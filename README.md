# 🧾 SLN Traders Billing System

A full-stack billing management system built with Angular and Spring Boot.

---

## 📁 Project Structure

* **frontend** → Angular application (UI)
* **backend** → Spring Boot REST API

---

## 🚀 Features

* 🔐 User Authentication (Login & Register)
* 🧾 Billing Management
* 📊 Size Sheet Management
* 📜 Recent Bills Tracking

---

## 🛠️ Tech Stack

* **Frontend:** Angular
* **Backend:** Spring Boot (Java)
* **Database:** MySQL *(or H2 for testing)*
* **Build Tool:** Maven

---

## ▶️ How to Run the Project

### 🔹 1. Clone Repository

```bash
git clone https://github.com/your-username/SLN-Traders-Billing.git
cd SLN-Traders-Billing
```

---

### 🔹 2. Run Backend (Spring Boot)

```bash
cd backend
.\mvnw.cmd spring-boot:run
```

* Runs on: **http://localhost:8080**

---

### 🔹 3. Run Frontend (Angular)

```bash
cd frontend
npm install
ng serve
```

* Runs on: **http://localhost:4200**

---

## 🔗 API Endpoints

### Authentication

* `POST /api/auth/register` → Register user
* `POST /api/auth/login` → Login user

---

## ⚠️ Notes

* Ensure Java (JDK 17+) is installed and configured (`JAVA_HOME`)
* Ensure Node.js and Angular CLI are installed
* Backend must be running before frontend API calls

---

## 📸 Future Improvements

* 🔐 JWT Authentication & Role-based access
* 🌐 Deploy frontend & backend online
* 📊 Dashboard & analytics
* 🧾 PDF bill generation

---

## 👨‍💻 Author

Sampangi Suman
