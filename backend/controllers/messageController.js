import { cloudinary } from "../config/cloudinary.js";
import Message from "../models/message.js";
import User from "../models/userModel.js";
import { io, userSocketMap } from "../index.js"

export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password"
    );
    const unseenMessages = {};

    const promises = filteredUsers.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        recieverId: userId,
        seen: false,
      });

      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }
    });

    await Promise.all(promises);
    res.json({
      success: true,
      users: filteredUsers,
      unseenMessages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, recieverId: selectedUserId },
        { senderId: selectedUserId, recieverId: myId },
      ],
    });
    await Message.updateMany(
      { senderId: selectedUserId, recieverId: myId },
      { seen: true }
    );
    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const markSeenMessage = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndUpdate(id, { seen: true });

    res.json({
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, messageType = 'text' } = req.body;
    const recieverId = req.params.id;
    const senderId = req.user._id;

    const newMessage = await Message.create({
      senderId,
      recieverId,
      text,
      messageType
    });

    const recieverSocketId = userSocketMap[recieverId];
    if(recieverSocketId) {
        io.to(recieverSocketId).emit("newMessage", newMessage)
    }

    res.json({
      success: true,
      newMessage,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const sendVideoMessage = async (req, res) => {
  try {
    const recieverId = req.params.id;
    const senderId = req.user._id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Video file is required"
      });
    }

    const newMessage = await Message.create({
      senderId,
      recieverId,
      video: req.file.path,
      messageType: 'video'
    });

    const recieverSocketId = userSocketMap[recieverId];
    if(recieverSocketId) {
        io.to(recieverSocketId).emit("newMessage", newMessage)
    }

    res.json({
      success: true,
      newMessage,
      videoUrl: req.file.path
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const sendImageMessage = async (req, res) => {
  try {
    const recieverId = req.params.id;
    const senderId = req.user._id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required"
      });
    }

    const newMessage = await Message.create({
      senderId,
      recieverId,
      image: req.file.path,
      messageType: 'image'
    });

    const recieverSocketId = userSocketMap[recieverId];
    if(recieverSocketId) {
        io.to(recieverSocketId).emit("newMessage", newMessage)
    }

    res.json({
      success: true,
      newMessage,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};