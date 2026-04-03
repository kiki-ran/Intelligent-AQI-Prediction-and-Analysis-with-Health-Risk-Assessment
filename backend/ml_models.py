"""
Machine Learning Module for BreatheSafe Chennai
Trains 3 regressors on the synthetic AQI dataset and provides prediction
and forecasting utilities.

Models: Random Forest, XGBoost, Gradient Boosting
Metrics: RMSE, MAE, R²
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.preprocessing import StandardScaler
from xgboost import XGBRegressor

from data_pipeline import load_and_build_dataset, get_aqi_category

# ─── Configuration ────────────────────────────────────────────────────────────

RANDOM_SEED = 42
FEATURE_COLS = ["pm25", "pm10", "no2", "so2", "co", "o3", "nh3",
                "temperature", "humidity", "wind_speed", "month", "day_of_week"]
TARGET_COL = "aqi"

# ─── State (cached after first training) ──────────────────────────────────────

_models: dict = {}
_scaler: StandardScaler = None
_metrics: dict = {}
_feature_importances: list = []
_X_test: pd.DataFrame = None
_y_test: pd.Series = None
_y_pred_best: np.ndarray = None
_is_trained: bool = False


def _train_models():
    """Train all 3 models on the AQI dataset. Cached after first call."""
    global _models, _scaler, _metrics, _feature_importances
    global _X_test, _y_test, _y_pred_best, _is_trained

    if _is_trained:
        return

    print("[MLModels] Training models — this may take a moment …")
    df = load_and_build_dataset()

    # ── Feature/target split ──────────────────────────────────────────────
    present_features = [c for c in FEATURE_COLS if c in df.columns]
    X = df[present_features].copy()
    y = df[TARGET_COL].copy()

    # Handle any remaining NaN
    X = X.fillna(X.median())
    y = y.fillna(y.median())

    # Sample for performance — use at most 150k rows
    if len(X) > 150_000:
        idx = np.random.default_rng(RANDOM_SEED).choice(len(X), 150_000, replace=False)
        X = X.iloc[idx].reset_index(drop=True)
        y = y.iloc[idx].reset_index(drop=True)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_SEED
    )
    _X_test = X_test.copy()
    _y_test = y_test.copy()

    # Scale for GB / XGB (RF doesn't need it but won't hurt)
    _scaler = StandardScaler()
    X_train_s = _scaler.fit_transform(X_train)
    X_test_s = _scaler.transform(X_test)

    # ── Model definitions ─────────────────────────────────────────────────
    model_defs = {
        "Random Forest": RandomForestRegressor(
            n_estimators=100, max_depth=12, random_state=RANDOM_SEED, n_jobs=-1
        ),
        "XGBoost": XGBRegressor(
            n_estimators=150, max_depth=6, learning_rate=0.1,
            random_state=RANDOM_SEED, verbosity=0, n_jobs=-1
        ),
        "Gradient Boosting": GradientBoostingRegressor(
            n_estimators=100, max_depth=5, learning_rate=0.1,
            random_state=RANDOM_SEED
        ),
    }

    best_r2 = -np.inf
    best_name = None

    for name, model in model_defs.items():
        model.fit(X_train_s, y_train)
        y_pred = model.predict(X_test_s)

        rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
        mae = float(mean_absolute_error(y_test, y_pred))
        r2 = float(r2_score(y_test, y_pred))

        _metrics[name] = {"rmse": round(rmse, 3), "mae": round(mae, 3), "r2": round(r2, 4)}
        _models[name] = model

        if r2 > best_r2:
            best_r2 = r2
            best_name = name
            _y_pred_best = y_pred

        print(f"  [{name}] RMSE={rmse:.2f}  MAE={mae:.2f}  R²={r2:.4f}")

    # ── Feature importances from best model ──────────────────────────────
    best_model = _models[best_name]
    if hasattr(best_model, "feature_importances_"):
        imp = best_model.feature_importances_
        _feature_importances = sorted(
            [{"feature": f, "importance": round(float(v), 5)}
             for f, v in zip(present_features, imp)],
            key=lambda x: -x["importance"]
        )

    _metrics["best_model"] = best_name
    _is_trained = True
    print(f"[MLModels] Training complete. Best model: {best_name} (R²={best_r2:.4f})")


# ─── Public API ───────────────────────────────────────────────────────────────

def get_metrics() -> dict:
    _train_models()
    return _metrics


def get_feature_importances() -> list:
    _train_models()
    return _feature_importances


def get_predicted_vs_actual(n: int = 100) -> list:
    """Returns a list of {actual, predicted} dicts for the test set."""
    _train_models()
    actual = _y_test.values[:n]
    predicted = _y_pred_best[:n]
    return [
        {"index": int(i), "actual": round(float(a), 1), "predicted": round(float(p), 1)}
        for i, (a, p) in enumerate(zip(actual, predicted))
    ]


def predict_aqi(hours: int = 24, area: str = None) -> list:
    """
    Predict AQI for the next `hours` hours.
    Uses the best model with slightly evolved feature values.
    """
    _train_models()
    df = load_and_build_dataset()
    if area:
        area_df = df[df["area"] == area]
        if len(area_df) == 0:
            area_df = df
    else:
        area_df = df

    # Use recent data as base for prediction
    present_features = [c for c in FEATURE_COLS if c in df.columns]
    recent = area_df[present_features].tail(hours).copy()

    if len(recent) < hours:
        repeat_times = (hours // len(recent)) + 1
        recent = pd.concat([recent] * repeat_times, ignore_index=True).head(hours)

    # Add trend: slight degradation of pollutants towards night/peak hours
    rng = np.random.default_rng(0)
    for col in ["pm25", "pm10", "no2"]:
        if col in recent.columns:
            recent[col] = recent[col] * (1 + rng.uniform(-0.05, 0.1, len(recent)))

    X_scaled = _scaler.transform(recent.fillna(recent.median()))
    best_model = _models[_metrics["best_model"]]
    preds = best_model.predict(X_scaled)

    results = []
    base_time = pd.Timestamp.now()
    for i, p in enumerate(preds):
        aqi_val = float(np.clip(p + rng.normal(0, 3), 0, 500))
        cat = get_aqi_category(aqi_val)
        results.append({
            "hour": i + 1,
            "datetime": (base_time + pd.Timedelta(hours=i + 1)).strftime("%Y-%m-%d %H:00"),
            "predicted_aqi": round(aqi_val, 1),
            "category": cat["category"],
            "color": cat["color"],
        })
    return results


def forecast_7days(area: str = None) -> list:
    """
    Produce a 7-day daily AQI forecast.
    """
    _train_models()
    df = load_and_build_dataset()
    if area:
        area_df = df[df["area"] == area]
        if len(area_df) == 0:
            area_df = df
    else:
        area_df = df

    present_features = [c for c in FEATURE_COLS if c in df.columns]
    rng = np.random.default_rng(7)

    results = []
    base_time = pd.Timestamp.now()
    best_model = _models[_metrics["best_model"]]

    for day in range(7):
        sample = area_df[present_features].sample(24, replace=True, random_state=day).copy()
        # Adjust month/day_of_week for the future day
        future_date = base_time + pd.Timedelta(days=day + 1)
        if "month" in sample.columns:
            sample["month"] = future_date.month
        if "day_of_week" in sample.columns:
            sample["day_of_week"] = future_date.dayofweek

        X_scaled = _scaler.transform(sample.fillna(sample.median()))
        day_preds = best_model.predict(X_scaled)
        avg_aqi = float(np.clip(day_preds.mean() + rng.normal(0, 4), 0, 500))
        min_aqi = float(np.clip(day_preds.min(), 0, 500))
        max_aqi = float(np.clip(day_preds.max(), 0, 500))
        cat = get_aqi_category(avg_aqi)

        results.append({
            "day": day + 1,
            "date": future_date.strftime("%A, %b %d"),
            "date_short": future_date.strftime("%b %d"),
            "avg_aqi": round(avg_aqi, 1),
            "min_aqi": round(min_aqi, 1),
            "max_aqi": round(max_aqi, 1),
            "category": cat["category"],
            "color": cat["color"],
        })
    return results
