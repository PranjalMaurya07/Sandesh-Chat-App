import { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import api from "../services/api";
import { io } from "socket.io-client";
import { useLocation } from "react-router-dom";
import "../styles/Chat.css";

let socket;

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();

  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  if (isToday) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const diff = now - d;
  const dayMs = 24 * 60 * 60 * 1000;
  if (diff < 7 * dayMs) {
    return d.toLocaleDateString([], { weekday: "short" });
  }

  return d.toLocaleDateString();
}

export default function Chat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const location = useLocation();

  useEffect(() => {
    socket = io("https://sandesh-chat-app-backend.onrender.com");
    socket.on("connect", () => console.log("Socket connected:", socket.id));

    socket.on("receiveMessage", (msg) => {
      if (msg.conversationId === currentChat?._id) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === msg._id);
          return exists ? prev : [...prev, msg];
        });
      }

      setConversations((prev) =>
        prev.map((c) =>
          c._id === msg.conversationId
            ? {
              ...c,
              lastMessage: msg.text,
              lastMessageTime: new Date().toISOString(),
              unreadCount:
                msg.conversationId === currentChat?._id
                  ? 0
                  : (c.unreadCount || 0) + (msg.sender._id !== user._id ? 1 : 0),
            }
            : c
        )
      );
    });

    return () => socket.disconnect();
  }, [currentChat, user._id]);

  useEffect(() => {
    const fetchConvos = async () => {
      try {
        const res = await api.get("/chat/conversation");
        setConversations(res.data);
        res.data.forEach((c) => socket.emit("joinConversation", c._id));
      } catch (err) {
        console.error(err);
      }
    };
    fetchConvos();
  }, []);

  useEffect(() => {
    if (location.state?.conversation) {
      setConversations((prev) =>
        prev.some((c) => c._id === location.state.conversation._id)
          ? prev
          : [...prev, { ...location.state.conversation, unreadCount: 0 }]
      );
      loadMessages(location.state.conversation);
    }
  }, [location.state]);

  const loadMessages = async (conversation) => {
    setCurrentChat(conversation);
    try {
      const res = await api.get(`/chat/message/${conversation._id}`);
      setMessages(res.data);
      socket.emit("joinConversation", conversation._id);

      setConversations((prev) =>
        prev.map((c) =>
          c._id === conversation._id ? { ...c, unreadCount: 0 } : c
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !currentChat) return;
    try {
      const res = await api.post("/chat/message", {
        conversationId: currentChat._id,
        text: newMsg,
      });

      setMessages((prev) =>
        prev.some((m) => m._id === res.data._id) ? prev : [...prev, res.data]
      );

      setNewMsg("");

      setConversations((prev) => {
        const updated = prev.map((c) =>
          c._id === currentChat._id
            ? {
              ...c,
              lastMessage: res.data.text,
              lastMessageTime: new Date().toISOString(),
              unreadCount: 0,
            }
            : c
        );
        return updated;
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="chat-container">

      <div className="chat-sidebar">
        <h3 className="chat-sidebar-title">Conversations</h3>
        {conversations.map((c) => {
          const otherNames = c.members
            .filter((m) => m._id !== user._id)
            .map((m) => m.name)
            .join(", ");
          const unread = c.unreadCount || 0;
          return (
            <div
              key={c._id}
              onClick={() => loadMessages(c)}
              className={`chat-conversation ${currentChat?._id === c._id ? "active" : ""
                }`}
            >
              <div className="chat-conversation-info">
                <div className={`chat-conversation-name ${unread > 0 ? "bold" : ""}`}>
                  {otherNames}
                </div>
                <div
                  className={`chat-conversation-preview ${unread > 0 ? "unread" : ""
                    }`}
                >
                  {c.lastMessage
                    ? c.lastMessage.length > 25
                      ? c.lastMessage.slice(0, 25) + "..."
                      : c.lastMessage
                    : ""}
                </div>
              </div>
              <div className="chat-conversation-meta">
                {c.lastMessageTime && (
                  <div className="chat-conversation-time">
                    {formatTime(c.lastMessageTime)}
                  </div>
                )}
                {unread > 0 && (
                  <span className="chat-conversation-unread">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="chat-main">
        {currentChat ? (
          <>
            <div className="chat-messages">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`chat-message ${msg.sender._id === user._id ? "mine" : "theirs"
                    }`}
                >
                  <div className="chat-message-text">
                    {msg.text}
                  </div>
                  <div className="chat-message-time">
                    {msg.createdAt ? formatTime(msg.createdAt) : ""}
                  </div>
                </div>
              ))}
            </div>


            <form className="chat-input-area" onSubmit={handleSend}>
              <input
                className="chat-input"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder="Type a message..."
              />
              <button className="chat-send-btn" type="submit">
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="chat-empty">
            <h3>Select a conversation to start chatting</h3>
          </div>
        )}
      </div>
    </div>
  );
}
