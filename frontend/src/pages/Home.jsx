import React, { useContext, useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import ChatContainer from '../components/ChatContainer.jsx'
import RightSidebar from '../components/RightSidebar.jsx'
import { ChatContext } from '../../context/Chatcontext.jsx'


const Home = () => {

  const { selectedUser, showUserInfo } = useContext(ChatContext)

  // Mobile browsers resize the visual viewport (not the layout viewport)
  // when the address bar or on-screen keyboard shows/hides - e.g. right
  // after sending a message and the keyboard closes. Pure CSS `dvh` still
  // recalculates during that transition and browsers can visibly "jump"
  // the page while it happens. Driving the height from JS + React state
  // instead keeps it fully under our control and eliminates that jump.
  const getViewportHeight = () =>
    typeof window === 'undefined'
      ? 0
      : (window.visualViewport ? window.visualViewport.height : window.innerHeight)

  const [viewportHeight, setViewportHeight] = useState(getViewportHeight)

  useEffect(() => {
    const updateHeight = () => setViewportHeight(getViewportHeight())
    updateHeight()

    window.visualViewport?.addEventListener('resize', updateHeight)
    window.addEventListener('resize', updateHeight)
    window.addEventListener('orientationchange', updateHeight)

    return () => {
      window.visualViewport?.removeEventListener('resize', updateHeight)
      window.removeEventListener('resize', updateHeight)
      window.removeEventListener('orientationchange', updateHeight)
    }
  }, [])

  return (
    <div
      className='w-full h-dvh overflow-hidden'
      style={viewportHeight ? { height: viewportHeight } : undefined}
    >

      <div className={`backdrop-blur-xl overflow-hidden h-full grid
       grid-cols-1 relative ${selectedUser && showUserInfo ? 'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]'
          : 'md:grid-cols-[3fr_7fr]'}`}>

        <Sidebar />
        <ChatContainer />
        <RightSidebar />

      </div>
    </div>
  ) 
}

export default Home;