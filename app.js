// --- LOGIN HANDLER ---
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevents the page from refreshing

        const fullName = document.getElementById('fullName').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, password })
            });

            const data = await response.json();

            if (response.ok) {
                // SUCCESS: Save the REAL user data to browser memory
                localStorage.setItem('userName', data.fullName); 
                localStorage.setItem('userRole', data.role);

                // Hide login, show dashboard
                document.getElementById('login-section').style.display = 'none';
                document.getElementById('dashboard').style.display = 'block';

                // Display the REAL name on the screen
                alert("Login Successful! Welcome, " + data.fullName);
            } else {
                alert(data.error || "Login Failed");
            }
        } catch (err) {
            console.error("Login Error:", err);
            alert("Could not connect to server.");
        }
    });
}
const spinner = document.getElementById('loadingSpinner');
const loginBtn = document.querySelector('button[type="submit"]');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 1. Show Spinner & Hide Button
    spinner.style.display = 'block';
    loginBtn.style.display = 'none';

    const fullName = document.getElementById('fullName').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, password })
        });

        const data = await response.json();

        // Give it a tiny 1-second delay so the user sees the professional animation
        setTimeout(() => {
            if (response.ok) {
                localStorage.setItem('userName', data.fullName);
                window.location.href = 'index.html'; // Go to dashboard
            } else {
                alert(data.error);
                // Reset if it fails
                spinner.style.display = 'none';
                loginBtn.style.display = 'block';
            }
        }, 1000);

    } catch (err) {
        spinner.style.display = 'none';
        loginBtn.style.display = 'block';
        alert("Server connection failed.");
    }
});