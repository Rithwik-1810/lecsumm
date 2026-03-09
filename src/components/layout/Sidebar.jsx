import React from 'react'
import { NavLink } from 'react-router-dom'
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
  ChevronRightIcon
} from '@heroicons/react/24/outline'

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
            <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
            
            <motion.div
              initial={{ x: -100 }}
              animate={{ x: 0 }}
              exit={{ x: -100 }}
              className="relative flex w-72 max-w-xs flex-1 flex-col bg-white"
            >
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none"
                  onClick={() => setSidebarOpen(false)}
                >
                  <XMarkIcon className="h-6 w-6 text-white" />
                </button>
              </div>
              
              <SidebarContent collapsed={false} isMobile={true} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar - collapsible */}
      <div 
        className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block lg:bg-white lg:border-r lg:border-gray-200 transition-all duration-300 ${
          collapsed ? 'lg:w-20' : 'lg:w-64'
        }`}
      >
        <div className="flex h-full flex-col bg-white relative">
          {/* Toggle Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-20 z-50 bg-white border border-gray-200 rounded-full p-1.5 shadow-md hover:shadow-lg transition hover:bg-gray-50"
          >
            {collapsed ? (
              <ChevronRightIcon className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronLeftIcon className="h-4 w-4 text-gray-600" />
            )}
          </button>
          
          <SidebarContent collapsed={collapsed} isMobile={false} />
        </div>
      </div>
    </>
  )
}

const SidebarContent = ({ collapsed, isMobile }) => {
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-white py-6">
      {/* Logo */}
      <div className={`px-4 pb-6 ${collapsed ? 'text-center' : 'px-6'}`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2'}`}>
          <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xl">AI</span>
          </div>
          {!collapsed && (
            <span className="text-xl font-bold text-gray-900">LectureSumm</span>
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
              `group flex items-center ${collapsed ? 'justify-center' : 'gap-3'} rounded-lg px-3 py-3 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-teal-50 hover:text-blue-600'
              }`
            }
            title={collapsed ? item.name : ''}
          >
            {({ isActive }) => (
              <>
                <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'}`} />
                {!collapsed && <span>{item.name}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      
      {/* Pro Tip Box - only show when expanded */}
      {!collapsed && !isMobile && (
        <div className="px-4 mt-6">
          <div className="bg-gradient-to-r from-blue-600 to-teal-500 rounded-lg p-4 text-white">
            <h4 className="font-semibold mb-2 flex items-center gap-1">
              <span className="text-lg">💡</span> Pro Tip
            </h4>
            <p className="text-sm opacity-90">
              Upload your lecture and get AI-powered summaries in minutes!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar