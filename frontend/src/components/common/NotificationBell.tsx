import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Clock, Pill, Calendar, Heart, ShieldAlert, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CuteBadge } from '../ui/CuteBadge.tsx';

interface NotificationItem {
  id: string;
  type: 'medication' | 'appointment' | 'vital' | 'family' | 'alert';
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
}

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      type: 'medication',
      title: 'Morning Medication Taken',
      message: 'Eleanor confirmed Lisinopril (10mg) intake at 08:15 AM.',
      time: '25m ago',
      read: false,
      link: '/medications'
    },
    {
      id: 'notif-2',
      type: 'vital',
      title: 'Optimal Blood Pressure Recorded',
      message: 'Marcus Chen logged morning vitals: 124/78 mmHg, Heart Rate: 72 bpm.',
      time: '1h ago',
      read: false,
      link: '/records'
    },
    {
      id: 'notif-3',
      type: 'appointment',
      title: 'Doctor Visit Tomorrow',
      message: 'Cardiology Follow-up with Dr. Elizabeth Adams at 10:30 AM.',
      time: '3h ago',
      read: false,
      link: '/appointments'
    },
    {
      id: 'notif-4',
      type: 'family',
      title: 'Sarah Vance Added Care Note',
      message: '"Mom had a restful night and good appetite for oatmeal breakfast."',
      time: '5h ago',
      read: true,
      link: '/activities'
    }
  ]);

  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markItemAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'medication':
        return <Pill className="w-4 h-4 text-emerald-600" />;
      case 'appointment':
        return <Calendar className="w-4 h-4 text-sky-600" />;
      case 'vital':
        return <Heart className="w-4 h-4 text-[#7969B5]" />;
      case 'alert':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-600" />;
    }
  };

  const getBgColor = (type: NotificationItem['type']) => {
    switch (type) {
      case 'medication':
        return 'bg-[#DDF5E9]';
      case 'appointment':
        return 'bg-[#DFEEFF]';
      case 'vital':
        return 'bg-[#E9E3FF]';
      case 'alert':
        return 'bg-[#FCE4ED]';
      default:
        return 'bg-[#FFE9DC]';
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2.5 rounded-2xl bg-white/70 hover:bg-white text-[#575973] hover:text-[#7969B5] border border-white/90 shadow-glass-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#E9E3FF]"
        title="Notifications & Care Alerts"
        aria-label="Care notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-gradient-to-r from-rose-500 to-red-500 text-white text-[11px] font-black flex items-center justify-center shadow-xs animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white/95 backdrop-blur-xl rounded-3xl shadow-glass-lg border border-white/90 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#FAF9FF]">
            <div className="flex items-center gap-2">
              <span className="font-extrabold font-heading text-sm text-[#34354A]">
                Care Notifications
              </span>
              {unreadCount > 0 && (
                <CuteBadge variant="lavender" size="sm">
                  {unreadCount} new
                </CuteBadge>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] font-bold text-[#7969B5] hover:text-[#6755A4] flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3 h-3" />
                <span>Mark read</span>
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="py-2 space-y-2 max-h-80 overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#7A7D9D]">
                No notifications right now. Everything is peaceful! 🌿
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markItemAsRead(item.id)}
                  className={`p-3 rounded-2xl transition-all cursor-pointer border ${
                    item.read
                      ? 'bg-white/60 border-transparent hover:bg-white'
                      : 'bg-[#FAF9FF] border-[#E5E4F2] shadow-2xs'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${getBgColor(
                        item.type
                      )}`}
                    >
                      {getIcon(item.type)}
                    </div>

                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold font-heading text-[#34354A] leading-tight">
                          {item.title}
                        </p>
                        <span className="text-[10px] text-[#7A7D9D] whitespace-nowrap pl-1">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium font-body text-[#575973] leading-relaxed">
                        {item.message}
                      </p>

                      {item.link && (
                        <div className="pt-1">
                          <Link
                            to={item.link}
                            onClick={() => setIsOpen(false)}
                            className="text-[10px] font-bold text-[#7969B5] hover:underline inline-flex items-center gap-0.5"
                          >
                            <span>View details →</span>
                          </Link>
                        </div>
                      )}
                    </div>

                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-[#7969B5] mt-1 shrink-0" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-[#FAF9FF] text-center">
            <span className="text-[10px] text-[#7A7D9D] font-medium">
              🔔 Real-time alerts for Eleanor's Care Circle
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

