
import React from 'react';
import { Contact } from '../types';

interface ContactListProps {
  contacts: Contact[];
  selectedContact: Contact | null;
  onSelectContact: (contact: Contact) => void;
}

const ContactList: React.FC<ContactListProps> = ({
  contacts,
  selectedContact,
  onSelectContact
}) => {
  const getStatusColor = (status: Contact['status']) => {
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
            onClick={() => onSelectContact(contact)}
            className={`
              flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 mb-1
              ${selectedContact?.id === contact.id
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-700 text-gray-300'
              }
            `}
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-lg">
                {contact.avatar}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${getStatusColor(contact.status)}`}></div>
            </div>
            
            <div className="flex-1 ml-3 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium truncate">{contact.name}</h4>
                <span className="text-xs text-gray-400">{contact.lastMessageTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400 truncate">{contact.lastMessage || 'No messages'}</p>
                {contact.unreadCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {contact.unreadCount}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">ID: {contact.id}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ContactList;
