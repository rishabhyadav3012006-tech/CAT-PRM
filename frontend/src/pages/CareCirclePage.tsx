import React, { useEffect, useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  KeyRound,
  HeartHandshake,
  Clock,
  Activity,
  History,
  Search,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { circleApi } from '../api/client.ts';
import { CareCircleMember, CareCircleInvite, CareCircleActivity } from '../types/index.ts';
import { LoadingSpinner } from '../components/common/LoadingSpinner.tsx';
import { GlassCard } from '../components/ui/GlassCard.tsx';
import { Button } from '../components/ui/Button.tsx';
import { CuteBadge } from '../components/ui/CuteBadge.tsx';

// Components
import { MemberCard } from '../components/circle/MemberCard.tsx';
import { InviteModal } from '../components/circle/InviteModal.tsx';
import { PermissionSettingsModal } from '../components/circle/PermissionSettingsModal.tsx';
import { ChangeRoleModal } from '../components/circle/ChangeRoleModal.tsx';
import { PendingRequestsCard } from '../components/circle/PendingRequestsCard.tsx';
import { ActiveInvitesSection } from '../components/circle/ActiveInvitesSection.tsx';
import { ActivityTimeline } from '../components/circle/ActivityTimeline.tsx';

type CircleTab = 'MEMBERS' | 'PENDING' | 'INVITES' | 'ACTIVITY';

export const CareCirclePage: React.FC = () => {
  const [members, setMembers] = useState<CareCircleMember[]>([]);
  const [invites, setInvites] = useState<CareCircleInvite[]>([]);
  const [activities, setActivities] = useState<CareCircleActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<CircleTab>('MEMBERS');
  const [memberFilter, setMemberFilter] = useState<'ALL' | 'FAMILY' | 'CARETAKER'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [permissionMember, setPermissionMember] = useState<CareCircleMember | null>(null);
  const [roleMember, setRoleMember] = useState<CareCircleMember | null>(null);

  const fetchData = async () => {
    try {
      const [membersRes, invitesRes, activitiesRes]: any = await Promise.all([
        circleApi.getMembers('eld-01'),
        circleApi.getInvites('eld-01'),
        circleApi.getActivities('eld-01')
      ]);

      if (membersRes.success && membersRes.data) {
        setMembers(membersRes.data);
      }
      if (invitesRes.success && invitesRes.data) {
        setInvites(invitesRes.data);
      }
      if (activitiesRes.success && activitiesRes.data) {
        setActivities(activitiesRes.data);
      }
    } catch (err) {
      console.error('Failed to load care circle data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers
  const handleApprove = async (memberId: string) => {
    try {
      await circleApi.approveMember(memberId);
      fetchData();
    } catch (err) {
      alert('Failed to approve member');
    }
  };

  const handleReject = async (memberId: string) => {
    try {
      await circleApi.rejectMember(memberId);
      fetchData();
    } catch (err) {
      alert('Failed to decline member');
    }
  };

  const handleRevokeAccess = async (member: CareCircleMember) => {
    if (
      !window.confirm(
        `Are you sure you want to revoke ${member.userName}'s access to Eleanor's Care Circle?`
      )
    ) {
      return;
    }
    try {
      await circleApi.revokeMember(member.id);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to revoke member access');
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    try {
      await circleApi.revokeInvite(inviteId);
      fetchData();
    } catch (err) {
      alert('Failed to revoke invitation code');
    }
  };

  // Metrics
  const activeMembers = members.filter((m) => m.status === 'ACTIVE');
  const pendingMembers = members.filter((m) => m.status === 'PENDING_APPROVAL');
  const familyAdminsCount = activeMembers.filter((m) => m.circleRole === 'FAMILY_ADMIN').length;
  const caretakersCount = activeMembers.filter((m) => m.circleRole === 'CARETAKER').length;

  // Filtered members
  const filteredMembers = activeMembers.filter((m) => {
    if (memberFilter === 'FAMILY') {
      if (m.circleRole !== 'FAMILY_ADMIN' && m.circleRole !== 'FAMILY_VIEWER') return false;
    }
    if (memberFilter === 'CARETAKER') {
      if (m.circleRole !== 'CARETAKER') return false;
    }

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.userName.toLowerCase().includes(q) ||
      m.relationship.toLowerCase().includes(q) ||
      m.userEmail.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return <LoadingSpinner message="Retrieving Family Care Circle members & permission hierarchy..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CuteBadge variant="lavender" size="sm" icon={<Users className="w-3.5 h-3.5" />}>
              Collaborative Care Ecosystem
            </CuteBadge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#34354A] tracking-tight">
            Family Care Circle
          </h1>
          <p className="text-sm font-medium font-body text-[#575973]">
            Manage authorized family members, caretakers, expiring invitation codes, and granular healthcare permissions
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsInviteOpen(true)}
          leftIcon={<UserPlus className="w-4 h-4" />}
          className="rounded-2xl shadow-glow-purple self-start sm:self-auto"
        >
          <span>Invite Member or Caretaker</span>
        </Button>
      </div>

      {/* Circle Telemetry Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard variant="lavender" padding="md" rounded="2xl" className="border-2 border-[#D1C6F8]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black font-heading uppercase tracking-wider text-[#55428F]">
              Connected Members
            </span>
            <Users className="w-4 h-4 text-[#7969B5]" />
          </div>
          <p className="font-black font-heading text-2xl text-[#34354A]">
            {activeMembers.length}
          </p>
          <p className="text-xs font-medium text-[#575973] mt-1">
            Active in Eleanor's Care Circle
          </p>
        </GlassCard>

        <GlassCard variant="babyBlue" padding="md" rounded="2xl" className="border-2 border-[#BDDCFF]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black font-heading uppercase tracking-wider text-[#1B5494]">
              Family Administrators
            </span>
            <Shield className="w-4 h-4 text-[#1B5494]" />
          </div>
          <p className="font-black font-heading text-2xl text-[#34354A]">
            {familyAdminsCount}
          </p>
          <p className="text-xs font-medium text-[#575973] mt-1">
            Authorized to manage care & invite
          </p>
        </GlassCard>

        <GlassCard variant="mint" padding="md" rounded="2xl" className="border-2 border-[#B7E7CE]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black font-heading uppercase tracking-wider text-[#1D6A48]">
              Active Caretakers
            </span>
            <HeartHandshake className="w-4 h-4 text-[#1D6A48]" />
          </div>
          <p className="font-black font-heading text-2xl text-[#34354A]">
            {caretakersCount}
          </p>
          <p className="text-xs font-medium text-[#575973] mt-1">
            Logging daily tasks & medication
          </p>
        </GlassCard>

        <GlassCard variant="peach" padding="md" rounded="2xl" className="border-2 border-[#FBD2BA]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black font-heading uppercase tracking-wider text-[#B85820]">
              Pending Approvals
            </span>
            <Clock className="w-4 h-4 text-[#B85820]" />
          </div>
          <p className="font-black font-heading text-2xl text-[#34354A]">
            {pendingMembers.length}
          </p>
          <p className="text-xs font-medium text-[#575973] mt-1">
            Awaiting family administrator review
          </p>
        </GlassCard>
      </div>

      {/* Pending Membership Requests Alert Banner */}
      {pendingMembers.length > 0 && (
        <PendingRequestsCard
          requests={pendingMembers}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#ECEAF5] pb-2">
        <button
          onClick={() => setActiveTab('MEMBERS')}
          className={`px-4 py-2 text-xs sm:text-sm font-extrabold font-heading rounded-2xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'MEMBERS'
              ? 'bg-[#E9E3FF] text-[#55428F] shadow-glass-sm'
              : 'text-[#7A7D9D] hover:bg-white hover:text-[#34354A]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Connected Members ({activeMembers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('INVITES')}
          className={`px-4 py-2 text-xs sm:text-sm font-extrabold font-heading rounded-2xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'INVITES'
              ? 'bg-[#DFEEFF] text-[#1B5494] shadow-glass-sm'
              : 'text-[#7A7D9D] hover:bg-white hover:text-[#34354A]'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Invitation Codes ({invites.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ACTIVITY')}
          className={`px-4 py-2 text-xs sm:text-sm font-extrabold font-heading rounded-2xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'ACTIVITY'
              ? 'bg-[#DDF5E9] text-[#1D6A48] shadow-glass-sm'
              : 'text-[#7A7D9D] hover:bg-white hover:text-[#34354A]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Activity Timeline ({activities.length})</span>
        </button>
      </div>

      {/* TAB 1: CONNECTED MEMBERS */}
      {activeTab === 'MEMBERS' && (
        <div className="space-y-4">
          {/* Search & Filter Header */}
          <GlassCard
            variant="white"
            padding="md"
            rounded="2xl"
            className="flex flex-col sm:flex-row items-center justify-between gap-3 border"
          >
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#7A7D9D] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search member by name, relationship, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#ECEAF5] bg-[#FAF9FF] font-medium text-[#34354A] focus:outline-none focus:border-[#7969B5]"
              />
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Filter className="w-4 h-4 text-[#7A7D9D]" />
              {(['ALL', 'FAMILY', 'CARETAKER'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setMemberFilter(filter)}
                  className={`px-3 py-1.5 text-xs font-black font-heading rounded-xl transition-all cursor-pointer ${
                    memberFilter === filter
                      ? 'bg-[#E9E3FF] text-[#55428F] shadow-2xs'
                      : 'text-[#7A7D9D] hover:bg-[#FAF9FF]'
                  }`}
                >
                  {filter === 'ALL'
                    ? 'All Members'
                    : filter === 'FAMILY'
                    ? 'Family Only'
                    : 'Caretakers Only'}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onOpenPermissions={(m) => setPermissionMember(m)}
                onOpenChangeRole={(m) => setRoleMember(m)}
                onRevokeAccess={handleRevokeAccess}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE INVITATION CODES */}
      {activeTab === 'INVITES' && (
        <ActiveInvitesSection
          invites={invites}
          onRevoke={handleRevokeInvite}
          onOpenInviteModal={() => setIsInviteOpen(true)}
        />
      )}

      {/* TAB 3: ACTIVITY TIMELINE */}
      {activeTab === 'ACTIVITY' && (
        <ActivityTimeline activities={activities} />
      )}

      {/* 1. Invite Modal */}
      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSuccess={fetchData}
      />

      {/* 2. Configure Granular Permissions Modal */}
      <PermissionSettingsModal
        isOpen={!!permissionMember}
        onClose={() => setPermissionMember(null)}
        member={permissionMember}
        onSuccess={fetchData}
      />

      {/* 3. Assign / Change Role Modal */}
      <ChangeRoleModal
        isOpen={!!roleMember}
        onClose={() => setRoleMember(null)}
        member={roleMember}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default CareCirclePage;

