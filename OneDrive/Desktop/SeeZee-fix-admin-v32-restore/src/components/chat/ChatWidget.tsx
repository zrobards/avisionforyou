"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Minimize2, X, Bot, User } from "lucide-react";
import { format } from "date-fns";

interface ChatMessage {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  createdAt: Date;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    if (isOpen && !hasGreeted) {
      const timer = setTimeout(() => {
        addMessage({
          role: "ASSISTANT",
          content:
            "Hi! 👋 I'm the SeeZee AI assistant. I can help you learn about our web development services, get a quote, or schedule a call with our team. How can I help you today?",
        });
        setHasGreeted(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, hasGreeted]);

  const addMessage = (message: Partial<ChatMessage>) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        createdAt: new Date(),
        ...message,
      } as ChatMessage,
    ]);
  };

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput("");
    addMessage({ role: "USER", content: userMessage });
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId.current,
          message: userMessage,
        }),
      });

      const data = await response.json();

      addMessage({
        role: "ASSISTANT",
        content: data.message,
      });

      if (data.needsHuman) {
        setTimeout(() => {
          addMessage({
            role: "SYSTEM",
            content:
              "I've notified our team. Someone will be with you shortly! In the meantime, feel free to continue chatting with me.",
          });
        }, 1000);
      }
    } catch (error) {
      console.error("Chat error:", error);
      addMessage({
        role: "SYSTEM",
        content: "Sorry, I'm having trouble connecting. Please try again.",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-trinity-red to-trinity-maroon shadow-lg flex items-center justify-center z-50 hover:shadow-xl transition-shadow"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        height: isMinimized ? 64 : 480,
      }}
      transition={{ type: "spring", damping: 20 }}
      className="fixed bottom-6 right-6 w-96 rounded-2xl border-2 border-gray-700 bg-[#0a0e1a] shadow-2xl overflow-hidden z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-trinity-red to-trinity-maroon">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">SeeZee Assistant</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-white/80">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 rounded-lg hover:bg-white/20 transition text-white"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-white/20 transition text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="h-[340px] overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "USER" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    message.role === "USER"
                      ? "bg-trinity-red text-white rounded-br-sm"
                      : message.role === "SYSTEM"
                      ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded-bl-sm"
                      : "bg-[#1a2235] text-gray-200 rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <span
                    className={`text-[10px] mt-1 block ${
                      message.role === "USER"
                        ? "text-white/60"
                        : "text-gray-500"
                    }`}
                  >
                    {format(message.createdAt, "h:mm a")}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#1a2235] rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.15s" }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.3s" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 rounded-xl border border-gray-700 bg-[#151b2e] px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-trinity-red"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isTyping}
                className="p-2.5 rounded-xl bg-trinity-red text-white hover:bg-trinity-maroon disabled:bg-gray-700 disabled:cursor-not-allowed transition"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[10px] text-gray-600 text-center mt-2">
              Powered by AI • Responses may not be accurate
            </p>
          </div>
        </>
      )}
    </motion.div>
  );
}

export default ChatWidget;








