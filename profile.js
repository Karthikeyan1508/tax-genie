document.addEventListener('DOMContentLoaded', function() {
    // Theme Toggle
    function setupThemeToggle() {
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        if (!themeToggleBtn) return;

        themeToggleBtn.addEventListener('click', function() {
            document.body.classList.toggle('light-mode');

            // Toggle the light mode on specific elements
            document.querySelectorAll('.profile-container, .personal-details, .input-box input, .bar').forEach(element => {
                element.classList.toggle('light-mode');
            });

            // Update the button text based on the current mode
            if (document.body.classList.contains('light-mode')) {
                themeToggleBtn.textContent = 'Switch to Dark Mode';
            } else {
                themeToggleBtn.textContent = 'Switch to Light Mode';
            }
        });
    }

    setupThemeToggle();
});
