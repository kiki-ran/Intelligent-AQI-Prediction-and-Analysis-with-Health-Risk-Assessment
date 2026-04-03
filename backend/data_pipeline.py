"""
Data Pipeline for BreatheSafe Chennai
Loads the base AQI_weather_dataset.csv and generates:
  - 20 Chennai area labels via cyclic assignment + Gaussian noise
  - Synthetic weather features (Temperature, Humidity, Wind Speed) with seasonal patterns
"""

import os
import numpy as np
import pandas as pd

# ─── Configuration ────────────────────────────────────────────────────────────

RANDOM_SEED = 42
CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "AQI_weather_dataset.csv")

CHENNAI_AREAS = [
    "T. Nagar", "Adyar", "Velachery", "Anna Nagar", "Tambaram",
    "Porur", "Guindy", "Perungudi", "Sholinganallur", "Egmore",
    "Mylapore", "Chromepet", "Ambattur", "Avadi", "Nungambakkam",
    "Royapettah", "Saidapet", "Pallavaram", "Thoraipakkam", "Besant Nagar",
]

# Pollutant columns expected in the CSV
POLLUTANT_COLS = ["pm2.5", "pm10", "no2", "so2", "co", "o3", "nh3"]

# ─── Helper: Seasonal Weather Generation ─────────────────────────────────────

def _generate_weather(months: np.ndarray, rng: np.random.Generator) -> pd.DataFrame:
    """
    Generates Temperature (°C), Humidity (%), and Wind Speed (km/h)
    with realistic seasonal patterns for Chennai.
    """
    n = len(months)

    # Summer: Mar–May → high temp; Monsoon: Jun–Sep → high humidity; Winter: Nov–Feb → mild
    base_temp = np.where(
        np.isin(months, [3, 4, 5]), 38,           # Summer
        np.where(np.isin(months, [6, 7, 8, 9]), 32,  # Monsoon
        np.where(np.isin(months, [10, 11]), 30,      # Post-monsoon
        28))                                          # Winter / default
    )
    temperature = base_temp + rng.normal(0, 2, n)
    temperature = np.clip(temperature, 22, 44)

    base_humidity = np.where(
        np.isin(months, [6, 7, 8, 9, 10]), 82,   # Monsoon / post-monsoon
        np.where(np.isin(months, [3, 4, 5]), 55,  # Summer
        65)                                        # Winter / default
    )
    humidity = base_humidity + rng.normal(0, 5, n)
    humidity = np.clip(humidity, 35, 98)

    base_wind = np.where(
        np.isin(months, [6, 7, 8]), 18,   # Monsoon → windier
        np.where(np.isin(months, [11, 12, 1]), 12,  # Winter NE monsoon
        10)
    )
    wind_speed = base_wind + rng.normal(0, 3, n)
    wind_speed = np.clip(wind_speed, 2, 45)

    return pd.DataFrame({
        "temperature": temperature.round(2),
        "humidity": humidity.round(2),
        "wind_speed": wind_speed.round(2),
    })


def _normalize_cols(df: pd.DataFrame) -> pd.DataFrame:
    """Lowercase all column names and strip whitespace."""
    df.columns = [c.strip().lower() for c in df.columns]
    return df


def _find_aqi_col(df: pd.DataFrame) -> str:
    """
    Tries to find the AQI column. The CSV may call it 'aqi', 'AQI',
    or we compute it from pollutants if not present.
    """
    for c in df.columns:
        if c.lower() == "aqi":
            return c
    return None


def _compute_aqi_from_pm25(pm25: pd.Series) -> pd.Series:
    """
    Simple linear AQI approximation from PM2.5 (µg/m³).
    Based on CPCB breakpoints (simplified).
    """
    aqi = pd.cut(
        pm25,
        bins=[-np.inf, 30, 60, 90, 120, 250, np.inf],
        labels=[50, 100, 150, 200, 300, 400],
    ).astype(float)
    # Interpolate within bins for smoother values
    aqi = aqi + np.random.default_rng(RANDOM_SEED).uniform(-15, 15, len(pm25))
    return aqi.clip(0, 500)


# ─── Main Pipeline ────────────────────────────────────────────────────────────

_cached_df: pd.DataFrame = None


