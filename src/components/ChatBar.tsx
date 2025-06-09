import React, { useState, useEffect } from 'react';
import { callOpenAI } from '@/lib/openai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatBar: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('openaiApiKey');
    if (stored) setApiKey(stored);
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');

    if (!apiKey) {
      setMessages([...newMessages, { role: 'assistant', content: 'Set your OpenAI key in Settings first.' }]);
      return;
    }

    setLoading(true);
    try {
      const reply = await callOpenAI(apiKey, newMessages.map(m => ({ role: m.role, content: m.content })));
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: 'assistant', content: 'Error contacting OpenAI' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-md p-4 space-y-2 bg-muted/40 animate-fade-in">
      <div className="space-y-1 max-h-60 overflow-y-auto flex flex-col">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-md w-fit transition-all ${m.role === 'user' ? 'bg-primary text-primary-foreground self-end' : 'bg-secondary'}`}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="animate-pulse p-2 rounded-md bg-secondary w-fit">Thinking...</div>
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          className="flex-1 border rounded-md p-2"
          placeholder="Ask the assistant..."
        />
        <button onClick={sendMessage} className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBar;
