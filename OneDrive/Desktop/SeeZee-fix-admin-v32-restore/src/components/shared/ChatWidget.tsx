"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Minimize2, User, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LogoHeader } from "@/components/brand/LogoHeader";
import { usePathname, useRouter } from "next/navigation";
import { extractPageContext, formatPageContextForAI } from "@/lib/ai/page-context";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
  quickActions?: string[];
  links?: Array<{ text: string; href: string }>;
}

interface LeadInfo {
  name?: string;
  email?: string;
  organization?: string;
  projectNeed?: string;
}

const QUICK_ACTIONS = [
  { label: "Pricing", value: "What are your prices?" },
  { label: "Services", value: "Tell me about your services" },
  { label: "Contact", value: "I'd like to talk to someone" },
];

const getInitialMessage = (): ChatMessage => {
  if (typeof window === 'undefined') {
    return {
      id: "welcome",
      role: "assistant",
      content: `Hey! I'm here to help you learn about our web development services for nonprofits.

What brings you here today?`,
      createdAt: new Date(),
      quickActions: QUICK_ACTIONS.map(a => a.label),
    };
  }

  const pageContext = extractPageContext();
  let welcomeMessage = `Hey! I'm here to help you learn about our web development services.`;

  // Add page-specific context
  if (pageContext.url && pageContext.url !== '/') {
    if (pageContext.url.includes('/services')) {
      welcomeMessage += ` I can see you're on our services page - perfect place to learn about our pricing tiers!`;
    } else if (pageContext.url.includes('/about')) {
      welcomeMessage += ` You're on our about page - want to know more about Sean and Zach?`;
    } else if (pageContext.url.includes('/case-studies')) {
      welcomeMessage += ` You're checking out our work - we're proud of what we've built!`;
    } else if (pageContext.url.includes('/start')) {
      welcomeMessage += ` You're on our project start page - ready to get started?`;
    }
  }

  welcomeMessage += `\n\nWhat can I help you with today?`;

  return {
    id: "welcome",
    role: "assistant",
    content: welcomeMessage,
    createdAt: new Date(),
    quickActions: QUICK_ACTIONS.map(a => a.label),
  };
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadInfo, setLeadInfo] = useState<LeadInfo>({});
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Generate visitor ID on mount and initialize messages
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
        } else {
          // Initialize with welcome message
          setMessages([getInitialMessage()]);
        }
        if (data.leadInfo) {
          setLeadInfo(data.leadInfo);
        }
      } catch {
        // Invalid stored data, initialize fresh
        setMessages([getInitialMessage()]);
      }
    } else {
      // No stored session, initialize with welcome message
      setMessages([getInitialMessage()]);
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    if (messages.length > 1 || conversationId) {
      localStorage.setItem("seezee_chat_session", JSON.stringify({
        conversationId,
        messages: messages.slice(-20),
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
    setUnreadCount(0);

    // Extract current page context
    const pageContext = extractPageContext();
    const pageContextText = formatPageContextForAI(pageContext);

    try {
      const response = await fetch("/api/chat/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          conversationId,
          leadInfo,
          pageContext: {
            url: pageContext.url,
            title: pageContext.title,
            headings: pageContext.headings,
            links: pageContext.links,
            mainContent: pageContext.mainContent,
          },
          pageContextText,
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
        links: data.links,
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
        content: `Thanks ${leadInfo.name}! Our team will reach out to you at ${leadInfo.email} soon. In the meantime, feel free to keep chatting with me!`,
        createdAt: new Date(),
      };
      setMessages(prev => [...prev, thankYouMessage]);
    } catch (error) {
      console.error("Failed to capture lead:", error);
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  // Collapsed button
  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-20 h-20 bg-[#0B0F1A] border border-[#1a2332] rounded-full shadow-lg flex items-center justify-center z-50 group hover:border-trinity-red transition-all"
      >
        <MessageCircle className="w-9 h-9 text-gray-300 group-hover:text-trinity-red transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-trinity-red rounded-full flex items-center justify-center text-white text-xs font-bold">
            {unreadCount}
          </span>
        )}
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
          className="bg-[#0B0F1A] border border-[#1a2332] rounded-xl px-4 py-3 flex items-center gap-2 hover:border-trinity-red transition-all shadow-xl"
        >
          <LogoHeader className="scale-75 origin-left" />
          <span className="text-xs text-gray-400 font-medium">Team Support</span>
          {messages.length > 1 && (
            <span className="text-xs text-gray-500">• {messages.length - 1} messages</span>
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
      className="fixed bottom-6 right-6 w-[380px] h-[600px] max-h-[calc(100vh-3rem)] bg-[#050914] border border-[#1a2332] rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden md:w-[380px] md:max-h-[600px]"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#1a2332] bg-[#0B0F1A]">
        <div className="flex items-center gap-2">
          <LogoHeader className="scale-75 origin-left" />
          <span className="text-xs text-gray-400 font-medium">Team Support</span>
        </div>
        <div className="flex gap-1">
          {messages.length > 1 && (
            <button
              onClick={() => {
                // Reset chat - clear messages and conversation
                setMessages([getInitialMessage()]);
                setConversationId(null);
                setMessageCount(0);
                setLeadInfo({});
                localStorage.removeItem("seezee_chat_session");
              }}
              className="px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-[#1a2332] rounded-lg transition-colors"
              title="Start a new chat"
            >
              New Chat
            </button>
          )}
          <button
            onClick={() => setIsMinimized(true)}
            className="p-2 hover:bg-[#1a2332] rounded-lg transition-colors"
            aria-label="Minimize"
          >
            <Minimize2 className="w-4 h-4 text-gray-300" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-[#1a2332] rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0B0F1A]">
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex gap-2 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {/* Avatar */}
                {msg.role !== "user" && (
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 bg-[#1a2332] border border-[#1a2332] rounded-full">
                    <MessageCircle className="w-4 h-4 text-gray-400" />
                  </div>
                )}

                {/* Message */}
                <div className="space-y-1">
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-trinity-red text-white rounded-br-sm"
                        : msg.role === "system"
                        ? "bg-yellow-900/30 text-yellow-200 border border-yellow-800/50 rounded-bl-sm"
                        : "bg-[#1a2332] text-gray-100 border border-[#1a2332] rounded-bl-sm"
                    }`}
                  >
                    <div 
                      className="text-sm leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ 
                        __html: msg.content
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, href) => {
                            const isExternal = href.startsWith('http');
                            return `<a href="${href}" ${isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''} class="text-trinity-red hover:text-trinity-red/80 underline">${text}</a>`;
                          })
                          .replace(/\n/g, '<br/>') 
                      }} 
                    />
                  </div>
                  <div className={`text-xs text-gray-400 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                    {formatTime(msg.createdAt)}
                  </div>

                  {/* Quick Actions */}
                  {msg.quickActions && msg.role === "assistant" && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {msg.quickActions.map((action) => (
                        <button
                          key={action}
                          onClick={() => handleQuickAction(action)}
                          className="text-xs px-3 py-1.5 bg-[#1a2332] border border-[#1a2332] rounded-full text-gray-300 hover:bg-trinity-red/20 hover:border-trinity-red hover:text-white transition-all"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Links/Citations */}
                  {msg.links && msg.links.length > 0 && msg.role === "assistant" && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {msg.links.map((link, idx) => {
                        const isExternal = link.href.startsWith('http');
                        const handleClick = (e: React.MouseEvent) => {
                          if (!isExternal) {
                            e.preventDefault();
                            router.push(link.href);
                            setIsOpen(true); // Keep chat open when navigating
                          }
                        };
                        return (
                          <a
                            key={idx}
                            href={link.href}
                            onClick={handleClick}
                            target={isExternal ? '_blank' : '_self'}
                            rel={isExternal ? 'noopener noreferrer' : undefined}
                            className="text-xs px-3 py-1.5 bg-[#1a2332] border border-trinity-red/30 rounded-full text-trinity-red hover:bg-trinity-red/20 hover:border-trinity-red hover:text-white transition-all inline-flex items-center gap-1 cursor-pointer"
                          >
                            {link.text}
                            <span className="text-[10px]">→</span>
                          </a>
                        );
                      })}
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
            <div className="w-8 h-8 flex items-center justify-center bg-[#1a2332] border border-[#1a2332] rounded-full">
              <MessageCircle className="w-4 h-4 text-gray-400" />
            </div>
            <div className="bg-[#1a2332] border border-[#1a2332] rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-trinity-red rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-trinity-red rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-trinity-red rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
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
              className="bg-[#1a2332] border border-[#1a2332] rounded-xl p-4"
            >
              <h4 className="text-white font-medium text-sm mb-2">Get personalized help!</h4>
              <p className="text-xs text-gray-400 mb-4">
                Leave your info and our team will reach out with custom recommendations.
              </p>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Your name"
                  value={leadInfo.name || ""}
                  onChange={(e) => setLeadInfo({ ...leadInfo, name: e.target.value })}
                  className="w-full bg-[#050914] border border-[#1a2332] rounded-lg px-3 py-2 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-trinity-red focus:ring-1 focus:ring-trinity-red"
                />
                <input
                  type="email"
                  placeholder="Your email"
                  value={leadInfo.email || ""}
                  onChange={(e) => setLeadInfo({ ...leadInfo, email: e.target.value })}
                  className="w-full bg-[#050914] border border-[#1a2332] rounded-lg px-3 py-2 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-trinity-red focus:ring-1 focus:ring-trinity-red"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowLeadForm(false)}
                    className="flex-1 px-3 py-2 text-gray-400 text-sm hover:text-white transition-colors"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleLeadSubmit}
                    disabled={!leadInfo.name || !leadInfo.email}
                    className="flex-1 px-4 py-2 bg-trinity-red text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-trinity-maroon transition-colors"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#1a2332] bg-[#050914]">
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
          placeholder="Type a message... (Press Enter to send)"
          disabled={isLoading}
          className="w-full bg-[#0B0F1A] border border-[#1a2332] rounded-xl px-4 py-3 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-trinity-red focus:ring-1 focus:ring-trinity-red disabled:opacity-50 transition-all"
        />
        <p className="text-[10px] text-gray-400 text-center mt-2">
          Powered by AI • <a href="/contact" className="text-trinity-red hover:underline">Prefer to talk to a human?</a>
        </p>
      </div>
    </motion.div>
  );
}

