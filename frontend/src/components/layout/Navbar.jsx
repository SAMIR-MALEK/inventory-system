import { Menu, Bell, LogOut, User, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Navbar({ onMenuClick }) {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [dropOpen, setDropOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
      {/* Left: hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
      >
        <Menu size={20} />
      </button>

      {/* Page title placeholder */}
      <div className="hidden lg:flex items-center gap-2 text-slate-400 text-sm">
        <span>نظام إدارة الوسائل والتسيير التجاري</span>
      </div>

      {/* Right: user menu */}
      <div className="flex items-center gap-3 mr-auto lg:mr-0">
        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropOpen(!dropOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
              {user?.name?.[0] || 'م'}
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-700 leading-tight">{user?.name}</p>
              <p className="text-xs text-slate-400">{isAdmin ? 'مدير النظام' : 'مستخدم'}</p>
            </div>
            <ChevronDown size={16} className="text-slate-400" />
          </button>

          {dropOpen && (
            <div className="absolute left-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-700">{user?.name}</p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
              >
                <LogOut size={16} />
                تسجيل الخروج
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
