import React from "react";
import { createContext, useEffect, useState } from "react";
import axios from 'axios'
import toast from "react-hot-toast";
import { io } from "socket.io-client"

const backendUrl = import.meta.env.VITE_BASE_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"))
    const [authUser, setAuthUser] = useState(null)
    const [onlineUsers, setOnlineUsers] = useState([])
    const [socket, setSocket] = useState(null)

    const checkAuth = async () => {
        const { data } = await axios.get('/api/auth/check');
        if (data.success) {
            setAuthUser(data.user)
            connectSocket(data.user)
        }
    }

    const sendOTP = async (jwt) => {
        const { data } = await axios.post("/api/auth/sendotp", {jwt});
        if (data.success) {
            toast.success(data.message);
        } else {
            toast.error(data.message);
        }
    };

    const verifyOTP = async (credentials) => {
        const { data } = await axios.post("/api/auth/verifyotp", credentials);
        if (data.success) {
            toast.success(data.message);
            setAuthUser(data.user);
        } else {
            toast.error(data.message);
        }
    };

    const login = async (credentials) => {
        const { data } = await axios.post('/api/auth/login', credentials);
        if (data.success) {
            setAuthUser(data.userData);
            connectSocket(data.userData);
            axios.defaults.headers.common["token"] = data.token;
            setToken(data.token);
            localStorage.setItem("token", data.token);
            toast.success(data.message);
        } else {
            toast.error(data.message);
        }
    }

    const signup = async (credentials) => {
        const { data } = await axios.post('/api/auth/signup', credentials);
        if (data.success) {
            setAuthUser(data.userData);
            connectSocket(data.userData);
            setToken(data.token);
            axios.defaults.headers.common["token"] = data.token;
            localStorage.setItem("token", data.token);
            await sendOTP(data.token)
            toast.success(data.message)
        } else {
            toast.error(data.message)
        }
    }

    const logout = async () => {
        localStorage.removeItem("token");
        setToken(null)
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common["token"] = null;
        toast.success("Logged out Successfully!");
        socket.disconnect();
    }

    const updateProfile = async (body) => {
        try {
            const { data } = await axios.put("/api/auth/update-profile", body);
            if (data.success) {
                setAuthUser(data.user);
                toast.success("Profile updated Successfully!")
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    const connectSocket = (userData) => {
        if (!userData || socket?.connected) return;
        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id
            }
        });
        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("getOnlineUsers", (userIds) => {
            setOnlineUsers(userIds);
        })
    }
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["token"] = token;
        }
        checkAuth()
    }, [])

    const value = {
        axios,
        authUser,
        onlineUsers,
        socket,
        verifyOTP,
        sendOTP,
        login,
        signup,
        logout,
        updateProfile
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )

}