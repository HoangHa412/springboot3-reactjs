import React, {useEffect, useRef, useState} from "react";
import {Stomp} from "@stomp/stompjs";
import SockJS from "sockjs-client";
import '../styles/Chat.css';
import user_icon from "../assets/loader.gif";

function Chat() {
    let selectedUserId = null;
    const chatPage = useRef(null);
    const messageForm = useRef(null);
    const messageInput = useRef(null);
    const chatArea = useRef(null);
    const logout = useRef(null);

    const [name, setName] = useState(null);
    // const [selectedUserId, setSelectedUserId] = useState(null);
    const [stompClient, setStompClient] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const tokenPayload = parseToken(token);
            setName(tokenPayload['sub']);
        }
    }, []);

    useEffect(() => {
        if (name) {
            const socket = new SockJS(`http://localhost:8081/ws?authentication=${localStorage.getItem('token')}`);
            const client = Stomp.over(socket);
            client.connect({}, () => {
                onConnected(client);
            }, onError);
            setStompClient(client);

            return () => {
                if (client) {
                    client.disconnect();
                }
            };
        }
    }, [name]);

    // useEffect(() => {
    //     if (selectedUserId) fetchAndDisplayUserChat().then();
    // }, [selectedUserId]);

    const parseToken = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error('Lỗi giải mã token:', e);
            return null;
        }
    };

    const onConnected = (client) => {
        client.subscribe(`/user/${name}/queue/messages`, onMessageReceived);
        client.subscribe(`/user/public`, onMessageReceived);

        client.send("/app/user.addUser", {}, JSON.stringify({userName: name, status: "ONLINE"}));

        setConnected(true);
        findAndDisplayConnectedUsers().then();
    };

    const findAndDisplayConnectedUsers = async () => {
        try {
            const response = await fetch('http://localhost:8081/user', {
                headers: {Authorization: 'Bearer ' + localStorage.getItem('token')}
            });

            let users = await response.json();
            users = users.filter(user => user.userName !== name);

            const userList = document.getElementById('connectedUsers');

            // Add a null check
            if (!userList) {
                console.error("User list element not found in the DOM.");
                return;
            }

            userList.innerHTML = '';

            users.forEach((user) => {
                const listItem = document.createElement('li');
                listItem.classList.add('user-item');
                listItem.id = user.userName;

                const userImage = document.createElement('img');
                userImage.src = user_icon;
                userImage.alt = user.userName;

                const usernameSpan = document.createElement('span');
                usernameSpan.textContent = user.userName;

                const receivedMsgs = document.createElement('span');
                receivedMsgs.textContent = '0';
                receivedMsgs.classList.add('nbr-msg', 'hidden');

                listItem.appendChild(userImage);
                listItem.appendChild(usernameSpan);
                listItem.appendChild(receivedMsgs);

                listItem.addEventListener('click', userItemClick);

                userList.appendChild(listItem);
            });
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };


    const userItemClick = (event) => {
        document.querySelectorAll('.user-item').forEach(item => {
            item.classList.remove('active');
        });
        messageForm.current.classList.remove('hidden');

        const clickedUser = event.currentTarget;
        clickedUser.classList.add('active');
        selectedUserId = clickedUser.getAttribute('id');
        localStorage.setItem("selectedUser", selectedUserId);

        fetchAndDisplayUserChat().then();
        const nbrMsg = clickedUser.querySelector('.nbr-msg');
        nbrMsg.classList.add('hidden');
        nbrMsg.textContent = '0';
    };


    const fetchAndDisplayUserChat = async () => {
        try {
            const response = await fetch(`http://localhost:8081/messages/${name}/${selectedUserId}`, {
                headers: {Authorization: 'Bearer ' + localStorage.getItem('token')}
            });

            const chatData = await response.json();
            chatArea.current.innerHTML = '';

            chatData.forEach(chat => {
                displayMessage(chat.senderId, chat.content);
            });

            chatArea.current.scrollTop = chatArea.current.scrollHeight;
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const displayMessage = (senderId, content) => {
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('message')
        if (senderId === name) {
            messageContainer.classList.add('sender');
        } else {
            messageContainer.classList.add('receiver');
        }
        const message = document.createElement('p');
        message.textContent = content;
        messageContainer.appendChild(message);
        chatArea.current.appendChild(messageContainer);
    };

    const onError = () => {
        alert('Could not connect to WebSocket server. Please refresh this page to try again!');
    };

    const sendMessage = (event) => {
        const messageContent = messageInput.current.value.trim();
        if (messageContent && stompClient) {
            const chatMessage = {
                senderId: name,
                recipientId: localStorage.getItem("selectedUser"),
                content: messageContent,
                timestamp: new Date()
            };
            stompClient.send("/app/chat", {}, JSON.stringify(chatMessage));
            console.log(JSON.stringify(chatMessage))
            displayMessage(name, messageContent);
            messageInput.current.value = '';
            chatArea.current.scrollTop = chatArea.current.scrollHeight;
        }
        event.preventDefault();
    };

    const onMessageReceived = async (payload) => {
        // await findAndDisplayConnectedUsers();
        const message = JSON.parse(payload['body']);
        console.log(message)
        console.log(selectedUserId)
        if (localStorage.getItem("selectedUser") && localStorage.getItem("selectedUser")===message.senderId) {
            displayMessage(message.senderId, message.content);
            chatArea.current.scrollTop = chatArea.current.scrollHeight;
        }

        const notifiedUser = document.querySelector(`#${message.senderId}`);
        if (notifiedUser && !notifiedUser.classList.contains('active')) {
            const nbrMsg = notifiedUser.querySelector('.nbr-msg');
            nbrMsg.classList.remove('hidden');
            nbrMsg.textContent = parseInt(nbrMsg.textContent) + 1;
        }
    };

    const onLogout = () => {
        stompClient.send("/app/user.disconnectUser", {}, JSON.stringify({userName: name, status: "OFFLINE"}));
        window.location.href = '/home';
    };

    if (!connected) {
        return <div>Connecting...</div>;
    }

    window.onbeforeunload = () => onLogout();

    return (
        <div className='chat'>
            <div className="chat-container" ref={chatPage}>
                <div className="users-list">
                    <div className="users-list-container">
                        <h2>Online Users</h2>
                        <ul id="connectedUsers"></ul>
                    </div>
                    <div>
                        <p id="connected-user-fullname">{name}</p>
                        <a onClick={onLogout} className="logout" ref={logout} >Logout</a>
                    </div>
                </div>
                <div className="chat-area">
                    <div className="chat-area" ref={chatArea} id="chat-messages">

                    </div>
                    <form ref={messageForm} id="messageForm" name="messageForm" className="hidden">
                        <div className="message-input">
                            <input ref={messageInput} autoComplete="off" type="text" id="message"
                                   placeholder="Type your message..."/>
                            <button onClick={sendMessage}>Send</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Chat;
