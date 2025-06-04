import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';
import MessageBubble from '../components/MessageBubble.tsx';
import axios from 'axios';

const getToken = () => localStorage.getItem('accessToken');

const ChatPage = () => {
  const { hostId: receiverID } = useParams<{ hostId: string }>();
  const [messages, setMessages] = useState<{ text: string; isSender: boolean }[]>([]);
  const [input, setInput] = useState('');
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  // Gửi tin nhắn API
  const handleSend = async () => {
    if (!input.trim()) return;

    try {
      const token = getToken();
      const response = await axios.post(
  'https://localhost:7135/api/Chat/SendMessage',
  {
    message: input,
    reciverID: receiverID,
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

      if (response.status === 200) {
        setMessages(prev => [...prev, { text: input, isSender: true }]);
        setInput('');
      } else {
        alert('Gửi tin nhắn thất bại.');
      }
    } catch (err) {
      console.error('Lỗi khi gửi:', err);
    }
  };

  // Khởi tạo kết nối SignalR khi component mount
  useEffect(() => {
    const token = getToken();

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7135/chatHub', {
        accessTokenFactory: () => token || '',
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connection
      .start()
      .then(() => {
        console.log('✅ SignalR connected');
        // Lắng nghe sự kiện nhận tin nhắn từ server
        connection.on('ReceiveMessage', (_senderId: string, message: string) => {
          // Bạn có thể check senderId nếu cần
          setMessages(prev => [...prev, { text: message, isSender: false }]);
        });
      })
      .catch(err => console.error('❌ SignalR connection failed:', err));

    connectionRef.current = connection;

    return () => {
      connection.stop();
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-white p-4 shadow-md text-lg font-semibold">
        Nhắn tin với chủ trọ
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <MessageBubble key={index} text={msg.text} isSender={msg.isSender} />
        ))}
      </div>

      <div className="p-4 bg-white flex items-center gap-2 border-t">
        <input
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nhập tin nhắn..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
        >
          Gửi
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
