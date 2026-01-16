'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Users, Mail, Phone, Linkedin, Shield } from 'lucide-react';
import Link from 'next/link';

interface BoardMember {
  id: string;
  name: string;
  title: string;
  role: string;
  bio: string;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  imageUrl: string | null;
  isActive: boolean;
}

export default function BoardMembersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchMembers();
    }
  }, [session]);

  async function fetchMembers() {
    try {
      const response = await fetch('/api/team?role=board');
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error('Failed to fetch board members:', error);
    } finally {
      setLoading(false);
    }
  }

  const getRoleDisplay = (role: string): string => {
    const roleMap: Record<string, string> = {
      BOARD_MEMBER: 'Board Member',
      BOARD_PRESIDENT: 'Board President',
      BOARD_VP: 'Board Vice President', 
      BOARD_TREASURER: 'Board Treasurer',
      BOARD_SECRETARY: 'Board Secretary',
    };
    return roleMap[role] || role;
  };

  const getRoleColor = (role: string): string => {
    // All board-related roles get purple badge
    if (role.startsWith('BOARD_')) {
      return 'bg-purple-100 text-purple-700';
    }
    return 'bg-gray-100 text-gray-700';
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const activeMembers = members.filter((m) => m.isActive);
  const inactiveMembers = members.filter((m) => !m.isActive);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/admin/board" className="text-gray-500 hover:text-gray-700">
              ← Back to Board Portal
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Board Members</h1>
              <p className="text-gray-600">Current board member roster and contact information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Active Members */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Board Members</h2>
          {activeMembers.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No active board members</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeMembers.map((member) => (
                <div key={member.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
                  {member.imageUrl && (
                    <img
                      src={member.imageUrl}
                      alt={member.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                    />
                  )}
                  
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-gray-600 mb-2">{member.title}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(member.role)}`}>
                      {getRoleDisplay(member.role)}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{member.bio}</p>

                  <div className="space-y-2">
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
                      >
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{member.email}</span>
                      </a>
                    )}
                    {member.phone && (
                      <a
                        href={`tel:${member.phone}`}
                        className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
                      >
                        <Phone className="w-4 h-4" />
                        <span>{member.phone}</span>
                      </a>
                    )}
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
                      >
                        <Linkedin className="w-4 h-4" />
                        <span>LinkedIn Profile</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inactive Members */}
        {inactiveMembers.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Past Board Members</h2>
            <div className="space-y-4">
              {inactiveMembers.map((member) => (
                <div key={member.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-600">{getRoleDisplay(member.role)}</p>
                    </div>
                    <span className="text-xs text-gray-500">Inactive</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Board Member Management</h3>
              <p className="text-blue-800 text-sm">
                To add, edit, or remove board members, please visit the{' '}
                <Link href="/admin/team" className="font-semibold underline">
                  Team Management
                </Link>{' '}
                section in the admin dashboard. Board member information displayed here is
                synchronized with the public team page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
