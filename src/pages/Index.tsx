import React, { useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import UpdatesChatArea from "@/components/UpdatesChatArea";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useContacts } from "@/hooks/useContacts";
import { useGroupChats } from "@/hooks/useGroupChats";
import { useMessages } from "@/hooks/useMessages";
import { useGroupMessages } from "@/hooks/useGroupMessages";

const IndexPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { contacts } = useContacts();
  const {
    groupChats,
    selectedGroupChatId,
    setSelectedGroupChatId,
  } = useGroupChats();
  const {
    messages: directMessages,
    sendMessage: sendDirectMessage,
    selectedContactId,
    setSelectedContactId,
  } = useMessages(user);
  const {
    messages: groupMessages,
    sendMessage: sendGroupMessage,
  } = useGroupMessages(selectedGroupChatId);

  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Auto-select general chat on first load
  useEffect(() => {
    if (
      groupChats.length > 0 &&
      !selectedContactId &&
      !selectedGroupChatId
    ) {
      const generalChat = groupChats.find((chat) => chat.is_general);
      if (generalChat) {
        setSelectedGroupChatId(generalChat.id);
      }
    }
  }, [groupChats, selectedContactId, selectedGroupChatId, setSelectedGroupChatId]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg text-white/70 font-semibold">
            Loading BlueTeck...
          </div>
        </div>
      </div>
    );
  }

  const currentMessages = selectedContactId ? directMessages : groupMessages;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white flex relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>
      {/* Sidebar */}
      <Sidebar
        contacts={contacts}
        groupChats={groupChats}
        selectedContactId={selectedContactId}
        selectedGroupChatId={selectedGroupChatId}
        onSelectContact={setSelectedContactId}
        onSelectGroupChat={setSelectedGroupChatId}
        currentUser={user}
        onAddContact={async () => false}
        onCreateGroup={async () => false}
        onSignOut={() => {
          // handle sign out
        }}
      />
      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedGroupChatId ? (
          groupChats.find(
            (c) => c.id === selectedGroupChatId && c.name === "Updates Chat"
          ) ? (
            <UpdatesChatArea
              groupChat={groupChats.find(
                (c) => c.id === selectedGroupChatId
              )}
              messages={groupMessages}
              currentUserId={user?.id}
              onSendMessage={sendGroupMessage}
            />
          ) : (
            <ChatArea
              groupChat={groupChats.find(
                (c) => c.id === selectedGroupChatId
              )}
              messages={groupMessages}
              currentUserId={user?.id}
              onSendMessage={sendGroupMessage}
            />
          )
        ) : selectedContactId ? (
          <ChatArea
            contact={contacts.find((c) => c.id === selectedContactId)}
            messages={directMessages}
            currentUserId={user?.id}
            onSendMessage={sendDirectMessage}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-900/50 via-blue-900/30 to-purple-900/50 backdrop-blur-xl">
            <div className="text-center max-w-md px-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6 backdrop-blur-sm border border-white/10">
                💬
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Welcome to BlueTeck
              </h2>
              <p className="text-white/60 leading-relaxed">
                Select a conversation from the sidebar to start chatting, or create a new group to bring people together.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndexPage;
