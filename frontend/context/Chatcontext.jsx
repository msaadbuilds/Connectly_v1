import React from "react";
import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./Authcontext";
import toast from "react-hot-toast";
import axios from "axios";

const backendUrl = import.meta.env.VITE_BASE_URL;
axios.defaults.baseURL = backendUrl;

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const { socket, axios, authUser } = useContext(AuthContext);

  // right sidebar (user info) is hidden by default and only opens when the
  // info icon is clicked; switching chats should always start collapsed
  useEffect(() => {
    setShowUserInfo(false);
  }, [selectedUser?._id]);

  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const sendMessage = async (messageData) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      recieverId: selectedUser._id,
      text: messageData.text,
      messageType: 'text',
      createdAt: new Date().toISOString(),
      pending: true,
      delivered: false,
      seen: false,
    };
    setMessages((prevMessages) => [...prevMessages, optimisticMessage]);
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData,
      );
      if (data.success) {
        setMessages((prevMessages) =>
          prevMessages.map((m) => (m._id === tempId ? data.newMessage : m))
        );
      } else {
        toast.error(data.message);
        setMessages((prevMessages) => prevMessages.filter((m) => m._id !== tempId));
      }
    } catch (error) {
      toast.error(error.message);
      setMessages((prevMessages) => prevMessages.filter((m) => m._id !== tempId));
    }
  };

  const sendVideoMessage = async (videoData) => {
    const file = videoData.get('video');
    const localUrl = file ? URL.createObjectURL(file) : null;
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      recieverId: selectedUser._id,
      video: localUrl,
      messageType: 'video',
      createdAt: new Date().toISOString(),
      pending: true,
      delivered: false,
      seen: false,
    };
    setMessages((prevMessages) => [...prevMessages, optimisticMessage]);
    try {
      setIsUploading(true);
      const { data } = await axios.post(
        `/api/messages/send-video/${selectedUser._id}`,
        videoData,
      );
      if (data.success) {
        setMessages((prevMessages) =>
          prevMessages.map((m) => (m._id === tempId ? data.newMessage : m))
        );
        toast.success("Video sent successfully!");
      } else {
        toast.error(data.message);
        setMessages((prevMessages) => prevMessages.filter((m) => m._id !== tempId));
      }
    } catch (error) {
      toast.error("Failed to send video!");
      setMessages((prevMessages) => prevMessages.filter((m) => m._id !== tempId));
    } finally {
      setIsUploading(false);
    }
  };

  const sendImageMessage = async (imageData) => {
    const file = imageData.get('image');
    const localUrl = file ? URL.createObjectURL(file) : null;
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      recieverId: selectedUser._id,
      image: localUrl,
      messageType: 'image',
      createdAt: new Date().toISOString(),
      pending: true,
      delivered: false,
      seen: false,
    };
    setMessages((prevMessages) => [...prevMessages, optimisticMessage]);
    try {
      setIsUploading(true);
      const { data } = await axios.post(
        `/api/messages/send-image/${selectedUser._id}`,
        imageData,
      );
      if (data.success) {
        setMessages((prevMessages) =>
          prevMessages.map((m) => (m._id === tempId ? data.newMessage : m))
        );
        toast.success("Image sent successfully!");
      } else {
        toast.error(data.message);
        setMessages((prevMessages) => prevMessages.filter((m) => m._id !== tempId));
      }
    } catch (error) {
      toast.error("Failed to send iamge!");
      setMessages((prevMessages) => prevMessages.filter((m) => m._id !== tempId));
    } finally {
      setIsUploading(false);
    }
  };

  const subscribeToMessages = async () => {
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;
        newMessage.delivered = true;
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMessages((prevUnseenMessages) => ({
          ...prevUnseenMessages,
          [newMessage.senderId]: prevUnseenMessages[newMessage.senderId]
            ? prevUnseenMessages[newMessage.senderId] + 1
            : 1,
        }));
      }
    });

    // a message I sent has now reached the recipient's device -> single tick becomes double
    socket.on("messagesDelivered", ({ messageIds }) => {
      setMessages((prevMessages) =>
        prevMessages.map((m) =>
          messageIds.includes(m._id) ? { ...m, delivered: true } : m
        )
      );
    });

    // the recipient has now read my message(s) -> double tick turns blue
    socket.on("messagesSeen", ({ messageIds }) => {
      setMessages((prevMessages) =>
        prevMessages.map((m) =>
          messageIds.includes(m._id) ? { ...m, seen: true, delivered: true } : m
        )
      );
    });
  };

  const unsubscribeFromMessages = async () => {
    if (socket) {
      socket.off("newMessage");
      socket.off("messagesDelivered");
      socket.off("messagesSeen");
    }
  };

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [socket, selectedUser]);

  const value = {
    messages,
    users,
    selectedUser,
    getUsers,
    getMessages,
    sendMessage,
    sendImageMessage,
    sendVideoMessage,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    isUploading,
    showUserInfo,
    setShowUserInfo,
  };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};