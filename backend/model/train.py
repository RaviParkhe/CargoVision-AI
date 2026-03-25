from ultralytics import YOLO

model = YOLO("yolov8n.pt")

model.train(
    data="Sixray.v5i.yolov8/data.yaml",
    epochs=20,
    imgsz=640,
    batch=8,
    name="cargo_model"
)