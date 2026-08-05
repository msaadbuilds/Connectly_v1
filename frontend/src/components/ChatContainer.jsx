import React, { useContext, useEffect, useRef, useState } from 'react'
import assets from '../assets/assets'
import { formatMessageTime } from '../../lib/utils'
import { ChatContext } from '../../context/Chatcontext'
import { AuthContext } from '../../context/Authcontext'
import imageCompression from "browser-image-compression";
import toast from "react-hot-toast";

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
        <div className="sm:w-85 w-55 rounded-lg overflow-hidden mb-8 border border-gray-700">
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
          className="sm:w-70 h-87.5 w-55 border cursor-pointer object-cover border-gray-700 rounded-lg overflow-hidden mb-8"
          alt="Shared image"
        />
      );
    } else {
      return (
        <div>
          <p className={`p-2 max-w-50 md:text-sm font-light rounded-lg mb-8 break-all bg-violet-600 text-white
            ${msg.senderId === authUser._id ? 'rounded-br-none' : 'rounded-bl-none'}`}>
            {msg.text}
          </p>
        </div>
      );
    }
  };

  return selectedUser ? (
    <div className="h-full overflow-scroll relative py-1">

      <div className="flex items-center gap-3 py-3 mx-3 border-b border-gray-500">
        <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className="w-8 h-8 object-cover rounded-full" />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
        </p>
        <img src={assets.arrow_icon} onClick={() => setSelectedUser(null)} className="md:hidden max-w-7 cursor-pointer" />
        <img src={assets.help_icon} className="max-md:hidden max-w-5" alt="" />
      </div>

      <div className="flex flex-col h-[calc(100%-110px)] overflow-y-scroll pt-3 pb-3 relative">

        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${assets.wb})`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            opacity: 0.24
          }}
        >
        </div>

        {isUploading && (
          <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-50">
            <div className="flex items-center gap-2 bg-violet-600 px-4 py-2 rounded-full">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span className="text-white text-md">Sending...</span>
            </div>
          </div>
        )}

        <div className="relative flex-1 overflow-y-scroll px-3">
          {messages.map((msg, index) => (
            <div
              key={index}
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
            </div>
          ))}
          <div ref={scrollEnd}></div>
        </div>
      </div>

      <div className="px-2 absolute right-0 left-0">
        <div className="flex items-center rounded-full px-1 py-1 bg-violet-500/20 shadow-lg w-full border border-gray-700">

          <div className="relative shrink-0">
            <button
              onClick={() => setShowUpload(prev => !prev)}
              className="text-white cursor-pointer p-2 hover:bg-gray-700 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
            {showUpload && (
              <div
                ref={dropdownRef}
                className="absolute bottom-12 left-0 flex gap-2 bg-gray-700/90 px-3 py-2 rounded-xl shadow-lg"
              >
                {/* Image Upload */}
                <label htmlFor="image" className="p-2 rounded-full hover:bg-gray-700 cursor-pointer">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    <path d="M15 8a1 1 0 100-2 1 1 0 000 2z" />
                  </svg>
                </label>
                <input onChange={handleSendImage} type="file" id="image" accept="image/*" hidden disabled={isUploading} />

                {/* Video Upload */}
                <label htmlFor="video" className="p-2 rounded-full hover:bg-gray-700 cursor-pointer">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </label>
                <input onChange={handleSendVideo} type="file" id="video" accept="video/*" hidden disabled={isUploading} />
              </div>
            )}
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
            className="shrink-0 w-9 h-9 ml-1"
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
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 rounded-lg max-md:hidden">
      <img src={assets.logo_icon} className="max-w-24" />
      <p className="text-xl font-normal text-white">Chat Anytime, Anywhere</p>
    </div>
  )
}

export default ChatContainer
