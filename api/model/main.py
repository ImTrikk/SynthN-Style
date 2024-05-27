import torch
from torchvision import transforms
from torchvision.models import vgg19, VGG19_Weights
from model.image_loader import image_loader
from model.style_transfer import run_style_transfer

# Set the device to GPU if available, otherwise CPU
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def perform_style_transfer(content_img_path, style_img_path, num_steps, style_weight):
    """
    Perform style transfer using the VGG19 model.
    
    Args:
        content_img_path (str): Path to the content image.
        style_img_path (str): Path to the style image.
        num_steps (int): Number of steps to run the style transfer.
        style_weight (int): Weight of the style loss relative to the content loss.
        
    Returns:
        PIL.Image: The stylized image.
    """
    # Load the style and content images
    style_img = image_loader(style_img_path).to(device, torch.float)
    content_img = image_loader(content_img_path).to(device, torch.float)

    # Ensure the images are the same size
    assert style_img.size() == content_img.size(), \
        "We need to import style and content images of the same size"

    # Load the pre-trained VGG19 model and set it to evaluation mode
    cnn = vgg19(weights=VGG19_Weights.DEFAULT).features.to(device).eval()

    # Define the normalization mean and standard deviation for the VGG19 model
    cnn_normalization_mean = torch.tensor([0.485, 0.456, 0.406]).to(device)
    cnn_normalization_std = torch.tensor([0.229, 0.224, 0.225]).to(device)

    # Create a clone of the content image to use as the input image
    input_img = content_img.clone()

    # Perform style transfer
    output = run_style_transfer(
        cnn, cnn_normalization_mean, cnn_normalization_std,
        content_img, style_img, input_img, num_steps, style_weight
    )

    # Convert the output tensor to a PIL image and save it
    output_img = transforms.ToPILImage()(output.data.squeeze().cpu())
    output_img.save('output.png')
    return output_img
