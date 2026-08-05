import React from "react";
import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./Authcontext";
import toast from "react-hot-toast";
import axios from 'axios'

const backendUrl = import.meta.env.VITE_BASE_URL;
axios.defaults.baseURL = backendUrl;

export const ChatContext = createContext()

export const ChatProvider = ({ children }) => {

    const [messages, setMessages] = useState([])
    const [users, setUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)
    const [unseenMessages, setUnseenMessages] = useState({})
    const [isUploading, setIsUploading] = useState(false)

    const { socket, axios } = useContext(AuthContext)

    const getUsers = async () => {
        try {
            const { data } = await axios.get("/api/messages/users")
            if (data.success) {
                setUsers(data.users)
                setUnseenMessages(data.unseenMessages)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getMessages = async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`)
            if (data.success) {
                setMessages(data.messages)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const sendMessage = async (messageData) => {
        try {
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData)
            if (data.success) {
                setMessages((prevMessages) => [...prevMessages, data.newMessage])
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const sendVideoMessage = async (videoData) => {
        try {
            setIsUploading(true)
            const { data } = await axios.post(`/api/messages/send-video/${selectedUser._id}`, videoData)
            if (data.success) {
                setMessages((prevMessages) => [...prevMessages, data.newMessage])
                toast.success("Video sent successfully!")
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error("Failed to send video!")
        } finally {
            setIsUploading(false)
        }
    }
    const sendImageMessage = async (imageData) => {
        try {
            setIsUploading(true)
            const { data } = await axios.post(`/api/messages/send-image/${selectedUser._id}`, imageData)
            if (data.success) {
                setMessages((prevMessages) => [...prevMessages, data.newMessage])
                toast.success("Image sent successfully!")
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error("Failed to send iamge!")
        } finally {
            setIsUploading(false)
        }
    }

    const subscribeToMessages = async () => {
        if (!socket) return;

        socket.on("newMessage", (newMessage) => {
            if (selectedUser && newMessage.senderId === selectedUser._id) {
                newMessage.seen = true
                setMessages((prevMessages) => [...prevMessages, newMessage])
                axios.put(`/api/messages/mark/${newMessage._id}`)
            } else {
                setUnseenMessages((prevUnseenMessages) => ({
                    ...prevUnseenMessages, [newMessage.senderId]:
                        prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages
                        [newMessage.senderId] + 1 : 1
                }))
            }
        })
    }

    const unsubscribeFromMessages = async () => {
        if (socket) socket.off("newMessage")
    }

    useEffect(() => {
        subscribeToMessages()
        return () => unsubscribeFromMessages()
    }, [socket, selectedUser])

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
        isUploading
    }

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}