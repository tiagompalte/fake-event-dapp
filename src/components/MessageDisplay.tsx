import React from 'react';

interface MessageDisplayProps {
  message: string;
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="mt-4 text-green-600 font-semibold">
      {message}
    </div>
  );
};

export default MessageDisplay;