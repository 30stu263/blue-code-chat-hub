
import React, { useState } from 'react';
import { DatabaseContact } from '../hooks/useContacts';
import { DatabaseGroupChat } from '../hooks/useGroupChats';
import { User } from '../types';
import ContactList from './ContactList';
import UserProfile from './UserProfile';
import AddContactModal from './AddContactModal';
import CreateGroupModal from './CreateGroupModal';
import UserListModal from './UserListModal';
import { Button } from '@/components/ui/button';
import { Plus, Search, LogOut, Settings, Menu, X, Users, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  contacts: DatabaseContact[];
  groupChats: DatabaseGroupChat[];
  selectedContactId: string | null;
  selectedGroupChatId: string | null;
  onSelectContact: (contactId: string) => void;
  onSelectGroupChat: (groupChatId: string) => void;
  currentUser: User;
  onAddContact: (username: string) => Promise<boolean>;
  onCreateGroup: (name: string, description?: string) => Promise<boolean>;
  onSignOut: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  contacts,
  groupChats,
  selectedContactId,
  selectedGroupChatId,
  onSelectContact,
  onSelectGroupChat,
  currentUser,
  onAddContact,
  onCreateGroup,
  onSignOut
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showUserListModal, setShowUserListModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const filteredContacts = contacts.filter(contact =>
    contact.profiles.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.profiles.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroupChats = groupChats.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleContactSelect = (contactId: string) => {
    onSelectContact(contactId);
    setIsMobileMenuOpen(false);
  };

  const handleGroupSelect = (groupChatId: string) => {
    onSelectGroupChat(groupChatId);
    setIsMobileMenuOpen(false);
  };

  const sidebarContent = (
    <>
      {/* Enhanced Header */}
      <div className="p-4 bg-gradient-to-r from-slate-800/80 to-blue-800/50 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              BlueTeck
            </h1>
          </div>
          
          {/* Mobile menu close button */}
          <Button
            onClick={() => setIsMobileMenuOpen(false)}
            size="sm"
            variant="ghost"
            className="md:hidden text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-lg"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button
            onClick={() => setShowAddModal(true)}
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg"
          >
            <Plus className="h-4 w-4 mr-1" />
            <span className="text-xs">Add Contact</span>
          </Button>
          <Button
            onClick={() => setShowCreateGroupModal(true)}
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0 shadow-lg"
          >
            <Users className="h-4 w-4 mr-1" />
            <span className="text-xs">New Group</span>
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <Button
            onClick={() => navigate('/settings')}
            size="sm"
            variant="ghost"
            className="text-white/80 hover:text-white hover:bg-white/10 border border-white/20"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setShowUserListModal(true)}
            size="sm"
            variant="ghost"
            className="text-white/80 hover:text-white hover:bg-white/10 border border-white/20"
          >
            <Users className="h-4 w-4" />
          </Button>
          <Button
            onClick={onSignOut}
            size="sm"
            variant="ghost"
            className="text-white/80 hover:text-white hover:bg-white/10 border border-white/20"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Enhanced Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/10 text-white placeholder-white/50 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/20 text-sm backdrop-blur-sm border border-white/20 transition-all"
          />
        </div>
      </div>

      {/* User Profile */}
      <div className="border-b border-white/10">
        <UserProfile user={currentUser} />
      </div>

      {/* Group Chats Section */}
      <div className="border-b border-white/10">
        <div className="px-4 py-3 bg-gradient-to-r from-slate-800/40 to-transparent">
          <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Group Chats
          </h3>
        </div>
        <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {filteredGroupChats.map((group) => (
            <div
              key={group.id}
              onClick={() => handleGroupSelect(group.id)}
              className={`group flex items-center px-4 py-3 hover:bg-gradient-to-r hover:from-white/10 hover:to-transparent cursor-pointer transition-all duration-200 ${
                selectedGroupChatId === group.id 
                  ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/20 border-r-2 border-blue-400' 
                  : ''
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-semibold mr-3 shadow-lg group-hover:scale-105 transition-transform">
                  <Users className="h-6 w-6" />
                </div>
                {group.is_general && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Sparkles className="h-2 w-2 text-yellow-800" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white truncate">{group.name}</p>
                  {group.is_general && (
                    <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 px-2 py-1 rounded-full font-medium">
                      General
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/60 truncate">
                  {group.description || 'Group conversation'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        <div className="px-4 py-3 bg-gradient-to-r from-slate-800/40 to-transparent">
          <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Direct Messages</h3>
        </div>
        <ContactList
          contacts={filteredContacts}
          selectedContactId={selectedContactId}
          onSelectContact={handleContactSelect}
        />
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddContactModal
          onClose={() => setShowAddModal(false)}
          onAddContact={onAddContact}
        />
      )}

      {showCreateGroupModal && (
        <CreateGroupModal
          onClose={() => setShowCreateGroupModal(false)}
          onCreateGroup={onCreateGroup}
        />
      )}

      {showUserListModal && (
        <UserListModal
          onClose={() => setShowUserListModal(false)}
        />
      )}
    </>
  );

  return (
    <>
      {/* Enhanced Mobile Menu Button */}
      <Button
        onClick={() => setIsMobileMenuOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-3 rounded-xl shadow-lg backdrop-blur-sm"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-80 bg-slate-900/50 backdrop-blur-xl border-r border-white/10 flex-col shadow-2xl">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex animate-fade-in">
          {/* Background overlay */}
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="w-80 max-w-[85vw] bg-slate-900/95 backdrop-blur-xl border-r border-white/20 flex flex-col shadow-2xl animate-slide-in-right">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
