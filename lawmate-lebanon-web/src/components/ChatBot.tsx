import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Send } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { language } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          text:
            language === 'ar'
              ? 'مرحباً! أنا مساعد LawMate. كيف يمكنني مساعدتك اليوم؟'
              : "Hello! I'm your LawMate assistant. How can I help you today?",
          isUser: false,
        },
      ]);
    }
  }, [isOpen, language, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

const handleSend = async () => {
  if (!message.trim()) return;

  const userMsg = { text: message, isUser: true };
  setMessages((prev) => [...prev, userMsg]);
  setMessage('');
  setIsTyping(true);

  try {
    const res = await fetch('https://lawmate-1.onrender.com/api/askai/short', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        question: userMsg.text,
        lang: language === 'ar' ? 'ar' : 'en'  // ✅ specify language
      }),
    });

    const data = await res.json();
    let answer = data.short_answer || '';

    answer = answer.replace(/\n\s*\n/g, '\n\n').trim();

    if (!answer) {
      answer =
        language === 'ar'
          ? 'عذراً، لم أتمكن من فهم سؤالك. يمكنك إعادة صياغته؟'
          : "Sorry, I couldn't understand your question. Could you rephrase it?";
    }

    setMessages((prev) => [...prev, { text: answer, isUser: false }]);
  } catch {
    setMessages((prev) => [
      ...prev,
      {
        text:
          language === 'ar'
            ? 'تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.'
            : 'Could not connect to server. Please check your internet connection.',
        isUser: false,
      },
    ]);
  } finally {
    setIsTyping(false);
  }
};


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
<>
  {/* Mobile button (small and above nav) */}
  <Button
    onClick={() => setIsOpen(true)}
    className="fixed bottom-20 right-4 w-10 h-10 rounded-full bg-[#26A69A] hover:bg-[#1e8e84] shadow-lg z-50 p-0 flex items-center justify-center transition-all duration-200 md:hidden"
    aria-label={language === 'ar' ? 'فتح مساعد الدردشة' : 'Open chat assistant'}
  >
    <span className="text-lg" role="img" aria-hidden="true">💬</span>
  </Button>

  {/* Desktop button (bigger and lower corner) */}
  <Button
    onClick={() => setIsOpen(true)}
    className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-[#26A69A] to-[#26A69A]/80 hover:from-[#26A69A]/90 hover:to-[#26A69A]/70 shadow-xl hover:shadow-2xl z-50 p-0 transform hover:scale-110 transition-all duration-200 hidden md:flex items-center justify-center"
    aria-label={language === 'ar' ? 'فتح مساعد الدردشة' : 'Open chat assistant'}
  >
    <span className="text-2xl" role="img" aria-hidden="true">💬</span>
  </Button>
</>


      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:inset-auto md:bottom-20 md:right-4 md:w-96 md:h-[500px]">
          {/* Backdrop for mobile */}
          <div
            className="absolute inset-0 bg-black/20 md:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <Card className="relative bg-white shadow-2xl z-10 flex flex-col rounded-none md:rounded-2xl h-full md:h-[500px] w-full md:w-96 animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-[#26A69A] to-[#26A69A]/90 text-white rounded-t-none md:rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="text-sm font-bold text-white">LM</span>
                </div>
                <div>
                  <span className="font-semibold text-lg">
                    {language === 'ar' ? 'مساعد LawMate' : 'LawMate Assistant'}
                  </span>
                  <div className="text-white/80 text-sm">
                    {language === 'ar' ? 'متصل الآن' : 'Online now'}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg touch-target transition-colors"
                aria-label={language === 'ar' ? 'إغلاق الدردشة' : 'Close chat'}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Chat Content */}
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-3 shadow-sm border max-w-[80%] ${
                        msg.isUser
                          ? 'bg-[#26A69A] text-white rounded-br-none'
                          : 'bg-white text-gray-800 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border text-gray-700">
                      <span className="animate-pulse">...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="p-6 border-t bg-white rounded-b-none md:rounded-b-2xl">
              <div className="flex space-x-3 mb-4">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    language === 'ar'
                      ? 'اطرح سؤالك القانوني...'
                      : 'Ask your legal question...'
                  }
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#26A69A] focus:border-transparent transition-all placeholder:text-gray-400"
                  aria-label={language === 'ar' ? 'رسالة الدردشة' : 'Chat message'}
                />
                <Button
                  size="sm"
                  onClick={handleSend}
                  disabled={!message.trim() || isTyping}
                  className="bg-[#26A69A] hover:bg-[#26A69A]/90 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 rounded-xl touch-target transition-all transform hover:scale-105 active:scale-95"
                  aria-label={language === 'ar' ? 'إرسال الرسالة' : 'Send message'}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">
                {language === 'ar'
                  ? 'هذا محتوى مولد بالذكاء الاصطناعي. ليس بديلاً عن المشورة القانونية المهنية.'
                  : 'This is AI-generated content. Not a substitute for professional legal advice.'}
              </p>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default ChatBot;
