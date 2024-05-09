import torch # type: ignore
import torch.nn as nn # type: ignore
import torch.nn.functional as F # type: ignore
import torch.optim as optim # type: ignore

from PIL import Image # type: ignore

import torchvision.transforms as transforms # type: ignore
from torchvision.models import vgg19, VGG19_Weights # type: ignore

import copy


device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
torch.set_default_device(device)

imsize = 512 if torch.cuda.is_available() else 128

loader = transforms.Compose([
    transforms.Resize(imsize),
    transforms.ToTensor()
])

def perform_style_transfer(content_img, style_image, num_steps, style_weight):
 def image_loader(image_name):
    image = Image.open(image_name).convert('RGB')
    image = loader(image).unsqueeze(0)
    return image.to(device, torch.float)
 

 style_img = image_loader(style_image)
 content_img = image_loader(content_img)


 assert style_img.size() == content_img.size(), \
   "we  need to import style and content image of the same size"

 # content loss
 class ContentLoss(nn.Module):

   def __init__(self, target,):
     super(ContentLoss, self).__init__()
     self.target = target.detach()

   def forward(self, input):
     self.loss = F.mse_loss(input, self.target)
     return input
   

 #style loss 
 def gram_matrix(input):
   a,b,c,d = input.size()
   features = input.view(a * b, c * d)
   G = torch.mm(features, features.t())
   return G.div(a * b * c * d)

 class StyleLoss(nn.Module):
   def __init__(self, target_feature):
     super(StyleLoss, self).__init__()
     self.target = gram_matrix(target_feature).detach()

   def forward(self, input):
     G = gram_matrix(input)
     self.loss = F.mse_loss(G, self.target)
     return input

 # importing model
 cnn = vgg19(weights = VGG19_Weights.DEFAULT).features.eval()

 cnn_normalization_mean = torch.tensor([0.485, 0.456, 0.406])
 cnn_normalization_std = torch.tensor([0.299, 0.224, 0.225])

 class Normalization(nn.Module):
   def __init__(self, mean, std):
    super(Normalization, self).__init__()
    self.mean = mean.clone().detach().view(-1, 1, 1)
    self.std = std.clone().detach().view(-1, 1, 1)

   def forward(self, img):
       return (img - self.mean) / self.std
   
 content_layers_default = ['conv_4']
 style_layers_default = ['conv_1', 'conv_2', 'conv_3', 'conv_4', 'conv_5']

 # style model and losses
 def get_style_model_and_losses(cnn, normalization_mean, normalization_std,
                                style_img, content_img,
                                content_layers=content_layers_default,
                                style_layers=style_layers_default):
     # normalization module
     normalization = Normalization(normalization_mean, normalization_std)

     # just in order to have an iterable access to or list of content/style
     # losses
     content_losses = []
     style_losses = []

     # assuming that ``cnn`` is a ``nn.Sequential``, so we make a new ``nn.Sequential``
     # to put in modules that are supposed to be activated sequentially
     model = nn.Sequential(normalization)

     i = 0  # increment every time we see a conv
     for layer in cnn.children():
         if isinstance(layer, nn.Conv2d):
             i += 1
             name = 'conv_{}'.format(i)
         elif isinstance(layer, nn.ReLU):
             name = 'relu_{}'.format(i)
             # The in-place version doesn't play very nicely with the ``ContentLoss``
             # and ``StyleLoss`` we insert below. So we replace with out-of-place
             # ones here.
             layer = nn.ReLU(inplace=False)
         elif isinstance(layer, nn.MaxPool2d):
             name = 'pool_{}'.format(i)
         elif isinstance(layer, nn.BatchNorm2d):
             name = 'bn_{}'.format(i)
         else:
             raise RuntimeError('Unrecognized layer: {}'.format(layer.__class__.__name__))

         model.add_module(name, layer)

         if name in content_layers:
             # add content loss:
             target = model(content_img).detach()
             content_loss = ContentLoss(target)
             model.add_module("content_loss_{}".format(i), content_loss)
             content_losses.append(content_loss)

         if name in style_layers:
             # add style loss:
             target_feature = model(style_img).detach()
             style_loss = StyleLoss(target_feature)
             model.add_module("style_loss_{}".format(i), style_loss)
             style_losses.append(style_loss)

     # now we trim off the layers after the last content and style losses
     for i in range(len(model) - 1, -1, -1):
         if isinstance(model[i], ContentLoss) or isinstance(model[i], StyleLoss):
             break

     model = model[:(i + 1)]

     return model, style_losses, content_losses

 # content image or white noise 
 input_img = content_img.clone()

 # gradident descnet
 def get_input_optimizer(input_img):
   optimizer = optim.LBFGS([input_img])
   return optimizer

 # style transfer
 def run_style_transfer(cnn, normalization_mean, normalization_std,
                        content_img, style_img, input_img, num_steps,
                        style_weight, content_weight=1):
     """Run the style transfer."""
     print('Building the style transfer model..')
     model, style_losses, content_losses = get_style_model_and_losses(cnn,
         normalization_mean, normalization_std, style_img, content_img)

     # We want to optimize the input and not the model parameters so we
     # update all the requires_grad fields accordingly
     input_img.requires_grad_(True)
     # We also put the model in evaluation mode, so that specific layers
     # such as dropout or batch normalization layers behave correctly.
     model.eval()
     model.requires_grad_(False)

     optimizer = get_input_optimizer(input_img)

     print('Optimizing..')
     run = [0]
     while run[0] <= num_steps:

         def closure():
             # correct the values of updated input image
             with torch.no_grad():
               input_img.clamp_(0, 1)

             optimizer.zero_grad()
             model(input_img)
             style_score = 0
             content_score = 0

             for sl in style_losses:
                 style_score += sl.loss
             for cl in content_losses:
                 content_score += cl.loss

             style_score *= style_weight
             content_score *= content_weight

             loss = style_score + content_score
             loss.backward()

             run[0] += 1
             if run[0] % 50 == 0:
                 print("run {}:".format(run))
                 print('Style Loss : {:4f} Content Loss: {:4f}'.format(
                     style_score.item(), content_score.item()))
                 print()

             return style_score + content_score

         optimizer.step(closure)

     # a last correction...
     with torch.no_grad():
         input_img.clamp_(0, 1)

     return input_img

 # running the algorithm
 output = run_style_transfer(cnn, cnn_normalization_mean, cnn_normalization_std, content_img, style_img, input_img, num_steps, style_weight)

 # saving transformed image with art style
 out_t = (output.data.squeeze())
 output_img = transforms.ToPILImage()(out_t)
 output_img.save('output.png')
 return output_img
