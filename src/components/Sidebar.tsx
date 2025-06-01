
import React, { useState } from 'react';
import { DatabaseContact } from '../hooks/useContacts';
import { DatabaseGroupChat } from '../hooks/useGroupChats';
import { User } from '../types';
import ContactList from './ContactList';
import UserProfile from './UserProfile';
import AddContactModal from './AddContactModal';
import CreateGroupModal from './CreateGroupModal';
import { Button } from '@/components/ui/button';
import { Plus, Search, LogOut, Settings, Menu, X, Users } from 'lucide-react';
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
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg md:text-xl font-bold text-blue-400 truncate">Blueteck Message</h1>
          
          {/* Mobile menu close button */}
          <Button
            onClick={() => setIsMobileMenuOpen(false)}
            size="sm"
            variant="ghost"
            className="md:hidden text-gray-300 hover:text-white p-1"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            onClick={() => setShowAddModal(true)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white flex-1 md:flex-none"
          >
            <Plus className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Add Contact</span>
          </Button>
          <Button
            onClick={() => setShowCreateGroupModal(true)}
            size="sm"
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700 flex-1 md:flex-none"
          >
            <Users className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">New Group</span>
          </Button>
          <Button
            onClick={() => navigate('/settings')}
            size="sm"
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700 flex-1 md:flex-none"
          >
            <Settings className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
          <Button
            onClick={onSignOut}
            size="sm"
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700 flex-1 md:flex-none"
          >
            <LogOut className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search contacts and groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* User Profile */}
      <UserProfile user={currentUser} />

      {/* Group Chats Section */}
      <div className="border-b border-gray-700">
        <div className="px-4 py-2">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Group Chats</h3>
        </div>
        <div className="max-h-40 overflow-y-auto">
          {filteredGroupChats.map((group) => (
            <div
              key={group.id}
              onClick={() => handleGroupSelect(group.id)}
              className={`flex items-center px-4 py-3 hover:bg-gray-700 cursor-pointer transition-colors ${
                selectedGroupChatId === group.id ? 'bg-gray-700 border-r-2 border-blue-500' : ''
              }`}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                👥
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white truncate">{group.name}</p>
                  {group.is_general && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">General</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 truncate">
                  {group.description || 'Group chat'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Direct Messages</h3>
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
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        onClick={() => setIsMobileMenuOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 bg-gray-800 hover:bg-gray-700 text-white p-2"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-80 bg-gray-800 border-r border-gray-700 flex-col">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Background overlay */}
          <div
            className="flex-1 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="w-80 max-w-[85vw] bg-gray-800 border-r border-gray-700 flex flex-col">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
