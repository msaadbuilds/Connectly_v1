import express from 'express'
import multer from 'multer';
import { protectRoute } from '../middleware/auth.js';
import { 
  getMessages, 
  getUsersForSidebar, 
  markSeenMessage, 
  sendImageMessage, 
  sendMessage, 
  sendVideoMessage 
} from '../controllers/messageController.js';
import { storage } from '../config/cloudinary.js';

const messageRouter = express.Router();
const upload = multer({
  storage,
  limits: {
      fileSize: 100 * 1024 * 1024
  }
});

messageRouter.get("/users", protectRoute, getUsersForSidebar);
messageRouter.get("/:id", protectRoute, getMessages);
messageRouter.put("/mark/:id", protectRoute, markSeenMessage);
messageRouter.post("/send/:id", protectRoute, sendMessage);
messageRouter.post("/send-image/:id", protectRoute, upload.single('image'), sendImageMessage);
messageRouter.post("/send-video/:id", protectRoute, upload.single('video'), sendVideoMessage);

export default messageRouter;