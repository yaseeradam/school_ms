import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Menu, Settings, Bot } from 'lucide-react'
import NotificationCenter from '@/components/notifications/NotificationCenter'
import CalculatorApp from '@/components/calculator/calculator'

export default function TopBar({ 
  user, 
  school, 
  activeTab, 
  onToggleSidebar, 
  onSettingsClick 
}) {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden text-gray-400 hover:text-gray-600 mr-4 p-2"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <div className="flex items-center space-x-3">
          <h1 className="text-lg font-semibold text-gray-900 capitalize">
            {activeTab.replace('-', ' ')}
          </h1>
          {user.role !== 'developer' && school && (
            <Badge variant="outline" className="text-xs">
              {school.name}
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <NotificationCenter
          currentUser={user}
          isOpen={false}
          onToggle={() => {}}
        />
        <button
          onClick={() => document.querySelector('[data-puter-trigger]')?.click()}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="AI Assistant"
        >
          <Bot className="h-5 w-5 text-gray-600" />
        </button>
        <CalculatorApp />
        {user.role === 'school_admin' && activeTab !== 'school-settings' && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSettingsClick}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        )}
      </div>
    </div>
  )
}
