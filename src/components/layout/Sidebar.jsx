import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HomeIcon, 
  CloudArrowUpIcon, 
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  BookmarkIcon,
  UserCircleIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../hooks/useAuth'
import SignOutModal from '../common/SignOutModal'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Upload Lecture', href: '/upload', icon: CloudArrowUpIcon },
  { name: 'My Summaries', href: '/summaries', icon: DocumentTextIcon },
  { name: 'Tasks & Deadlines', href: '/tasks', icon: ClipboardDocumentListIcon },
  { name: 'Saved Notes', href: '/saved', icon: BookmarkIcon },
  { name: 'Profile', href: '/profile', icon: UserCircleIcon },
]

const Sidebar = ({ sidebarOpen, setSidebarOpen, collapsed, setCollapsed }) => {
  return (
    <>
      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex lg:hidden"
          >
            <div className="fixed inset-0 bg-white dark:bg-surface-900/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            
            <motion.div
              initial={{ x: -100 }}
              animate={{ x: 0 }}
              exit={{ x: -100 }}
              className="relative flex w-72 max-w-xs flex-1 flex-col bg-white shadow-2xl"
            >
              <div className="absolute top-0 right-0 -mr-12 pt-4">
                <button
                  type="button"
                  className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 dark:bg-surface-800/50 hover:bg-slate-200 dark:bg-surface-800 focus:outline-none backdrop-blur-md transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <XMarkIcon className="h-6 w-6 text-slate-900 dark:text-white" />
                </button>
              </div>
              
              <SidebarContent collapsed={false} isMobile={true} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar - collapsible */}
      <div 
        className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block bg-white dark:bg-[#0B0C10]/95 backdrop-blur-3xl border-r border-slate-200 dark:border-white/10 shadow-lg dark:shadow-[4px_0_24px_rgba(0,0,0,0.5)] transition-all duration-300 ease-in-out ${
          collapsed ? 'lg:w-20' : 'lg:w-64'
        }`}
      >
        <div className="flex h-full flex-col relative w-full">
          {/* Toggle Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-20 z-50 bg-white dark:bg-[#1A1C23] border border-slate-200 dark:border-white/10 rounded-full p-2 shadow-md dark:shadow-glow-brand hover:scale-110 transition-all duration-300 text-slate-800 dark:text-white/90 hover:text-brand-400"
          >
            {collapsed ? (
              <ChevronRightIcon className="h-4 w-4" />
            ) : (
              <ChevronLeftIcon className="h-4 w-4" />
            )}
          </button>
          
          <SidebarContent collapsed={collapsed} isMobile={false} />
        </div>
      </div>
    </>
  )
}

const SidebarContent = ({ collapsed, isMobile }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showSignOut, setShowSignOut] = useState(false);

  const handleLogout = () => {
    setShowSignOut(false);
    logout();
    navigate('/');
  };

  return (
    <>
      <div className="flex h-full flex-col overflow-y-auto py-6">
        {/* Logo */}
        <div className={`px-4 pb-6 ${collapsed ? 'text-center' : 'px-6'}`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="h-8 w-8 stripe-gradient-bg rounded-lg flex items-center justify-center flex-shrink-0 shadow-glow-brand">
              <span className="text-slate-900 dark:text-white font-bold text-sm font-display">LS</span>
            </div>
            {!collapsed && (
              <span className="text-lg font-bold text-slate-900 dark:text-white font-display tracking-tight">LectureSumm</span>
            )}
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-500/10 text-brand-400 shadow-glass-inset border border-brand-500/20'
                    : 'text-slate-800 dark:text-white/90 hover:bg-slate-100 dark:bg-white/5 hover:text-slate-900 dark:text-white border border-transparent'
                }`
              }
              title={collapsed ? item.name : ''}
            >
              {({ isActive }) => (
                <>
                  <div className={`flex items-center justify-center transition-colors ${isActive ? 'text-brand-400' : 'text-slate-800 dark:text-white/90 group-hover:text-brand-300'}`}>
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                  </div>
                  {!collapsed && <span>{item.name}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        
        <div className="mt-auto px-4 space-y-4 pt-8">
          {/* Pro Tip Box - only show when expanded */}
          {!collapsed && !isMobile && (
            <div className="bg-slate-100 dark:bg-white/5 rounded-xl p-4 text-slate-800 dark:text-white/90 border border-slate-200 dark:border-white/10 shadow-glass-inset relative overflow-hidden group hover:border-brand-500/30 transition-colors">
              <h4 className="font-bold text-sm mb-1 flex items-center gap-1.5 text-slate-900 dark:text-white">
                <span className="text-brand-400">✨</span> Tip
              </h4>
              <p className="text-xs text-slate-800 dark:text-white/90 leading-relaxed font-medium">
                You can upload audio in multiple languages for automatic translation and summarization.
              </p>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={() => setShowSignOut(true)}
            className={`w-full group flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 border border-transparent hover:border-rose-500/20`}
            title={collapsed ? 'Sign Out' : ''}
          >
            <div className="flex items-center justify-center transition-colors text-rose-500 group-hover:text-rose-400">
              <ArrowRightOnRectangleIcon className="h-5 w-5 flex-shrink-0" />
            </div>
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>

      <SignOutModal
        isOpen={showSignOut}
        onCancel={() => setShowSignOut(false)}
        onConfirm={handleLogout}
      />
    </>
  )
}

export default Sidebar