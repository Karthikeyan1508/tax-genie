
function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); 
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); 
    
    
    alert("Welcome, " + profile.getName() + "!");
}


document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault(); 
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // send to server
    console.log('Manual login attempt with:', email, password);
    
    alert("Logged in manually with email: " + email);
});

//-------------------mode change--------------------------------------
const themeToggleBtn = document.getElementById('theme-toggle-btn');
document.body.classList.add('dark-mode');
themeToggleBtn.textContent = 'Switch to Light Mode';  

themeToggleBtn.addEventListener('click', function() {
    document.body.classList.toggle('light-mode');
    //document.body.classList.toggle('dark-mode');
    // if (document.body.classList.contains('light-mode')) {
    //     themeToggleBtn.textContent = 'Switch to Dark Mode';
    // } else {
    //     themeToggleBtn.textContent = 'Switch to Light Mode';
    // }

    // Toggle the light mode on other elements like input, buttons, etc.
    document.querySelectorAll('.login-container, .input-box input, .btn, .bar, .forgot-password a').forEach(element => {
        element.classList.toggle('light-mode');
    });

    // Update the button text based on the current mode
    if (document.body.classList.contains('light-mode')) {
        themeToggleBtn.textContent = 'Switch to Dark Mode';
    } else {
        themeToggleBtn.textContent = 'Switch to Light Mode';
    }

});

