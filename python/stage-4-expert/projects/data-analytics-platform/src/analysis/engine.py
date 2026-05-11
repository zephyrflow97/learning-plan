"""
Data Analysis Engine - Pandas-based analytics
"""
import logging
import pandas as pd
import numpy as np
from typing import Any

logger = logging.getLogger(__name__)


class AnalysisEngine:
    """Core analysis engine using Pandas and NumPy."""

    def __init__(self, df: pd.DataFrame) -> None:
        self.df = df
        logger.info(f"[Engine] Loaded DataFrame: {df.shape}")

    def summary(self) -> dict[str, Any]:
        """Generate statistical summary."""
        logger.info("[Engine] Generating summary")
        numeric_df = self.df.select_dtypes(include="number")
        return {
            "shape": {"rows": self.df.shape[0], "columns": self.df.shape[1]},
            "columns": list(self.df.columns),
            "dtypes": {col: str(dtype) for col, dtype in self.df.dtypes.items()},
            "missing": self.df.isnull().sum().to_dict(),
            "statistics": numeric_df.describe().to_dict() if not numeric_df.empty else {},
        }

    def correlation(self) -> dict[str, Any]:
        """Compute correlation matrix."""
        logger.info("[Engine] Computing correlation")
        numeric_df = self.df.select_dtypes(include="number")
        if numeric_df.empty:
            return {"error": "No numeric columns"}
        corr = numeric_df.corr()
        return {"correlation_matrix": corr.to_dict()}

    def detect_outliers(self, method: str = "iqr") -> dict[str, Any]:
        """Detect outliers using IQR or Z-score."""
        logger.info(f"[Engine] Detecting outliers (method={method})")
        numeric_df = self.df.select_dtypes(include="number")
        outliers = {}
        for col in numeric_df.columns:
            if method == "iqr":
                q1 = numeric_df[col].quantile(0.25)
                q3 = numeric_df[col].quantile(0.75)
                iqr = q3 - q1
                mask = (numeric_df[col] < q1 - 1.5 * iqr) | (numeric_df[col] > q3 + 1.5 * iqr)
            else:  # z-score
                z = np.abs((numeric_df[col] - numeric_df[col].mean()) / numeric_df[col].std())
                mask = z > 3
            outliers[col] = int(mask.sum())
        return {"method": method, "outlier_counts": outliers}
