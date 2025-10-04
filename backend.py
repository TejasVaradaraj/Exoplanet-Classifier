from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import os
import uvicorn
import pandas as pd

app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static frontend files
app.mount("/static", StaticFiles(directory="NASA_resources/frontend"), name="static")

# Load models
gbc = joblib.load("scalars/Gradient Boosting.pkl")
lGBM = joblib.load("scalars/LightGBM.pkl")
logistic = joblib.load("scalars/Logistic.pkl")
rForest = joblib.load("scalars/Random Forest.pkl")

# Load scalars
koi_duration_scalar = joblib.load("scalars/koi_duration.pkl")
koi_fpflag_co_scalar = joblib.load("scalars/koi_fpflag_co.pkl")
koi_fpflag_ec_scalar = joblib.load("scalars/koi_fpflag_ec.pkl")
koi_fpflag_nt_scalar = joblib.load("scalars/koi_fpflag_nt.pkl")
koi_fpflag_ss_scalar = joblib.load("scalars/koi_fpflag_ss.pkl")
koi_time0bk_scalar = joblib.load("scalars/koi_time0bk.pkl")
ra_scalar = joblib.load("scalars/ra.pkl")

# Request model
class PredictionRequest(BaseModel):
    model_name: str
    koi_fpflag_ss: int
    koi_fpflag_nt: int
    koi_fpflag_co: int
    koi_duration: float
    koi_time0bk: float
    koi_fpflag_ec: int
    ra: float

@app.get("/")
async def serve_frontend():
    return FileResponse("NASA_resources/frontend/index.html")

@app.post("/api/predict")
async def predict(request: PredictionRequest):
    try:
        # Transform input data using scalars
        data_dict = {
            'koi_fpflag_ss': koi_fpflag_ss_scalar.transform(np.array([[request.koi_fpflag_ss]]))[0,0],
            'koi_fpflag_nt': koi_fpflag_nt_scalar.transform(np.array([[request.koi_fpflag_nt]]))[0,0],
            'koi_fpflag_co': koi_fpflag_co_scalar.transform(np.array([[request.koi_fpflag_co]]))[0,0],
            'koi_duration': koi_duration_scalar.transform(np.array([[request.koi_duration]]))[0,0],
            'koi_time0bk': koi_time0bk_scalar.transform(np.array([[request.koi_time0bk]]))[0,0],
            'koi_fpflag_ec': koi_fpflag_ec_scalar.transform(np.array([[request.koi_fpflag_ec]]))[0,0],
            'ra': ra_scalar.transform(np.array([[request.ra]]))[0,0]
        }
        df = pd.DataFrame([data_dict])
        
        # Select and run the model
        y_pred = None
        y_proba = None
        
        if request.model_name == 'logistic':
            y_pred = logistic.predict(df)
            if hasattr(logistic, 'predict_proba'):
                y_proba = logistic.predict_proba(df)[0].tolist()
        elif request.model_name == 'random-forest':
            y_pred = rForest.predict(df)
            if hasattr(rForest, 'predict_proba'):
                y_proba = rForest.predict_proba(df)[0].tolist()
        elif request.model_name == 'gradient-boosting':
            y_pred = gbc.predict(df)
            if hasattr(gbc, 'predict_proba'):
                y_proba = gbc.predict_proba(df)[0].tolist()
        elif request.model_name == 'lightgbm':
            y_pred = lGBM.predict(df)
            if hasattr(lGBM, 'predict_proba'):
                y_proba = lGBM.predict_proba(df)[0].tolist()
        else:
            return JSONResponse(
                status_code=400,
                content={"error": f"Unknown model name: {request.model_name}"}
            )
        
        # Calculate confidence score (probability * 100)
        confidence = int(y_proba[1] * 100) if y_proba else (100 if y_pred[0] == 1 else 0)
        
        return JSONResponse(content={
            "prediction": int(y_pred[0]),
            "confidence": confidence,
            "probabilities": y_proba,
            "is_exoplanet": bool(y_pred[0] == 1)
        })
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

if __name__ == "__main__":
    uvicorn.run("backend:app", host="0.0.0.0", port=int(os.environ.get("PORT", 8000)), reload=True)