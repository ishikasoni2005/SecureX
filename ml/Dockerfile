FROM python:3.10-slim

WORKDIR /app

COPY ml/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY ml /app/ml

ENV SPAM_MODEL_PATH=/app/ml/spam_model.joblib
EXPOSE 8001

CMD ["uvicorn", "ml.serve_spam:app", "--host", "0.0.0.0", "--port", "8001"]


