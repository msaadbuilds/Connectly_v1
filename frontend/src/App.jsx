import React, { useContext } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import { Toaster } from 'react-hot-toast'
import Home from "./pages/Home"
import Signup from "./pages/Signup"
import Verify from "./pages/Verify"
import Login from "./pages/Login"
import Profile from "./pages/Profile"
import { AuthContext } from '../context/Authcontext'


function App() {
  const { authUser} = useContext(AuthContext)

  return (
    <div className="bg-[url('/bgImage.svg')] bg-contain">
      <Toaster />

      <Routes>
        <Route path="/" element={authUser ? <Home /> : <Navigate to="/login" />}  /> 
        <Route path="/login" element={!authUser ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!authUser ? <Signup /> : <Navigate to="/" />} />
        <Route path="/verify" element={!authUser ? <Verify /> : <Navigate to="/" />} />
        <Route path="/profile" element={authUser ? <Profile /> : <Navigate to="/login"/>} />
      </Routes>
    </div>
  )
}

export default App
