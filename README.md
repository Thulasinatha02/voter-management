# Ward Management System (React + Node.js + Express + MongoDB)

A modern, production-grade administrative dashboard and demographic registry designed for neutral, privacy-respecting ward enumeration, family management, and live reporting.

---

## 🔒 Policy on Non-Profiling & Sensitive Attributes
In strict compliance with statutory democratic governance:
- **Religion and political party affiliation are intentionally prohibited** from being used to profile individual voters or build targeted political messaging lists.
- Member registration only records legitimate administrative attributes (full name, age/DOB, gender, relationship, household address, voter franchise age threshold).
- Aggregate dashboard views display neutral statistics (completion rates, sector density, voter eligibility totals).

---

## 🏗️ Architecture & Features

### 1. Frontend (`/client`)
- **Framework**: React 19 + Vite 6
- **Styling**: Tailwind CSS with custom design tokens, responsive cards, and clean typography (`Plus Jakarta Sans`)
- **Icons**: Lucide React
- **Routing**: `react-router-dom` with role-based protected routes
- **Global Context**: Dynamic Ward Selector in Navbar that synchronizes all dashboard KPIs, family directory searches, and reports to the currently selected ward.

### 2. Backend (`/server`)
- **Server**: Node.js + Express 5
- **Database**: MongoDB with Mongoose
- **Validation**: Zod schema validation for all endpoints
- **Authentication**: JWT Bearer tokens with bcrypt password hashing
- **Security**: Helmet, CORS origin configuration, rate-ready structure
- **Audit Logging**: Immutable tracking of actions (`CREATE`, `UPDATE`, `ARCHIVE`, `LOGIN`, `EXPORT`)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB running locally at `mongodb://127.0.0.1:27017` or MongoDB Atlas URI

### 1. Server Setup
```bash
cd server
npm install
npm run seed     # Seeds sample wards, households, and test admin accounts
npm run dev      # Starts Express API at http://localhost:5000
```

### 2. Client Setup
```bash
cd ../client
npm install
npm run dev      # Starts Vite React dev server at http://localhost:5173
```

---

## 👥 Default Demo Credentials

| Role | Username | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Superadmin** | `admin` | `admin123` | Full access across all wards, user creation, audit logs |
| **Field Operator** | `operator` | `admin123` | Scoped to Ward 01 & Ward 02 family/member entry |

---

## 📋 API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Fetch active user profile |
| `GET` | `/api/wards` | List authorized wards |
| `POST` | `/api/wards` | Create new ward |
| `PATCH` | `/api/wards/:id` | Update ward details |
| `PATCH` | `/api/wards/:id/archive`| Soft-archive / restore ward |
| `GET` | `/api/dashboard/summary?wardId=...` | Live MongoDB aggregation KPIs |
| `GET` | `/api/families?wardId=...` | Paginated family directory |
| `POST` | `/api/families` | Register family & multiple members atomically |
| `GET` | `/api/families/:id` | View family and all members |
| `GET` | `/api/members?wardId=...` | List individual members with filters |
| `POST` | `/api/members` | Add single member to family |
| `GET` | `/api/reports/ward/:id` | Statutory ward demographic report |
| `GET` | `/api/reports/ward/:id/export-csv` | Authorized CSV download |
| `GET` | `/api/reports/audit-logs` | Immutable audit log trail |
