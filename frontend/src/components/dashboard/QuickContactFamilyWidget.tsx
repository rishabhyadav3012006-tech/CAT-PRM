import React from 'react';
import { Phone, MessageCircle, Heart, User, CheckCircle2, ShieldAlert } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';
import { CuteBadge } from '../ui/CuteBadge.tsx';

export const QuickContactFamilyWidget: React.FC = () => {
  const contacts = [
    {
      id: 'cnt-1',
      name: 'Sarah Vance',
      role: 'Daughter / Family Lead',
      phone: '+1 (555) 345-6789',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
      status: 'Available',
      badge: 'babyBlue' as const,
      isPrimary: true
    },
    {
      id: 'cnt-2',
      name: 'Marcus Chen',
      role: 'Primary Caregiver (Aide)',
      phone: '+1 (555) 456-7890',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=256&q=80',
      status: 'On Duty Today',
      badge: 'mint' as const,
      isPrimary: false
    },
    {
      id: 'cnt-3',
      name: 'Dr. Elizabeth Adams',
      role: 'Attending Cardiologist',
      phone: '+1 (555) 567-8901',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=256&q=80',
      status: 'St. Jude Center',
      badge: 'peach' as const,
      isPrimary: false
    }
  ];

  return (
    <GlassCard
      variant="white"
      padding="lg"
      rounded="3xl"
      className="space-y-4 border border-[#E5E4F2] shadow-glass-sm text-left"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#E9E3FF] text-[#7969B5] flex items-center justify-center">
            <Heart className="w-4 h-4 fill-[#7969B5]/20" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black font-heading text-[#34354A]">
              Quick Contact Family & Care
            </h3>
            <p className="text-xs text-[#7A7D9D] font-medium">One-tap direct calling for peace of mind</p>
          </div>
        </div>

        <CuteBadge variant="mint" size="sm" dot>
          <span>Support Ready</span>
        </CuteBadge>
      </div>

      {/* Contact Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
              contact.isPrimary
                ? 'bg-gradient-to-br from-[#FAF9FF] to-[#F1EEFC] border-[#D2C7FC] shadow-glass-sm'
                : 'bg-[#FAF9FF] border-[#E5E4F2] hover:bg-white'
            }`}
          >
            {/* Top row: Avatar + info */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-2xs"
                />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
              </div>

              <div className="space-y-0.5 truncate">
                <h4 className="text-xs sm:text-sm font-extrabold font-heading text-[#34354A] truncate">
                  {contact.name}
                </h4>
                <p className="text-[11px] text-[#7A7D9D] truncate font-medium">{contact.role}</p>
                <CuteBadge variant={contact.badge} size="sm" className="text-[9px] py-0">
                  {contact.status}
                </CuteBadge>
              </div>
            </div>

            {/* Calling action button */}
            <div className="pt-1 flex gap-2">
              <a
                href={`tel:${contact.phone.replace(/\D/g, '')}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#7969B5] text-white text-xs font-bold hover:bg-[#6755A4] transition-all shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call</span>
              </a>

              <a
                href={`sms:${contact.phone.replace(/\D/g, '')}`}
                className="inline-flex items-center justify-center p-2 rounded-xl bg-white border border-[#E5E4F2] text-[#575973] hover:text-[#7969B5] hover:bg-[#FAF9FF] transition-all shadow-xs"
                title="Send text message"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

