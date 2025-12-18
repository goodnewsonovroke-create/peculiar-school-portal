document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, password })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Login Success! Opening Dashboard...");
            // 1. Hide the login section
            document.getElementById('login-section').style.display = 'none';
            // 2. Show the dashboard
            const dashboard = document.getElementById('dashboard');
            dashboard.style.display = 'block';
            dashboard.querySelector('h2').innerText = `Welcome, ${fullName}!`;
        } else {
            messageDiv.innerText = data.error || "Invalid Credentials";
            messageDiv.style.color = "red";
        }
    } catch (err) {
        console.error("Connection Error:", err);
        messageDiv.innerText = "Cannot connect to server.";
    }
});const data = await response.json();
if (response.ok) {
    // Only show the "Upload Scores" button if the user is staff
    const uploadBtn = document.getElementById('uploadPortalBtn'); 
    if (data.role === 'staff') {
        uploadBtn.style.display = 'block';
    } else {
        uploadBtn.style.display = 'none';
    }
}
app.get('/api/results/:name', async (req, res) => {
    try {
        const student = await User.findOne({ fullName: req.params.name });
        if (student) {
            // We send back the scores stored in the database
            res.json({
                math: student.math,
                english: student.english,
                science: student.science
            });
        } else {
            res.status(404).json({ error: "Student not found" });
        }
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});