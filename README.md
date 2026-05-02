# 🛡️ Fraud Simulation & SOC Monitoring System

[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

A comprehensive end-to-end **Fraud Detection and Cyber Defense Simulation** platform. This project simulates a real-world scenario where a Security Operations Center (SOC) monitors, detects, and mitigates various cyber attacks against a target application.

---

## 🚀 Key Features

### 📡 Real-Time Monitoring
- **Live Attack Feed**: View incoming requests and security events as they happen.
- **Dynamic Risk Scoring**: Every request is analyzed and assigned a score based on malicious patterns.
- **Interactive Dashboard**: Visual graphs and statistics showing traffic trends and blocked threats.

### ⚔️ Attack Simulation Engine
- **Brute Force**: Simulate aggressive credential guessing attacks with configurable RPS.
- **SQL Injection**: Test database protection with malicious payload injections.
- **XSS & Tampering**: Validate input sanitization and parameter integrity.
- **Custom Scenarios**: Build and save your own attack patterns to test specific defense rules.

### 🛡️ Active Defense System
- **Rules Engine**: Create and manage security rules (Thresholds, Time Windows, Actions) dynamically.
- **Automatic Blocking**: Instant IP blocking when a threat exceeds the defined risk threshold.
- **Manual Control**: Directly manage the blacklist and unblock IPs from the dashboard.

---

## 🏗️ Architecture

The system is built using a **Multi-Tier Microservices Architecture**, fully containerized for seamless deployment.

```mermaid
graph TD
    User((Analyst)) -->|Manages SOC| Frontend[React Dashboard]
    Frontend -->|API Calls| SOC_Backend[SOC Backend - Java/Spring]
    SOC_Backend -->|Stores Rules/Logs| DB[(PostgreSQL)]
    
    Attacker((Simulation Engine)) -->|Attacks| Victim[Victim Server - Java/Spring]
    Victim -->|Fetches Rules| SOC_Backend
    Victim -->|Reports Incidents| SOC_Backend
    Victim -->|Updates Stats| Frontend
```

---

## 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Material UI, Recharts |
| **SOC Backend** | Java 17, Spring Boot, Spring Security (JWT), Hibernate |
| **Victim Server** | Java 17, Spring Boot, Active Defense Logic |
| **Database** | PostgreSQL 16 |
| **Infrastructure** | Docker, Docker Compose, Nginx |

---

## 🚦 Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Installation & Run
1. **Clone the repository**:
   ```bash
   git clone https://github.com/seanpip05/fraud-project.git
   cd fraud-project
   ```

2. **Configure Environment**:
   The system uses a `.env` file for secrets. Ensure you have one in the root directory:
   ```env
   DB_PASSWORD=your_secure_password
   JWT_SECRET_KEY=your_base64_secret_key
   JWT_EXPIRATION=86400000
   ```

3. **Launch the platform**:
   ```bash
   docker compose up --build
   ```

4. **Access the Dashboard**:
   Open your browser and navigate to `http://localhost`.

---

## 📸 Dashboard Preview

*Insert your beautiful screenshots here!*
- **Main SOC View**: Monitoring global security status.
- **Victim Monitor**: Real-time traffic analysis.
- **Rule Builder**: Configuring the defense logic.

---

## 📜 Project Background
This project was developed as a final thesis/capstone to demonstrate the integration of modern web technologies with cybersecurity defense principles. It provides a safe environment to learn how automated detection systems (IDS/IPS) operate in high-pressure scenarios.

---

**Developed with ❤️ by Sean Pipkin**
