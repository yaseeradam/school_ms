'use client'

import { useState, useEffect } from 'react'
import { School } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useApi } from '@/hooks/useApi'
import { getNavigationItems } from '@/lib/navigation'
import LoginPage from '@/components/layout/LoginPage'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import PuterAI from '@/components/ai/PuterAI'

// Import page components (you'll create these next)
import DashboardPage from '@/components/pages/DashboardPage'
import MessagesPage from '@/components/chat/MessagesPage'
// ... other page imports

export default function App() {
  const { user, school, token, loading, login, logout, setSchool } = useAuth()
  const { apiCall } = useApi(token)
  
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [authData, setAuthData] = useState({ email: '', password: '' })
  
  // Data states
  const [stats, setStats] = useState({})
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [parents, setParents] = useState([])
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [assignments, setAssignments] = useState([])
  const [attendance, setAttendance] = useState([])
  const [notifications, setNotifications] = useState([])
  const [schools, setSchools] = useState([])

  const handleAuth = async (e) => {
    e.preventDefault()
    await login(authData.email, authData.password)
  }

  const loadDashboardData = async () => {
    try {
      const [statsData, classesData, subjectsData] = await Promise.all([
        apiCall('dashboard/stats'),
        user.role !== 'developer' ? apiCall('classes') : Promise.resolve([]),
        user.role !== 'developer' ? apiCall('subjects') : Promise.resolve([])
      ])
      
      setStats(statsData)
      setClasses(classesData)
      setSubjects(subjectsData)
      
      if (user.role === 'developer') {
        const schoolsData = await apiCall('master/schools')
        setSchools(schoolsData)
      } else if (user.role === 'school_admin') {
        const [studentsData, teachersData, parentsData, assignmentsData] = await Promise.all([
          apiCall('students'),
          apiCall('teachers'),
          apiCall('parents'),
          apiCall('teacher-assignments')
        ])
        setStudents(studentsData)
        setTeachers(teachersData)
        setParents(parentsData)
        setAssignments(assignmentsData)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  useEffect(() => {
    if (user && token) {
      loadDashboardData()
    }
  }, [user, token])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <School className="h-8 w-8 text-blue-600 mx-auto mb-4 absolute top-4 left-1/2 transform -translate-x-1/2" />
          </div>
          <p className="text-gray-600">Loading EduManage...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage authData={authData} onAuthDataChange={setAuthData} onSubmit={handleAuth} />
  }

  const navigationItems = getNavigationItems(user.role)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <Sidebar
        user={user}
        school={school}
        sidebarOpen={sidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        activeTab={activeTab}
        notifications={notifications}
        navigationItems={navigationItems}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onTabChange={setActiveTab}
        onLogout={logout}
      />
      
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        <TopBar
          user={user}
          school={school}
          activeTab={activeTab}
          onToggleSidebar={() => setSidebarOpen(true)}
          onSettingsClick={() => setActiveTab('school-settings')}
        />
        
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          {activeTab === 'dashboard' && (
            <DashboardPage 
              user={user} 
              stats={stats} 
              students={students}
              teachers={teachers}
              classes={classes}
              subjects={subjects}
              attendance={attendance}
              notifications={notifications}
            />
          )}
          
          {activeTab === 'messages' && (
            <MessagesPage currentUser={user} onBack={() => setActiveTab('dashboard')} />
          )}
          
          {/* Add other page components here */}
        </div>
      </div>

      <div data-puter-ai>
        <PuterAI />
      </div>
    </div>
  )
}
