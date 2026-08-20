import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import assets from '../assets/assets';
import { AuthContext } from '../../context/Authcontext';

const Profile = () => {

  const { authUser, updateProfile } = useContext(AuthContext)

  const [selectedImg, setSelectedImg] = useState(null)
  const navigate = useNavigate()
  const [name, setName] = useState(authUser.fullName)
  const [bio, setBio] = useState(authUser.bio)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedImg) {
      await updateProfile({ fullName: name, bio });
      navigate('/')
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(selectedImg)
    reader.onload = async () => {
      const base64Image = reader.result;
      await updateProfile({ profilePic: base64Image, fullName: name, bio });
      navigate('/')
    }
  }
  return (
    <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center backdrop-blur-md p-4'>
      <div className='w-5/6 max-w-2xl backdrop-blur-2xl bg-white/5 text-gray-300 border border-white/10 flex items-center
       justify-center max-sm:flex-col-reverse rounded-2xl shadow-2xl shadow-black/30' >
        <form onSubmit={handleSubmit} className='flex flex-col gap-5 p-10 flex-1'>
          <h3 className='text-lg font-medium text-white'>
            Profile Details
          </h3>
          <label htmlFor="avatar" className='flex items-center gap-3 cursor-pointer group'>
            <input onChange={(e) => setSelectedImg(e.target.files[0])} type="file" id='avatar' accept='image/*' hidden />
            <img src={selectedImg ? URL.createObjectURL(selectedImg) : (authUser?.profilePic || assets.avatar_icon)} className='w-12 h-12 rounded-full object-cover object-center ring-2 ring-white/10 group-hover:ring-violet-400/50 transition' />
            <span className='group-hover:text-white transition-colors'>{authUser?.profilePic ? 'Update Profile Image' : 'Upload Profile Image'}</span>
          </label>
          <input type="text" onChange={(e) => setName(e.target.value)} value={name} required placeholder='Your name'
            className='p-2.5 bg-white/8 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition' />

          <textarea onChange={(e) => setBio(e.target.value)} value={bio} placeholder='Write Profile bio...'
            className='p-2.5 bg-white/8 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition'
            rows="4">
          </textarea>

          <button type='submit' className='bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white p-2.5 rounded-full text-lg
          cursor-pointer hover:brightness-110 active:scale-[0.99] transition shadow-lg shadow-violet-900/30'>
            Save
          </button>
        </form>
        <img
          src={authUser?.profilePic || (selectedImg && URL.createObjectURL(selectedImg))}
          className={`max-w-44 aspect-square object-cover rounded-full mx-10 max-sm:mt-10 ring-4 ring-white/10 ${selectedImg ? 'rounded-full' : ''}`}
        />

      </div>

    </div>
  )
}

export default Profile