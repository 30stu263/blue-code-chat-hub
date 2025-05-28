import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import { Contact, Message } from '../types';

const Index = () => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [currentUser] = useState({
    id: '728395',
    name: 'You',
    avatar: '👤',
    status: 'online' as const
  });

  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '123456',
      name: 'Alex Chen',
      avatar: '🧑‍💼',
      status: 'online',
      lastMessage: 'Hey there! How are you?',
      lastMessageTime: '2:30 PM',
      unreadCount: 2
    },
    {
      id: '789012',
      name: 'Sarah Wilson',
      avatar: '👩‍💻',
      status: 'away',
      lastMessage: 'Thanks for the files!',
      lastMessageTime: '1:15 PM',
      unreadCount: 0
    },
    {
      id: '345678',
      name: 'Mike Johnson',
      avatar: '👨‍🎨',
      status: 'offline',
      lastMessage: 'See you tomorrow',
      lastMessageTime: 'Yesterday',
      unreadCount: 0
    }
  ]);

  const [messages, setMessages] = useState<Record<string, Message[]>>({
    '123456': [
      {
        id: '1',
        senderId: '123456',
        content: 'Hey there! How are you doing today?',
        timestamp: new Date(Date.now() - 300000),
        type: 'text'
      },
      {
        id: '2',
        senderId: '728395',
        content: 'I\'m doing great! Just working on some projects. How about you?',
        timestamp: new Date(Date.now() - 240000),
        type: 'text'
      },
      {
        id: '3',
        senderId: '123456',
        content: 'Same here! Working on a new design system. Want to check it out?',
        timestamp: new Date(Date.now() - 180000),
        type: 'text'
      }
    ],
    '789012': [
      {
        id: '4',
        senderId: '789012',
        content: 'Thanks for sending those files earlier!',
        timestamp: new Date(Date.now() - 600000),
        type: 'text'
      },
      {
        id: '5',
        senderId: '728395',
        content: 'No problem! Let me know if you need anything else.',
        timestamp: new Date(Date.now() - 540000),
        type: 'text'
      }
    ],
    '345678': [
      {
        id: '6',
        senderId: '345678',
        content: 'Don\'t forget about our meeting tomorrow!',
        timestamp: new Date(Date.now() - 86400000),
        type: 'text'
      }
    ]
  });

  const sendMessage = (content: string) => {
    if (!selectedContact) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      content,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => ({
      ...prev,
      [selectedContact.id]: [...(prev[selectedContact.id] || []), newMessage]
    }));

    // Update last message in contacts
    setContacts(prev => prev.map(contact =>
      contact.id === selectedContact.id
        ? { ...contact, lastMessage: content, lastMessageTime: 'Now' }
        : contact
    ));
  };

  const addContact = (contactId: string) => {
    // Simulate finding a contact by ID
    const mockUsers = [
      { id: '111222', name: 'Emma Davis', avatar: '👩‍🔬', status: 'online' as const },
      { id: '333444', name: 'Ryan Garcia', avatar: '👨‍🚀', status: 'away' as const },
      { id: '555666', name: 'Lisa Park', avatar: '👩‍🎨', status: 'offline' as const }
    ];

    const user = mockUsers.find(u => u.id === contactId);
    if (user && !contacts.find(c => c.id === contactId)) {
      const newContact: Contact = {
        ...user,
        lastMessage: '',
        lastMessageTime: '',
        unreadCount: 0
      };
      setContacts(prev => [...prev, newContact]);
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <Sidebar
        contacts={contacts}
        selectedContact={selectedContact}
        onSelectContact={setSelectedContact}
        currentUser={currentUser}
        onAddContact={addContact}
      />
      <ChatArea
        selectedContact={selectedContact}
        messages={selectedContact ? messages[selectedContact.id] || [] : []}
        currentUserId={currentUser.id}
        onSendMessage={sendMessage}
      />
    </div>
  );
};

export default Index;
