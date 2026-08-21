import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoute.js";
import Message from "./models/message.js";
import dns from "dns";

// Set the DNS server to use
dns.setServers(["8.8.8.8"]);

const app = express();
const server = http.createServer(app);
export const io = new Server(server, {
  cors: { origin: "*" },
});

export const userSocketMap = {};

io.on("connection", async (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User connected", userId);
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Any message that was sent to this user while they were offline is now
  // "delivered" the moment they come online — notify each original sender
  // (if they're online) so their tick updates to double-check in realtime.
  if (userId) {
    try {
      const pending = await Message.find({ recieverId: userId, delivered: false });
      if (pending.length > 0) {
        const idsBySender = {};
        pending.forEach((m) => {
          const sId = m.senderId.toString();
          if (!idsBySender[sId]) idsBySender[sId] = [];
          idsBySender[sId].push(m._id.toString());
        });

        await Message.updateMany(
          { recieverId: userId, delivered: false },
          { delivered: true }
        );

        Object.entries(idsBySender).forEach(([senderId, messageIds]) => {
          const senderSocketId = userSocketMap[senderId];
          if (senderSocketId) {
            io.to(senderSocketId).emit("messagesDelivered", { by: userId, messageIds });
          }
        });
      }
    } catch (err) {
      console.log("Delivery sync error:", err.message);
    }
  }

  socket.on("disconnect", () => {
    console.log("User disconnected", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

});

app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ extended: true, limit: "200mb" }));
app.use(cors());

app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

await connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on PORT: ${PORT}`));

export default server;