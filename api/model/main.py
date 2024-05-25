import torch
from torchvision import transforms
from torchvision.models import vgg19, VGG19_Weights
from model.image_loader import image_loader
from model.style_transfer import run_style_transfer

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def perform_style_transfer(content_img_path, style_img_path, num_steps, style_weight):
    style_img = image_loader(style_img_path)
    content_img = image_loader(content_img_path)

    assert style_img.size() == content_img.size(), \
        "We need to import style and content images of the same size"

    cnn = vgg19(weights=VGG19_Weights.DEFAULT).features.to(device).eval()

    cnn_normalization_mean = torch.tensor([0.485, 0.456, 0.406]).to(device)
    cnn_normalization_std = torch.tensor([0.299, 0.224, 0.225]).to(device)

    input_img = content_img.clone()

    output = run_style_transfer(cnn, cnn_normalization_mean, cnn_normalization_std,content_img, style_img, input_img, num_steps, style_weight)

    output_img = transforms.ToPILImage()(output.data.squeeze().cpu())
    output_img.save('output.png')
    return output_img
