import Conversation from "../models/conversation.js";
import Message from "../models/message.js";
import User from "../models/user.js";

export const createConversation = async (req, res) => {
  try {
    const { receiverId } = req.body;

    let conversation = await Conversation.findOne({
      members: { $all: [req.user.id, receiverId] },
    }).populate("members", "name");

    if (conversation) return res.json(conversation);

    conversation = await Conversation.create({
      members: [req.user.id, receiverId],
      lastMessage: "",
      lastMessageTime: null,
      unreadCounts: {}, 
    });

    conversation = await Conversation.findById(conversation._id).populate(
      "members",
      "name"
    );

    res.status(201).json(conversation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getConversations = async (req, res) => {
  try {
    const convos = await Conversation.find({ members: req.user.id })
      .populate("members", "name")
      .lean();

    const result = convos.map((convo) => {
      const unreadCount = convo.unreadCounts?.[req.user.id] ?? 0;
      return {
        ...convo,
        unreadCount,
      };
    });

    result.sort((a, b) => {
      const ta = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
      const tb = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
      return tb - ta;
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;

    const senderUser = await User.findById(req.user.id);
    if (!senderUser) return res.status(404).json({ error: "User not found" });

    const newMessage = await Message.create({
      conversationId,
      sender: {
        _id: String(senderUser._id),
        name: senderUser.name,
      },
      text,
    });

    const convo = await Conversation.findById(conversationId);
    if (convo) {
      convo.lastMessage = text;
      convo.lastMessageTime = new Date();

      convo.members.forEach((memberId) => {
        const idStr = String(memberId);
        if (idStr !== String(req.user.id)) {
          const prev = convo.unreadCounts.get(idStr) || 0;
          convo.unreadCounts.set(idStr, prev + 1);
        }
      });

      await convo.save();
    }

    const io = req.app.get("io");
    if (io) {
      io.to(conversationId.toString()).emit("receiveMessage", newMessage);

      io.to(conversationId.toString()).emit("conversationUpdated", {
        conversationId,
        lastMessage: convo.lastMessage,
        lastMessageTime: convo.lastMessageTime,
        unreadCounts: Object.fromEntries(convo.unreadCounts),
      });
    }

    return res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId }).sort({
      createdAt: 1,
    });

    const convo = await Conversation.findById(conversationId);
    if (convo) {
      convo.unreadCounts.set(String(req.user.id), 0);
      await convo.save();

      const io = req.app.get("io");
      if (io) {
        io.to(conversationId.toString()).emit("conversationUpdated", {
          conversationId,
          lastMessage: convo.lastMessage,
          lastMessageTime: convo.lastMessageTime,
          unreadCounts: Object.fromEntries(convo.unreadCounts),
        });
      }
    }

    res.json(messages);
  } catch (err) {
    console.error("Error in getMessages:", err);
    res.status(500).json({ message: err.message });
  }
};
