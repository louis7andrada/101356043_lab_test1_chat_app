const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./models/User');
const Message = require('./models/Message');


const app = express();
const server = http.createServer(app);
const io = socketio(server);
const rooms = ['devops', 'cloud computing', 'covid19', 'sports', 'nodeJS'];

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/labtest1', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
});

// Middlewares
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
}));

// Socket.io setup
const devopsNamespace = io.of('/devops-chatroom');
devopsNamespace.on('connection', (socket) => {
    console.log('a user connected to devops chatroom');
    socket.on('disconnect', () => {
        console.log('user disconnected from devops chatroom');
    });
});

const cloudComputingNamespace = io.of('/cloudcomputing-chatroom');
cloudComputingNamespace.on('connection', (socket) => {
    console.log('a user connected to cloud computing chatroom');
    socket.on('disconnect', () => {
        console.log('user disconnected from cloud computing chatroom');
    });
});

const covid19Namespace = io.of('/covid19-chatroom');
covid19Namespace.on('connection', (socket) => {
    console.log('a user connected to covid 19 chatroom');
    socket.on('disconnect', () => {
        console.log('user disconnected from covid 19 chatroom');
    });
});

const sportsNamespace = io.of('/sports-chatroom');
sportsNamespace.on('connection', (socket) => {
    console.log('a user connected to sports chatroom');
    socket.on('disconnect', () => {
        console.log('user disconnected from sports chatroom');
    });
});

const nodeJSNamespace = io.of('/nodejs-chatroom');
nodeJSNamespace.on('connection', (socket) => {
    console.log('a user connected to nodejs chatroom');
    socket.on('disconnect', () => {
        console.log('user disconnected from nodejs chatroom');
    });
});

