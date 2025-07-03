import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Bot, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { MessageBubble } from '@/components/MessageBubble';
import { useMediaQuery } from 'react-responsive';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const AskAI = () => {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initial welcome message
    const welcomeMessage: Message = {
      id: '1',
      text: language === 'ar' 
        ? 'مرحباً! أنا مساعدك القانوني الذكي. كيف يمكنني مساعدتك اليوم؟'
        : 'Hello! I\'m your AI legal assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [language]);

const generateResponse = async (userInput: string): Promise<string> => {
  try {
    const response = await fetch('http://localhost:5001/api/askai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: userInput, lang: language }), // <-- add lang
    });
    const data = await response.json();

    let answer = data.answer || '';
    answer = answer.replace(/\n\s*\n/g, '\n\n').trim();

    if (!answer) {
      return language === 'ar'
        ? 'عذراً، لم أتمكن من فهم سؤالك. يمكنك إعادة صياغته؟'
        : 'Sorry, I couldn\'t understand your question. Could you rephrase it?';
    }

    return answer;
  } catch (e) {
    return language === 'ar'
      ? 'تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.'
      : 'Could not connect to server. Please check your internet connection.';
  }
};


  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    const response = await generateResponse(currentInput);
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: response,
      isUser: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);
  };

  const quickQuestions = language === 'ar' ? [
    'كيف أصيغ عقد عمل؟',
    'ما هي حقوقي كمستأجر؟',
    'كيف أؤسس شركة؟',
    'مدة الإشعار للفصل؟'
  ] : [
    'Draft employment contract?',
    'My rights as a tenant?',
    'Start a company?',
    'Termination notice?'
  ];

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {/* Mobile Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="px-3 py-3 flex items-center gap-2">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className={`h-4 w-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#26A69A] rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-base font-semibold text-[#1F2A44]">
                {language === 'ar' ? 'المساعد الذكي' : 'AI Assistant'}
              </h1>
            </div>
          </div>
        </div>

        {/* Mobile Chat Container */}
        <div className="p-2">
          <Card className="h-[calc(100vh-140px)] flex flex-col">
            {/* Messages */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-[#26A69A] rounded-full flex items-center justify-center">
                      <Bot className="h-3 w-3 text-white" />
                    </div>
                    <div className="bg-gray-100 px-3 py-2 rounded-lg rounded-tl-none">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input - Quick questions removed in mobile view */}
            <div className="p-2 border-t">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={language === 'ar' ? 'اكتب سؤالك...' : 'Type your question...'}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 text-sm h-10"
                />
                <Button 
                  onClick={handleSendMessage}
                  className="bg-[#26A69A] hover:bg-[#26A69A]/90 h-10 w-10 p-0"
                  disabled={!inputValue.trim() || isTyping}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[10px] text-gray-500 mt-1 text-center">
                {language === 'ar' 
                  ? 'محتوى ذكاء اصطناعي. ليس استشارة قانونية.'
                  : 'AI content. Not legal advice.'
                }
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Original Desktop View with Quick Questions
  return (
    <div className="min-h-screen bg-gray-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className={`h-4 w-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#26A69A] rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-[#1F2A44]">
                  {language === 'ar' ? 'المساعد القانوني الذكي' : 'AI Legal Assistant'}
                </h1>
                <p className="text-sm text-gray-500">
                  {language === 'ar' ? 'متوفر 24/7 للاستشارات القانونية' : 'Available 24/7 for legal consultations'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto p-4">
        <Card className="h-[70vh] flex flex-col">
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-6">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#26A69A] rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-100 px-4 py-3 rounded-lg rounded-tl-none">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions (only in desktop view) */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2">
              <p className="text-sm text-gray-600 mb-2">
                {language === 'ar' ? 'أسئلة سريعة:' : 'Quick questions:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setInputValue(question)}
                    className="text-xs"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={language === 'ar' ? 'اكتب سؤالك القانوني...' : 'Type your legal question...'}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                className="bg-[#26A69A] hover:bg-[#26A69A]/90"
                disabled={!inputValue.trim() || isTyping}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {language === 'ar' 
                ? 'هذا المحتوى مولد بالذكاء الاصطناعي. ليس بديلاً عن الاستشارة القانونية المهنية.'
                : 'This content is AI-generated. Not a substitute for professional legal advice.'
              }
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AskAI;