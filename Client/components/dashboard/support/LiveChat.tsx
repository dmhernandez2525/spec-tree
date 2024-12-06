import { useState } from 'react';

const LiveChat: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>('');

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, input]);
      setInput('');
    }
  };

  return (
    <div className="live-chat p-4 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Live Chat Support</h2>
      <div className="chat-window h-64 overflow-y-scroll p-2 bg-white rounded-lg mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className="chat-message p-2 mb-2 bg-blue-100 rounded"
          >
            {msg}
          </div>
        ))}
      </div>
      <div className="chat-input flex">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          className="p-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default LiveChat;
