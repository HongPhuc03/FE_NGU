// src/components/MessageBubble.tsx
import React from 'react';

interface MessageBubbleProps {
  text: string;
  isSender: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ text, isSender }) => {
  return (
    <div className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`px-4 py-2 rounded-2xl max-w-xs text-black ${isSender ? 'bg-blue-600' : 'bg-gray-500'}`}>
        {text}
      </div>
    </div>
  );
};

export default MessageBubble;
