# BFHL Full Stack Assignment

This project was developed as part of the Bajaj Finserv Health Limited Full Stack assessment.

## 🚀 Live Links

* Frontend: https://bfhl-frontend-abhijeet.netlify.app
* Backend API: https://bfhl-backend-igvm.onrender.com

---

## 📌 Features

* Accepts node relationships (e.g., A->B)
* Validates input format
* Detects invalid entries and duplicates
* Identifies cycles in graph
* Builds hierarchical tree structures
* Displays summary of results

---

## 🛠️ Tech Stack

**Frontend:**
HTML, CSS, JavaScript

**Backend:**
Node.js, Express.js, CORS

**Deployment:**
Netlify (Frontend), Render (Backend)

---

## ⚙️ API Endpoint

### POST /bfhl

**Request:**
{
"data": ["A->B", "B->C"]
}

**Response:**

* Hierarchy structure
* Summary (trees, cycles)
* Invalid entries
* Duplicate edges

---

## 🧠 Working

1. User enters node relationships
2. Frontend sends POST request to backend
3. Backend processes graph logic
4. Returns structured JSON response
5. Frontend displays results visually

---

## 👤 Author

Abhijeet Kumar
