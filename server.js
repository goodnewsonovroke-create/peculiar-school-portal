// ==========================================
// 1. SETUP & IMPORTS
// ==========================================
const mysql = require('mysql2/promise');
const express = require('express');
const cors = require('cors');
const app = express();

// ==========================================
// 2. MIDDLEWARE (How the server handles data)
// ==========================================
app.use(express.json({ limit: '50mb' }));
app.use(cors());
app.use(express.static(__dirname)); // Serves your HTML/CSS files

// ==========================================
// 3. DATABASE CONNECTION
// ==========================================
// This uses Render environment variables automatically when live!
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'peculiar_db'
});

// ==========================================
// 4. API ENDPOINTS (The "Routes")
// ==========================================

// --- BULK UPLOAD ENDPOINT ---
app.post('/api/upload-bulk', async (req, res) => {
    try {
        const d = req.body;
        const values = d.results.map(r => [
            d.name, d.id, d.class, r.subject, r.ca, r.exam,
            (parseInt(r.ca || 0) + parseInt(r.exam || 0)),
            'P', d.passport, 'Paid', d.drawing, d.sports, d.communication,
            d.leadership, d.self_control, d.neatness, d.punctuality
        ]);
        
        // Ensure you have your SQL INSERT query here to handle 'values'
        // await db.query("INSERT INTO results (...) VALUES ?", [values]);

        res.json({ message: "Upload successful!" });
    } catch (err) {
        console.error("Upload Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// --- CHECK RESULT ENDPOINT ---
app.get('/api/check-result', async (req, res) => {
    try {
        const { name, id } = req.query;
        const [rows] = await db.query("SELECT * FROM results WHERE student_name = ? AND student_id = ?", [name, id]);
        
        if (rows.length > 0) {
            res.json(rows);
        } else {
            res.status(404).json({ error: "Student not found. Please check your details." });
        }
    } catch (err) {
        console.error("Check Result Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// --- ANALYTICS ENDPOINT ---
app.get('/api/analytics-data', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT student_name, student_id, student_class, subject, total, grade FROM results");
        res.json(rows);
    } catch (err) {
        console.error("Analytics Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 5. START SERVER
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 PECULIAR SERVER ACTIVE AT PORT ${PORT}`);
});