# Analysing and Predicting Major Earthquakes in Pakistan (2025–2030)

## Project By: Abdur Rehman Tariq & Ahmad Hassan

---

## Introduction

During our time at Space Summer School, we explored satellite data and learned how to access and utilize it effectively. Drawing on our newly acquired skills, we developed an earthquake prediction and risk analysis system based on seismic data provided by Mr. Abdul Mateen from the Space Summer School team. The data was sourced from the United States Geological Survey (USGS) and credited to NCGSA.

---

## Project Goals

- Build a model to predict the frequency of major earthquakes (Magnitude ≥ 6) in Pakistan for the years 2025–2030.
- Develop an interactive dashboard to analyze and visualize earthquake risk across Pakistan's districts.

---

## Problem Statement & Initial Challenges

We initially worked with 5 years of data (2020–2025) containing the following fields:

| Field Name | Description |
|------------|-------------|
| `time` | Timestamp of the earthquake event |
| `latitude` | Latitude coordinate of the earthquake epicenter |
| `longitude` | Longitude coordinate of the earthquake epicenter |
| `depth` | Depth of the earthquake (in kilometers) |
| `mag` | Magnitude of the earthquake |
| `place` | Textual description of the location |
| `type` | Type of seismic event (e.g., earthquake, explosion) |

The challenge was to build a reliable forecasting model with limited and inherently chaotic seismic data.

---

## Technologies Used

- **Python**
  - `pandas`, `numpy` for data preprocessing
  - `matplotlib`, `seaborn`, `plotly` for data visualization
  - `scikit-learn`, `xgboost` for model training
- **Machine Learning Models**
  - Linear Regression
  - Polynomial Regression
  - Random Forest Regressor
  - Gradient Boosting Regressor
  - XGBoost
- **Leaflet + ReactJS**
  - For building a dynamic frontend map displaying live and predicted earthquake data
---

## Prediction Models

We trained models to forecast:

- **Total Earthquakes per Year**
- **Average Magnitude**
- **Maximum Magnitude**
- **Geographic Location (Latitude & Longitude)**

We tested the models using `R²` and `MSE` to measure their performance and selected the best ensemble (stacking) model to make our final predictions.

---

## Deployment

1. **Frontend:**
   - Built using ReactJS with LeafletJS for geospatial rendering and TailwindCSS for styling
   - Displays current and predicted earthquake statistics, highlighting **major earthquakes** (Magnitude ≥ 5)


---

## Output

- Forecast of **major earthquake activity in Pakistan from 2025 to 2030**
- Interactive heatmaps for earthquake-prone districts
---

## Future Work

- Integrate satellite imagery analysis for tectonic movement detection
- Expand training data by including global datasets
- Incorporate seismic wave modeling for more accurate predictions
