const mysql = require('mysql2/promise');
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware to parse JSON and enable Cross-Origin requests
app.use(express.json({ limit: '50mb' }));
app.use(cors());

// CRITICAL: This line allows your HTML to see styles.css, school-logo.png, and background images
app.use(express.static(__dirname)); 

// Database Connection Setup
const db = mysql.createPool({
    host: 'localhost', 
    user: 'root', 
    password: '', 
    database: 'peculiar_db'
});

// 1. BULK UPLOAD ENDPOINT (Staff Portal)
app.post('/api/upload-bulk', async (req, res) => {
    try {
        const d = req.body;
        
        // Maps the incoming payload to your MySQL columns perfectly
        const values = d.results.map(r => [
            d.name, d.id, d.class, r.subject, r.ca, r.exam, 
            (parseInt(r.ca || 0) + parseInt(r.exam || 0)), // Calculates Total automatically
            'P', d.passport, 'Paid', d.drawing, d.sports, d.communication, 
            d.leadership, d.self_control, d.neatness, d.punctuality, 
            d.attitude, d.t_comment, d.p_comment
        ]);

        const sql = `INSERT INTO results (
            student_name, student_id, student_class, subject, ca_score, exam_score, total, 
            grade, passport, fees_status, drawing, sports, communication, leadership, 
            self_control, neatness, punctuality, attitude, teacher_comment, principal_comment
        ) VALUES ?`;
        
        await db.query(sql, [values]);
        res.status(200).json({ success: true, message: "Upload Complete" });
        
    } catch (err) { 
        console.error("❌ Upload Error:", err.message);
        res.status(500).json({ error: err.message }); 
    }
});

// 2. CHECK RESULT ENDPOINT (Student Search)
app.get('/api/check-result', async (req, res) => {
    try {
        const { name, id } = req.query;
        
        // Searches the database securely using placeholders (?) to prevent SQL injection
        const [rows] = await db.query(
            "SELECT * FROM results WHERE student_name = ? AND student_id = ?", 
            [name, id]
        );
        
        if (rows.length > 0) {
            res.json(rows);
        } else {
            res.status(404).json({ error: "Student not found in database" });
        }
        
    } catch (err) { 
        console.error("❌ Search Error:", err.message);
        res.status(500).json({ error: err.message }); 
    }
});

// Start the Server Engine
app.listen(3000, () => {
    console.log('🚀 PECULIAR SERVER ACTIVE AT http://localhost:3000');
    console.log('✅ Ready to process result searches and uploads.');
});