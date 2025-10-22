'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { School, X, ChevronLeft, ChevronRight, LogOut, Crown } from 'lucide-react'

export default function Sidebar({
  user = {},
  school = {},
  sidebarOpen = false,
  sidebarCollapsed = false,
  activeTab = '',
  notifications = [],
  navigationItems = [],
  onToggleSidebar = () => {},
  onToggleCollapse = () => {},
  onTabChange = () => {},
  onLogout = () => {},
}) {
  return (
    <div
      className={`
        fixed inset-y-0 left-0 z-50 
        ${sidebarCollapsed ? 'w-16' : 'w-64'} 
        bg-white shadow-lg border-r border-gray-200
        transform transition-all duration-300 ease-in-out 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <div className="flex items-center">
          {school?.logo ? (
            <img
              src={school.logo}
              alt="School Logo"
              className="h-8 w-8 mr-3 rounded"
            />
          ) : (
            <School className="h-8 w-8 text-blue-600 mr-3" />
          )}
          {!sidebarCollapsed && (
            <div>
              <span className="text-lg font-bold text-gray-900 block leading-tight">
                {school?.name || 'EduManage'}
              </span>
              {user?.role === 'developer' && (
                <span className="text-xs text-blue-600 font-medium">
                  Master System
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleCollapse}
            className="hidden lg:block text-gray-400 hover:text-gray-600 p-1 rounded"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={onToggleSidebar}
            className="lg:hidden text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {Array.isArray(navigationItems) && navigationItems.length > 0 ? (
          navigationItems.map((item) => {
            if (!item || !item.id) return null
            const Icon = item.icon || School // fallback icon
            const unreadCount = notifications?.filter((n) => !n.read)?.length || 0

            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id)
                  onToggleSidebar()
                }}
                className={`w-full flex items-center px-3 py-2.5 text-left text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={sidebarCollapsed ? item.label : ''}
              >
                <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.id === 'notifications' && unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="ml-2 text-xs px-1.5 py-0.5"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </>
                )}
              </button>
            )
          })
        ) : (
          <p className="text-sm text-gray-400 px-3">No navigation items</p>
        )}
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center mb-3">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || 'User'}
              </p>
              <div className="flex items-center space-x-1">
                <Badge variant="secondary" className="text-xs capitalize">
                  {user?.role === 'school_admin' ? 'Admin' : user?.role || 'User'}
                </Badge>
                {user?.role === 'developer' && (
                  <Crown className="h-3 w-3 text-yellow-500" />
                )}
              </div>
            </div>
          )}
        </div>

        <Button
          onClick={onLogout}
          variant="outline"
          size="sm"
          className={`${sidebarCollapsed ? 'w-10 h-10 p-0' : 'w-full'} justify-center`}
          title={sidebarCollapsed ? 'Logout' : ''}
        >
          <LogOut className="h-4 w-4" />
          {!sidebarCollapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </div>
  )
}
