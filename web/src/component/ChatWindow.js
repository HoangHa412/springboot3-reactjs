import React, { useEffect, useState, useRef } from 'react';
import { IconButton, Box, TextField, Paper, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { Avatar } from "antd";
import WebSocketService from "../service/WebSocketService";
import useApi from "../service/api";

const ChatWindow = ({ isOpen, onClose, username }) => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const { parseToken, findChatMessage } = useApi();
    const tokenPayload = parseToken(localStorage.getItem('token'));
    const senderId = tokenPayload['sub'];
    const recipientId = username;

    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            const handleReceivedMessage = (receivedMessage) => {
                if (receivedMessage.senderId === recipientId) {
                    setMessages(prevMessages => [...prevMessages, { text: receivedMessage.content, fromUser: false }]);
                }
            };

            // Fetch old messages when chat is opened
            const fetchOldMessages = async () => {
                try {
                    const response = await findChatMessage(senderId, recipientId);
                    setMessages(response.data.map(msg => ({
                        text: msg.content,
                        fromUser: msg.senderId === senderId
                    })));
                } catch (error) {
                    console.error("Error fetching old messages:", error);
                }
            };
            fetchOldMessages();

            // Add WebSocket message listener
            WebSocketService.onMessageReceived(handleReceivedMessage);

            // Clean up WebSocket listener on component unmount
            return () => {
                WebSocketService.removeMessageListener(handleReceivedMessage);
            };
        }
    }, [isOpen, senderId, recipientId, findChatMessage]);

    useEffect(() => {
        // Scroll to the bottom of the chat window when new messages arrive
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = () => {
        if (message.trim() !== '') {
            const chatMessage = {
                senderId: senderId,
                recipientId: recipientId,
                content: message,
                timestamp: new Date().toISOString()
            };

            setMessages([...messages, { text: message, fromUser: true }]);
            setMessage('');

            WebSocketService.sendMessage(chatMessage);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        isOpen && (
            <Paper
                elevation={3}
                style={{
                    position: 'fixed',
                    bottom: 0,
                    right: 20,
                    width: 300,
                    height: 400,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Box
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px',
                        backgroundColor: '#0078FF',
                        color: '#fff',
                    }}
                >
                    <Typography>
                        <div>
                            <Avatar>{username.charAt(0).toUpperCase()}</Avatar> {username}
                        </div>
                    </Typography>
                    <IconButton onClick={onClose} style={{ color: '#fff' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Box
                    style={{
                        flex: 1,
                        padding: '10px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {messages.map((msg, index) => (
                        <Box
                            key={index}
                            style={{
                                alignSelf: msg.fromUser ? 'flex-end' : 'flex-start',
                                marginBottom: '10px',
                            }}
                        >
                            <Typography
                                style={{
                                    backgroundColor: msg.fromUser ? '#DCF8C6' : '#fff',
                                    padding: '10px',
                                    borderRadius: '10px',
                                }}
                            >
                                {msg.text}
                            </Typography>
                        </Box>
                    ))}
                    <div ref={messagesEndRef} />
                </Box>

                <Box
                    style={{
                        display: 'flex',
                        padding: '10px',
                        borderTop: '1px solid #ccc',
                    }}
                >
                    <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                    />
                    <IconButton
                        color="primary"
                        onClick={handleSendMessage}
                        style={{ marginLeft: '10px' }}
                    >
                        <SendIcon />
                    </IconButton>
                </Box>
            </Paper>
        )
    );
};

export default ChatWindow;
