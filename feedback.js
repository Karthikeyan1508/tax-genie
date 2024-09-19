document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('ratingModal');
    const closeBtn = document.querySelector('.rating-modal .close-btn');
    const stars = document.querySelectorAll('.rating-modal .star');
    const submitBtn = document.querySelector('.submit-btn');
    
    submitBtn.addEventListener('click', function(event) {
        event.preventDefault(); 
        modal.style.display = 'flex';
    });
    
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            let rating = this.getAttribute('data-value');
            stars.forEach(star => {
                star.classList.remove('selected');
            });
            this.classList.add('selected');
            for (let i = 0; i < rating; i++) {
                stars[i].classList.add('selected');
            }
        });
    });
    
    // Theme toggle button
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    document.body.classList.add('dark-mode');
    themeToggleBtn.textContent = 'Switch to Light Mode';  
    
    themeToggleBtn.addEventListener('click', function() {
        document.body.classList.toggle('light-mode');
        document.querySelectorAll('.login-container, .bar, .submit-btn').forEach(element => {
            element.classList.toggle('light-mode');
        });

        if (document.body.classList.contains('light-mode')) {
            themeToggleBtn.textContent = 'Switch to Dark Mode';
        } else {
            themeToggleBtn.textContent = 'Switch to Light Mode';
        }
    });
});
