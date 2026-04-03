"""
Health Risk Assessment Engine for BreatheSafe Chennai
Combines current AQI category with user vulnerability profile to determine
personal risk level and generate targeted precautions.
"""

from data_pipeline import get_aqi_category

# ─── Vulnerability Scoring ────────────────────────────────────────────────────

DISEASE_SENSITIVITY = {
    "asthma": 3,
    "copd": 3,
    "heart disease": 2,
    "diabetes": 1,
    "allergies": 2,
    "hypertension": 1,
    "lung disease": 3,
}

PROFESSION_RISK = {
    "outdoor": 2,      # Construction, delivery, traffic police
    "driver": 2,
    "farmer": 2,
    "teacher": 1,
    "office": 0,
    "indoor": 0,
    "student": 1,
    "healthcare": 0,
    "other": 0,
}

AQI_CATEGORY_SCORE = {
    "Good": 0,
    "Satisfactory": 1,
    "Moderate": 2,
    "Poor": 3,
    "Very Poor": 4,
    "Severe": 5,
}


def _vulnerability_score(age: int, smoker: bool, diseases: list, profession: str) -> float:
    """Compute a vulnerability score 0–10."""
    score = 0.0

    # Age factor
    if age < 12:
        score += 2.0   # Children
    elif age > 60:
        score += 2.5   # Elderly
    elif age > 45:
        score += 1.0

    # Smoker
    if smoker:
        score += 1.5

    # Diseases
    for disease in diseases:
        d = disease.lower().strip()
        score += DISEASE_SENSITIVITY.get(d, 0.5)

    # Profession
    prof_key = profession.lower().strip() if profession else "other"
    score += PROFESSION_RISK.get(prof_key, 0)

    return min(score, 10.0)


def _generate_precautions(risk_level: str, aqi_category: str,
                           has_asthma: bool, age: int, smoker: bool) -> list:
    """Return a personalised list of precaution strings."""
    precautions = []
    is_child = age < 12
    is_elderly = age > 60

    # Universal precautions for Poor+ AQI
    if aqi_category in ("Poor", "Very Poor", "Severe"):
        precautions += [
            "🚫 Avoid prolonged outdoor activities",
            "😷 Wear N95/KN95 mask if going outside",
            "🏠 Keep windows and doors closed",
        ]
    if aqi_category in ("Very Poor", "Severe"):
        precautions += [
            "🌬️ Use air purifier indoors (HEPA filter recommended)",
            "💧 Stay well-hydrated to help clear airways",
            "📵 Avoid strenuous exercise outdoors",
        ]
    if aqi_category == "Severe":
        precautions += [
            "🏥 Seek medical advice if you experience breathing difficulty",
            "🚗 Avoid driving with car windows open",
        ]

    # Asthma-specific
    if has_asthma:
        precautions += [
            "💊 Keep your rescue inhaler readily accessible",
            "📋 Follow your asthma action plan",
        ]
        if aqi_category not in ("Good", "Satisfactory"):
            precautions += [
                "⚠️ Your asthma raises sensitivity — limit all outdoor exposure",
                "🏥 Consult your pulmonologist if symptoms worsen",
            ]

    # Children
    if is_child and aqi_category not in ("Good", "Satisfactory"):
        precautions += [
            "👶 Reduce outdoor play time for children",
            "🏫 Inform school to limit outdoor activities",
        ]

    # Elderly
    if is_elderly and aqi_category not in ("Good", "Satisfactory"):
        precautions += [
            "👴 Elderly individuals should stay indoors during peak pollution hours (6–9 AM, 6–9 PM)",
            "❤️ Monitor blood pressure and heart rate if AQI is Poor or worse",
        ]

    # Smoker
    if smoker and aqi_category not in ("Good",):
        precautions += [
            "🚬 Smoking + air pollution severely impacts lung health — consider quitting",
        ]

    # Good AQI catch-all
    if not precautions:
        precautions = [
            "✅ Air quality is good — safe for most activities",
            "🌳 Enjoy outdoor activities; stay hydrated",
        ]

    return list(dict.fromkeys(precautions))  # Remove duplicates, preserve order


# ─── Public API ───────────────────────────────────────────────────────────────

def assess_health_risk(
    aqi: float,
    age: int,
    gender: str,
    profession: str,
    smoker: bool,
    diseases: list,
) -> dict:
    """
    Returns:
      {
        "risk_level": "Low" | "Medium" | "High",
        "risk_score": float (0–10),
        "aqi_category": str,
        "precautions": [str, ...],
        "color": hex str,
      }
    """
    aqi_info = get_aqi_category(float(aqi))
    aqi_cat = aqi_info["category"]
    aqi_score = AQI_CATEGORY_SCORE.get(aqi_cat, 0)

    has_asthma = any("asthma" in d.lower() for d in diseases)
    vuln = _vulnerability_score(age, smoker, diseases, profession)

    # Combined risk score
    risk_score = (aqi_score * 1.2 + vuln * 0.8) / 2  # scale to ~0–5
    risk_score = min(risk_score, 10.0)

    if risk_score < 2.0:
        risk_level = "Low"
        color = "#00ff88"
    elif risk_score < 4.5:
        risk_level = "Medium"
        color = "#ffaa00"
    else:
        risk_level = "High"
        color = "#ff4444"

    # Override: asthma patient in Poor+ AQI is always High
    if has_asthma and aqi_score >= 3:
        risk_level = "High"
        color = "#ff4444"

    precautions = _generate_precautions(risk_level, aqi_cat, has_asthma, age, smoker)

    return {
        "risk_level": risk_level,
        "risk_score": round(float(risk_score), 2),
        "aqi": round(float(aqi), 1),
        "aqi_category": aqi_cat,
        "aqi_color": aqi_info["color"],
        "risk_color": color,
        "precautions": precautions,
        "has_asthma": has_asthma,
        "vulnerability_score": round(float(vuln), 2),
    }
