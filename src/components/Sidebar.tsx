
import React, { useState } from 'react';
import { DatabaseContact } from '../hooks/useContacts';
import { User } from '../types';
import ContactList from './ContactList';
import UserProfile from './UserProfile';
import AddContactModal from './AddContactModal';
import { Button } from '@/components/ui/button';
import { Plus, Search, LogOut, Settings, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  contacts: DatabaseContact[];
  selectedContactId: string | null;
  onSelectContact: (contactId: string) => void;
  currentUser: User;
  onAddContact: (username: string) => Promise<boolean>;
  onSignOut: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  contacts,
  selectedContactId,
  onSelectContact,
  currentUser,
  onAddContact,
  onSignOut
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const filteredContacts = contacts.filter(contact =>
    contact.profiles.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.profiles.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleContactSelect = (contactId: string) => {
    onSelectContact(contactId);
    setIsMobileMenuOpen(false); // Close mobile menu when contact is selected
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
            <span className="hidden sm:inline">Add</span>
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
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* User Profile */}
      <UserProfile user={currentUser} />

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto">
        <ContactList
          contacts={filteredContacts}
          selectedContactId={selectedContactId}
          onSelectContact={handleContactSelect}
        />
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <AddContactModal
          onClose={() => setShowAddModal(false)}
          onAddContact={onAddContact}
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
