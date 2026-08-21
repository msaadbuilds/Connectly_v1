import React, { useContext } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import { Toaster } from 'react-hot-toast'
import { motion } from 'framer-motion'
import Home from "./pages/Home"
import Signup from "./pages/Signup"
import Verify from "./pages/Verify"
import Login from "./pages/Login"
import Profile from "./pages/Profile"
import { AuthContext } from '../context/Authcontext'
import AnimatedBackground from './components/AnimatedBackground'
import { LogoMark } from './components/Logo'


function App() {
  const { authUser, isCheckingAuth } = useContext(AuthContext)

  return (
    <div>
      <AnimatedBackground />
      <Toaster />

      {isCheckingAuth ? (
        <div className="h-dvh w-full flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <LogoMark size={72} />
          </motion.div>
        </div>
      ) : (
        <Routes>
          <Route path="/" element={authUser ? <Home /> : <Navigate to="/login" />}  /> 
          <Route path="/login" element={!authUser ? <Login /> : <Navigate to="/" />} />
          <Route path="/signup" element={!authUser ? <Signup /> : <Navigate to="/" />} />
          <Route path="/verify" element={!authUser ? <Verify /> : <Navigate to="/" />} />
          <Route path="/profile" element={authUser ? <Profile /> : <Navigate to="/login"/>} />
        </Routes>
      )}
    </div>
  )
}

export default App
