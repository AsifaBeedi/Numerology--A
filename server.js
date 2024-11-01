require('dotenv').config();
console.log('MongoDB URI:', process.env.MONGODB_URI);
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {}).then(
    () => { console.log('Connected to MongoDB successfully'); },
    err => { console.error('Failed to connect to MongoDB', err); }
);

// User Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', UserSchema);

// User Signup
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);
    const newUser = new User({ username, password: hashedPassword });

    try {
        await newUser.save();
        res.status(200).send("User registered successfully.");
    } catch (err) {
        res.status(500).send("User registration failed.");
    }
});

// User Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).send("Login failed.");
    }

    res.status(200).send("Login successful.");
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
