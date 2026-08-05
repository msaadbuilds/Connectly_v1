import React, { useContext, useState } from 'react'
import assets from '../assets/assets'
import { AuthContext } from '../../context/Authcontext'
import { Link } from 'react-router-dom'



const Login = () => {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login } = useContext(AuthContext)

  const onSubmitHandler = (event) => {

    event.preventDefault()
    login({ email, password })

  }

  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly
    max-sm:flex-col backdrop-blur-2xl p-4'>

      <img src={assets.logo_big} className='w-[min(50vw,280px)]' alt="" />

      <form onSubmit={onSubmitHandler} className="border border-gray-600 bg-gradient-to-r from-purple-400/17 to-violet-700/17
       text-white p-5 flex flex-col rounded-lg shadow-lg space-y-5 w-full max-w-sm sm:max-w-md" >

        <h1 className='font-semibold text-3xl flex justify-between items-center'>
          Welcome Back!
        </h1>

        <div className='flex flex-col'>
          <label className='mb-1' htmlFor="Email">Email</label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
            id='Email'
            className='p-2.5 bg-white/12 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'
            placeholder='Enter your Email'
            required
          />
        </div>
        <div className='flex flex-col'>
          <label className='mb-1' htmlFor="pass">Password</label>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type="password"
            id='pass'
            className='p-2.5 bg-white/12 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'
            placeholder='Enter your Password'
            required
          />
        </div>

        <button type='submit' className='py-2.5 mt-2 text-xl font-medium bg-gradient-to-r from-purple-400 to-violet-600 rounded-lg
        cursor-pointer' >
          Login
        </button>

        <div className='text-center text-gray-400'>
          <p className='text-md'>
            Don't have an account?{' '}
            <Link to="/signup" className='font-medium text-violet-500 cursor-pointer'>
              Create
            </Link>
          </p>
        </div>

      </form >
    </div >
  )
}

export default Login