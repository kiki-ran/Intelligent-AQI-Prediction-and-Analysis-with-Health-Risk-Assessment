"""
Flask Application — BreatheSafe Chennai API
Endpoints:
  GET  /api/dashboard-data
  GET  /api/predict?hours=24&area=T.+Nagar
  GET  /api/forecast?area=T.+Nagar
  POST /api/health-risk
  GET  /api/current-aqi?area=T.+Nagar
"""

import json
import numpy as np
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

from data_pipeline import (
    load_and_build_dataset,
    get_area_stats,
    get_aqi_category,
    CHENNAI_AREAS,
)
from ml_models import (
    get_metrics,
    get_feature_importances,
    get_predicted_vs_actual,
    predict_aqi,
    forecast_7days,
)
from health_risk import assess_health_risk

# ─── App Setup ────────────────────────────────────────────────────────────────

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})


class _NpEncoder(json.JSONEncoder):
    """Make numpy types JSON-serializable."""
    def default(self, obj):
        if isinstance(obj, (np.integer,)):
            return int(obj)
        if isinstance(obj, (np.floating,)):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super().default(obj)


app.json_encoder = _NpEncoder


def _ok(data):
    return jsonify({"status": "success", "data": data})


def _err(msg, code=400):
    return jsonify({"status": "error", "message": msg}), code


# ─── Endpoints ────────────────────────────────────────────────────────────────

@app.route("/api/dashboard-data", methods=["GET"])
def dashboard_data():
    """
    Returns all data needed by the Dashboard page:
    - KPI stats (6 cards)
    - AQI trend (last 90 days aggregated)
    - Pollutant averages
    - AQI category distribution
    - Correlation matrix
    - Predicted vs Actual (sample)
    - Area ranking (all 20 areas)
    - Model metrics & feature importances
    """
    df = load_and_build_dataset()
    area_stats = get_area_stats()
    metrics = get_metrics()
    fi = get_feature_importances()
    pva = get_predicted_vs_actual(120)

    # ── KPI Cards ────────────────────────────────────────────────────────
    current_aqi = float(df["aqi"].iloc[-1])
    avg_30 = float(df["aqi"].tail(30 * 24).mean())
    max_aqi = float(df["aqi"].max())
    tomorrow_pred = float(predict_aqi(24)[0]["predicted_aqi"])
    yesterday_avg = float(df["aqi"].tail(48 * 24).head(24 * 24).mean())
    today_avg = float(df["aqi"].tail(24).mean())
    pct_change = round((today_avg - yesterday_avg) / max(yesterday_avg, 1) * 100, 1)
    current_cat = get_aqi_category(current_aqi)

    kpi = {
        "current_aqi": round(current_aqi, 1),
        "avg_30_days": round(avg_30, 1),
        "max_aqi": round(max_aqi, 1),
        "predicted_tomorrow": round(tomorrow_pred, 1),
        "pct_change_yesterday": pct_change,
        "aqi_category": current_cat["category"],
        "aqi_color": current_cat["color"],
    }

    # ── AQI Trend (last 90 days, daily buckets) ───────────────────────────
    df_sorted = df.sort_values("datetime")
    if "datetime" in df_sorted.columns and pd.api.types.is_datetime64_any_dtype(df_sorted["datetime"]):
        daily = (
            df_sorted.set_index("datetime")["aqi"]
            .resample("D").mean().dropna()
            .tail(90)
            .reset_index()
        )
        aqi_trend = [
            {"date": row["datetime"].strftime("%b %d"), "aqi": round(row["aqi"], 1)}
            for _, row in daily.iterrows()
        ]
    else:
        # Fallback: use row index as day
        sampled = df["aqi"].iloc[::24].tail(90)
        aqi_trend = [
            {"date": f"Day {i+1}", "aqi": round(v, 1)}
            for i, v in enumerate(sampled)
        ]

    # ── Pollutant Averages ────────────────────────────────────────────────
    pol_cols = ["pm25", "pm10", "no2", "so2", "co", "o3", "nh3"]
    pol_avgs = {c.upper().replace("25", "2.5"): round(float(df[c].mean()), 2)
                for c in pol_cols if c in df.columns}

    pollutant_pie = [
        {"name": k, "value": v} for k, v in pol_avgs.items()
    ]

    # ── AQI Category Distribution ─────────────────────────────────────────
    def cat_label(v):
        return get_aqi_category(v)["category"]

    df["_cat"] = df["aqi"].apply(cat_label)
    cat_counts = df["_cat"].value_counts().to_dict()
    cat_order = ["Good", "Satisfactory", "Moderate", "Poor", "Very Poor", "Severe"]
    cat_colors = ["#00e400", "#92d400", "#ffff00", "#ff7e00", "#ff0000", "#7e0023"]
    aqi_category_dist = [
        {"category": c, "count": int(cat_counts.get(c, 0)), "color": col}
        for c, col in zip(cat_order, cat_colors)
    ]

    # ── Correlation Matrix ─────────────────────────────────────────────────
    corr_cols = [c for c in ["pm25", "pm10", "no2", "so2", "co", "o3", "nh3",
                             "temperature", "humidity", "wind_speed", "aqi"]
                 if c in df.columns]
    corr_df = df[corr_cols].corr().round(3)
    correlation = {
        "labels": [c.upper().replace("25", "2.5") for c in corr_cols],
        "matrix": corr_df.values.tolist(),
    }

    # ── Area Rankings ─────────────────────────────────────────────────────
    areas = area_stats.to_dict(orient="records")

    return _ok({
        "kpi": kpi,
        "aqi_trend": aqi_trend,
        "pollutant_pie": pollutant_pie,
        "pollutant_averages": pol_avgs,
        "aqi_category_dist": aqi_category_dist,
        "correlation": correlation,
        "predicted_vs_actual": pva,
        "area_stats": areas,
        "model_metrics": metrics,
        "feature_importances": fi,
        "areas": CHENNAI_AREAS,
    })


