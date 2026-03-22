# 🚀 CargoVision AI

AI-powered cargo inspection system to detect suspicious and prohibited objects in X-ray images using YOLOv8.

---

## 🎯 Problem Statement
Manual inspection of cargo images is time-consuming, inconsistent, and prone to human error. Detecting hidden contraband like weapons or narcotics is challenging.

---

## 💡 Our Solution
CargoVision AI uses deep learning to:
- Detect suspicious objects in cargo images
- Highlight regions using bounding boxes
- Classify objects (normal / suspicious / prohibited)
- Assign a risk score
- Provide explanation for detection

---

## 🧠 System Architecture

![Architecture](docs/architecture.png)

---

## ⚙️ Tech Stack
- Frontend: React.js
- Backend: FastAPI
- AI Model: YOLOv8 (Ultralytics)
- Image Processing: OpenCV

---

## 📊 Features
- Object Detection
- Risk Scoring System
- Suspicious Region Highlighting
- Simple Web Interface

---

## 📂 Project Structure
frontend/ → React UI
backend/ → FastAPI + AI logic
dataset/ → Dataset info
docs/ → Architecture & images
