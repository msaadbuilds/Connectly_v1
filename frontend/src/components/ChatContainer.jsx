import React, { useContext, useEffect, useRef, useState } from 'react'
import assets from '../assets/assets'
import { formatMessageTime, getDateLabel, getDateKey, formatFileSize } from '../../lib/utils'
import { ChatContext } from '../../context/Chatcontext'
import { AuthContext } from '../../context/Authcontext'
import imageCompression from "browser-image-compression";
import toast from "react-hot-toast";
import { LogoMark } from './Logo'
import { motion, AnimatePresence } from 'framer-motion'
import EmojiPicker from './EmojiPicker'

// --- WhatsApp-style status icons (clock while sending, single/double tick, blue when seen) ---
const ClockIcon = ({ className = '' }) => (
  <svg viewBox="0 0 16 16" className={className} fill="none">
    <circle cx="8" cy="8" r="6.3" stroke="currentColor" strokeWidth="1.3" />
    <path d="M8 4.6V8.2L10.3 9.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const SingleTick = ({ className = '' }) => (
  <svg viewBox="0 0 16 12" className={className} fill="none">
    <path d="M1.5 6.3L5.2 10L14.5 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const DoubleTick = ({ className = '' }) => (
  <svg viewBox="0 0 20 12" className={className} fill="none">
    <path d="M0.5 6.3L4.2 10L13.5 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 6.3L9.7 10L19 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const MessageStatus = ({ msg, light = false }) => {
  const baseClass = light ? 'text-white/80' : 'text-white/70'
  if (msg.pending) return <ClockIcon className={`w-3 h-3 shrink-0 ${baseClass}`} />
  if (msg.seen) return <DoubleTick className="w-3.5 h-3 shrink-0 text-[#53BDEB]" />
  if (msg.delivered) return <DoubleTick className={`w-3.5 h-3 shrink-0 ${baseClass}`} />
  return <SingleTick className={`w-3 h-3 shrink-0 ${baseClass}`} />
}

const DownloadIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16" />
  </svg>
)

// Page-with-folded-corner icon - used for both the "Document" attach option
// and the generic file badge inside a document message bubble.
const FileIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 3v5h5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.5 13h7M8.5 16.5h7" strokeLinecap="round" />
  </svg>
)

// Landscape-photo icon - used for the "Photos & videos" attach option.
const MediaIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="4" width="18" height="16" rx="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="8.5" cy="9.5" r="1.6" />
    <path d="M3 16l5-5 4 4 3-3 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const EmojiToggleIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 10h.01M15.5 10h.01M8 14.5c1.2 1.2 2.5 1.8 4 1.8s2.8-.6 4-1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// Extension -> badge color/label for the document bubble, matching the
