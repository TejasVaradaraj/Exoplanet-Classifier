# Exoplanet-Classifier

Building a machine learning model that is trained on one or more of NASA's open-source exoplanet datasets to classify exo-planets. Building a Web application where users can interact with the provided results and view details of respective exo-planets.

## Features

- **Multiple ML Models**: Choose from Logistic Regression, Random Forest, Gradient Boosting, or LightGBM
- **Real-time Predictions**: Get instant exoplanet classification results
- **Beautiful UI**: Modern, dark-themed interface with animated confidence meter
- **Manual Input**: Enter parameters directly for single predictions
- **CSV Upload**: Batch process exoplanet data from CSV files

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Run the Backend Server

```bash
python backend.py
```

The server will start on `http://localhost:8000`

### 3. Access the Application

Open your browser and navigate to:
```
http://localhost:8000
```

## Input Parameters

The classifier uses the following parameters:

1. **Stellar Eclipse Flag** (koi_fpflag_ss): 0 or 1
2. **Not Transit-Like Flag** (koi_fpflag_nt): 0 or 1
3. **Centroid Offset Flag** (koi_fpflag_co): 0 or 1
4. **Transit Duration** (koi_duration): Hours
5. **Transit Epoch** (koi_time0bk): BJD - 2,454,833.0
6. **Ephemeris Match Contamination Flag** (koi_fpflag_ec): 0 or 1
7. **KIC Right Ascension** (ra): Degrees

## API Endpoints

- `GET /`: Serve the frontend application
- `POST /api/predict`: Make predictions
  - Request body:
    ```json
    {
      "model_name": "logistic",
      "koi_fpflag_ss": 0,
      "koi_fpflag_nt": 0,
      "koi_fpflag_co": 0,
      "koi_duration": 5.0,
      "koi_time0bk": 100.0,
      "koi_fpflag_ec": 0,
      "ra": 290.5
    }
    ```
  - Response:
    ```json
    {
      "prediction": 1,
      "confidence": 85,
      "probabilities": [0.15, 0.85],
      "is_exoplanet": true
    }
    ```

## Project Structure

```
Exoplanet-Classifier/
├── backend.py                  # FastAPI backend server
├── requirements.txt            # Python dependencies
├── scalars/                    # Trained models and scalars
│   ├── Logistic.pkl
│   ├── Random Forest.pkl
│   ├── Gradient Boosting.pkl
│   ├── LightGBM.pkl
│   └── *.pkl                  # Feature scalars
├── NASA_resources/
│   └── frontend/              # Frontend files
│       ├── index.html
│       ├── styles.css
│       └── script.js
└── data.ipynb                 # Training notebook
```
