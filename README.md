# HealthScope Python Modules

This folder contains AI model and backend logic used in HealthScope.

## Structure

- `AI/` – CNN model to detect eye diseases (Normal, Cataract, etc.)
- `backend/`
  - `health_comparator.py` – Compares old and new health report metrics.
  - `diet_recommender.py` – Recommends diets based on conditions.
  - `report_analyzer.py` – Creates prompt for AI chatbot to suggest remedies.

## Requirements

- TensorFlow / Keras
- OpenCV
- NumPy
- Python 3.10+
