import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import connectDB from "./config/connection.js";
import authRoutes from "./routes/authRoute.js";
import chatRoutes from "./routes/chatRoute.js";
import usersRoutes from "./routes/usersRoute.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api", usersRoutes);

// For health-check

app.get('/api/health', (req,res) => {
  res.status(200).json({status : "Ready to work"});
})


const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.set("io", io);

// Connect
io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  // Join conversation 
  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
