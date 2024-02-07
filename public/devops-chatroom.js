document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chatBox');
    const inputBox = document.getElementById('inputBox');
    const sendButton = document.getElementById('sendButton');

    // Fetch messages from the server
    const fetchMessages = async () => {
        try {
            const response = await fetch('/devops-chatroom/get-messages');
            const data = await response.json();

            if (data.success) {
                // Display messages in the chat box
                data.messages.forEach(message => {
                    appendMessageToChatBox(message.sender, message.message, message.timestamp); // Adjusted property name
                });
            } else {
                console.error('Failed to fetch messages:', data.message);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            alert('Failed to fetch messages. Please try again.'); // Add error handling
        }
    };

    // Function to send message to server
    const sendMessage = async () => {
        const message = inputBox.value;
        try {
            // Send message to server
            const response = await fetch('/devops-chatroom/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            // Clear input box after sending message
            inputBox.value = '';

            // Reload the page
            location.reload();
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        }
    };

    // Function to append a message to the chat box
    const appendMessageToChatBox = (sender, message, timestamp) => {
        const messageElement = document.createElement('div');
        messageElement.innerHTML =`<strong>@${sender}</strong>:........${message} --------> ${timestamp}`;
        chatBox.appendChild(messageElement);
    };
``
    // Event listener for send button click
    sendButton.addEventListener('click', sendMessage);

    // Fetch messages when the page loads
    fetchMessages();
});
