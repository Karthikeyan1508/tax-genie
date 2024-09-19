const themeToggleBtn = document.getElementById('theme-toggle-btn');

// Initialize the page with dark mode
document.body.classList.add('dark-mode');
themeToggleBtn.textContent = 'Switch to Light Mode';

themeToggleBtn.addEventListener('click', function() {
    document.body.classList.toggle('light-mode');
    
    document.querySelectorAll('.profile-container, .bar').forEach(element => {
        element.classList.toggle('light-mode');
    });

    // Update the button text based on the current mode
    if (document.body.classList.contains('light-mode')) {
        themeToggleBtn.textContent = 'Switch to Dark Mode';
    } else {
        themeToggleBtn.textContent = 'Switch to Light Mode';
    }
});

// Log out button functionality
document.querySelector('.logout-btn').addEventListener('click', function() {
    alert('You have logged out successfully!');
    window.location.href = 'login.html';  // Redirect to login page
});
