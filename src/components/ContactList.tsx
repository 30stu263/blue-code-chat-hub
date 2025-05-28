
import React from 'react';
import { DatabaseContact } from '../hooks/useContacts';

interface ContactListProps {
  contacts: DatabaseContact[];
  selectedContactId: string | null;
  onSelectContact: (contactId: string) => void;
}

const ContactList: React.FC<ContactListProps> = ({
  contacts,
  selectedContactId,
  onSelectContact
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-2">
      <h3 className="text-sm font-semibold text-gray-400 mb-2 px-2">CONTACTS</h3>
      {contacts.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p>No contacts found</p>
          <p className="text-sm mt-1">Add some friends to start chatting!</p>
        </div>
      ) : (
        contacts.map((contact) => (
          <div
            key={contact.id}
            onClick={() => onSelectContact(contact.contact_user_id)}
            className={`
              flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 mb-1
              ${selectedContactId === contact.contact_user_id
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-700 text-gray-300'
              }
            `}
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-lg">
                {contact.profiles.avatar_emoji}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${getStatusColor(contact.profiles.status)}`}></div>
            </div>
            
            <div className="flex-1 ml-3 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium truncate">{contact.profiles.display_name}</h4>
              </div>
              <p className="text-xs text-gray-500">@{contact.profiles.username}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ContactList;
