const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// ONLY ONE CONNECTION BLOCK ALLOWED
mongoose.connect('mongodb://127.0.0.1:27017/peculiar_school')
    .then(() => console.log('✅ DATABASE CONNECTED SUCCESSFULLY!'))
    .catch(err => console.error('❌ CONNECTION ERROR:', err));

app.use(express.json());
app.use(express.static(path.join(__dirname)));
// THE ONLY USER SCHEMA (Includes roles and scores)
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true, unique: true },
    email: String,
    password: { type: String, required: true },
    role: { type: String, default: 'student' }, 
    math: { type: Number, default: 0 },
    english: { type: Number, default: 0 },
    science: { type: Number, default: 0 }
});

const User = mongoose.model('User', userSchema);

// LOGIN ROUTE
app.post('/api/login', async (req, res) => {
    const { fullName, password } = req.body;
    try {
        const user = await User.findOne({ fullName });
        if (user && await bcrypt.compare(password, user.password)) {
            res.status(200).json({ 
                message: "Login successful", 
                fullName: user.fullName, 
                role: user.role 
            });
        } else {
            res.status(401).json({ error: "Invalid Name or Password" });
        }
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});

// UPLOAD ROUTE (Staff Only)
app.post('/api/upload', async (req, res) => {
    const { fullName, math, english, science } = req.body;
    try {
        const student = await User.findOneAndUpdate(
            { fullName: fullName.trim() }, 
            { $set: { math: Number(math), english: Number(english), science: Number(science) } }, 
            { new: true }
        );
        student ? res.json({ message: "Success" }) : res.status(404).json({ error: "Not found" });
    } catch (err) {
        res.status(500).json({ error: "Error" });
    }
});

// GET RESULTS ROUTE
app.get('/api/results/:name', async (req, res) => {
    try {
        const student = await User.findOne({ fullName: new RegExp("^" + req.params.name.trim() + "$", "i") });
        if (student) {
            res.json({ math: student.math, english: student.english, science: student.science });
        } else {
            res.status(404).json({ error: "Not found" });
        }
    } catch (err) {
        res.status(500).json({ error: "Error" });
    }
});

// Use 127.0.0.1 instead of localhost for better stability on Windows
// DELETE ALL OTHER CONNECT LINES AND USE ONLY THIS ONE:
mongodb+srv://goodnewsonovroke_db_user:HBmkpfDmp2TdbIiA@peculiar-school-portal.z0tmfwx.mongodb.net/
    .then(() => console.log('🚀 DATABASE CONNECTED SUCCESSFULLY!'))
    .catch(err => console.error('❌ CONNECTION ERROR:', err));
    const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));