import { useLanguage } from '@/contexts/LanguageContext';
import { Bot, User } from 'lucide-react';
import { useMemo } from 'react';

interface MessageBubbleProps {
  message: {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
  };
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

const formatContent = (text: string) => {
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className={`${isRTL ? 'text-right' : 'text-left'} leading-relaxed`}>
      {text.split('\n').map((line, lineIndex) => {
        const boldify = (segment: string, idx: number) => {
          if (segment.startsWith('**') && segment.endsWith('**')) {
            return <strong key={idx} className="font-semibold">{segment.slice(2, -2)}</strong>;
          }
          return segment;
        };

        // Bullet point
        if (line.trim().startsWith('* ')) {
          return (
            <div key={`bullet-${lineIndex}`} className="flex items-start gap-2">
              <span className="text-lg mt-1">•</span>
              <span>{line.replace('* ', '').split(/(\*\*.*?\*\*)/g).map(boldify)}</span>
            </div>
          );
        }

        // Numbered list
        if (/^\d+\./.test(line.trim())) {
          const match = line.match(/^(\d+)\.(.*)/);
          if (match) {
            const [, number, content] = match;
            return (
              <div key={`number-${lineIndex}`} className="flex items-start gap-2">
                <span className="font-medium">{number}.</span>
                <span>{content.split(/(\*\*.*?\*\*)/g).map(boldify)}</span>
              </div>
            );
          }
        }

        // Heading (ends with :)
        if (line.trim().endsWith(':')) {
          return (
            <h3 key={`heading-${lineIndex}`} className="font-semibold text-base mt-3 mb-1">
              {line.split(/(\*\*.*?\*\*)/g).map(boldify)}
            </h3>
          );
        }

        // Regular paragraph
        return (
          <p key={`plain-${lineIndex}`} className="mb-2 text-sm leading-relaxed">
            {line.split(/(\*\*.*?\*\*)/g).map(boldify)}
          </p>
        );
      })}
    </div>
  );
};

const formattedText = useMemo(() => {
  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`space-y-3 ${isRTL ? 'font-almarai' : 'prose prose-sm max-w-full'} prose-p:my-2`}
    >
      {message.text.split('\n\n').map((paragraph, i) => (
        <div key={i}>
          {formatContent(paragraph)}
        </div>
      ))}
    </div>
  );
}, [message.text, isRTL]);



  const formattedTime = useMemo(() => {
    return message.timestamp.toLocaleTimeString(isRTL ? 'ar-LB' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      numberingSystem: isRTL ? 'arab' : 'latn'
    });
  }, [message.timestamp, isRTL]);

  return (
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start gap-3 max-w-xs lg:max-w-md xl:max-w-lg`}>
        {!message.isUser && (
          <div className="w-8 h-8 bg-[#26A69A] rounded-full flex items-center justify-center flex-shrink-0">
            <Bot className="h-4 w-4 text-white" />
          </div>
        )}
        <div
          className={`px-4 py-3 rounded-lg ${
            message.isUser
              ? 'bg-[#1F2A44] text-white rounded-tr-none'
              : 'bg-gray-100 text-gray-800 rounded-tl-none'
          }`}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div className="text-sm whitespace-pre-wrap">
            {formattedText}
          </div>
          <span className={`text-xs opacity-70 mt-1 block text-left ${message.isUser ? 'text-gray-300' : 'text-gray-500'}`}>
            {formattedTime}
          </span>
        </div>
        {message.isUser && (
          <div className="w-8 h-8 bg-[#1F2A44] rounded-full flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 text-white" />
          </div>
        )}
      </div>
    </div>
  );
};