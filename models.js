const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  periodStartDate: { type: Date },
  ovulationDate: { type: Date },
  symptoms: [String], // Array of symptoms
  productsBought: [
    {
      productName: String,
      price: Number,
      quantity: Number,
      date: { type: Date, default: Date.now },
    },
  ],
});

// Create a model for the User
const User = mongoose.model('User', userSchema);

module.exports = { User };