// Signup endpoint
app.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if the username already exists
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user and save to database
        const user = new User({ username, password: hashedPassword });
        await user.save();

        // Respond with success
        res.status(201).json({ success: true, message: 'User created' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if the user exists in the database
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        // Compare the provided password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        // Store user session in req.session
        req.session.user = user;
        req.session.username = username;

        // Respond with success
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Endpoint to fetch the list of available rooms
app.get('/rooms', (req, res) => {
    res.json(rooms);
});

// Endpoint to handle joining a room
app.post('/joinRoom', (req, res) => {
    const { roomName } = req.body;
    // Check if the requested room exists in the list of available rooms
    if (rooms.includes(roomName)) {
        // Join the room
        req.session.room = roomName;
        res.json({ success: true, message: `Joined room: ${roomName}` });
    } else {
        res.status(404).json({ success: false, message: 'Room not found' });
    }
});

// Signup endpoint
app.post('/signup', async (req, res) => {
    // Signup logic
});

// Login endpoint
app.post('/login', async (req, res) => {
    // Login logic
});

// Endpoint to handle sending messages to the "devops" chatroom
app.post('/devops-chatroom/send-message', async (req, res) => {
    try {
        const { message } = req.body;

        // Create a new message document
        const newMessage = new Message({
            room: 'devops', // Room identifier
            sender: req.session.user.username, // Assuming user is authenticated and their username is stored in the session
            message: message,
            timestamp: new Date() // Current timestamp
        });

        // Save the message to the database
        await newMessage.save();

        // Broadcast the message to all connected clients in the "devops" room using WebSocket or Socket.IO
        devopsNamespace.emit('message', newMessage);

        // Respond with success status
        res.status(200).json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        // Handle any errors
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
});

// Endpoint to retrieve messages from the "devops" chatroom
app.get('/devops-chatroom/get-messages', async (req, res) => {
    try {
        // Retrieve messages from MongoDB for the "devops" chatroom
        const messages = await Message.find({ room: 'devops' }, 'sender message timestamp');

        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error('Error retrieving messages:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve messages' });
    }
});

// Endpoint to handle sending messages to the "cloud computing" chatroom
app.post('/cloudcomputing-chatroom/send-message', async (req, res) => {
    try {
        const { message } = req.body;

        // Create a new message document
        const newMessage = new Message({
            room: 'cloud computing', // Room identifier
            sender: req.session.user.username, // Assuming user is authenticated and their username is stored in the session
            message: message,
            timestamp: new Date() // Current timestamp
        });

        // Save the message to the database
        await newMessage.save();

        // Broadcast the message to all connected clients in the "devops" room using WebSocket or Socket.IO
        cloudComputingNamespace.emit('message', newMessage);

        // Respond with success status
        res.status(200).json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        // Handle any errors
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
});

// Endpoint to retrieve messages from the "cloud computing" chatroom
app.get('/cloudcomputing-chatroom/get-messages', async (req, res) => {
    try {
        // Retrieve messages from MongoDB for the "cloud computing" chatroom
        const messages = await Message.find({ room: 'cloud computing' }, 'sender message timestamp');

        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error('Error retrieving messages:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve messages' });
    }
});

// Endpoint to handle sending messages to the "covid19" chatroom
app.post('/covid19-chatroom/send-message', async (req, res) => {
    try {
        const { message } = req.body;

        // Create a new message document
        const newMessage = new Message({
            room: 'covid19', // Room identifier
            sender: req.session.user.username, // Assuming user is authenticated and their username is stored in the session
            message: message,
            timestamp: new Date() // Current timestamp
        });

        // Save the message to the database
        await newMessage.save();

        // Broadcast the message to all connected clients in the "devops" room using WebSocket or Socket.IO
        covid19Namespace.emit('message', newMessage);

        // Respond with success status
        res.status(200).json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        // Handle any errors
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
});

// Endpoint to retrieve messages from the "covid19" chatroom
app.get('/covid19-chatroom/get-messages', async (req, res) => {
    try {
        // Retrieve messages from MongoDB for the "devops" chatroom
        const messages = await Message.find({ room: 'covid19' }, 'sender message timestamp');

        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error('Error retrieving messages:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve messages' });
    }
});

// Endpoint to handle sending messages to the "sports" chatroom
app.post('/sports-chatroom/send-message', async (req, res) => {
    try {
        const { message } = req.body;

        // Create a new message document
        const newMessage = new Message({
            room: 'sports', // Room identifier
            sender: req.session.user.username, // Assuming user is authenticated and their username is stored in the session
            message: message,
            timestamp: new Date() // Current timestamp
        });

        // Save the message to the database
        await newMessage.save();

        // Broadcast the message to all connected clients in the "devops" room using WebSocket or Socket.IO
        sportsNamespace.emit('message', newMessage);

        // Respond with success status
        res.status(200).json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        // Handle any errors
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
});

// Endpoint to retrieve messages from the "sports" chatroom
app.get('/sports-chatroom/get-messages', async (req, res) => {
    try {
        // Retrieve messages from MongoDB for the "devops" chatroom
        const messages = await Message.find({ room: 'sports' }, 'sender message timestamp');

        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error('Error retrieving messages:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve messages' });
    }
});

// Endpoint to handle sending messages to the "nodeJS" chatroom
app.post('/nodejs-chatroom/send-message', async (req, res) => {
    try {
        const { message } = req.body;

        // Create a new message document
        const newMessage = new Message({
            room: 'nodeJS', // Room identifier
            sender: req.session.user.username, // Assuming user is authenticated and their username is stored in the session
            message: message,
            timestamp: new Date() // Current timestamp
        });

        // Save the message to the database
        await newMessage.save();

        // Broadcast the message to all connected clients in the "devops" room using WebSocket or Socket.IO
        nodeJSNamespace.emit('message', newMessage);

        // Respond with success status
        res.status(200).json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        // Handle any errors
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
});

// Endpoint to retrieve messages from the "nodeJS" chatroom
app.get('/nodejs-chatroom/get-messages', async (req, res) => {
    try {
        // Retrieve messages from MongoDB for the "devops" chatroom
        const messages = await Message.find({ room: 'nodeJS' }, 'sender message timestamp');

        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error('Error retrieving messages:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve messages' });
    }
});

// Define route handlers
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/public/signup.html');
});

// Add route for login page
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.get('/room-list', (req, res) => {
    res.sendFile(__dirname + '/public/room-list.html');
});

// Define route to serve devops-chatroom.html
app.get('/chat/devops', (req, res) => {
    res.sendFile(__dirname + '/public/devops-chatroom.html');
});

// Define route to serve cloudcomputing-chatroom.html
app.get('/chat/cloud%20computing', (req, res) => {
    res.sendFile(__dirname + '/public/cloudcomputing-chatroom.html');
});

// Define route to serve covid19-chatroom.html
app.get('/chat/covid19', (req, res) => {
    res.sendFile(__dirname + '/public/covid19-chatroom.html');
});

// Define route to serve sports-chatroom.html
app.get('/chat/sports', (req, res) => {
    res.sendFile(__dirname + '/public/sports-chatroom.html');
});

// Define route to serve devops-chatroom.html
app.get('/chat/nodeJS', (req, res) => {
    res.sendFile(__dirname + '/public/nodejs-chatroom.html');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
