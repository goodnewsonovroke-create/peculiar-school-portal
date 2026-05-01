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
// This tells your server to accept large image payloads!
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// ==========================================
// 3. DATABASE CONNECTION
// ==========================================
// See how we changed createConnection to createPool right here? 👇
const db = mysql.createPool({
    connectionLimit: 10,
    host: 'mysql-1cd8eef8-peculiar-portal-01.h.aivencloud.com',
    port: '12174', 
    user: 'avnadmin',
    password: 'process.env.DB_PASSWORD,',
    database: 'defaultdb',
    // ADD THIS NEW SSL BLOCK HERE 👇
    ssl: {
        rejectUnauthorized: false
    }
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
// MODERN PROMISE-BASED SETUP ROUTE
app.get('/api/setup-database', async (req, res) => {
    try {
        const createStudentsTable = `
            CREATE TABLE IF NOT EXISTS students (
                id VARCHAR(50) PRIMARY KEY, name VARCHAR(100), class VARCHAR(20), 
                term VARCHAR(20), passport LONGTEXT, drawing INT, sports INT, 
                communication INT, leadership INT, self_control INT, neatness INT, 
                punctuality INT, attitude INT, t_comment TEXT, p_comment TEXT
            )
        `;

        const createResultsTable = `
            CREATE TABLE IF NOT EXISTS results (
                id INT AUTO_INCREMENT PRIMARY KEY, student_id VARCHAR(50), 
                subject VARCHAR(50), ca INT, exam INT, 
                FOREIGN KEY (student_id) REFERENCES students(id)
            )
        `;

        if (!db) {
            return res.send("<h1>🚨 ERROR: 'db' is missing!</h1>");
        }

        // We use 'await' here instead of callbacks!
        await db.query(createStudentsTable);
        await db.query(createResultsTable);

        res.send("<h1>✅ DATABASE TABLES CREATED SUCCESSFULLY!</h1>");

    } catch (error) {
        // This catches any crashes and prints them
        res.send("<h1>🚨 SERVER CRASHED:</h1> <p>" + error.message + "</p>");
    }
});
// ==========================================
// 5. START SERVER
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 PECULIAR SERVER ACTIVE AT PORT ${PORT}`);
});