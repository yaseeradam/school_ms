'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, X, Minus, GripHorizontal, Send, Loader2 } from 'lucide-react';

export default function PuterAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const aiRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleMouseDown = (e) => {
    if (e.target.closest('.no-drag')) return;
    setIsDragging(true);
    const rect = aiRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        const maxX = window.innerWidth - (aiRef.current?.offsetWidth || 0);
        const maxY = window.innerHeight - (aiRef.current?.offsetHeight || 0);
        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY))
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('https://api.puter.com/drivers/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interface: 'puter-chat-completion',
          driver: 'openai-completion',
          method: 'complete',
          args: {
            messages: [...messages, userMessage].map(m => ({
              role: m.role,
              content: m.content
            }))
          }
        })
      });

      if (!response.ok) throw new Error('API request failed');
      
      const data = await response.json();
      const aiMessage = { 
        role: 'assistant', 
        content: data.message?.content || data.result?.message?.content || 'I apologize, but I could not generate a response. Please try again.' 
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again later.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="hidden"
        data-puter-trigger
      />
    );
  }

  return (
    <>
      {isDragging && <div className="fixed inset-0 z-40" />}
      <div
        ref={aiRef}
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        className={`fixed z-50 transition-all duration-300 ${
          isDragging ? 'shadow-2xl cursor-grabbing' : 'shadow-lg cursor-default'
        }`}
      >
        <div className="w-96 rounded-2xl overflow-hidden bg-white">
          <div
            onMouseDown={handleMouseDown}
            className="flex items-center justify-between p-3 cursor-grab active:cursor-grabbing bg-gradient-to-r from-purple-500 to-blue-500"
          >
            <div className="flex items-center gap-2">
              <GripHorizontal size={18} className="text-white" />
              <Bot size={18} className="text-white" />
              <span className="font-semibold text-white">AI Assistant</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="no-drag p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <Minus size={16} className="text-white" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="no-drag p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X size={16} className="text-white" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <div className="flex flex-col h-96">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 mt-20">
                    <Bot size={48} className="mx-auto mb-3 opacity-50" />
                    <p>Ask me anything!</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        msg.role === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <Loader2 size={20} className="animate-spin text-gray-600" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
