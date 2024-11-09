// Function to update an existing paragraph's text
function updateText() {
    let paragraph = document.getElementById("myParagraph");
    paragraph.textContent = "Updated Text Content";
}

// Function to create a new paragraph and append it to a container
function addParagraph() {
    let newParagraph = document.createElement("p");
    newParagraph.textContent = "This is a new paragraph added via JavaScript.";
    
    let container = document.getElementById("container");
    container.appendChild(newParagraph);
}

// Function to change the background color to blue
function changeBackgroundColor() {
    document.body.style.backgroundColor = "blue";
}
