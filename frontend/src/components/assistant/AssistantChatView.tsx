import React, { useState, useRef, useEffect } from 'react';
import { AssistantChatMessage } from '../../types/index.ts';
import { Send, Sparkles, AlertTriangle, ArrowRight, Bot, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AssistantChatViewProps {
  messages: AssistantChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  loading: boolean;
  onSelectPrompt: (prompt: string) => void;
}

const DEFAULT_SUGGESTIONS = [
  "Today's Routine",
  "Next Medication",
  "Upcoming Doctor Visit",
  "I drank a glass of water",
  "Find Prescriptions in Vault",
  "Take me to reports"
];

export const AssistantChatView: React.FC<AssistantChatViewProps> = ({
  messages,
  onSendMessage,
  loading,
  onSelectPrompt
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;
    const msg = inputText.trim();
    setInputText('');
    await onSendMessage(msg);
  };

  return (
    <div className="flex flex-col h-[420px] text-[#34354A]">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 scrollbar-thin">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-end gap-2 max-w-[88%]">
                {!isUser && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7969B5] to-[#B85820] text-white flex items-center justify-center shrink-0 mb-1 shadow-xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed transition-all shadow-xs ${
                    isUser
                      ? 'bg-gradient-to-br from-[#7969B5] to-[#55428F] text-white rounded-br-xs'
                      : m.isSafetyAlert
                      ? 'bg-amber-50/90 border border-amber-200 text-amber-900 rounded-bl-xs'
                      : 'bg-white/90 border border-white/95 text-[#34354A] rounded-bl-xs'
                  }`}
                >
                  {/* Safety Warning Header if message is a safety alert */}
                  {m.isSafetyAlert && (
                    <div className="flex items-center gap-1.5 text-amber-700 font-bold mb-1.5 pb-1 border-b border-amber-200 font-heading">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Clinical Safety Guardrail</span>
                    </div>
                  )}

                  <p className="whitespace-pre-line">{m.text}</p>

                  {/* Action Link Button if provided */}
                  {m.action && (
                    <div className="mt-2.5 pt-2 border-t border-black/10">
                      <button
                        onClick={() => navigate(m.action!.path)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs shadow-xs transition-all ${
                          isUser
                            ? 'bg-white text-[#7969B5]'
                            : 'bg-[#7969B5] text-white hover:bg-[#55428F]'
                        }`}
                      >
                        <span>{m.action.label}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Replies under message */}
              {m.quickReplies && m.quickReplies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 ml-8">
                  {m.quickReplies.map((reply, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSelectPrompt(reply)}
                      disabled={loading}
                      className="text-[11px] font-semibold text-[#7969B5] bg-purple-50 hover:bg-purple-100 border border-purple-100 px-2.5 py-1 rounded-full transition-colors active:scale-95"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Loading / Typing Indicator */}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-[#7A7D9D] italic pl-8">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce delay-100" />
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce delay-200" />
            <span>Nestie is checking your health routine...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-purple-50">
        <Sparkles className="w-3.5 h-3.5 text-[#7969B5] shrink-0" />
        {DEFAULT_SUGGESTIONS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSelectPrompt(prompt)}
            disabled={loading}
            className="text-[11px] whitespace-nowrap bg-white/70 hover:bg-white border border-purple-100 text-[#55428F] px-2.5 py-1 rounded-full font-medium transition-colors shadow-2xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-1">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask Nestie about medicines, visits, water..."
          disabled={loading}
          className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-white/90 border border-purple-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7969B5] shadow-xs"
        />
        <button
          type="submit"
          disabled={loading || !inputText.trim()}
          className="p-2.5 bg-gradient-to-br from-[#7969B5] to-[#55428F] hover:from-[#6b5ca3] hover:to-[#453478] text-white rounded-2xl shadow-xs disabled:opacity-50 transition-all active:scale-95 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

