import torch.optim as optim

def get_input_optimizer(input_img):
    optimizer = optim.LBFGS([input_img])
    return optimizer
