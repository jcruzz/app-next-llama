"use client"

import {useEffect, useRef, useState} from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
    sender: 'user' | 'bot';
    text: string;
}

const ChatPage: React.FC = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [input, setInput] = useState<string>("");

    const idSession = '100'

    const messagesRef = useRef<Message[]>([]);
    const currentMessageRef = useRef<string>("");
    const [, forceRender] = useState<number>(0);

    useEffect(() => {
        // const newSocket = io("http://localhost:3000");
        const newSocket = io("http://localhost:3000");
        setSocket(newSocket);

        newSocket.on("receiveMessage", (data: { message: string }) => {
            currentMessageRef.current += data.message;
            forceRender((prev) => prev + 1);
        });

        newSocket.on("completeMessage", () => {
            messagesRef.current.push({ sender: "bot", text: currentMessageRef.current });
            currentMessageRef.current = "";
            forceRender((prev) => prev + 1);
        });

        newSocket.on("errorMessage", (error: { error: string }) => {
            console.error("Error recibido:", error.error);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const handleSendMessage = () => {
        if (socket && input.trim()) {
            messagesRef.current.push({ sender: "user", text: input });
            forceRender((prev) => prev + 1);
            socket.emit("sendMessage", { message: input, idSession: idSession });
            setInput("");
        }
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1>Chat con Llama3</h1>
            <div
                style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                    marginBottom: "20px",
                    height: "400px",
                    overflowY: "scroll",
                }}
            >
                {messagesRef.current.map((msg, index) => (
                    <div
                        key={index}
                        style={{
                            textAlign: msg.sender === "user" ? "right" : "left",
                            margin: "10px 0",
                        }}
                    >
                        <strong>{msg.sender === "user" ? "Tú:" : "Bot:"}</strong> {msg.text}
                    </div>
                ))}
                {currentMessageRef.current && (
                    <div
                        style={{
                            margin: "10px 0",
                            textAlign: "left",
                        }}
                    >
                        <strong>Bot:</strong> {currentMessageRef.current}
                    </div>
                )}
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    style={{ flex: 1, padding: "10px", border: "1px solid #ccc" }}
                    placeholder="Escribe un mensaje..."
                />
                <button
                    onClick={handleSendMessage}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    Enviar
                </button>
            </div>
        </div>
    );
};

export default ChatPage;