def load_and_build_dataset() -> pd.DataFrame:
    """
    Loads the CSV, normalises columns, assigns areas, adds weather, and returns
    a clean DataFrame ready for ML training and API responses.
    """
    global _cached_df
    if _cached_df is not None:
        return _cached_df

    rng = np.random.default_rng(RANDOM_SEED)

    # 1. Load base CSV
    df = pd.read_csv(CSV_PATH, low_memory=False)
    df = _normalize_cols(df)

    # 2. Parse datetime → extract month for seasonal patterns
    for date_col in ["datetime", "date", "time"]:
        if date_col in df.columns:
            df["datetime"] = pd.to_datetime(df[date_col], errors="coerce")
            break
    else:
        df["datetime"] = pd.date_range("2019-01-01", periods=len(df), freq="h")

    df["month"] = df["datetime"].dt.month.fillna(6).astype(int)
    df["year"] = df["datetime"].dt.year.fillna(2022).astype(int)
    df["day_of_week"] = df["datetime"].dt.dayofweek.fillna(0).astype(int)

    # 3. Normalise pollutant columns (handle missing)
    col_map = {
        "pm2.5": "pm25", "pm10": "pm10",
        "no2": "no2", "so2": "so2",
        "co": "co", "o3": "o3", "nh3": "nh3",
    }
    for src, dst in col_map.items():
        if src in df.columns:
            df[dst] = pd.to_numeric(df[src], errors="coerce")
        elif dst not in df.columns:
            df[dst] = rng.uniform(5, 80, len(df))

    # Fill NaN pollutants with column medians
    pollutant_final = ["pm25", "pm10", "no2", "so2", "co", "o3", "nh3"]
    for col in pollutant_final:
        df[col] = df[col].fillna(df[col].median())

    # 4. Determine / compute AQI
    aqi_col = _find_aqi_col(df)
    if aqi_col and aqi_col in df.columns:
        df["aqi"] = pd.to_numeric(df[aqi_col], errors="coerce")
    if "aqi" not in df.columns or df["aqi"].isna().mean() > 0.5:
        df["aqi"] = _compute_aqi_from_pm25(df["pm25"])
    df["aqi"] = df["aqi"].fillna(df["pm25"] * 1.2 + 20).clip(0, 500)

    # 5. Generate weather features
    weather = _generate_weather(df["month"].values, rng)
    df = pd.concat([df.reset_index(drop=True), weather], axis=1)

    # 6. Assign 20 Chennai area labels cyclically + add Gaussian noise per area
    n = len(df)
    area_ids = rng.integers(0, len(CHENNAI_AREAS), size=n)
    df["area"] = [CHENNAI_AREAS[i] for i in area_ids]

    # Area-specific noise on AQI and pollutants to differentiate areas
    area_bias = {a: rng.uniform(-15, 20) for a in CHENNAI_AREAS}
    df["aqi"] = df.apply(
        lambda r: np.clip(r["aqi"] + area_bias[r["area"]] + rng.normal(0, 5), 0, 500),
        axis=1,
    )
    for col in pollutant_final:
        area_pol_noise = {a: rng.uniform(-5, 8) for a in CHENNAI_AREAS}
        df[col] = df.apply(
            lambda r, c=col: max(0, r[c] + area_pol_noise[r["area"]] + rng.normal(0, 2)),
            axis=1,
        )

    # 7. Keep only required columns + metadata
    keep_cols = ["datetime", "area", "month", "year", "day_of_week",
                 "pm25", "pm10", "no2", "so2", "co", "o3", "nh3",
                 "temperature", "humidity", "wind_speed", "aqi"]
    df = df[[c for c in keep_cols if c in df.columns]].copy()
    df = df.dropna(subset=["aqi"])
    df = df.reset_index(drop=True)

    _cached_df = df
    print(f"[DataPipeline] Dataset ready: {df.shape[0]} rows × {df.shape[1]} cols")
    return df


def get_area_stats() -> pd.DataFrame:
    """Returns per-area average statistics for City Insights."""
    df = load_and_build_dataset()
    agg_cols = {c: "mean" for c in ["pm25", "pm10", "no2", "so2", "co", "o3", "nh3",
                                     "temperature", "humidity", "wind_speed", "aqi"]}
    stats = df.groupby("area").agg(agg_cols).round(2).reset_index()
    stats["aqi_rank"] = stats["aqi"].rank(ascending=False).astype(int)
    stats["hotspot_score"] = (
        0.4 * stats["aqi"] / stats["aqi"].max() +
        0.3 * stats["pm25"] / stats["pm25"].max() +
        0.2 * stats["pm10"] / stats["pm10"].max() +
        0.1 * stats["no2"] / stats["no2"].max()
    ).round(4)
    return stats.sort_values("aqi", ascending=False)


def get_aqi_category(aqi_val: float) -> dict:
    """Returns category name and color for a given AQI value."""
    if aqi_val <= 50:
        return {"category": "Good", "color": "#00e400", "text_color": "#000"}
    elif aqi_val <= 100:
        return {"category": "Satisfactory", "color": "#92d400", "text_color": "#000"}
    elif aqi_val <= 150:
        return {"category": "Moderate", "color": "#ffff00", "text_color": "#000"}
    elif aqi_val <= 200:
        return {"category": "Poor", "color": "#ff7e00", "text_color": "#fff"}
    elif aqi_val <= 300:
        return {"category": "Very Poor", "color": "#ff0000", "text_color": "#fff"}
    else:
        return {"category": "Severe", "color": "#7e0023", "text_color": "#fff"}
