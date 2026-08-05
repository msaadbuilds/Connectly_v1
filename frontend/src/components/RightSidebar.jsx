import React, { useContext, useEffect, useState } from 'react'
import assets from '../assets/assets'
import { ChatContext } from '../../context/Chatcontext'
import { AuthContext } from '../../context/Authcontext'

const RightSidebar = () => {
  const { selectedUser, messages } = useContext(ChatContext)
  const { logout, onlineUsers } = useContext(AuthContext)
  const [msgImages, setMsgImages] = useState([])
  const [msgVideos, setMsgVideos] = useState([])
  const [mediaType, setMediaType] = useState('images') // 'images' or 'videos'

  useEffect(() => {
    // Filter images
    setMsgImages(
      messages.filter(msg => msg.image || msg.messageType === 'image').map(msg => msg.image)
    )
    
    // Filter videos
    setMsgVideos(
      messages.filter(msg => msg.video || msg.messageType === 'video').map(msg => ({
        url: msg.video,
        text: msg.text || ''
      }))
    )
  }, [messages])

  return selectedUser && (
    <div className={`bg-[#8185B2]/16 text-white w-full relative overflow-y-scroll ${selectedUser ?
      "max-md:hidden" : ""}`}>
      <div className='pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto'>
        <img src={selectedUser?.profilePic || assets.avatar_icon} className='w-25 h-25 aspect-square rounded-full
         object-cover' />
        <h1 className='px-10 text-2xl font-bold mx-auto flex items-center gap-2'>
          {onlineUsers.includes(selectedUser._id) && <p className='w-2 h-2 rounded-full bg-green-500'></p>}
          {selectedUser.fullName}
        </h1>
        <p className='px-10 mx-auto text-sm'>{selectedUser.bio}</p>
      </div>

      <hr className='border-[#ffffff50] my-4' />

      <div className='px-5'>
        <div className='flex items-center gap-4 mb-3'>
          <p className='text-md'>Media</p>
          <div className='flex bg-gray-700/50 rounded-full p-1'>
            <button 
              onClick={() => setMediaType('images')}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                mediaType === 'images' ? 'bg-violet-600 text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Images ({msgImages.length})
            </button>
            <button 
              onClick={() => setMediaType('videos')}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                mediaType === 'videos' ? 'bg-violet-600 text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Videos ({msgVideos.length})
            </button>
          </div>
        </div>

        <div className='mt-2 max-h-100 w-full overflow-y-scroll grid grid-cols-2 gap-4 opacity-80'>
          {mediaType === 'images' && msgImages.map((url, index) => (
            <div key={index} onClick={() => window.open(url)}
              className='cursor-pointer rounded'>
              <img src={url} className='h-30 w-full object-cover rounded-md' alt={`Image ${index + 1}`} />
            </div>
          ))}
          
          {mediaType === 'videos' && msgVideos.map((videoData, index) => (
            <div key={index} className='cursor-pointer rounded relative group'>
              <video 
                className='h-30 w-full object-cover rounded-md' 
                preload="metadata"
                onClick={() => window.open(videoData.url)}
              >
                <source src={videoData.url} type="video/mp4" />
                <source src={videoData.url} type="video/webm" />
                <source src={videoData.url} type="video/ogg" />
              </video>
              {/* Play button overlay */}
              <div className='absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-md'>
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
              {videoData.text && (
                <div className='absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 rounded-b-md'>
                  {videoData.text.length > 20 ? videoData.text.substring(0, 20) + '...' : videoData.text}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Show message when no media */}
        {mediaType === 'images' && msgImages.length === 0 && (
          <div className='text-center text-gray-400 py-8'>
            <p className='text-sm'>No images shared yet</p>
          </div>
        )}
        
        {mediaType === 'videos' && msgVideos.length === 0 && (
          <div className='text-center text-gray-400 py-8'>
            <p className='text-sm'>No videos shared yet</p>
          </div>
        )}
      </div>

      <button onClick={() => logout()} className='absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-linear-to-r
       from-purple-400 to-violet-600 text-white border-none text-lg font-normal py-2 px-25
        rounded-full cursor-pointer'>
        Logout
      </button>
    </div>
  )
}

export default RightSidebar