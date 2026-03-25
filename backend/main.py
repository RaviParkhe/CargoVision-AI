from ultralytics import YOLO
import os
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import shutil

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load YOUR trained model
model = YOLO("VIT HACKTHON/CargoVision-AI/cargoxray-master/runs/detect/train/weights/best.pt")  # <-- trained model

HIGH_RISK = {"knife", "gun", "pistol", "rifle"}
MEDIUM_RISK = {"scissors", "tools"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Run inference
    results = model(file_path)[0]

    detections = []
    risk = "LOW"

    for box in results.boxes:
        cls_id = int(box.cls[0])
        label = model.names[cls_id]
        conf = float(box.conf[0])

        detections.append({
            "label": label,
            "confidence": round(conf, 2)
        })

        if label in HIGH_RISK:
            risk = "HIGH"
        elif label in MEDIUM_RISK and risk != "HIGH":
            risk = "MEDIUM"

    explanation = (
        "High-risk object detected" if risk == "HIGH" else
        "Suspicious object detected" if risk == "MEDIUM" else
        "No significant threat detected"
    )

    return JSONResponse({
        "detections": detections,
        "risk": risk,
        "explanation": explanation
    })