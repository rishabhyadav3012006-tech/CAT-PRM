import React, { useState, useEffect } from 'react';
import { assistantApi } from '../../api/client.ts';
import {
  AssistantDailySummary,
  AssistantChatMessage,
  AssistantWellnessDTO
} from '../../types/index.ts';
import { AssistantChatView } from './AssistantChatView.tsx';
import { AssistantDailySummaryCard } from './AssistantDailySummaryCard.tsx';
import { AssistantWellnessTracker } from './AssistantWellnessTracker.tsx';
import { AssistantChecklist } from './AssistantChecklist.tsx';
import {
  Bot,
  Sparkles,
  X,
  Minimize2,
  Maximize2,
  Droplets,
  Calendar,
  CheckCircle2,
  MessageSquare,
  ShieldAlert,
  Heart,
  Volume2,
  VolumeX
} from 'lucide-react';

export const SmartCareAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'routine' | 'wellness' | 'checklist'>('chat');
  const [summary, setSummary] = useState<AssistantDailySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<AssistantChatMessage[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Fetch initial summary & establish conversation
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res: any = await assistantApi.getSummary();
        if (res.success && res.data) {
          setSummary(res.data);

          // Populate initial welcoming assistant message if messages are empty
          if (messages.length === 0) {
            setMessages([
              {
                id: 'init-1',
                sender: 'assistant',
                text: `${res.data.greeting} I am Nestie, your CareNest Smart Care Assistant.\n\n${res.data.routineSummary}\n\nFeel free to ask about your medication times, upcoming visits, or log your water intake!`,
                timestamp: new Date().toISOString(),
                quickReplies: [
                  "Today's Routine",
                  "Next Medication",
                  "Upcoming Appointments",
                  "I drank a glass of water",
                  "Find Prescriptions"
                ]
              }
            ]);
          }
        }
      } catch (err) {
        // Fallback gracefully without breaking UI
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const handleSendMessage = async (text: string) => {
    const userMsg: AssistantChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMsg]);
    setActiveTab('chat');

    try {
      setLoading(true);
      const res: any = await assistantApi.chat(text);
      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data]);

        // If water or mood was updated by chat, refresh summary
        if (
          text.toLowerCase().includes('water') ||
          text.toLowerCase().includes('mood') ||
          text.toLowerCase().includes('drink')
        ) {
          const sumRes: any = await assistantApi.getSummary();
          if (sumRes.success && sumRes.data) {
            setSummary(sumRes.data);
          }
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'I apologize, but I had trouble retrieving that information. Please check your connection or try again.',
          timestamp: new Date().toISOString(),
          quickReplies: ["Today's Routine", 'Next Medication']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogWellness = async (dto: AssistantWellnessDTO) => {
    try {
      setLoading(true);
      const res: any = await assistantApi.logWellness(dto);
      if (res.success && res.data?.updatedSummary) {
        setSummary(res.data.updatedSummary);
      }
    } catch (err) {
      // Handled in subcomponent
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChecklist = async (itemId: string, completed: boolean) => {
    try {
      await handleLogWellness({
        action: 'TOGGLE_CHECKLIST',
        checklistItemId: itemId,
        completed
      });
    } catch {
      // Silently handle
    }
  };

  const pendingDoses = summary?.medicationSummary.pendingCount ?? 0;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end">
      {/* 1. EXPANDED ASSISTANT PANEL */}
      {isOpen && (
        <div
          className={`w-[360px] sm:w-[420px] bg-white/95 backdrop-blur-xl border border-white/90 shadow-2xl rounded-3xl overflow-hidden flex flex-col mb-3 transition-all duration-300 ${
            isMinimized ? 'h-14' : 'h-[600px] max-h-[85vh]'
          }`}
        >
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-[#FAF9FF] via-[#E9E3FF]/80 to-[#FCE4ED]/80 px-4 py-3 border-b border-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#7969B5] to-[#B85820] text-white flex items-center justify-center shadow-xs">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold font-heading text-[#34354A]">
                    Nestie
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-[#7969B5]/15 text-[#7969B5]">
                    Care Assistant
                  </span>
                </div>
                <p className="text-[11px] text-[#7A7D9D]">
                  Daily Routine & Wellness Companion
                </p>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1 text-[#7A7D9D]">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 hover:bg-white/80 rounded-xl transition-colors"
                title={soundEnabled ? 'Mute Assistant Audio' : 'Enable Audio'}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-[#7969B5]" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-400" />
                )}
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-white/80 rounded-xl transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <Minimize2 className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/80 rounded-xl transition-colors text-rose-500"
                title="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Tab Navigation Pill Strip */}
              <div className="px-3 pt-2 pb-1.5 bg-[#FAF9FF]/60 border-b border-purple-50 flex items-center justify-between gap-1 text-[11px] font-bold font-heading">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'chat'
                      ? 'bg-white text-[#7969B5] shadow-xs'
                      : 'text-[#7A7D9D] hover:text-[#34354A]'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat</span>
                </button>
                <button
                  onClick={() => setActiveTab('routine')}
                  className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'routine'
                      ? 'bg-white text-[#7969B5] shadow-xs'
                      : 'text-[#7A7D9D] hover:text-[#34354A]'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Routine</span>
                </button>
                <button
                  onClick={() => setActiveTab('wellness')}
                  className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'wellness'
                      ? 'bg-white text-[#7969B5] shadow-xs'
                      : 'text-[#7A7D9D] hover:text-[#34354A]'
                  }`}
                >
                  <Droplets className="w-3.5 h-3.5 text-[#2B6EB5]" />
                  <span>Wellness</span>
                </button>
                <button
                  onClick={() => setActiveTab('checklist')}
                  className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'checklist'
                      ? 'bg-white text-[#7969B5] shadow-xs'
                      : 'text-[#7A7D9D] hover:text-[#34354A]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Checklist</span>
                </button>
              </div>

              {/* Safety Interceptor Sub-Banner */}
              <div className="px-3.5 py-1.5 bg-[#FAF9FF] border-b border-purple-50 text-[10px] text-[#7A7D9D] flex items-center gap-1.5 justify-center text-center">
                <Heart className="w-3 h-3 text-rose-400 shrink-0" />
                <span>
                  Non-diagnostic companion • Direct medical questions to your physician
                </span>
              </div>

              {/* Tab Contents */}
              <div className="flex-1 overflow-y-auto p-3.5 scrollbar-thin">
                {activeTab === 'chat' && (
                  <AssistantChatView
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    loading={loading}
                    onSelectPrompt={handleSendMessage}
                  />
                )}

                {activeTab === 'routine' && (
                  <AssistantDailySummaryCard
                    summary={summary}
                    loading={loading}
                    onSelectAction={handleSendMessage}
                  />
                )}

                {activeTab === 'wellness' && (
                  <AssistantWellnessTracker
                    summary={summary}
                    onLogWellness={handleLogWellness}
                    loading={loading}
                  />
                )}

                {activeTab === 'checklist' && (
                  <AssistantChecklist
                    items={summary?.wellnessChecklist ?? []}
                    onToggleItem={handleToggleChecklist}
                    loading={loading}
                  />
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* 2. FLOATING LAUNCHER BUTTON */}
      <button
        onClick={() => {
          if (isOpen && isMinimized) {
            setIsMinimized(false);
          } else {
            setIsOpen(!isOpen);
            setIsMinimized(false);
          }
        }}
        className="group relative flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#7969B5] via-[#65559C] to-[#B85820] text-white rounded-full shadow-glass-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-white/30"
        title="Open CareNest Smart Assistant"
      >
        <div className="relative">
          <Bot className="w-5 h-5 transition-transform group-hover:rotate-12" />
          <Sparkles className="w-3 h-3 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
        </div>

        <span className="font-heading font-bold text-xs tracking-wide">
          Nestie Assistant
        </span>

        {/* Pending dose pill indicator if any */}
        {pendingDoses > 0 && (
          <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-400 text-[#34354A] rounded-full shadow-xs">
            {pendingDoses} med{pendingDoses > 1 ? 's' : ''}
          </span>
        )}
      </button>
    </div>
  );
};

