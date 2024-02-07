// login.js

// Function to handle login form submission
document.getElementById('loginForm').onsubmit = async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Send login credentials to the server for authentication
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            throw new Error('Login failed. Please try again.'); // Throw error if response status is not ok
        }

        const data = await response.json();
        if (data.success) {
            // Login successful, store user session in localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            // Redirect to home page or another page
            window.location.href = '/room-list';
        } else {
            // Login failed, display error message
            document.getElementById('error').innerText = data.message;
        }
    } catch (error) {
        // Handle fetch error
        console.error('Login error:', error);
        document.getElementById('error').innerText = 'An error occurred during login. Please try again.';
    }
};

// Function to display room list after successful login
async function displayRoomList() {
    try {
        const response = await fetch('/rooms');
        if (!response.ok) {
            throw new Error('Failed to retrieve room list.'); // Throw error if response status is not ok
        }

        const rooms = await response.json();
        if (rooms.length > 0) {
            const roomListContainer = document.getElementById('roomList');
            roomListContainer.innerHTML = ''; // Clear existing room list
            rooms.forEach(room => {
                const button = document.createElement('button');
                button.textContent = room;
                button.onclick = () => joinRoom(room);
                roomListContainer.appendChild(button);
            });
        } else {
            document.getElementById('roomList').innerText = 'No rooms available.';
        }
    } catch (error) {
        console.error('Error fetching room list:', error);
        document.getElementById('roomList').innerText = 'Failed to retrieve room list. Please try again.';
    }
}

// Function to join a room
async function joinRoom(roomName) {
    try {
        // Send request to server to join the specified room
        const response = await fetch('/joinRoom', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ roomName })
        });

        if (!response.ok) {
            throw new Error('Failed to join room.'); // Throw error if response status is not ok
        }

        // Room joined successfully
        window.location.href = `/room/${roomName}`; // Redirect to the room page
    } catch (error) {
        console.error('Error joining room:', error);
        alert('Failed to join room. Please try again.');
    }
}
