import React, { useState } from 'react'
import { Bars3Icon, ArrowRightOnRectangleIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import SignOutModal from '../common/SignOutModal'

const Header = ({ setSidebarOpen }) => {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [showSignOut, setShowSignOut] = useState(false)

  const handleLogout = () => {
    setShowSignOut(false)
    logout()
    navigate('/')
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-x-4 bg-white/80 dark:bg-[#0B0C10]/80 backdrop-blur-3xl border-b border-slate-200 dark:border-white/10 px-4 sm:gap-x-6 sm:px-6 lg:px-8 mb-6 shadow-sm dark:shadow-[0_4px_24px_rgba(0,0,0,0.5)] transition-all duration-300">
        {/* Mobile menu button */}
        <button
          type="button"
          className="-m-2.5 p-2.5 text-slate-800 dark:text-white/90 hover:text-slate-900 dark:text-white transition-colors lg:hidden rounded-lg hover:bg-slate-100 dark:bg-white/5"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon className="h-6 w-6" />
        </button>

        <div className="flex flex-1 items-center justify-end">
          <div className="flex items-center gap-2">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 mr-2 text-slate-800 dark:text-white/90 hover:text-brand-400 dark:text-white/90 dark:hover:text-brand-400 hover:bg-slate-100 dark:bg-white/5 rounded-full transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? (
                <SunIcon className="w-5 h-5 text-amber-400" />
              ) : (
                <MoonIcon className="w-5 h-5 text-indigo-400" />
              )}
            </button>

            {/* Profile avatar — navigates to /profile on click */}
            <div
              onClick={() => navigate('/profile')}
              className="flex items-center gap-3 cursor-pointer p-1.5 rounded-full hover:bg-slate-100 dark:bg-white/5 transition-colors group"
            >
              <div className="flex flex-col items-end mr-1 hidden sm:flex">
                <span className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                  {user?.name || 'Guest'}
                </span>
                <span className="text-[10px] font-semibold text-brand-400 uppercase tracking-widest mt-1">
                  Online
                </span>
              </div>
              <div className="h-9 w-9 rounded-full stripe-gradient-bg border border-slate-300 dark:border-white/20 flex items-center justify-center text-slate-900 dark:text-white font-bold overflow-hidden shadow-glow-brand group-hover:scale-105 transition-transform">
                {user?.name?.charAt(0).toUpperCase() || 'G'}
              </div>
            </div>
            
            <div className="w-[1px] h-6 bg-slate-200 dark:bg-white/10 mx-2 hidden sm:block"></div>
            
            <button 
              onClick={() => setShowSignOut(true)}
              className="p-2 text-slate-800 dark:text-white/90 hover:text-rose-400 hover:bg-slate-100 dark:bg-white/5 rounded-full transition-colors"
              title="Sign Out"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <SignOutModal
        isOpen={showSignOut}
        onCancel={() => setShowSignOut(false)}
        onConfirm={handleLogout}
      />
    </>
  )
}

export default Header