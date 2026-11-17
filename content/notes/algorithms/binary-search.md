---
title: Binary search
order: 2
---

# Binary search

Binary search finds a value in a **sorted** array by halving the search range at every step, which gives $O(\log n)$ time.

## The idea

1. Look at the middle element.
2. If it is the target, stop.
3. If the target is smaller, keep the left half. Otherwise keep the right half.
4. Repeat until the range is empty.

```python
def binary_search(items: list[int], target: int) -> int:
    low, high = 0, len(items) - 1
    while low <= high:
        mid = (low + high) // 2
        if items[mid] == target:
            return mid
        if items[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1
```

> [!WARNING]
> In languages with fixed size integers, `(low + high) / 2` can overflow. Use `low + (high - low) / 2` instead.

## Why it is logarithmic

Each step halves the range, so after $k$ steps there are $n / 2^k$ elements left. The search ends when that reaches one:

$$
\frac{n}{2^k} = 1 \quad\Longrightarrow\quad k = \log_2 n
$$

| Array size | Steps at most |
| ---: | ---: |
| 1,000 | 10 |
| 1,000,000 | 20 |
| 1,000,000,000 | 30 |

Run the tests with:

```bash
pytest tests/test_search.py -q
```

More on growth rates in [Big O notation](./big-o-notation.md).
