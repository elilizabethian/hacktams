// Wait for the page to fully load
document.addEventListener("DOMContentLoaded", function() {

    // Grab the button
    const button = document.getElementById("myButton");

    // Do something when it's clicked
    button.addEventListener("click", function() {
        alert("Hello! You clicked the button!");
    });

});