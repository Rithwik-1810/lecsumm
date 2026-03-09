import React from 'react'
import { Bars3Icon } from '@heroicons/react/24/outline'
import { useAuth } from '../../hooks/useAuth'

const Header = ({ setSidebarOpen }) => {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      <div className="flex flex-1 items-center justify-end">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">
            {user?.name || 'Student'}
          </span>
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-teal-500 flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0) || 'S'}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header