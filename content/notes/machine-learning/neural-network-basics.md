---
title: Neural network basics
order: 2
---

# Neural network basics

A neural network is a stack of layers. Each layer applies a linear map and then a non linear activation.

## One layer

$$
\mathbf{a}^{(l)} = \sigma\!\left(W^{(l)} \mathbf{a}^{(l-1)} + \mathbf{b}^{(l)}\right)
$$

## Activations

| Function | Formula | Range |
| --- | --- | --- |
| Sigmoid | $\sigma(x) = \dfrac{1}{1 + e^{-x}}$ | $(0, 1)$ |
| Tanh | $\tanh(x)$ | $(-1, 1)$ |
| ReLU | $\max(0, x)$ | $[0, \infty)$ |

> [!IMPORTANT]
> Without a non linear activation, any number of stacked layers collapses into a single linear map.

## A small model in PyTorch

```python
import torch
from torch import nn

model = nn.Sequential(
    nn.Linear(784, 128),
    nn.ReLU(),
    nn.Linear(128, 10),
)

logits = model(torch.randn(32, 784))
print(logits.shape)  # torch.Size([32, 10])
```

## Training loop

1. Forward pass: compute predictions.
2. Loss: compare them with the labels.
3. Backward pass: compute gradients with backpropagation.
4. Update: take a [gradient descent](./gradient-descent.md) step.
