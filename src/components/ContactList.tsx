
import React from 'react';
import { DatabaseContact } from '../hooks/useContacts';
import { MessageCircle } from 'lucide-react';

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
      case 'online': return 'bg-emerald-400 shadow-emerald-400/50';
      case 'away': return 'bg-yellow-400 shadow-yellow-400/50';
      case 'offline': return 'bg-gray-400 shadow-gray-400/50';
      default: return 'bg-gray-400 shadow-gray-400/50';
    }
  };

  return (
    <div className="p-2">
      {contacts.length === 0 ? (
        <div className="text-center text-white/60 py-12 px-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/10">
            <MessageCircle className="h-8 w-8 text-white/40" />
          </div>
          <p className="font-medium mb-1">No contacts yet</p>
          <p className="text-sm text-white/40">Add friends to start chatting!</p>
        </div>
      ) : (
        contacts.map((contact) => (
          <div
            key={contact.id}
            onClick={() => onSelectContact(contact.contact_user_id)}
            className={`
              group flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 mb-2 hover:scale-[1.02]
              ${selectedContactId === contact.contact_user_id
                ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/20 border border-blue-400/30 shadow-lg'
                : 'hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/10'
              }
            `}
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center text-lg shadow-lg group-hover:shadow-xl transition-shadow">
                {contact.profiles.avatar_emoji}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${getStatusColor(contact.profiles.status)} shadow-lg`}></div>
            </div>
            
            <div className="flex-1 ml-3 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-white truncate">{contact.profiles.display_name}</h4>
                <div className="flex items-center space-x-1">
                  {contact.profiles.status === 'online' && (
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>
              <p className="text-xs text-white/60 truncate">@{contact.profiles.username}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ContactList;
