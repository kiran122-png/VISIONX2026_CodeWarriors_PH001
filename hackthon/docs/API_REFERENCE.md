# 🛠️ JanRakshak AI: API Documentation (v1.0)
### 🏆 VISION X 2026 Technical Reference

This document outlines the lightweight, high-performance REST API endpoints for the **JanRakshak AI** backend.

---

## 🚀 1. Health Risk Prediction Engine
**Endpoint:** `POST /api/predict`
**Role:** Uses fuzzy clinical thresholds to score non-communicable disease risks.

### **Request Body (JSON):**
```json
{
  "age": 45,
  "weight": 85,
  "systolic": 150,
  "diastolic": 95,
  "glucose": 200,
  "hemoglobin": 10.5
}
```

### **Response (JSON):**
```json
{
  "heart_risk": "High",
  "diabetes_risk": "High",
  "anemia_risk": "Moderate",
  "prescriptions": [
    {
      "condition": "Diabetes",
      "medicines": [{"name": "Metformin 500mg", "dose": "1 tab bi-daily", ...}]
    }
  ]
}
```

---

## 🦴 2. AI Multimodal Diagnosis (Vision)
**Endpoint:** `POST /api/image-diagnosis`
**Role:** Integrates **Google Gemini 1.5 Flash** for X-Ray/Wound scanning.

### **Request Data (Form-Data):**
- `image`: Binary file (JPG/PNG).
- `scan_mode`: `wound` or `bone`.

### **Emergency Feature:** 
If `scan_mode="bone"` and a fracture is detected, the API returns a **"⛔ STOP / FIRST AID ONLY"** protocol to protect the patient before surgery.

---

## 🤱 3. Maternal Health Suite
**Endpoint:** `POST /api/maternal-risk`
**Role:** Evaluates prenatal risks for mothers based on PM Janani Suraksha Yojana guidelines.

### **Request Body (JSON):**
```json
{
  "age": 17,
  "weeks": 24,
  "hemoglobin": 8.5,
  "systolic": 160,
  "diastolic": 110,
  "weight": 52,
  "height": 155,
  "gravida": 2,
  "prev_cs": true,
  "diabetes_hist": true,
  "symptoms": ["Blurred Vision", "Severe Headache"]
}
```

---

## 🏥 4. GPS Hospital Triage
**Endpoint:** `POST /api/alert-hospital`
**Role:** Identifies the nearest 10+ hospitals and PHCs based on patient geolocation and triggers an alert.

---

## 🌍 Multilingual NLP Lookup
**Endpoint:** `POST /api/disease-lookup`
**Role:** Uses a fuzzy-match engine to map colloquial terms (e.g., "loose motion") to medical conditions in English, Hindi, and Telugu.
