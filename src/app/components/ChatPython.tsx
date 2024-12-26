"use client"

import { useEffect, useState } from "react";

const Chat = () => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    useEffect(() => {
        // Establecer conexión al WebSocket
        const ws = new WebSocket("ws://localhost:8089/ws");
        setSocket(ws);

        // Manejar mensajes entrantes
        ws.onmessage = (event) => {
            setMessages((prev) => [...prev, { role: "GPT", content: event.data }]);
        };

        // Limpiar la conexión al desmontar
        return () => {
            ws.close();
        };
    }, []);

    const sendMessage = () => {
        if (socket && input.trim()) {
            // Enviar mensaje al WebSocket
            socket.send(input);
            setMessages((prev) => [...prev, { role: "User", content: input }]);
            setInput("");
        }
    };

    return (
        <div style={{ padding: "1rem", maxWidth: "600px", margin: "0 auto" }}>
            <h1>Chat con GPT (via WebSocket)</h1>
            <div
                style={{
                    border: "1px solid #ddd",
                    padding: "1rem",
                    height: "300px",
                    overflowY: "auto",
                    marginBottom: "1rem",
                }}
            >
                {messages.map((msg, index) => (
                    <div key={index} style={{ margin: "0.5rem 0" }}>
                        <strong>{msg.role}: </strong>
                        {msg.content}
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu mensaje..."
                style={{ width: "calc(100% - 70px)", marginRight: "10px", padding: "0.5rem" }}
            />
            <button onClick={sendMessage} style={{ padding: "0.5rem" }}>
                Enviar
            </button>
        </div>
    );
};

export default Chat;
