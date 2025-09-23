import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import "../styles/NewChat.css";

export default function NewChat() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users");
        setUsers(res.data.filter((u) => u._id !== user._id));
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, [user]);

  const startConversation = async (receiverId) => {
    try {
      const res = await api.post("/chat/conversation", { receiverId });
      navigate("/chat", { state: { conversation: res.data } });
    } catch (err) {
      console.error("Error creating conversation:", err);
    }
  };

  return (
    <div className="newchat-container">
      <h2 className="newchat-title">Start a New Conversation</h2>
      {users.length === 0 ? (
        <p className="newchat-empty">No other users found</p>
      ) : (
        <ul className="newchat-list">
          {users.map((u) => (
            <li key={u._id} className="newchat-item">
              <span className="newchat-username">{u.name}</span>
              <button
                className="newchat-btn"
                onClick={() => startConversation(u._id)}
              >
                Chat
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
