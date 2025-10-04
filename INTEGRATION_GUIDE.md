# Backend-Frontend Integration Guide

## How It Works

### Architecture Overview

```
User Browser
    ↓
Frontend (HTML/CSS/JS)
    ↓ (HTTP POST to /api/predict)
FastAPI Backend
    ↓
ML Models (Logistic, Random Forest, etc.)
    ↓
Prediction Result
    ↓ (JSON Response)
Frontend displays results
```

## Step-by-Step Flow

### 1. User Interaction (Frontend)
- User selects a model (Logistic, Random Forest, Gradient Boosting, or LightGBM)
- User enters 7 parameters in the form
- User clicks "Analyze Data" button

### 2. JavaScript Processing (script.js)
```javascript
// Collects form data
const data = {
    model_name: "logistic",
    koi_fpflag_ss: 0,
    koi_fpflag_nt: 0,
    // ... other parameters
};

// Sends POST request to backend
fetch('/api/predict', {
    method: 'POST',
    body: JSON.stringify(data)
});
```

### 3. Backend Processing (backend.py)
```python
# Receives request
@app.post("/api/predict")
async def predict(request: PredictionRequest):
    # Transforms data using scalars
    # Runs selected ML model
    # Returns prediction + confidence
```

### 4. Response Back to Frontend
```json
{
    "prediction": 1,
    "confidence": 85,
    "probabilities": [0.15, 0.85],
    "is_exoplanet": true
}
```

### 5. Display Results
- Animates the confidence meter
- Shows classification (High/Moderate/Low Confidence)
- Displays whether it's an exoplanet or not
- Shows probability breakdown

## Key Files

### Backend (`backend.py`)
- **Purpose**: API server that loads ML models and makes predictions
- **Port**: 8000
- **Main Endpoint**: `POST /api/predict`
- **Dependencies**: FastAPI, joblib, pandas, numpy

### Frontend (`NASA_resources/frontend/`)

**index.html**
- Structure of the web page
- Form inputs for the 7 parameters
- Model selection buttons
- Results display area

**styles.css**
- Dark gradient theme
- Glassmorphism effects
- Responsive design
- Animation styles

**script.js**
- Handles user interactions
- Makes API calls to backend
- Animates the confidence meter
- Displays results dynamically

## Running the Application

### Terminal 1: Start Backend
```bash
cd /Users/venuvaradaraj/Desktop/Nasa_Hackathon/Exoplanet-Classifier
python backend.py
```

Expected output:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Browser: Access Frontend
Navigate to: `http://localhost:8000`

## Testing the Integration

### Example Test Data
```
Stellar Eclipse Flag: 0
Not Transit-Like Flag: 0
Centroid Offset Flag: 0
Transit Duration: 5.5
Transit Epoch: 131.5
Contamination Flag: 0
KIC Right Ascension: 290.5
```

### Expected Response
- The meter should animate to show the confidence score
- Results section shows:
  - Model used
  - EXOPLANET CANDIDATE or NOT AN EXOPLANET
  - Confidence percentage
  - Probability breakdown

## Troubleshooting

### Error: "Failed to connect to backend"
**Cause**: Backend server is not running
**Solution**: Run `python backend.py` first

### Error: Model file not found
**Cause**: Incorrect path to .pkl files
**Solution**: Verify all files are in `scalars/` directory

### Error: CORS issues
**Cause**: Cross-origin request blocked
**Solution**: Backend already includes CORS middleware

### Port already in use
**Cause**: Another process using port 8000
**Solution**: Kill the process or change port in backend.py

## API Testing with cURL

Test the backend directly:

```bash
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "model_name": "logistic",
    "koi_fpflag_ss": 0,
    "koi_fpflag_nt": 0,
    "koi_fpflag_co": 0,
    "koi_duration": 5.5,
    "koi_time0bk": 131.5,
    "koi_fpflag_ec": 0,
    "ra": 290.5
  }'
```

Expected response:
```json
{
  "prediction": 1,
  "confidence": 85,
  "probabilities": [0.15, 0.85],
  "is_exoplanet": true
}
```

## Model Selection

The frontend allows switching between 4 models:
- **Logistic Regression**: Fast, interpretable
- **Random Forest**: Ensemble method, robust
- **Gradient Boosting**: High accuracy, sequential
- **LightGBM**: Fast, efficient for large datasets

Each model was trained on NASA's exoplanet dataset and uses the same 7 input features.
