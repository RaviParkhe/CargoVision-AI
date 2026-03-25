from ultralytics import YOLO

if __name__ == "__main__":
    model = YOLO("yolov8n.pt")

    model.train(
        data="E:/VIT Hackthon/CargoVision-AI/dataset/Sixray.v5i.yolov8/data.yaml",
        epochs=20,
        imgsz=640,
        batch=8,
        name="cargo_model"
    )