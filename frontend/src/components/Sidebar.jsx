import React, { useContext, useEffect, useState } from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/Authcontext'
import { ChatContext } from '../../context/Chatcontext'
import Logo from './Logo'
import { motion, AnimatePresence } from 'framer-motion'

const Sidebar = () => {

  const { getUsers, users, selectedUser, setSelectedUser, unseenMessages, setUnseenMessages } = useContext(ChatContext)
  const { logout, onlineUsers } = useContext(AuthContext)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(false)

  const filteredUsers = input ? users.filter((user) => user.fullName.toLowerCase()
    .includes(input.toLowerCase())) : users;

  useEffect(() => {
    getUsers();
  }, [onlineUsers])

  return (
    <div className={`bg-[#8185B2]/8 p-2 h-full rounded-r-2xl text-white border-r border-white/5
      ${selectedUser ? "max-md:hidden" : ""}`}>
      <div className='mb-5 p-3'>
        <div className='flex justify-between items-center'>
          <Logo size="sm" />
          <div className='relative py-2'>
            <button
              onClick={() => setOpen(!open)}
              className='h-9 w-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors cursor-pointer'
            >
              <img src={assets.menu_icon} alt="Menu" className='h-5' />
            </button>
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className='absolute top-full right-0 z-20 w-36 py-2 rounded-xl bg-[#241f3d]/95 backdrop-blur-xl border border-white/10 text-gray-100 shadow-2xl shadow-black/40'
                >
                  <p onClick={() => { navigate("/profile"); setOpen(false) }} className='cursor-pointer text-sm text-center py-2 hover:bg-white/5 transition-colors'>
                    Edit Profile
                  </p>
                  <hr className='my-1 border-t border-white/10' />
                  <p onClick={() => { logout(); setOpen(false) }} className='cursor-pointer text-sm text-center py-2 hover:bg-white/5 transition-colors text-red-300'>
                    Logout
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className='bg-white/5 border border-white/10 rounded-full flex items-center gap-2 py-2.5 px-4 mt-5 focus-within:border-violet-400/60 focus-within:bg-white/8 transition-colors'>
          <img src={assets.search_icon} alt="Search" className='w-3 opacity-70' />
          <input onChange={(e) => setInput(e.target.value)} type="text" className='bg-transparent border-none outline-none text-white text-sm placeholder-gray-400 flex-1' placeholder='Search user...' />
        </div>
      </div>


      <div className='flex flex-col gap-1 overflow-y-auto overflow-x-hidden max-h-[calc(100vh-180px)] px-2'>
        {filteredUsers.map((user, index) => (
          <motion.div
            onClick={() => { setSelectedUser(user); setUnseenMessages(prev => ({ ...prev, [user._id]: 0 })) }}
            key={user._id || index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.04, ease: 'easeOut' }}
            whileTap={{ scale: 0.98 }}
            className={`relative flex items-center gap-3
           p-2.5 rounded-xl cursor-pointer max-sm:text-sm transition-colors ${selectedUser?._id === user._id
                ? 'bg-linear-to-r from-violet-600/25 to-fuchsia-600/10 border border-violet-400/20'
                : 'border border-transparent hover:bg-white/5'}`}>
            <div className='relative shrink-0'>
              <img src={user?.profilePic || assets.avatar_icon} alt=""
                className='w-10 sm:w-11.25 aspect-square object-cover rounded-full ring-2 ring-white/10' />
              {onlineUsers.includes(user._id) && (
                <span className='absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#1a1730]'></span>
              )}
            </div>
            <div className='flex flex-col leading-5 min-w-0'>
              <p className='truncate'>{user.fullName}</p>
              {
                onlineUsers.includes(user._id)
                  ? <span className='text-emerald-400 text-xs'>Online</span>
                  : <span className='text-neutral-400 text-xs'>Offline</span>
              }
            </div>
            {unseenMessages[user._id] > 0 && <p className='absolute top-1/2 -translate-y-1/2 right-3 text-[11px] font-medium h-5 min-w-5 px-1 flex justify-center
        items-center rounded-full bg-linear-to-br from-violet-500 to-fuchsia-500 shadow-md shadow-violet-900/40'>{unseenMessages[user._id]}</p>}
          </motion.div>
        ))}
      </div>
    </div>

  )
}

export default Sidebar  