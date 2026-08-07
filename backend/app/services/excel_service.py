import pandas as pd


def load_excel(file):
    """
    Reads an Excel file and returns a pandas DataFrame.
    """
    return pd.read_excel(file)