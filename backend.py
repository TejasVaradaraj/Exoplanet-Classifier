from fastapi import FastAPI, Request, Form
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import joblib
import numpy as np
import os
import uvicorn
import pandas as pd

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

# models
gbc = joblib.load("scalar/Gradient Boosting.pkl")
lGBM = joblib.load("scalar/LightGBM.pkl")
logistic = joblib.load("scalar/Logistic.pkl")
rForest = joblib.load("scalar/Random Forest.pkl")

# scalars
koi_duration_scalar = joblib.load("scalar/koi_duration.pkl")
koi_fpflag_co_scalar = joblib.load("scalar/koi_fpflag_co.pkl")
koi_fpflag_ec_scalar = joblib.load("scalar/koi_fpflag_ec.pkl")
koi_fpflag_nt_scalar = joblib.load("scalar/koi_fpflag_nt.pkl")
koi_fpflag_ss_scalar = joblib.load("scalar/koi_fpflag_ss.pkl")
koi_time0bk_scalar = joblib.load("scalar/koi_time0bk_scalar.pkl")
ra_scalar = joblib.load("scalar/ra.pkl")

templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def form_get(request: Request):
    return templates.TemplateResponse("index.html", {"request":request})

@app.post("/", response_class=HTMLResponse)
async def submit_form(
    request: Request,
    model_name: str = Form(...),
    koi_fpflag_ss: int = Form(...),
    koi_fpflag_nt: int = Form(...),
    koi_fpflag_co: int = Form(...),
    koi_duration: float = Form(...),
    koi_time0bk: float = Form(...),
    koi_fpflag_ec: int = Form(...),
    ra: float = Form(...)
):
    try:
        data_dict = {
            'koi_fpflag_ss': koi_fpflag_ss_scalar.transform(np.array([[koi_fpflag_ss]]))[0,0],
            'koi_fpflag_nt': koi_fpflag_nt_scalar.transform(np.array([[koi_fpflag_nt]]))[0,0],
            'koi_fpflag_co': koi_fpflag_co_scalar.transform(np.array([[koi_fpflag_co]]))[0,0],
            'koi_duration': koi_duration_scalar.transform(np.array([[koi_duration]]))[0,0],
            'koi_time0bk': koi_time0bk_scalar.transform(np.array([[koi_time0bk]]))[0,0],
            'koi_fpflag_ec': koi_fpflag_ec_scalar.transform(np.array([[koi_fpflag_ec]]))[0,0],
            'ra': ra_scalar.transform(np.array([[ra]]))[0,0]
        }
        df = pd.DataFrame([data_dict])
        
        y_pred = None # initial case
        
        if model_name == 'logistic':
            y_pred = logistic.predict(df)
        elif model_name == 'random-forest':
            y_pred = rForest.predict(df)
        elif model_name == 'gradient-boosting':
            y_pred = gbc.predict(df)
        elif model_name == 'lightgbm':
            y_pred = lGBM.predict(df)
        else:
            raise ValueError(f"Unknown model name: {model_name}")
                
        return templates.TemplateResponse("index.html",{
            "request": Request,
            "output": int(y_pred[0]),
            "error": None
        })
    except Exception as e:
        return templates.TemplateResponse("index.html",{
            "request": Request,
            "output": None,
            "error": str(e)
        })

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port = int(os.environ.get("PORT",8000)))