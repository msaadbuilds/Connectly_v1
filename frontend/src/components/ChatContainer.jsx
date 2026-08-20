import React, { useContext, useEffect, useRef, useState } from 'react'
import assets from '../assets/assets'
import { formatMessageTime } from '../../lib/utils'
import { ChatContext } from '../../context/Chatcontext'
import { AuthContext } from '../../context/Authcontext'
import imageCompression from "browser-image-compression";
import toast from "react-hot-toast";
import { LogoMark } from './Logo'
import { motion, AnimatePresence } from 'framer-motion'

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage, sendVideoMessage, sendImageMessage, getMessages, isUploading } = useContext(ChatContext)
  const { authUser, onlineUsers } = useContext(AuthContext)

  const scrollEnd = useRef()
  const dropdownRef = useRef();
  const [showUpload, setShowUpload] = useState(false);
  const [input, setInput] = useState('')

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (input.trim() === "") return null;
    await sendMessage({ text: input.trim() })
    setInput("")
  }

  const handleSendImage = async (e) => {
    setShowUpload(false);
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Select an image file");
      return;
    }
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1080,
      useWebWorker: true,
    };
    const compressedFile = await imageCompression(file, options);
    const formData = new FormData();
    formData.append("image", compressedFile);

    await sendImageMessage(formData);
    e.target.value = "";
  };

  const handleSendVideo = async (e) => {
    setShowUpload(false);
    const file = e.target.files[0]
    if (!file || !file.type.startsWith("video/")) {
      toast.error("Select a video file")
      return
    }

    if (file.size > 209715200) {
      toast.error("Video size must be less than 200MB");
      return;
    }

    const formData = new FormData();
    formData.append("video", file);
    await sendVideoMessage(formData);
    e.target.value = "";
  }

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id)
    }
  }, [selectedUser])

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUpload(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const renderMessage = (msg) => {
    if (msg.messageType === 'video' || msg.video) {
      return (
        <div className="sm:w-85 w-55 rounded-2xl overflow-hidden mb-8 border border-white/10 shadow-md shadow-black/20">
          <video
            controls
            className="w-full h-auto max-h-60 object-cover"
            preload="metadata"
          >
            <source src={msg.video} type="video/mp4" />
            <source src={msg.video} type="video/webm" />
            <source src={msg.video} type="video/ogg" />
          </video>
        </div>
      );
    } else if (msg.messageType === 'image' || msg.image) {
      return (
        <img
          src={msg.image}
          onClick={() => window.open(msg.image)}
          className="sm:w-70 h-87.5 w-55 border cursor-pointer object-cover border-white/10 rounded-2xl overflow-hidden mb-8 shadow-md shadow-black/20"
          alt="Shared image"
        />
      );
    } else {
      const isMine = msg.senderId === authUser._id
      return (
        <div>
          <p className={`px-3.5 py-2 max-w-50 md:text-sm font-light rounded-2xl mb-8 break-all shadow-md
            ${isMine
              ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white rounded-br-md shadow-violet-900/30'
              : 'bg-white/10 border border-white/10 backdrop-blur-sm text-white rounded-bl-md shadow-black/20'}`}>
            {msg.text}
          </p>
        </div>
      );
    }
  };

  return (
    <AnimatePresence mode="wait">
      {selectedUser ? (
        <motion.div
          key={selectedUser._id}
          initial={{ opacity: 0, x: 24, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="h-full min-h-0 overflow-hidden relative flex flex-col"
        >

          <div className="flex items-center gap-3 py-3 mx-3 border-b border-white/10 shrink-0">
            <div className="relative shrink-0">
              <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className="w-9 h-9 object-cover rounded-full ring-2 ring-white/10" />
              {onlineUsers.includes(selectedUser._id) && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#15122a]"></span>
              )}
            </div>
            <p className="flex-1 text-lg text-white flex items-center gap-2">
              {selectedUser.fullName}
            </p>
            <img src={assets.arrow_icon} onClick={() => setSelectedUser(null)} className="md:hidden max-w-7 cursor-pointer opacity-80 hover:opacity-100 transition-opacity" />
            <img src={assets.help_icon} className="max-md:hidden max-w-5 opacity-70 hover:opacity-100 transition-opacity cursor-pointer" alt="" />
          </div>

          {/* Everything below the header shares one continuous watermark + ambient glow background */}
          <div className="relative flex-1 min-h-0">

            {/* ambient animated glow specific to this open chat */}
            <motion.div
              className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-fuchsia-600/20 blur-3xl pointer-events-none"
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-violet-600/20 blur-3xl pointer-events-none"
              animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />

            {/* whatsapp-style watermark, now spans the full area behind messages AND the input bar */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `url(${assets.wb})`,
                backgroundSize: "contain",
                backgroundPosition: "center",
                opacity: 0.22
              }}
            />

            {isUploading && (
              <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-50">
                <div className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 rounded-full shadow-lg shadow-violet-900/40">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span className="text-white text-md">Sending...</span>
                </div>
              </div>
            )}

            {/* scrollable messages - bottom padding keeps last messages clear of the floating input bar */}
            <div className="relative h-full overflow-y-scroll px-3 pt-3 pb-24">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className={`flex items-end gap-2 justify-end ${msg.senderId !== authUser._id && 'flex-row-reverse'}`}
                >
                  {renderMessage(msg)}
                  <div className="text-center text-xs">
                    <img
                      src={
                        msg.senderId === authUser._id
                          ? authUser?.profilePic || assets.avatar_icon
                          : selectedUser?.profilePic || assets.avatar_icon
                      }
                      className="w-7 h-7 object-cover rounded-full"
                    />
                    <p className="text-gray-300 mt-1">{formatMessageTime(msg.createdAt)}</p>
                  </div>
                </motion.div>
              ))}
              <div ref={scrollEnd}></div>
            </div>

            {/* input bar - sits over the same watermark layer, lifted with bottom padding so it doesn't hug the edge */}
            <div className="absolute bottom-0 left-0 right-0 px-3 pb-4 pt-6 bg-gradient-to-t from-[#0b0917]/70 via-[#0b0917]/30 to-transparent">
              <div className="flex items-center rounded-full px-1.5 py-1.5 bg-white/8 backdrop-blur-md shadow-lg w-full border border-white/10 focus-within:border-violet-400/50 transition-colors">

                <div className="relative shrink-0">
                  <button
                    onClick={() => setShowUpload(prev => !prev)}
                    className="text-white cursor-pointer p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <AnimatePresence>
                    {showUpload && (
                      <motion.div
                        ref={dropdownRef}
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-13 left-0 flex gap-2 bg-[#241f3d]/95 backdrop-blur-xl px-3 py-2 rounded-2xl shadow-2xl shadow-black/40 border border-white/10"
                      >
                        {/* Image Upload */}
                        <label htmlFor="image" className="p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            <path d="M15 8a1 1 0 100-2 1 1 0 000 2z" />
                          </svg>
                        </label>
                        <input onChange={handleSendImage} type="file" id="image" accept="image/*" hidden disabled={isUploading} />

                        {/* Video Upload */}
                        <label htmlFor="video" className="p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </label>
                        <input onChange={handleSendVideo} type="file" id="video" accept="video/*" hidden disabled={isUploading} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Input Field */}
                <input
                  onChange={(e) => setInput(e.target.value)}
                  value={input}
                  onKeyDown={(e) => e.key === "Enter" ? handleSendMessage(e) : null}
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 min-w-0 px-2 py-1 text-md font-normal text-white bg-transparent outline-none placeholder-gray-400"
                  disabled={isUploading}
                />

                {/* Send Button */}
                <button
                  onClick={isUploading ? undefined : handleSendMessage}
                  className="shrink-0 w-9 h-9 ml-1 transition hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                  disabled={isUploading}
                >
                  <img
                    src={assets.send_button}
                    className={`${isUploading ? 'opacity-50 cursor-not-allowed' : 'w-full h-full cursor-pointer'}`}
                    alt="Send"
                  />
                </button>

              </div>
            </div>

          </div>
        </motion.div>
      ) : (
        <motion.div
          key="empty-state"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center gap-4 text-gray-500 bg-white/5 rounded-2xl max-md:hidden h-full relative overflow-hidden"
        >
          <motion.div
            className="absolute w-64 h-64 rounded-full bg-violet-600/20 blur-3xl pointer-events-none"
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            <LogoMark size={88} />
          </motion.div>
          <div className="text-center relative">
            <p className="text-xl font-medium text-white">Chat Anytime, Anywhere</p>
            <p className="text-sm text-gray-400 mt-1">Select a conversation to start messaging</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ChatContainer
