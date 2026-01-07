# How to Run College ERP System

## 📋 Prerequisites
Before running the project on a new system, ensure you have the following installed:

1.  **Java JDK 17** (Required for Backend)
    - Download: [Eclipse Temurin JDK 17](https://adoptium.net/temurin/releases/?version=17) or Oracle JDK 17.
    - Verify: `java -version`

2.  **Node.js & npm** (Required for Frontend)
    - Download: [Node.js LTS](https://nodejs.org/)
    - Verify: `node -v` and `npm -v`

3.  **Maven** (Optional but recommended)
    - Usually included in the `apache-maven-x.x.x` folder inside this project, or install globally.

---

## 🚀 Setup & Run Instructions

### 1. Backend Setup (Spring Boot)
The backend runs the API logic and manages the database.

1.  Open a terminal.
2.  Navigate to the `backend` folder:
    ```bash
    cd backend
    ```
3.  Run the application using the included Maven wrapper or your local Maven:
    
    *If you have the `apache-maven` folder included:*
    ```bash
    ../apache-maven-3.9.6/bin/mvn spring-boot:run
    ```
    
    *OR if you have Maven installed globally:*
    ```bash
    mvn spring-boot:run
    ```

4.  Wait for the logs to show **"Started ErpSystemApplication"**.
    - Server runs on: `http://localhost:8080`

### 2. Frontend Setup (React)
The frontend is the user interface.

1.  Open a **new** terminal.
2.  Navigate to the `frontend` folder:
    ```bash
    cd frontend
    ```
3.  Install dependencies (only needed the first time):
    ```bash
    npm install
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```
5.  Open your browser to: http://localhost:5173

---

## 🔑 Login Credentials

The system is pre-loaded with the following users (Password is same for all: `123` suffix to check README, usually `role` + `123`):

| Role | Username | Password |
|------|----------|----------|
| **Admin** | `admin` | `admin123` |
| **Accounts** | `accounts` | `accounts123` |
| **Admissions** | `admissions` | `admissions123` |
| **Warden** | `warden` | `warden123` |
| **Librarian** | `librarian` | `librarian123` |
| **Exam Cell** | `examcell` | `examcell123` |

---

## ℹ️ Important Notes

- **Database**: The project is configured to use **H2 File-Based Database**.
    - **Effect**: Data is **saved** to the `backend/data/` folder. It persists even after you stop the server.
    - **Reset**: To clear data, simply delete the `backend/data/` folder.
- **Backend Port**: 8080
- **Frontend Port**: 5173
