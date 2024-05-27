import torch
from model.process import get_style_model_and_losses
from model.optimizer import get_input_optimizer

def run_style_transfer(cnn, normalization_mean, normalization_std,
                       content_img, style_img, input_img, num_steps,
                       style_weight, content_weight=1):
    """
    Run the style transfer.

    Args:
        cnn (torch.nn.Module): The pre-trained CNN model (e.g., VGG19).
        normalization_mean (torch.Tensor): The mean for normalization.
        normalization_std (torch.Tensor): The standard deviation for normalization.
        content_img (torch.Tensor): The content image tensor.
        style_img (torch.Tensor): The style image tensor.
        input_img (torch.Tensor): The input image tensor to optimize.
        num_steps (int): The number of steps to run the style transfer.
        style_weight (float): The weight for the style loss.
        content_weight (float, optional): The weight for the content loss. Defaults to 1.

    Returns:
        torch.Tensor: The output image tensor after style transfer.
    """
    # Get the style transfer model and loss functions
    model, style_losses, content_losses = get_style_model_and_losses(
        cnn, normalization_mean, normalization_std, style_img, content_img)

    # Ensure input image requires gradient
    input_img.requires_grad_(True)
    model.eval()  # Set the model to evaluation mode
    model.requires_grad_(False)

    # Get the optimizer
    optimizer = get_input_optimizer(input_img)

    run = [0]  # Initialize run counter
    while run[0] <= num_steps:
        def closure():
            """
            A closure function for the optimizer to reevaluate the model and calculate the loss.

            Returns:
                torch.Tensor: The total loss (style loss + content loss).
            """
            with torch.no_grad():
                input_img.clamp_(0, 1)  # Clamp the input image to be in the range [0, 1]

            optimizer.zero_grad()  # Zero the gradients
            model(input_img)  # Forward pass
            style_score = 0
            content_score = 0

            # Accumulate style losses
            for sl in style_losses:
                style_score += sl.loss
            # Accumulate content losses
            for cl in content_losses:
                content_score += cl.loss

            style_score *= style_weight  # Scale style loss
            content_score *= content_weight  # Scale content loss

            loss = style_score + content_score  # Total loss
            loss.backward()  # Backward pass to compute gradients

            run[0] += 1  # Increment run counter
            if run[0] % 50 == 0:
                print("run {}: Style Loss : {:4f} Content Loss: {:4f}".format(
                    run[0], style_score.item(), content_score.item()))

            return loss

        optimizer.step(closure)  # Perform a single optimization step

    with torch.no_grad():
        input_img.clamp_(0, 1)  # Clamp the final output image

    return input_img