// app's violet/fuchsia theme with a few recognizable accent colors.
const getFileMeta = (filename = '') => {
  const ext = (filename.split('.').pop() || '').toUpperCase();
  const map = {
    PDF: { color: 'text-red-400 bg-red-500/15', label: 'PDF' },
    DOC: { color: 'text-blue-400 bg-blue-500/15', label: 'DOC' },
    DOCX: { color: 'text-blue-400 bg-blue-500/15', label: 'DOC' },
    XLS: { color: 'text-emerald-400 bg-emerald-500/15', label: 'XLS' },
    XLSX: { color: 'text-emerald-400 bg-emerald-500/15', label: 'XLS' },
    PPT: { color: 'text-orange-400 bg-orange-500/15', label: 'PPT' },
    PPTX: { color: 'text-orange-400 bg-orange-500/15', label: 'PPT' },
    ZIP: { color: 'text-amber-400 bg-amber-500/15', label: 'ZIP' },
    RAR: { color: 'text-amber-400 bg-amber-500/15', label: 'RAR' },
    TXT: { color: 'text-slate-300 bg-slate-500/15', label: 'TXT' },
    CSV: { color: 'text-emerald-400 bg-emerald-500/15', label: 'CSV' },
  };
  return map[ext] || { color: 'text-violet-300 bg-violet-500/15', label: ext || 'FILE' };
};

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage, sendVideoMessage, sendImageMessage, sendDocumentMessage, getMessages, isUploading, showUserInfo, setShowUserInfo } = useContext(ChatContext)
  const { authUser, onlineUsers } = useContext(AuthContext)

  const messagesContainerRef = useRef()
  const dropdownRef = useRef();
  const emojiRef = useRef();
  const inputRef = useRef();
  const [showUpload, setShowUpload] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [input, setInput] = useState('')

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error('Download failed');
    }
  };

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

  // "Photos & videos" is a single WhatsApp-style entry point that accepts
  // either type and routes to the existing image/video handler - neither
  // handler needs to change, they already read the file off this same event.
  const handleSendMedia = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type.startsWith("image/")) {
      await handleSendImage(e);
    } else if (file.type.startsWith("video/")) {
      await handleSendVideo(e);
    } else {
      toast.error("Select a photo or video file");
      setShowUpload(false);
      e.target.value = "";
    }
  };

  const handleSendDocument = async (e) => {
    setShowUpload(false);
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      toast.error("Document size must be less than 25MB");
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("document", file);
    await sendDocumentMessage(formData);
    e.target.value = "";
  };

  const toggleUpload = () => {
    setShowEmoji(false);
    setShowUpload((prev) => !prev);
  };

  const toggleEmoji = () => {
    setShowUpload(false);
    setShowEmoji((prev) => !prev);
  };

  // Inserts the picked emoji at the current caret position (not just the
  // end), then restores focus + caret right after it - same as WhatsApp.
  const handleEmojiSelect = (emoji) => {
    const el = inputRef.current;
    if (el && typeof el.selectionStart === 'number') {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const next = input.slice(0, start) + emoji + input.slice(end);
      setInput(next);
      requestAnimationFrame(() => {
        el.focus();
        const pos = start + emoji.length;
        el.setSelectionRange(pos, pos);
      });
    } else {
      setInput((prev) => prev + emoji);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id)
    }
  }, [selectedUser])

  useEffect(() => {
    // Scroll only the message list itself, not scrollIntoView() - which can
    // walk up and nudge outer overflow-hidden ancestors on some browsers,
    // causing the whole chat pane to visibly jump with no way to scroll it back.
    const container = messagesContainerRef.current
    if (container && messages) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
    }
  }, [messages])


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUpload(false);
      }
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setShowEmoji(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const renderMessage = (msg) => {
    const isMine = msg.senderId === authUser._id
    const time = formatMessageTime(msg.createdAt)

    if (msg.messageType === 'video' || msg.video) {
      return (
        <div className="sm:w-85 w-55 rounded-2xl overflow-hidden border border-white/10 shadow-md shadow-black/20 relative bg-black/40">
          <video
            controls
            className="w-full h-auto max-h-60 object-cover block"
            preload="metadata"
          >
            <source src={msg.video} type="video/mp4" />
            <source src={msg.video} type="video/webm" />
            <source src={msg.video} type="video/ogg" />
          </video>
          {/* bottom gradient so time/ticks stay legible over any video frame */}
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-linear-to-t from-black/70 to-transparent pointer-events-none" />
          <button
            onClick={() => handleDownload(msg.video, `video-${msg._id || Date.now()}.mp4`)}
            className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-colors"
            title="Download video"
          >
            <DownloadIcon className="w-3.5 h-3.5 text-white" />
          </button>
          <div className="absolute bottom-1.5 right-2.5 flex items-center gap-1 text-[11px] text-white/90">
            <span>{time}</span>
            {isMine && <MessageStatus msg={msg} light />}
          </div>
        </div>
      );
    } else if (msg.messageType === 'image' || msg.image) {
      return (
        <div className="sm:w-70 w-55 rounded-2xl overflow-hidden border border-white/10 shadow-md shadow-black/20 relative bg-black/20">
          <img
            src={msg.image}
            onClick={() => window.open(msg.image)}
            className="w-full h-87.5 cursor-pointer object-cover block"
            alt="Shared image"
          />
          {/* bottom gradient so time/ticks stay legible over any image */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-black/70 to-transparent pointer-events-none" />
          <button
            onClick={() => handleDownload(msg.image, `image-${msg._id || Date.now()}.jpg`)}
            className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-colors"
            title="Download image"
          >
            <DownloadIcon className="w-3.5 h-3.5 text-white" />
          </button>
          <div className="absolute bottom-1.5 right-2.5 flex items-center gap-1 text-[11px] text-white/90">
            <span>{time}</span>
            {isMine && <MessageStatus msg={msg} light />}
          </div>
        </div>
      );
    } else if (msg.messageType === 'document' || msg.document) {
      const meta = getFileMeta(msg.documentName);
      return (
        <div className={`w-64 sm:w-72 rounded-2xl p-3 shadow-md ${isMine
            ? 'bg-linear-to-br from-violet-600 to-fuchsia-600 shadow-violet-900/30'
            : 'bg-white/10 border border-white/10 backdrop-blur-sm shadow-black/20'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${meta.color}`}>
              <FileIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{msg.documentName || 'Document'}</p>
              <p className="text-[11px] text-white/60 mt-0.5">
                {meta.label}{msg.documentSize ? ` · ${formatFileSize(msg.documentSize)}` : ''}
              </p>
            </div>
            {!msg.pending && msg.document && (
              <button
                onClick={() => handleDownload(msg.document, msg.documentName || `document-${msg._id || Date.now()}`)}
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/30 transition-colors"
                title="Download document"
              >
                <DownloadIcon className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
          <div className="flex items-center justify-end gap-1 mt-1.5 text-[10.5px] text-white/70">
            <span>{time}</span>
            {isMine && <MessageStatus msg={msg} />}
          </div>
        </div>
      );
    } else {
      return (
        <div className={`relative max-w-[75vw] sm:max-w-70 md:max-w-xs px-3 py-2 rounded-2xl shadow-md
            ${isMine
            ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white rounded-br-md shadow-violet-900/30'
            : 'bg-white/10 border border-white/10 backdrop-blur-sm text-white rounded-bl-md shadow-black/20'}`}>
          <p className="md:text-sm font-light whitespace-pre-wrap [overflow-wrap:anywhere] leading-relaxed">
            {msg.text}
            {/* invisible spacer, exact same size as the real time/ticks below,
                so the last line of text always wraps around it correctly -
                works for single-line AND multi-line messages, just like WhatsApp */}
            <span className="invisible inline-flex items-center gap-1 text-[10.5px] ml-2 align-bottom select-none">
              <span>{time}</span>
              {isMine && <MessageStatus msg={msg} />}
            </span>
          </p>
          <span className="pointer-events-none absolute bottom-1.5 right-3 flex items-center gap-1 text-[10.5px] text-white/70">
            <span>{time}</span>
            {isMine && <MessageStatus msg={msg} />}
          </span>
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
          className="h-full overflow-hidden relative flex flex-col"
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
            <button
              onClick={() => setShowUserInfo(prev => !prev)}
              className={`max-md:hidden h-8 w-8 flex items-center justify-center rounded-full transition-colors cursor-pointer ${showUserInfo ? 'bg-white/15' : 'hover:bg-white/10'}`}
              title="Contact info"
            >
              <img src={assets.help_icon} className="max-w-5 opacity-80" alt="" />
            </button>
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
            <div ref={messagesContainerRef} className="relative h-full overflow-y-scroll px-3 pt-3 pb-24">
              {messages.map((msg, index) => {
                const prevMsg = messages[index - 1];
                const showDateSeparator = !prevMsg || getDateKey(msg.createdAt) !== getDateKey(prevMsg.createdAt);
                return (
                  <React.Fragment key={msg._id || index}>
                    {showDateSeparator && (
                      <div className="flex justify-center my-3">
                        <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-[11px] font-medium text-white/70 shadow-sm">
                          {getDateLabel(msg.createdAt)}
                        </span>
                      </div>
                    )}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className={`flex items-end gap-2 mb-3 justify-end ${msg.senderId !== authUser._id && 'flex-row-reverse'}`}
                    >
                      {renderMessage(msg)}
                      <img
                        src={
                          msg.senderId === authUser._id
                            ? authUser?.profilePic || assets.avatar_icon
                            : selectedUser?.profilePic || assets.avatar_icon
                        }
                        className="w-7 h-7 object-cover rounded-full shrink-0 mb-0.5"
                      />
                    </motion.div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* input bar - sits over the same watermark layer, lifted with bottom padding so it doesn't hug the edge */}
            <div className="absolute bottom-0 left-0 right-0 px-3 pb-4 pt-6 bg-gradient-to-t from-[#0b0917]/70 via-[#0b0917]/30 to-transparent">
              <div className="flex items-center rounded-full px-1.5 py-1.5 bg-white/8 backdrop-blur-md shadow-lg w-full border border-white/10 focus-within:border-violet-400/50 transition-colors">

                <div className="relative shrink-0">
                  <button
                    onClick={toggleUpload}
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
                        className="absolute bottom-13 left-0 w-56 bg-[#241f3d]/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/40 border border-white/10 overflow-hidden py-1.5"
                      >
                        {/* Document */}
                        <label htmlFor="document" className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-white/10 transition-colors cursor-pointer">
                          <span className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center bg-violet-500/20 text-violet-300">
                            <FileIcon className="w-5 h-5" />
                          </span>
                          <span className="text-sm text-white">Document</span>
                        </label>
                        <input
                          onChange={handleSendDocument}
                          type="file"
                          id="document"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar"
                          hidden
                          disabled={isUploading}
                        />

                        {/* Photos & videos */}
                        <label htmlFor="media" className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-white/10 transition-colors cursor-pointer">
                          <span className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center bg-sky-500/20 text-sky-300">
                            <MediaIcon className="w-5 h-5" />
                          </span>
                          <span className="text-sm text-white">Photos & videos</span>
                        </label>
                        <input onChange={handleSendMedia} type="file" id="media" accept="image/*,video/*" hidden disabled={isUploading} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Emoji */}
                <div className="relative shrink-0">
                  <button
                    onClick={toggleEmoji}
                    className="text-white cursor-pointer p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <EmojiToggleIcon className="w-6 h-6" />
                  </button>
                  <AnimatePresence>
                    {showEmoji && <EmojiPicker pickerRef={emojiRef} onSelect={handleEmojiSelect} />}
                  </AnimatePresence>
                </div>

                {/* Input Field */}
                <input
                  ref={inputRef}
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
