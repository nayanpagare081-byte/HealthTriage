import pytest
from app.inference.certainty_factor import CertaintyFactorEngine


def test_calculate_single_cf():
    cf = CertaintyFactorEngine.calculate(1.0, 1.0)
    assert cf == 1.0

    cf_partial = CertaintyFactorEngine.calculate(0.8, 0.5)
    assert cf_partial == 0.4


def test_calculate_invalid_range():
    with pytest.raises(ValueError):
        CertaintyFactorEngine.calculate(1.5, 1.0)

    with pytest.raises(ValueError):
        CertaintyFactorEngine.calculate(0.5, -0.1)


def test_calculate_combined_empty():
    combined = CertaintyFactorEngine.calculate_combined([])
    assert combined == 0.0


def test_calculate_combined_single():
    combined = CertaintyFactorEngine.calculate_combined([1.0])
    assert combined == 1.0


def test_calculate_combined_mycin_formula():
    # Formula: 1 - (1 - 0.8) * (1 - 0.6) = 1 - (0.2 * 0.4) = 1 - 0.08 = 0.92
    combined = CertaintyFactorEngine.calculate_combined([0.8, 0.6])
    assert combined == 0.92


def test_calculate_combined_invalid():
    with pytest.raises(ValueError):
        CertaintyFactorEngine.calculate_combined([0.5, 1.2])
