import React, { useContext, useEffect, useState } from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/Authcontext'
import { ChatContext } from '../../context/Chatcontext'

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
    <div className={`bg-[#8185B2]/16 p-2 h-full rounded-r-xl text-white
      ${selectedUser ? "max-md:hidden" : ""}`}>
      <div className='mb-5 p-3'>
        <div className='flex justify-between items-center'>
          <img src={assets.logo} alt="logo" className='max-w-40' />
          <div className='relative py-2'>
            <img src={assets.menu_icon} alt="Menu" className='h-5 cursor-pointer' onClick={() => setOpen(!open)} />
            {open && (
              <div className='absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100'>
                <p onClick={() => { navigate("/profile"); setOpen(false) }} className='cursor-pointer text-sm text-center'>
                  Edit Profile
                </p>
                <hr className='my-2 border-t border-gray-500' />
                <p onClick={() => { logout(); setOpen(false) }} className='cursor-pointer text-sm text-center'>
                  Logout
                </p>
              </div>
            )}
          </div>
        </div>

        <div className='bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5'>
          <img src={assets.search_icon} alt="Search" className='w-3' />
          <input onChange={(e) => setInput(e.target.value)} type="text" className='bg-transparent border-none outline-none text-white text-sm placeholder-[#c8c8c8c] flex-1' placeholder='Search User...' />
        </div>
      </div>


      <div className='flex flex-col overflow-y-auto max-h-[calc(100vh-180px)]'>
        {filteredUsers.map((user, index) => (
          <div onClick={() => { setSelectedUser(user); setUnseenMessages(prev => ({ ...prev, [user._id]: 0 })) }} key={index} className={`relative flex items-center gap-2
           p-2 sm:ml-2 rounded cursor-pointer max-sm:text-sm ${selectedUser?._id === user._id &&
           'bg-[#282142]/50'}`}>
            <img src={user?.profilePic || assets.avatar_icon} alt=""
              className='w-10 sm:w-11.25 aspect-square object-cover rounded-full' />
            <div className='flex flex-col leading-5'>
              <p>{user.fullName}</p>
              {
                onlineUsers.includes(user._id)
                  ? <span className='text-green-400 text-xs'>Online</span>
                  : <span className='text-neutral-400 text-xs'>Offline</span>
              }
            </div>
            {unseenMessages[user._id] > 0 && <p className='absolute top-4 right-4 text-xs h-5 w-5 flex justify-center
        items-center rounded-full bg-violet-500/50'>{unseenMessages[user._id]}</p>}
          </div>
        ))}
      </div>
    </div>

  )
}

export default Sidebar  