import React from "react";
import Sidebar from "@/components/Sidebar";

// If you have a ChatArea or Home/Welcome screen, import that too:
import ChatArea from "@/components/ChatArea"; // or whatever your main chat component is

const IndexPage = () => {
  // Dummy props for demonstration; replace with your real hooks/state!
  const contacts = [];
  const groupChats = [];
  const selectedContactId = null;
  const selectedGroupChatId = null;
  const user = null;

  return (
    <div className="flex h-screen">
      <div className="w-80 flex-shrink-0 flex flex-col overflow-hidden">
        <Sidebar
          contacts={contacts}
          groupChats={groupChats}
          selectedContactId={selectedContactId}
          selectedGroupChatId={selectedGroupChatId}
          onSelectContact={() => {}}
          onSelectGroupChat={() => {}}
          currentUser={user}
          onAddContact={async () => false}
          onCreateGroup={async () => false}
          onSignOut={() => {}}
        />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 min-h-0 flex flex-col">
          <ChatArea />
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
