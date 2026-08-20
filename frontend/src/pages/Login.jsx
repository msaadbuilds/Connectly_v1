import React, { useContext, useState } from 'react'
import { AuthContext } from '../../context/Authcontext'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'



const Login = () => {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login } = useContext(AuthContext)

  const onSubmitHandler = (event) => {

    event.preventDefault()
    login({ email, password })

  }

  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-10 sm:justify-evenly
    max-sm:flex-col backdrop-blur-xl p-4'>

      <Logo size="xl" stacked withTagline />

      <form onSubmit={onSubmitHandler} className="border border-white/10 bg-white/5 backdrop-blur-xl
       text-white p-6 flex flex-col rounded-2xl shadow-2xl shadow-black/30 space-y-5 w-full max-w-sm sm:max-w-md" >

        <h1 className='font-semibold text-3xl flex justify-between items-center'>
          Welcome Back!
        </h1>

        <div className='flex flex-col'>
          <label className='mb-1 text-sm text-gray-300' htmlFor="Email">Email</label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
            id='Email'
            className='p-2.5 bg-white/8 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition'
            placeholder='Enter your Email'
            required
          />
        </div>
        <div className='flex flex-col'>
          <label className='mb-1 text-sm text-gray-300' htmlFor="pass">Password</label>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type="password"
            id='pass'
            className='p-2.5 bg-white/8 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition'
            placeholder='Enter your Password'
            required
          />
        </div>

        <button type='submit' className='py-2.5 mt-2 text-xl font-medium bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500
        rounded-xl cursor-pointer hover:brightness-110 active:scale-[0.99] transition shadow-lg shadow-violet-900/30' >
          Login
        </button>

        <div className='text-center text-gray-400'>
          <p className='text-md'>
            Don't have an account?{' '}
            <Link to="/signup" className='font-medium text-violet-400 hover:text-violet-300 cursor-pointer transition-colors'>
              Create
            </Link>
          </p>
        </div>

      </form >
    </div >
  )
}

export default Login