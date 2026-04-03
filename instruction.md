# 🌍 BreatheSafe Chennai – AQI Prediction & Health Risk Management System

## 📌 Project Overview

BreatheSafe Chennai is a full-stack web application designed to monitor, analyze, and predict Air Quality Index (AQI) levels in Chennai. The platform integrates machine learning-based AQI prediction with a health risk assessment module focused on asthma patients and vulnerable populations.

The system uses real AQI pollutant data and enhances it with synthetically generated weather data to simulate real-world environmental conditions.

---

## 🎯 Objectives

* Predict AQI using machine learning models
* Analyze historical AQI trends and pollutant contributions
* Identify pollution hotspots in Chennai
* Provide personalized health risk assessment (especially for asthma patients)
* Deliver actionable precautions based on AQI levels

---

## 👥 Target Users

* General public
* Asthma patients
* Elderly individuals
* Children
* Health-conscious users

---

## 🧠 Core Features

### 1. KPI Dashboard

Display the following metrics:

* Current AQI
* Average AQI (Last 30 Days)
* Maximum AQI Recorded
* Predicted AQI for Tomorrow
* % Change from Yesterday
* AQI Category (Color-coded)

---

### 2. Data Pipeline (IMPORTANT)

#### Input Data:

* Base dataset: AQI_weather.csv
* Base dataset: AQI pollutant dataset (PM2.5, PM10, NO₂, SO₂, CO, O₃, NH₃)
* Locations: 20 populated areas in Chennai (treated as monitoring zones)
* Each area represents a distinct spatial region for AQI analysis

#### Synthetic Spatial Expansion:

* If base dataset has fewer stations, expand to 21 areas using mapping logic
* Assign each data record to one of the 20 Chennai areas
* Use duplication + noise addition to simulate realistic variation between areas

#### Logic:

* Randomly assign area names to existing records
* Add slight variation:
  * AQI ± 5–15
  * Pollutants ± small Gaussian noise
* Ensure no two areas have identical patterns

* Use random distribution with seasonal patterns:

  * Higher temperature in summer months
  * Higher humidity in monsoon
* Ensure reproducibility using random seed


#### Output Dataset:

Final dataset should include:
PM2.5, PM10, NO₂, SO₂, CO, O₃, NH₃, Temperature, Humidity, Wind Speed, AQI

---

#### Chennai Areas (21 Zones):

* T. Nagar
* Adyar
* Velachery
* Anna Nagar
* Tambaram
* Porur
* Guindy
* Perungudi
* Sholinganallur
* Egmore
* Mylapore
* Chromepet
* Ambattur
* Avadi
* Nungambakkam
* Royapettah
* Saidapet
* Pallavaram
* Thoraipakkam
* Besant Nagar
* Tambaram

#### Hotspot Logic:

* Compute average AQI per area (20 areas)
* Rank areas:
  * Top 5 → High Pollution Hotspots
  * Middle → Moderate Zones
  * Bottom → Clean Zones

* Assign "Hotspot Score":
  - Based on AQI + pollutant concentration

* Display:
  * Top polluted areas
  * Least polluted areas

### 3. Machine Learning Module

#### Models:

* Random Forest Regressor
* XGBoost Regressor
* Gradient Boosting Regressor

#### Tasks:

* Train on historical AQI data
* Predict:

  * Next 24–72 hours AQI
  * Next 7 days AQI (forecast)

#### Evaluation Metrics:

* RMSE
* MAE
* R² Score

#### Advanced Feature:

* Feature importance visualization (Explainable AI)

---

### 4. Dashboard & Visualizations

#### Layout:

---

## | KPI Cards (6 cards)                        |

## | AQI Trend (Historical)  | City Comparison  |

## | Pollutant Analysis      | AQI Category     |

## | ML Forecast (7 days)    | Actual vs Pred   |

## | Correlation Heatmap                     |

---

### Charts:

#### Historical AQI Trend

* Type: Line Chart

#### Pollutant Contribution

* Type: Pie Chart

#### Predicted vs Actual AQI

* Type: Dual Line Chart

#### Future Forecast (7 Days)

* Type: Time-Series Chart

#### Correlation Heatmap

* Type: Heatmap

#### AQI Category Distribution

* Type: Donut Chart

---

### 5. City Insights Module

#### Features:

* City-wise AQI trends
* Seasonal AQI behavior
* Pollution hotspot identification

#### Hotspot Logic:

* Compute average AQI per station
* Rank stations:

  * High AQI → Hotspot
  * Low AQI → Clean zone

---

### 6. AQI Classification

Color-coded categories:

* Good (Green)
* Satisfactory (Light Green)
* Moderate (Yellow)
* Poor (Orange)
* Very Poor (Red)
* Severe (Dark Red)

---

### 7. Health Risk Assessment Module (Advanced)

#### User Inputs:

* Age
* Gender
* Profession
* Smoker (Yes/No)
* Existing diseases (Asthma, etc.)

#### Output:

* Risk Level: Low / Medium / High
* Personalized recommendations

#### Logic:

* Combine AQI category + user vulnerability
* Asthma patients → higher sensitivity

#### Recommendations:

Provide precautions for:

* Children
* Elderly
* Asthma patients

Example:

* Avoid outdoor activity
* Use masks
* Stay indoors
* Use air purifiers

---

## 🖥️ Frontend (React)

### Pages:

* Home
* Dashboard
* Forecast
* Health Risk
* City Insights
* About

### UI Theme:

* Dark theme (Black background)
* Green → Safe AQI
* Blue → Information
* Red → Dangerous AQI

### Components:

* KPI Cards
* Charts (Recharts / Chart.js)
* Input Forms (Health module)
* Navigation Bar

---

## ⚙️ Backend (Flask)

### Responsibilities:

* Data preprocessing
* Synthetic data generation
* ML model training & prediction
* API endpoints

### API Endpoints:

* /api/current-aqi
* /api/predict
* /api/forecast
* /api/health-risk
* /api/dashboard-data

---

## 🧪 ML Workflow

1. Load dataset
2. Generate synthetic spatial data (20 areas)
3. Generate synthetic weather data
4. Feature engineering
5. Train models
6. Evaluate performance
7. Save best model
7. Serve predictions via API

---


## 💡 Novelty & Highlights

* Multi-model AQI prediction system
* Synthetic + real hybrid dataset
* Explainable AI (feature importance)
* Health-centric decision support
* Asthma-focused risk analysis
* Fully deployable modern web application

---

## 📌 Future Scope

* Live AQI API integration
* Mobile application
* Real-time alerts/notifications
* Advanced geospatial heatmaps

---

## 🏁 Conclusion

BreatheSafe Chennai is an intelligent air quality monitoring and health advisory platform that combines machine learning, data analytics, and personalized healthcare insights to improve urban living conditions.
