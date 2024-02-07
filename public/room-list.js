document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch the list of rooms from the server
        const response = await fetch('/rooms');
        if (!response.ok) {
            throw new Error('Failed to fetch room list');
        }
        const rooms = await response.json();

        // Populate the room list HTML
        const roomList = document.getElementById('roomList');
        rooms.forEach(room => {
            const listItem = document.createElement('li');
            listItem.textContent = room;
            listItem.addEventListener('click', () => {
                // Redirect to the chat page for the selected room
                window.location.href = `/chat/${room}`;
            });
            roomList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching room list:', error);
        alert('An error occurred while fetching the room list. Please try again.');
    }
});
