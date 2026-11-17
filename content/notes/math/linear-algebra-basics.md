---
title: Linear algebra basics
order: 1
---

# Linear algebra basics

Vectors and matrices are the language most of machine learning is written in. These are the pieces I keep coming back to.

## Vectors

A vector $\mathbf{v} \in \mathbb{R}^n$ is an ordered list of $n$ numbers. Its length, the Euclidean norm, is

$$
\lVert \mathbf{v} \rVert = \sqrt{v_1^2 + v_2^2 + \dots + v_n^2}
$$

The dot product of two vectors measures how much they point the same way:

$$
\mathbf{a} \cdot \mathbf{b} = \sum_{i=1}^{n} a_i b_i = \lVert \mathbf{a} \rVert \, \lVert \mathbf{b} \rVert \cos\theta
$$

> [!NOTE]
> If $\mathbf{a} \cdot \mathbf{b} = 0$ the vectors are orthogonal. This is the test I use most.

<svg viewBox="0 0 320 180" role="img" aria-label="Two vectors a and b with the angle theta between them" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="tip" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="currentColor"/></marker>
  </defs>
  <g fill="none" stroke-width="2.5" stroke-linecap="round">
    <line x1="50" y1="150" x2="270" y2="150" stroke="#2f9bff" marker-end="url(#tip)" color="#2f9bff"/>
    <line x1="50" y1="150" x2="200" y2="40" stroke="#0b6bdc" marker-end="url(#tip)" color="#0b6bdc"/>
    <path d="M100 150 A50 50 0 0 0 90 120" stroke="#52627a" stroke-width="1.5"/>
  </g>
  <g font-family="ui-monospace, monospace" font-size="14" fill="#2c3a4f">
    <text x="276" y="155">b</text><text x="206" y="38">a</text><text x="108" y="136">θ</text>
  </g>
</svg>

## Matrices

A matrix is a linear map. Multiplying $A \in \mathbb{R}^{m \times n}$ by $\mathbf{x} \in \mathbb{R}^n$ gives a vector in $\mathbb{R}^m$.

| Operation | Notation | Shape rule |
| --- | --- | --- |
| Product | $AB$ | $(m \times n)(n \times p) \to m \times p$ |
| Transpose | $A^\top$ | $m \times n \to n \times m$ |
| Inverse | $A^{-1}$ | square and $\det A \neq 0$ |

```python
import numpy as np

A = np.array([[2, 1], [1, 3]])
x = np.array([1, 2])

print(A @ x)             # [4 7]
print(np.linalg.inv(A))  # the inverse, if it exists
```

> [!WARNING]
> Matrix multiplication is not commutative. In general $AB \neq BA$.

## Eigenvalues

A non zero vector $\mathbf{v}$ is an eigenvector of $A$ when $A\mathbf{v} = \lambda \mathbf{v}$. The scalar $\lambda$ is its eigenvalue, found from

$$
\det(A - \lambda I) = 0
$$

- [x] Dot product and norms
- [x] Matrix products
- [ ] Singular value decomposition
