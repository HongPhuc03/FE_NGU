import React from 'react';
import { useState, useRef, useEffect } from 'react';
import './AIChatBox.css';

interface Message {
    id: string;
    text: string | React.JSX.Element;
    sender: 'user' | 'ai';
    timestamp: Date;
}

const AIChatBox = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Xin chào! Tôi có thể giúp gì cho bạn?',
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isMinimized, setIsMinimized] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            text: inputMessage,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newMessage]);
        setInputMessage('');

        try {
            const response = await fetch('https://localhost:7135/api/ChatBot/ChatBot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(inputMessage)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(data.message.houses);
            let aiMessageContent: string | React.JSX.Element = typeof data.message === 'string' ? data.message : JSON.stringify(data.message);

            interface House {
                id: string;
                url: string;
                name: string;
            }

            if (Array.isArray(data.message.houses) && data.message.houses.length > 0) {
                aiMessageContent = (
                    <div>
                        <p>{data.message.message}</p>
                        <ul className="list-unstyled mb-0">
                            {data.message.houses.map((house: House) => (
                                <li key={house.id}>
                                    <a href={house.url} target="_blank" rel="noopener noreferrer">
                                        {house.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            }

            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: aiMessageContent,
                sender: 'ai',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiResponse]);

        } catch (error) {
            console.error('Error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        setIsMinimized(false);
    };

    const toggleMinimize = () => {
        setIsMinimized(!isMinimized);
    };

    return (
        <div className={`ai-chat-container ${isOpen ? 'open' : ''}`}>
            {/* Chat Toggle Button */}
            <button className="chat-toggle-btn" onClick={toggleChat} aria-label="Toggle chat">
                <i className={`bi ${isOpen ? 'bi-x-lg' : 'bi-chat-dots-fill'}`}></i>
            </button>

            {/* Chat Box */}
            <div className={`chat-box ${isMinimized ? 'minimized' : ''}`}>
                {/* Header */}
                <div className="chat-header">
                    <div className="d-flex align-items-center">
                        <img src="/img/logo-roomnear.png" alt="AI Assistant" className="ai-avatar" />
                        <div className="ms-2">
                            <h6 className="mb-0">AI Assistant</h6>
                            <small className="text-muted">Online</small>
                        </div>
                    </div>
                    <div className="chat-actions">
                        <button className="btn btn-link btn-sm p-0 me-2" onClick={toggleMinimize}>
                            <i className={`bi ${isMinimized ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                        </button>
                        <button className="btn btn-link btn-sm p-0" onClick={toggleChat}>
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="chat-messages">
                    {messages.map((message) => (
                        <div key={message.id} className={`message ${message.sender === 'ai' ? 'ai' : 'user'}`}>
                            {message.sender === 'ai' && (
                                <img src="/img/logo-roomnear.png" alt="AI" className="message-avatar" />
                            )}
                            <div className="message-content">
                                {typeof message.text === 'string' ? <p>{message.text}</p> : message.text}
                                <small className="message-time">
                                    {message.timestamp.toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </small>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} className="chat-input">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                        className="form-control"
                    />
                    <button
                        type="submit"
                        className="btn btn-primary send-button"
                        disabled={!inputMessage.trim()}
                    >
                        <i className="bi bi-send-fill"></i>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AIChatBox;
