from decimal import Decimal, getcontext
import argparse


def arctan_inverse(x, precision):
    x = Decimal(x)
    x_power = Decimal(1) / x
    total = x_power
    sign = -1
    n = 3

    while True:
        x_power /= x * x
        term = x_power / n
        if term == 0:
            break
        total += sign * term
        sign *= -1
        n += 2

        if abs(term) < Decimal(10) ** -(precision + 5):
            break

    return total


def calculate_pi(precision):
    if precision < 1:
        raise ValueError("precision must be at least 1")

    getcontext().prec = precision + 10
    pi = 16 * arctan_inverse(5, precision) - 4 * arctan_inverse(239, precision)
    return +pi


def main():
    parser = argparse.ArgumentParser(description="Calculate pi to a given precision.")
    parser.add_argument(
        "precision",
        nargs="?",
        type=int,
        default=50,
        help="number of decimal digits to calculate (default: 50)",
    )
    args = parser.parse_args()

    pi = calculate_pi(args.precision)
    print(f"{pi:.{args.precision}f}")


if __name__ == "__main__":
    main()
