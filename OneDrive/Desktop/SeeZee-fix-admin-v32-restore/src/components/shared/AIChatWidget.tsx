"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, Send, Minimize2, User, Bot, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
  quickActions?: string[];
}

interface LeadInfo {
  name?: string;
  email?: string;
  projectNeed?: string;
}

const QUICK_ACTIONS = [
  { label: "💰 Pricing", value: "What are your prices?" },
  { label: "📁 Portfolio", value: "Show me your work" },
  { label: "📅 Schedule", value: "I'd like to schedule a call" },
  { label: "🚀 Get Started", value: "How do I get started?" },
];

const INITIAL_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: `Hi! 👋 I'm SeeZee's AI assistant. I can help you with:

• **Pricing** for websites and apps
• **Portfolio** examples of our work  
• **Scheduling** a free consultation
• **Getting started** on your project

What can I help you with today?`,
  createdAt: new Date(),
  quickActions: QUICK_ACTIONS.map(a => a.label),
};

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadInfo, setLeadInfo] = useState<LeadInfo>({});
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate session ID on mount
  useEffect(() => {
    const stored = localStorage.getItem("seezee_chat_session");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setConversationId(data.conversationId);
        if (data.messages?.length > 1) {
          setMessages(data.messages.map((m: ChatMessage) => ({
            ...m,
            createdAt: new Date(m.createdAt)
          })));
          setMessageCount(data.messageCount || 0);
        }
        if (data.leadInfo) {
          setLeadInfo(data.leadInfo);
        }
      } catch {
        // Invalid stored data
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    if (messages.length > 1 || conversationId) {
      localStorage.setItem("seezee_chat_session", JSON.stringify({
        conversationId,
        messages: messages.slice(-20), // Keep last 20 messages
        messageCount,
        leadInfo,
      }));
    }
  }, [messages, conversationId, messageCount, leadInfo]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Show lead form after 4 messages
  useEffect(() => {
    if (messageCount >= 4 && !leadInfo.email && !showLeadForm) {
      setShowLeadForm(true);
    }
  }, [messageCount, leadInfo.email, showLeadForm]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: content.trim(),
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);
    setMessageCount(prev => prev + 1);

    try {
      const response = await fetch("/api/chat/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          conversationId,
          leadInfo,
          history: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();

      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.content,
        createdAt: new Date(),
        quickActions: data.quickActions,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again or reach out to us directly at sean@see-zee.com!",
        createdAt: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, isLoading, leadInfo, messages]);

  const handleQuickAction = (action: string) => {
    const quickAction = QUICK_ACTIONS.find(a => a.label === action);
    if (quickAction) {
      sendMessage(quickAction.value);
    }
  };

  const handleLeadSubmit = async () => {
    if (!leadInfo.email || !leadInfo.name) return;

    try {
      await fetch("/api/chat/capture-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          ...leadInfo,
        }),
      });

      setShowLeadForm(false);
      
      const thankYouMessage: ChatMessage = {
        id: `system-${Date.now()}`,
        role: "assistant",
        content: `Thanks ${leadInfo.name}! 🎉 Our team will reach out to you at ${leadInfo.email} soon. In the meantime, feel free to keep chatting with me!`,
        createdAt: new Date(),
      };
      setMessages(prev => [...prev, thankYouMessage]);
    } catch (error) {
      console.error("Failed to capture lead:", error);
    }
  };

  const resetChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setConversationId(null);
    setMessageCount(0);
    setLeadInfo({});
    setShowLeadForm(false);
    localStorage.removeItem("seezee_chat_session");
  };

  // Collapsed button
  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full shadow-2xl shadow-cyan-500/40 flex items-center justify-center z-50 group"
      >
        <Bot className="w-7 h-7 text-white" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
          <span className="absolute w-full h-full bg-green-500 rounded-full animate-ping opacity-75" />
          <span className="w-2 h-2 bg-white rounded-full" />
        </span>
        <span className="absolute bottom-full right-0 mb-2 bg-slate-900 text-white text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
          Chat with SeeZee AI 💬
        </span>
      </motion.button>
    );
  }

  // Minimized state
  if (isMinimized) {
    return (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-cyan-500/50 transition-all shadow-xl"
        >
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-medium">SeeZee AI</span>
          {messages.length > 1 && (
            <span className="text-xs text-slate-400">{messages.length - 1} messages</span>
          )}
        </button>
      </motion.div>
    );
  }

  // Full chat window
  return (
    <motion.div
      initial={{ y: 20, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      className="fixed bottom-6 right-6 w-[380px] h-[600px] bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 flex flex-col z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-blue-600/10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
          </div>
          <div>
            <h3 className="text-white font-semibold flex items-center gap-2">
              SeeZee AI
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </h3>
            <p className="text-xs text-green-400">Online • Replies instantly</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={resetChat}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white text-xs"
            title="Reset chat"
          >
            Reset
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <Minimize2 className="w-4 h-4 text-slate-400" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex gap-2 max-w-[90%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === "user" 
                    ? "bg-slate-700" 
                    : "bg-gradient-to-r from-cyan-500 to-blue-600"
                }`}>
                  {msg.role === "user" ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <div
                    className={`rounded-2xl p-3 ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                        : "bg-slate-800/80 text-white border border-white/5"
                    }`}
                  >
                    <div 
                      className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: msg.content
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\n/g, '<br/>') 
                      }} 
                    />
                  </div>

                  {/* Quick Actions */}
                  {msg.quickActions && msg.role === "assistant" && (
                    <div className="flex flex-wrap gap-2">
                      {msg.quickActions.map((action) => (
                        <button
                          key={action}
                          onClick={() => handleQuickAction(action)}
                          className="text-xs px-3 py-1.5 bg-slate-800 border border-white/10 rounded-full text-slate-300 hover:bg-cyan-500/20 hover:border-cyan-500/50 hover:text-white transition-all"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-slate-800/80 border border-white/5 rounded-2xl p-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Lead Capture Form */}
        <AnimatePresence>
          {showLeadForm && !leadInfo.email && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h4 className="text-white font-medium text-sm">Get personalized help!</h4>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Leave your info and our team will reach out with custom recommendations.
              </p>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Your name"
                  value={leadInfo.name || ""}
                  onChange={(e) => setLeadInfo({ ...leadInfo, name: e.target.value })}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-500/50"
                />
                <input
                  type="email"
                  placeholder="Your email"
                  value={leadInfo.email || ""}
                  onChange={(e) => setLeadInfo({ ...leadInfo, email: e.target.value })}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-500/50"
                />
                <textarea
                  placeholder="What's your project about? (optional)"
                  value={leadInfo.projectNeed || ""}
                  onChange={(e) => setLeadInfo({ ...leadInfo, projectNeed: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-500/50 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowLeadForm(false)}
                    className="flex-1 px-3 py-2 text-slate-400 text-sm hover:text-white transition-colors"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleLeadSubmit}
                    disabled={!leadInfo.name || !leadInfo.email}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Submit
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10 bg-slate-950/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(message);
              }
            }}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1 bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage(message)}
            disabled={!message.trim() || isLoading}
            className="px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-[10px] text-slate-500 text-center mt-2">
          Powered by AI • <a href="/contact" className="text-cyan-400 hover:underline">Prefer to talk to a human?</a>
        </p>
      </div>
    </motion.div>
  );
}

