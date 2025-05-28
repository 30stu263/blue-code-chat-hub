
import React, { useState } from 'react';
import { DatabaseContact } from '../hooks/useContacts';
import { User } from '../types';
import ContactList from './ContactList';
import UserProfile from './UserProfile';
import AddContactModal from './AddContactModal';
import { Button } from '@/components/ui/button';
import { Plus, Search, LogOut } from 'lucide-react';

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

  const filteredContacts = contacts.filter(contact =>
    contact.profiles.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.profiles.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-blue-400">Blueteck Message</h1>
          <div className="flex space-x-2">
            <Button
              onClick={() => setShowAddModal(true)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              onClick={onSignOut}
              size="sm"
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          onSelectContact={onSelectContact}
        />
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <AddContactModal
          onClose={() => setShowAddModal(false)}
          onAddContact={onAddContact}
        />
      )}
    </div>
  );
};

export default Sidebar;
