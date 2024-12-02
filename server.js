require('dotenv').config();  // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');  // For resolving file paths
const session = require('express-session');  // Add express-session for session handling

// Initialize app
const app = express();

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());  // Parse incoming JSON data

// Serve static files (for CSS, images, etc.)
app.use(express.static(__dirname));  // Serve static files from the root directory

// Set up session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,  // Session secret (from .env)
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // Set secure to true in production if using HTTPS
}));

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.log('Error connecting to MongoDB Atlas:', err));

// Define User Schema
const User = mongoose.model('User', new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String
}));

// Define Symptom Schema
const Symptom = mongoose.model('Symptom', new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    symptomName: String,
    description: String
}));

// Routes

// Serve the registration page
app.get('/reg', (req, res) => {
    res.sendFile(path.join(__dirname, 'reg.html'));  // Serve the HTML file for registration
});

// Handle registration form submission
app.post('/reg', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if the email already exists in the database
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('Email already in use. Please use a different email.');
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();  // Save to MongoDB Atlas

        // Redirect to login page after successful registration
        res.redirect('/login');
    } catch (err) {
        res.status(500).send('Error during registration: ' + err.message);
    }
});

// Serve the login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));  // Serve the login page
});

// Handle login form submission
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send('User not found!');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Invalid password!');
        }

        // Store user data in session or send a response for frontend use
        req.session.user = user; // Using session to store logged-in user

        res.redirect('/dashboard');
    } catch (err) {
        res.status(500).send('Error logging in: ' + err.message);
    }
});

// Serve the dashboard page
app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    res.sendFile(path.join(__dirname, 'dashboard.html'));  // Serve the dashboard page
});

// Handle symptom submission
app.post('/submit-symptom', async (req, res) => {
    const { symptomName, description } = req.body;
    const userId = req.session.user._id; // Use session to get the logged-in user's ID

    try {
        const newSymptom = new Symptom({
            userId, // Link to the user
            symptomName,
            description
        });

        await newSymptom.save(); // Save to MongoDB

        res.status(200).send('Symptom recorded successfully!');
    } catch (err) {
        res.status(500).send('Error saving symptom: ' + err.message);
    }
});

// Logout route (optional)
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error logging out: ' + err.message);
        }
        res.redirect('/login');
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
