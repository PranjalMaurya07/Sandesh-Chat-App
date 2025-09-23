import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    sender: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: String,
    },
    text: String,
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);