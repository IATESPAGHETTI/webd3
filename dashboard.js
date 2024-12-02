class User {
    constructor(email) {
        this.email = email;
        this.data = JSON.parse(localStorage.getItem(email)) || {};
    }

    save() {
        console.log("Saving user data:", this.data); // Debugging line
        localStorage.setItem(this.email, JSON.stringify(this.data));
    }

    getData() {
        return this.data;
    }

    updateData(updates) {
        console.log("Updating user data with:", updates); // Debugging line
        Object.assign(this.data, updates);
        this.save();
    }
}

class PeriodTracker {
    constructor(user) {
        this.user = user;
        this.loggedInEmail = user.email;
    }

    saveData() {
        if (this.loggedInEmail) {
            const periodStartDate = document.getElementById('periodStartDate').value;
            const ovulationDate = document.getElementById('ovulationDate').value;
            const symptoms = document.getElementById('symptoms').value;

            const updates = {
                periodStartDate,
                ovulationDate,
                symptoms
            };

            // Send symptoms to the server
            this.saveSymptomToServer(symptoms);

            this.user.updateData(updates);

            // Check if the update is successful
            const updatedUserData = this.user.getData();
            if (updatedUserData.periodStartDate === periodStartDate && updatedUserData.ovulationDate === ovulationDate) {
                alert("Data saved successfully!");
            } else {
                alert("Error: Data could not be saved.");
            }
        }
    }

    async saveSymptomToServer(symptoms) {
        if (symptoms) {
            try {
                const response = await fetch('/submit-symptom', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        symptomName: symptoms, // Send symptom data
                        userId: this.user.email // Send the email (or userId) to link to the user
                    })
                });

                if (response.ok) {
                    console.log("Symptom saved successfully!");
                } else {
                    console.log("Failed to save symptom.");
                }
            } catch (error) {
                console.error("Error submitting symptom data:", error);
            }
        }
    }

    calculatePredictedDate() {
        const userData = this.user.getData();

        if (userData && userData.periodStartDate) {
            const periodStartDate = new Date(userData.periodStartDate);

            // Assuming a 28-day cycle for simplicity
            const predictedDate = new Date(periodStartDate);
            predictedDate.setDate(predictedDate.getDate() + 28);

            document.getElementById('predictedDate').textContent = `Predicted Next Period Date: ${predictedDate.toDateString()}`;

            userData.predictedDate = predictedDate.toDateString();
            this.user.save();
        } else {
            alert("Please enter your period start date first.");
        }
    }
}

class UI {
    constructor() {
        this.loggedInEmail = sessionStorage.getItem('loggedInUser');
        this.greetingElement = document.getElementById('greeting');
        this.predictButton = document.getElementById('predictButton');

        this.setupGreeting();
        this.setupEventListeners();
    }

    setupGreeting() {
        if (this.loggedInEmail) {
            const user = new User(this.loggedInEmail);
            const userData = user.getData();

            if (userData) {
                this.greetingElement.textContent = `Hello, ${userData.name}!`;
            }
        }
    }

    setupEventListeners() {
        if (this.loggedInEmail) {
            const user = new User(this.loggedInEmail);
            const periodTracker = new PeriodTracker(user);

            // Save buttons now call saveData directly from the PeriodTracker instance
            const saveButtons = document.querySelectorAll('.save-button');
            saveButtons.forEach(button => {
                button.addEventListener('click', () => periodTracker.saveData());
            });

            this.predictButton.addEventListener('click', () => periodTracker.calculatePredictedDate());

            // Handle the symptom form submission
            const symptomsForm = document.getElementById('symptomsForm');
            symptomsForm.addEventListener('submit', (event) => {
                event.preventDefault(); // Prevent default form submission
                periodTracker.saveData(); // Trigger saveData when the form is submitted
            });
        }
    }
}

const ui = new UI();
