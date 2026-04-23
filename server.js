const mysql = require('mysql2/promise');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(cors());
app.use(express.static(__dirname)); // Serves your school-logo.png and styles.css

// Database Connection
const db = mysql.createPool({
    host: 'localhost', 
    user: 'root', 
    password: '', 
    database: 'peculiar_db'
});

// 1. BULK UPLOAD ENDPOINT
app.post('/api/upload-bulk', async (req, res) => {
    try {
        const d = req.body;
     // Inside app.post('/api/upload-bulk')
const values = d.results.map(r => [
    d.name, d.id, d.class, d.term, r.subject, r.ca, r.exam, (parseInt(r.ca || 0) + parseInt(r.exam || 0)), 
    'P', d.passport, 'Paid', d.drawing, d.sports, d.communication, d.leadership, 
    d.self_control, d.neatness, d.punctuality, d.attitude, d.t_comment, d.p_comment
]);

const sql = `INSERT INTO results (
    student_name, student_id, student_class, term, subject, ca_score, exam_score, total, 
    grade, passport, fees_status, drawing, sports, communication, leadership, 
    self_control, neatness, punctuality, attitude, teacher_comment, principal_comment
) VALUES ?`;
        
        await db.query(sql, [values]);
        res.status(200).json({ success: true, message: "Upload Complete" });
    } catch (err) { 
        console.error(err);
        res.status(500).json({ error: err.message }); 
    }
});

// 2. CHECK RESULT ENDPOINT
app.get('/api/check-result', async (req, res) => {
    try {
        const { name, id } = req.query;
        const [rows] = await db.query("SELECT * FROM results WHERE student_name = ? AND student_id = ?", [name, id]);
        
        if (rows.length > 0) res.json(rows);
        else res.status(404).json({ error: "Student not found" });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// Change this in server.js
const db = mysql.createPool({
    host: 'YOUR_NEW_AIVEN_HOST_URL', 
    user: 'YOUR_NEW_AIVEN_USERNAME', 
    password: 'YOUR_NEW_AIVEN_PASSWORD', 
    database: 'defaultdb', // Aiven usually calls the free db 'defaultdb'
    port: 25060, // Aiven will provide a specific port
    ssl: { rejectUnauthorized: false } // Required for secure cloud databases
});