@app.route("/api/predict", methods=["GET"])
def predict():
    """Predict AQI for next 24–72 hours."""
    try:
        hours = int(request.args.get("hours", 24))
        hours = max(1, min(hours, 72))
    except ValueError:
        return _err("Invalid 'hours' parameter")

    area = request.args.get("area", None)
    predictions = predict_aqi(hours=hours, area=area)
    return _ok({"predictions": predictions, "hours": hours, "area": area})


@app.route("/api/forecast", methods=["GET"])
def forecast():
    """7-day AQI forecast."""
    area = request.args.get("area", None)
    forecast_data = forecast_7days(area=area)
    model_used = get_metrics().get("best_model", "Unknown")
    return _ok({"forecast": forecast_data, "model_used": model_used, "area": area})


@app.route("/api/health-risk", methods=["POST"])
def health_risk():
    """Personalised health risk assessment."""
    body = request.get_json(force=True, silent=True)
    if not body:
        return _err("JSON body required")

    try:
        aqi = float(body.get("aqi", 150))
        age = int(body.get("age", 30))
        gender = str(body.get("gender", "Other"))
        profession = str(body.get("profession", "other"))
        smoker = bool(body.get("smoker", False))
        diseases = list(body.get("diseases", []))
    except (TypeError, ValueError) as e:
        return _err(f"Invalid input: {e}")

    result = assess_health_risk(aqi, age, gender, profession, smoker, diseases)
    return _ok(result)


@app.route("/api/current-aqi", methods=["GET"])
def current_aqi():
    """Latest AQI reading for a given area."""
    area = request.args.get("area", None)
    df = load_and_build_dataset()

    if area:
        area_df = df[df["area"] == area]
        if len(area_df) == 0:
            return _err(f"Area '{area}' not found", 404)
        latest_aqi = float(area_df["aqi"].iloc[-1])
    else:
        latest_aqi = float(df["aqi"].iloc[-1])

    cat = get_aqi_category(latest_aqi)
    return _ok({
        "area": area or "Chennai (Overall)",
        "aqi": round(latest_aqi, 1),
        **cat,
    })


@app.route("/", methods=["GET"])
def root():
    return jsonify({
        "app": "BreatheSafe Chennai API",
        "version": "1.0.0",
        "endpoints": [
            "/api/dashboard-data",
            "/api/predict",
            "/api/forecast",
            "/api/health-risk",
            "/api/current-aqi",
        ],
    })


# ─── Entry Point ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    # Pre-load dataset on startup
    print("[BreatheSafe] Loading dataset and warming up models …")
    load_and_build_dataset()
    app.run(debug=False, host="0.0.0.0", port=5000)
