import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Package, ArrowLeftRight, MapPin, Tag,
  ClipboardList, Users, BarChart3, ChevronRight, ChevronLeft,
  GraduationCap, X, Menu
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'لوحة التحكم' },
  { path: '/items', icon: Package, label: 'الوسائل والمخزون' },
  { path: '/transactions', icon: ArrowLeftRight, label: 'العمليات' },
  { path: '/inventory', icon: ClipboardList, label: 'الجرد' },
  { path: '/locations', icon: MapPin, label: 'المواقع' },
  { path: '/categories', icon: Tag, label: 'الفئات' },
  { path: '/reports', icon: BarChart3, label: 'التقارير' },
]

const adminItems = [
  { path: '/users', icon: Users, label: 'المستخدمون' },
]

export default function Sidebar({ open, onClose }) {
  const { isAdmin } = useAuth()
  const location = useLocation()

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
      isActive
        ? 'bg-blue-600 text-white shadow-sm'
        : 'text-slate-300 hover:bg-white/10 hover:text-white'
    }`

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 right-0 h-full w-64 bg-navy-900 z-40 flex flex-col transition-transform duration-300
        ${open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        lg:static lg:translate-x-0
      `} style={{ backgroundColor: '#0f1f35' }}>

        {/* Header */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                <GraduationCap size={20} className="text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold leading-tight">إدارة الوسائل</p>
                <p className="text-slate-400 text-xs">كلية الحقوق - برج بوعريريج</p>
              </div>
            </div>
            <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-slate-500 text-xs font-medium px-4 mb-2 uppercase tracking-wider">القائمة الرئيسية</p>
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path} end={item.path === '/'} className={linkClass} onClick={onClose}>
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <p className="text-slate-500 text-xs font-medium px-4 mt-4 mb-2 uppercase tracking-wider">الإدارة</p>
              {adminItems.map(item => (
                <NavLink key={item.path} to={item.path} className={linkClass} onClick={onClose}>
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <p className="text-slate-500 text-xs text-center">جامعة محمد البشير الإبراهيمي</p>
          <p className="text-slate-600 text-xs text-center">برج بوعريريج</p>
        </div>
      </aside>
    </>
  )
}
