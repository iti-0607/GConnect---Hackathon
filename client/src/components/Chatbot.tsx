import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { chatAPI } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

interface ChatMessage {
  id: string;
  message: string;
  response?: string;
  isUser: boolean;
  timestamp: Date;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history when opened
  const { data: chatHistory } = useQuery({
    queryKey: ["/api/chat/history"],
    queryFn: () => chatAPI.getHistory(20),
    enabled: isOpen && !!user,
  });

  useEffect(() => {
    if (chatHistory && chatHistory.length > 0) {
      const formattedHistory = chatHistory.reverse().map((chat: any) => [
        {
          id: `${chat.id}-user`,
          message: chat.message,
          isUser: true,
          timestamp: new Date(chat.createdAt),
        },
        {
          id: `${chat.id}-bot`,
          message: chat.response,
          isUser: false,
          timestamp: new Date(chat.createdAt),
        },
      ]).flat();
      
      setMessages(formattedHistory);
    } else if (isOpen && messages.length === 0) {
      // Add welcome message
      setMessages([{
        id: "welcome",
        message: language === "hi" 
          ? "नमस्ते! मैं आपकी सरकारी योजनाओं के बारे में मदद कर सकता हूं। आप हिंदी या अंग्रेजी में पूछ सकते हैं।"
          : "Hello! I can help you with government schemes. Ask me anything in Hindi or English.",
        isUser: false,
        timestamp: new Date(),
      }]);
    }
  }, [chatHistory, isOpen, language]);

  const sendMessageMutation = useMutation({
    mutationFn: (data: { message: string; language?: string }) => 
      chatAPI.sendMessage(data),
    onSuccess: (response) => {
      // Add bot response
      setMessages(prev => [...prev, {
        id: Date.now().toString() + "-bot",
        message: response.message,
        isUser: false,
        timestamp: new Date(),
      }]);
    },
    onError: (error) => {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString() + "-error",
        message: language === "hi" 
          ? "माफ करें, कुछ गलत हुआ है। कृपया पुनः प्रयास करें।"
          : "Sorry, something went wrong. Please try again.",
        isUser: false,
        timestamp: new Date(),
      }]);
    },
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: message.trim(),
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Send to API
    sendMessageMutation.mutate({
      message: message.trim(),
      language: language,
    });
    
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Chat Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="floating-chat w-16 h-16 rounded-full shadow-lg bg-gradient-to-r from-primary to-blue-600 hover:shadow-xl"
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <MessageCircle className="h-6 w-6 text-white" />
          )}
        </Button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-80 h-96 z-50 shadow-2xl border-0 animate-slide-up">
          <CardHeader className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-t-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">GConnect Assistant</CardTitle>
                  <p className="text-xs text-blue-100">
                    {language === "hi" ? "हिंदी/अंग्रेजी में पूछें" : "Ask in Hindi/English"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex flex-col h-full">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${
                    msg.isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {!msg.isUser && (
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-xs rounded-lg p-3 ${
                      msg.isUser
                        ? "bg-primary text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  </div>

                  {msg.isUser && (
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
              
              {sendMessageMutation.isPending && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 max-w-xs">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder={
                    language === "hi"
                      ? "अपना संदेश लिखें..."
                      : "Type your message..."
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                  disabled={sendMessageMutation.isPending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  size="sm"
                  className="px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
