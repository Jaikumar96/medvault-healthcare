import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Heart, User, Minimize2, Maximize2 } from 'lucide-react';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId] = useState(() => 'session_' + Date.now());
    const messagesEndRef = useRef(null);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Function to render message with proper formatting from the backend
    const renderMessage = (text) => {
        // Handle markdown-style bold text: **text** -> <strong>text</strong>
        let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Handle star ratings: ⭐ -> <span class="text-yellow-400">⭐</span>
        formattedText = formattedText.replace(/⭐/g, '<span class="text-yellow-400">⭐</span>');
        
        // Handle line breaks: \n -> <br />
        formattedText = formattedText.replace(/\n/g, '<br />');
        
        // Handle numbered lists or other custom emoji formats if needed
        formattedText = formattedText.replace(/(\d+)️⃣/g, '<span class="font-semibold text-blue-600">$1.</span>');

        return { __html: formattedText };
    };

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            // Send welcome message with MedVault branding
            setMessages([{
                id: 1,
                text: `Hello! 👋 I'm MedVault Assistant, your personal healthcare companion.

I can help you with:
🏥 Booking appointments
👨‍⚕️ Finding doctors
⭐ Leaving doctor reviews
📋 Medical records
🆘 Emergency assistance
🧠 Mental health support

How can I assist you today?`,
                sender: 'bot',
                timestamp: new Date()
            }]);
        }
    }, [isOpen, messages.length]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const sendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: inputMessage,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        const currentMessage = inputMessage;
        setInputMessage('');
        setIsTyping(true);

        try {
            const response = await fetch('http://localhost:8080/api/chatbot/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: currentMessage,
                    patientId: user.id,
                    sessionId: sessionId
                }),
            });

            if (response.ok) {
                const data = await response.json();
                
                setTimeout(() => {
                    const botMessage = {
                        id: Date.now(),
                        text: data.response,
                        sender: 'bot',
                        timestamp: new Date()
                    };
                    
                    setMessages(prev => [...prev, botMessage]);
                    setIsTyping(false);
                }, 800);
            } else {
                throw new Error('Network response was not ok');
            }

        } catch (error) {
            console.error('Chatbot API Error:', error);
            setIsTyping(false);
            const errorMessage = {
                id: Date.now(),
                text: "I'm having trouble connecting to our servers right now. Please try again in a moment, or contact our support team if the issue persists.",
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const quickReplies = [
        "Book an appointment",
        "Find a doctor",
        "How do I review a doctor?",
        "My appointments", 
        "Emergency help",
        "Mental health support"
    ];

    const handleQuickReply = (reply) => {
        // Directly create and send the message as if the user typed it.
        const userMessage = {
            id: Date.now(),
            text: reply,
            sender: 'user',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setInputMessage(''); // Clear input in case user was typing
        setIsTyping(true);

        // Mimic the send message flow for the selected reply
        const sendMessageWithReply = async () => {
             try {
                const response = await fetch('http://localhost:8080/api/chatbot/message', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: reply, patientId: user.id, sessionId }),
                });
                if (response.ok) {
                    const data = await response.json();
                    setTimeout(() => {
                        const botMessage = { id: Date.now(), text: data.response, sender: 'bot', timestamp: new Date() };
                        setMessages(prev => [...prev, botMessage]);
                        setIsTyping(false);
                    }, 800);
                } else { throw new Error('Network response not ok'); }
            } catch (error) {
                console.error('Chatbot API Error:', error);
                setIsTyping(false);
                const errorMessage = { id: Date.now(), text: "I'm having trouble connecting right now. Please try again in a moment.", sender: 'bot', timestamp: new Date() };
                setMessages(prev => [...prev, errorMessage]);
            }
        };
        sendMessageWithReply();
    };

    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full p-4 shadow-lg transition-all duration-300 transform hover:scale-110 relative"
                >
                    <MessageCircle size={24} />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </button>
            </div>
        );
    }

    return (
        <div className={`fixed bottom-6 right-6 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 transition-all duration-300 ${
            isMinimized ? 'w-80 h-14' : 'w-80 sm:w-96 h-[500px]'
        }`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-xl flex items-center justify-between cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
                <div className="flex items-center space-x-2">
                    <Heart size={20} className="text-red-300" />
                    <span className="font-semibold">MedVault Assistant</span>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                        className="hover:bg-blue-800 p-1 rounded transition-colors"
                        title={isMinimized ? "Expand" : "Minimize"}
                    >
                        {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                        className="hover:bg-blue-800 p-1 rounded transition-colors"
                        title="Close"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages */}
                    <div className="h-[350px] overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex items-end gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {message.sender === 'bot' && <Heart size={16} className="text-blue-600 flex-shrink-0 mb-1" />}
                                <div
                                    className={`max-w-xs px-4 py-2 rounded-lg text-sm leading-relaxed ${
                                        message.sender === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                                            : 'bg-white text-gray-800 rounded-bl-none shadow-md border border-gray-100'
                                    }`}
                                >
                                     <div dangerouslySetInnerHTML={renderMessage(message.text)} />
                                </div>
                                 {message.sender === 'user' && <User size={16} className="text-blue-200 flex-shrink-0 mb-1" />}
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start items-end gap-2">
                                <Heart size={16} className="text-blue-600 flex-shrink-0 mb-1" />
                                <div className="bg-white px-4 py-3 rounded-lg text-sm max-w-xs shadow-md border border-gray-100">
                                    <div className="flex items-center space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Replies */}
                    {messages.length <= 1 && (
                        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                            <div className="flex flex-wrap gap-2">
                                {quickReplies.map((reply, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleQuickReply(reply)}
                                        className="text-xs bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full hover:bg-blue-200 transition-colors font-medium"
                                    >
                                        {reply}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div className="border-t border-gray-200 p-3 bg-white rounded-b-xl">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask me anything..."
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={isTyping}
                                maxLength={500}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!inputMessage.trim() || isTyping}
                                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Send message"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                         <div className="flex items-center justify-center mt-2">
                            <div className="text-xs text-gray-500 flex items-center space-x-1">
                                 <Heart size={10} className="text-red-400" />
                                 <span>Powered by MedVault AI</span>
                             </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Chatbot;

