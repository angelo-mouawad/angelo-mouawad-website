---
title: Probability cheatsheet
order: 2
---

# Probability cheatsheet

The rules I need most often, in one place.

## Core rules

For events $A$ and $B$:

$$
P(A \cup B) = P(A) + P(B) - P(A \cap B)
$$

$$
P(A \mid B) = \frac{P(A \cap B)}{P(B)}
$$

> [!IMPORTANT]
> Bayes' theorem turns a conditional around: $P(A \mid B) = \dfrac{P(B \mid A)\,P(A)}{P(B)}$

## Expectation and variance

| Quantity | Definition | Handy property |
| --- | --- | --- |
| Expectation | $E[X] = \sum_x x\,P(X = x)$ | $E[aX + b] = aE[X] + b$ |
| Variance | $\mathrm{Var}(X) = E[(X - \mu)^2]$ | $\mathrm{Var}(aX + b) = a^2\,\mathrm{Var}(X)$ |
| Covariance | $E[(X - \mu_X)(Y - \mu_Y)]$ | zero when $X, Y$ are independent |

## Common distributions

1. **Bernoulli**: one trial with success probability $p$.
2. **Binomial**: the number of successes in $n$ trials, $P(X = k) = \binom{n}{k} p^k (1-p)^{n-k}$.
3. **Normal**: density $f(x) = \dfrac{1}{\sigma\sqrt{2\pi}}\, e^{-\frac{(x-\mu)^2}{2\sigma^2}}$.

> [!TIP]
> About 68% of a normal distribution lies within one standard deviation of the mean, 95% within two.

See also [linear algebra basics](./linear-algebra-basics.md).
