from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import os
from typing import List

app = FastAPI(title="Spam Model API", version="1.0.0")

MODEL_PATH = os.environ.get('SPAM_MODEL_PATH', 'spam_model.joblib')
model = None


class PredictRequest(BaseModel):
    texts: List[str]


@app.on_event("startup")
def load_model():
    global model
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(f"Model not found at {MODEL_PATH}. Train it first.")
    model = joblib.load(MODEL_PATH)


@app.post('/predict')
def predict(req: PredictRequest):
    if not req.texts:
        raise HTTPException(status_code=400, detail='texts is required (list of strings)')
    preds = model.predict(req.texts)
    labels = ['ham' if int(p) == 0 else 'spam' for p in preds]
    return { 'success': True, 'labels': labels }


if __name__ == '__main__':
    import uvicorn
    port = int(os.environ.get('PORT', 8001))
    uvicorn.run(app, host='0.0.0.0', port=port)


