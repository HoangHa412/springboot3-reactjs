import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

const WebSocketService = {
    stompClient: null,
    onMessageCallback: null,

    connect(url, name) {
        const socket = new SockJS(url);
        this.stompClient = Stomp.over(socket);

        this.stompClient.connect({}, () => {
            this.onConnected(name);
        }, this.onError);
    },

    onConnected(name) {
        if (this.stompClient) {
            // Subscribe to private messages
            this.stompClient.subscribe(`/user/${name}/queue/messages`, (message) => {
                if (this.onMessageCallback) {
                    this.onMessageCallback(JSON.parse(message.body));
                }
            });

            // Subscribe to public messages (if needed)
            this.stompClient.subscribe(`/topic/public`, (message) => {
                if (this.onMessageCallback) {
                    this.onMessageCallback(JSON.parse(message.body));
                }
            });

            // Send an online status message
            this.stompClient.send("/app/user.addUser", {}, JSON.stringify({ userName: name, status: "ONLINE" }));
        }
    },

    disconnect(name) {
        if (this.stompClient) {
            // Send an offline status message before disconnecting
            this.stompClient.send("/app/user.disconnectUser", {}, JSON.stringify({ userName: name, status: "OFFLINE" }));
            this.stompClient.disconnect(() => {
                console.log("Disconnected from WebSocket");
            });
        }
    },

    onError(error) {
        console.error("WebSocket error", error);
    },

    sendMessage(message) {
        if (this.stompClient && this.stompClient.connected) {
            this.stompClient.send("/app/chat", {}, JSON.stringify(message));
        } else {
            console.error("Unable to send message, WebSocket is not connected.");
        }
    },

    onMessageReceived(callback) {
        this.onMessageCallback = callback;
    },

    removeMessageListener(callback) {
        if (this.onMessageCallback === callback) {
            this.onMessageCallback = null;
        }
    },
};

export default WebSocketService;
