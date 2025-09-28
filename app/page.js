'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { 
  Users, 
  UserCheck, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Settings, 
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  School,
  Menu,
  X,
  LogOut,
  Home,
  BarChart3,
  Building2,
  Crown,
  Upload,
  UserPlus,
  Users2,
  Shield
} from 'lucide-react'

function App() {
  // Core state
  const [user, setUser] = useState(null)
  const [school, setSchool] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Auth state
  const [authData, setAuthData] = useState({
    email: '',
    password: ''
  })
  
  // Dashboard data
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
  
  // School settings state
  const [schoolSettings, setSchoolSettings] = useState({
    schoolName: '',
    logo: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
    address: '',
    phoneNumber: '',
    email: ''
  })
  
  // Form states
  const [masterSchoolForm, setMasterSchoolForm] = useState({
    schoolName: '',
    adminName: '',
    adminEmail: '',
    adminPassword: ''
  })
  
  const [teacherForm, setTeacherForm] = useState({
    teacherData: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      address: '',
      qualification: '',
      experience: '',
      specialization: '',
      dateOfJoining: ''
    },
    credentials: {
      email: '',
      password: ''
    }
  })
  
  const [parentForm, setParentForm] = useState({
    parentData: {
      name: '',
      phoneNumber: '',
      address: ''
    },
    parentCredentials: {
      email: '',
      password: ''
    }
  })
  
  const [studentForm, setStudentForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    phoneNumber: '',
    parentId: '',
    classId: '',
    admissionNumber: '',
    emergencyContact: ''
  })
  
  const [classForm, setClassForm] = useState({
    name: '',
    description: '',
    capacity: '',
    academicYear: new Date().getFullYear().toString()
  })
  
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    description: '',
    credits: ''
  })
  
  const [assignmentForm, setAssignmentForm] = useState({
    teacherId: '',
    classId: '',
    subjectId: '',
    subjectName: '',
    className: ''
  })
  
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedClass, setSelectedClass] = useState('')
  const [attendanceList, setAttendanceList] = useState([])
  
  // Modal states
  const [showMasterSchoolModal, setShowMasterSchoolModal] = useState(false)
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [showTeacherModal, setShowTeacherModal] = useState(false)
  const [showParentModal, setShowParentModal] = useState(false)
  const [showClassModal, setShowClassModal] = useState(false)
  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  
  // Check authentication on load
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    const savedSchool = localStorage.getItem('school')
    
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      if (savedSchool) {
        setSchool(JSON.parse(savedSchool))
      }
    }
    setLoading(false)
  }, [])
  
  // Load data when user is authenticated
  useEffect(() => {
    if (user && token) {
      loadDashboardData()
      loadNotifications()
      if (user.role === 'school_admin') {
        loadSchoolSettings()
      }
    }
  }, [user, token])
  
  // API helper
  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`/api/${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          ...options.headers
        },
        ...options
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'API Error')
      }
      
      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      toast.error(error.message || 'Something went wrong')
      throw error
    }
  }
  
  // Authentication functions
  const handleAuth = async (e) => {
    e.preventDefault()
    try {
      const result = await apiCall('auth/login', {
        method: 'POST',
        body: JSON.stringify(authData)
      })
      
      setToken(result.token)
      setUser(result.user)
      setSchool(result.school)
      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result.user))
      if (result.school) {
        localStorage.setItem('school', JSON.stringify(result.school))
      }
      
      toast.success('Logged in successfully!')
    } catch (error) {
      // Error already handled in apiCall
    }
  }
  
  const handleLogout = () => {
    setUser(null)
    setSchool(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('school')
    toast.success('Logged out successfully')
  }
  
  // Data loading functions
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
        const [studentsData, teachersData, parentsData] = await Promise.all([
          apiCall('students'),
          apiCall('teachers'),
          apiCall('parents')
        ])
        setStudents(studentsData)
        setTeachers(teachersData)
        setParents(parentsData)
      } else if (user.role === 'teacher') {
        const assignmentsData = await apiCall('teacher-assignments')
        setAssignments(assignmentsData)
      } else if (user.role === 'parent') {
        const childrenData = await apiCall('parent/students')
        setStudents(childrenData)
      }
    } catch (error) {
      // Error already handled in apiCall
    }
  }
  
  const loadSchoolSettings = async () => {
    try {
      const settings = await apiCall('school/settings')
      setSchoolSettings({
        schoolName: settings.schoolName || school?.name || '',
        logo: settings.logo || '',
        primaryColor: settings.primaryColor || '#3b82f6',
        secondaryColor: settings.secondaryColor || '#64748b',
        address: settings.address || '',
        phoneNumber: settings.phoneNumber || '',
        email: settings.email || ''
      })
    } catch (error) {
      // Error already handled in apiCall
    }
  }
  
  const loadNotifications = async () => {
    try {
      const notificationsData = await apiCall('notifications')
      setNotifications(notificationsData)
    } catch (error) {
      // Error already handled in apiCall
    }
  }
  
  // Master/Developer functions
  const handleCreateSchool = async (e) => {
    e.preventDefault()
    try {
      await apiCall('master/schools', {
        method: 'POST',
        body: JSON.stringify(masterSchoolForm)
      })
      
      toast.success('School created successfully!')
      setShowMasterSchoolModal(false)
      setMasterSchoolForm({
        schoolName: '',
        adminName: '',
        adminEmail: '',
        adminPassword: ''
      })
      loadDashboardData()
    } catch (error) {
      // Error already handled in apiCall
    }
  }
  
  // School settings functions
  const handleSaveSettings = async (e) => {
    e.preventDefault()
    try {
      await apiCall('school/settings', {
        method: 'POST',
        body: JSON.stringify(schoolSettings)
      })
      
      toast.success('Settings saved successfully!')
      setShowSettingsModal(false)
      
      // Update local school data if name changed
      if (school && schoolSettings.schoolName !== school.name) {
        const updatedSchool = { ...school, name: schoolSettings.schoolName }
        setSchool(updatedSchool)
        localStorage.setItem('school', JSON.stringify(updatedSchool))
      }
    } catch (error) {
      // Error already handled in apiCall
    }
  }
  
  // CRUD functions - Updated for new multi-tenant structure
  const handleCreateTeacher = async (e) => {
    e.preventDefault()
    try {
      const result = await apiCall('teachers', {
        method: 'POST',
        body: JSON.stringify(teacherForm)
      })
      
      toast.success(`Teacher created successfully! Login: ${result.credentials.email} / ${result.credentials.tempPassword}`)
      setShowTeacherModal(false)
      setTeacherForm({
        teacherData: {
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          address: '',
          qualification: '',
          experience: '',
          specialization: '',
          dateOfJoining: ''
        },
        credentials: {
          email: '',
          password: ''
        }
      })
      loadDashboardData()
    } catch (error) {
      // Error already handled in apiCall
    }
  }
  
  const handleCreateParent = async (e) => {
    e.preventDefault()
    try {
      const result = await apiCall('parents', {
        method: 'POST',
        body: JSON.stringify(parentForm)
      })
      
      toast.success(`Parent account created successfully! Login: ${result.credentials.email} / ${result.credentials.tempPassword}`)
      setShowParentModal(false)
      setParentForm({
        parentData: {
          name: '',
          phoneNumber: '',
          address: ''
        },
        parentCredentials: {
          email: '',
          password: ''
        }
      })
      loadDashboardData()
    } catch (error) {
      // Error already handled in apiCall
    }
  }
  
  const handleCreateStudent = async (e) => {
    e.preventDefault()
    try {
      await apiCall('students', {
        method: 'POST',
        body: JSON.stringify(studentForm)
      })
      
      toast.success('Student created successfully!')
      setShowStudentModal(false)
      setStudentForm({
        firstName: '',
        lastName: '',
        email: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        phoneNumber: '',
        parentId: '',
        classId: '',
        admissionNumber: '',
        emergencyContact: ''
      })
      loadDashboardData()
    } catch (error) {
      // Error already handled in apiCall
    }
  }
  
  const handleCreateClass = async (e) => {
    e.preventDefault()
    try {
      await apiCall('classes', {
        method: 'POST',
        body: JSON.stringify(classForm)
      })
      
      toast.success('Class created successfully!')
      setShowClassModal(false)
      setClassForm({
        name: '',
        description: '',
        capacity: '',
        academicYear: new Date().getFullYear().toString()
      })
      loadDashboardData()
    } catch (error) {
      // Error already handled in apiCall
    }
  }
  
  const handleCreateSubject = async (e) => {
    e.preventDefault()
    try {
      await apiCall('subjects', {
        method: 'POST',
        body: JSON.stringify(subjectForm)
      })
      
      toast.success('Subject created successfully!')
      setShowSubjectModal(false)
      setSubjectForm({
        name: '',
        code: '',
        description: '',
        credits: ''
      })
      loadDashboardData()
    } catch (error) {
      // Error already handled in apiCall
    }
  }
  
  const handleCreateAssignment = async (e) => {
    e.preventDefault()
    try {
      const selectedSubject = subjects.find(s => s.id === assignmentForm.subjectId)
      const selectedClass = classes.find(c => c.id === assignmentForm.classId)
      
      await apiCall('teacher-assignments', {
        method: 'POST',
        body: JSON.stringify({
          ...assignmentForm,
          subjectName: selectedSubject?.name || '',
          className: selectedClass?.name || ''
        })
      })
      
      toast.success('Teacher assigned successfully!')
      setShowAssignmentModal(false)
      setAssignmentForm({
        teacherId: '',
        classId: '',
        subjectId: '',
        subjectName: '',
        className: ''
      })
      loadDashboardData()
    } catch (error) {
      // Error already handled in apiCall
    }
  }
  
  const loadAttendanceForClass = async () => {
    if (!selectedClass) return
    
    try {
      const classStudents = await apiCall(`students/by-class?classId=${selectedClass}`)
      const attendanceRecords = await apiCall(`attendance?classId=${selectedClass}&date=${attendanceDate}`)
      
      const attendanceMap = {}
      attendanceRecords.forEach(record => {
        attendanceMap[record.studentId] = record.status
      })
      
      const attendanceData = classStudents.map(student => ({
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        status: attendanceMap[student.id] || 'absent'
      }))
      
      setAttendanceList(attendanceData)
    } catch (error) {
      // Error already handled in apiCall
    }
  }
  
  const handleMarkAttendance = async () => {
    try {
      const attendanceData = attendanceList.map(item => ({
        studentId: item.studentId,
        classId: selectedClass,
        date: attendanceDate,
        status: item.status
      }))
      
      await apiCall('attendance/bulk', {
        method: 'POST',
        body: JSON.stringify({ attendanceList: attendanceData })
      })
      
      toast.success('Attendance marked successfully!')
      setShowAttendanceModal(false)
    } catch (error) {
      // Error already handled in apiCall
    }
  }
  
  const markNotificationAsRead = async (notificationId) => {
    try {
      await apiCall('notifications/mark-read', {
        method: 'POST',
        body: JSON.stringify({ notificationId })
      })
      
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      ))
    } catch (error) {
      // Error already handled in apiCall
    }
  }
  
  // Get role-based navigation items
  const getNavigationItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'notifications', label: 'Notifications', icon: Bell }
    ]
    
    if (user?.role === 'developer') {
      return [
        ...baseItems,
        { id: 'schools', label: 'Schools', icon: Building2 },
        { id: 'master-settings', label: 'Master Settings', icon: Settings }
      ]
    } else if (user?.role === 'school_admin') {
      return [
        ...baseItems,
        { id: 'students', label: 'Students', icon: Users },
        { id: 'teachers', label: 'Teachers', icon: UserCheck },
        { id: 'parents', label: 'Parents', icon: Users2 },
        { id: 'classes', label: 'Classes', icon: School },
        { id: 'subjects', label: 'Subjects', icon: BookOpen },
        { id: 'assignments', label: 'Assignments', icon: GraduationCap },
        { id: 'attendance', label: 'Attendance', icon: Calendar },
        { id: 'school-settings', label: 'School Settings', icon: Settings }
      ]
    } else if (user?.role === 'teacher') {
      return [
        ...baseItems,
        { id: 'my-assignments', label: 'My Assignments', icon: BookOpen },
        { id: 'attendance', label: 'Mark Attendance', icon: Calendar },
        { id: 'students', label: 'My Students', icon: Users }
      ]
    } else if (user?.role === 'parent') {
      return [
        ...baseItems,
        { id: 'my-children', label: 'My Children', icon: Users },
        { id: 'attendance', label: 'Attendance Records', icon: Calendar },
        { id: 'results', label: 'Results', icon: BarChart3 }
      ]
    }
    
    return baseItems
  }
  
  const [activeTab, setActiveTab] = useState('dashboard')
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <School className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <School className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold text-gray-900">EduManage Nigeria</CardTitle>
            <CardDescription>School Management System</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={authData.email}
                  onChange={(e) => setAuthData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={authData.password}
                  onChange={(e) => setAuthData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
            
            {/* Demo credentials helper */}
            <div className="mt-6 p-3 bg-gray-50 rounded-lg text-xs">
              <p className="font-medium text-gray-700 mb-2">Demo Credentials:</p>
              <p><strong>Developer:</strong> dev@system.com / dev123</p>
              <p><strong>School Admin:</strong> admin@school.com / admin123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - Fixed responsive positioning */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 
        w-64 bg-white shadow-lg border-r border-gray-200
        transform transition-transform duration-300 ease-in-out 
        lg:translate-x-0 lg:block
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            {school?.logo ? (
              <img src={school.logo} alt="School Logo" className="h-8 w-8 mr-3 rounded" />
            ) : (
              <School className="h-8 w-8 text-blue-600 mr-3" />
            )}
            <div>
              <span className="text-lg font-bold text-gray-900 block leading-tight">
                {school?.name || 'EduManage'}
              </span>
              {user.role === 'developer' && (
                <span className="text-xs text-blue-600 font-medium">Master System</span>
              )}
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {getNavigationItems().map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center px-3 py-2.5 text-left text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.id === 'notifications' && notifications.filter(n => !n.read).length > 0 && (
                  <Badge variant="destructive" className="ml-2 text-xs px-1.5 py-0.5">
                    {notifications.filter(n => !n.read).length}
                  </Badge>
                )}
              </button>
            )
          })}
        </nav>
        
        {/* User Profile Section */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center mb-3">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <div className="flex items-center space-x-1">
                <Badge variant="secondary" className="text-xs capitalize">
                  {user.role === 'school_admin' ? 'Admin' : user.role}
                </Badge>
                {user.role === 'developer' && (
                  <Crown className="h-3 w-3 text-yellow-500" />
                )}
              </div>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
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
            {user.role === 'school_admin' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettingsModal(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            )}
          </div>
        </div>
        
        {/* Content area - with proper scrolling */}
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {user.role === 'developer' && (
                <>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalSchools || 0}</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Schools</CardTitle>
                      <Shield className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.activeSchools || 0}</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalUsers || 0}</div>
                    </CardContent>
                  </Card>
                </>
              )}
              
              {user.role === 'school_admin' && (
                <>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalStudents || 0}</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalTeachers || 0}</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Parents</CardTitle>
                      <Users2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalParents || 0}</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                      <School className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalClasses || 0}</div>
                    </CardContent>
                  </Card>
                </>
              )}
              
              {user.role === 'teacher' && (
                <>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">My Assignments</CardTitle>
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.myAssignments || 0}</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">My Classes</CardTitle>
                      <School className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.myClasses || 0}</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Students in My Classes</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalStudentsInMyClasses || 0}</div>
                    </CardContent>
                  </Card>
                </>
              )}
              
              {user.role === 'parent' && (
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">My Children</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.myChildren || 0}</div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          {/* Master/Developer Schools Management */}
          {activeTab === 'schools' && user.role === 'developer' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Schools Management</h2>
                <Dialog open={showMasterSchoolModal} onOpenChange={setShowMasterSchoolModal}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create School
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New School</DialogTitle>
                      <DialogDescription>
                        Set up a new school with admin credentials.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSchool}>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="schoolName">School Name</Label>
                          <Input
                            id="schoolName"
                            value={masterSchoolForm.schoolName}
                            onChange={(e) => setMasterSchoolForm(prev => ({ ...prev, schoolName: e.target.value }))}
                            placeholder="Enter school name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="adminName">Admin Name</Label>
                          <Input
                            id="adminName"
                            value={masterSchoolForm.adminName}
                            onChange={(e) => setMasterSchoolForm(prev => ({ ...prev, adminName: e.target.value }))}
                            placeholder="Enter admin full name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="adminEmail">Admin Email</Label>
                          <Input
                            id="adminEmail"
                            type="email"
                            value={masterSchoolForm.adminEmail}
                            onChange={(e) => setMasterSchoolForm(prev => ({ ...prev, adminEmail: e.target.value }))}
                            placeholder="Enter admin email"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="adminPassword">Admin Password</Label>
                          <Input
                            id="adminPassword"
                            type="password"
                            value={masterSchoolForm.adminPassword}
                            onChange={(e) => setMasterSchoolForm(prev => ({ ...prev, adminPassword: e.target.value }))}
                            placeholder="Enter admin password"
                            required
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Create School</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schools.map((school) => (
                  <Card key={school.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {school.name}
                        <Badge variant={school.active ? "default" : "secondary"}>
                          {school.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Created: {new Date(school.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Admin ID:</span>
                          <span className="font-mono text-xs">{school.adminId}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* School Settings Modal */}
          <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>School Settings</DialogTitle>
                <DialogDescription>
                  Configure your school's information and appearance.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSaveSettings}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="schoolName">School Name</Label>
                      <Input
                        id="schoolName"
                        value={schoolSettings.schoolName}
                        onChange={(e) => setSchoolSettings(prev => ({ ...prev, schoolName: e.target.value }))}
                        placeholder="Enter school name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="schoolEmail">School Email</Label>
                      <Input
                        id="schoolEmail"
                        type="email"
                        value={schoolSettings.email}
                        onChange={(e) => setSchoolSettings(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter school email"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={schoolSettings.phoneNumber}
                      onChange={(e) => setSchoolSettings(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="Enter school phone number"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={schoolSettings.address}
                      onChange={(e) => setSchoolSettings(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter school address"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="logo">Logo URL</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="logo"
                        value={schoolSettings.logo}
                        onChange={(e) => setSchoolSettings(prev => ({ ...prev, logo: e.target.value }))}
                        placeholder="Enter logo URL"
                      />
                      <Button type="button" variant="outline">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <Input
                        id="primaryColor"
                        type="color"
                        value={schoolSettings.primaryColor}
                        onChange={(e) => setSchoolSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">Secondary Color</Label>
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={schoolSettings.secondaryColor}
                        onChange={(e) => setSchoolSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save Settings</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          {/* Teachers Management (School Admin) */}
          {activeTab === 'teachers' && user.role === 'school_admin' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Teachers Management</h2>
                <Dialog open={showTeacherModal} onOpenChange={setShowTeacherModal}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Teacher
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Create Teacher Account</DialogTitle>
                      <DialogDescription>
                        Fill in teacher information and create login credentials.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateTeacher}>
                      <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
                        <div className="space-y-4">
                          <h3 className="font-medium text-gray-900">Personal Information</h3>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="firstName">First Name</Label>
                              <Input
                                id="firstName"
                                value={teacherForm.teacherData.firstName}
                                onChange={(e) => setTeacherForm(prev => ({ 
                                  ...prev, 
                                  teacherData: { ...prev.teacherData, firstName: e.target.value }
                                }))}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="lastName">Last Name</Label>
                              <Input
                                id="lastName"
                                value={teacherForm.teacherData.lastName}
                                onChange={(e) => setTeacherForm(prev => ({ 
                                  ...prev, 
                                  teacherData: { ...prev.teacherData, lastName: e.target.value }
                                }))}
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="teacherPhone">Phone Number</Label>
                              <Input
                                id="teacherPhone"
                                value={teacherForm.teacherData.phoneNumber}
                                onChange={(e) => setTeacherForm(prev => ({ 
                                  ...prev, 
                                  teacherData: { ...prev.teacherData, phoneNumber: e.target.value }
                                }))}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="qualification">Qualification</Label>
                              <Input
                                id="qualification"
                                value={teacherForm.teacherData.qualification}
                                onChange={(e) => setTeacherForm(prev => ({ 
                                  ...prev, 
                                  teacherData: { ...prev.teacherData, qualification: e.target.value }
                                }))}
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="teacherAddress">Address</Label>
                            <Textarea
                              id="teacherAddress"
                              value={teacherForm.teacherData.address}
                              onChange={(e) => setTeacherForm(prev => ({ 
                                ...prev, 
                                teacherData: { ...prev.teacherData, address: e.target.value }
                              }))}
                            />
                          </div>
                        </div>
                        
                        <div className="border-t pt-4 space-y-4">
                          <h3 className="font-medium text-gray-900">Login Credentials</h3>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="teacherEmail">Email</Label>
                              <Input
                                id="teacherEmail"
                                type="email"
                                value={teacherForm.credentials.email}
                                onChange={(e) => setTeacherForm(prev => ({ 
                                  ...prev, 
                                  credentials: { ...prev.credentials, email: e.target.value }
                                }))}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="teacherPassword">Temporary Password</Label>
                              <Input
                                id="teacherPassword"
                                type="password"
                                value={teacherForm.credentials.password}
                                onChange={(e) => setTeacherForm(prev => ({ 
                                  ...prev, 
                                  credentials: { ...prev.credentials, password: e.target.value }
                                }))}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Create Teacher Account</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Qualification</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teachers.map((teacher) => (
                        <TableRow key={teacher.id}>
                          <TableCell>{teacher.firstName} {teacher.lastName}</TableCell>
                          <TableCell>{teacher.email}</TableCell>
                          <TableCell>{teacher.phoneNumber}</TableCell>
                          <TableCell>{teacher.qualification}</TableCell>
                          <TableCell>
                            <Badge variant={teacher.active ? "default" : "secondary"}>
                              {teacher.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Parents Management (School Admin) */}
          {activeTab === 'parents' && user.role === 'school_admin' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Parents Management</h2>
                <Dialog open={showParentModal} onOpenChange={setShowParentModal}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Parent
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Parent Account</DialogTitle>
                      <DialogDescription>
                        Create a parent account with login credentials.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateParent}>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-4">
                          <h3 className="font-medium text-gray-900">Parent Information</h3>
                          
                          <div className="space-y-2">
                            <Label htmlFor="parentName">Full Name</Label>
                            <Input
                              id="parentName"
                              value={parentForm.parentData.name}
                              onChange={(e) => setParentForm(prev => ({ 
                                ...prev, 
                                parentData: { ...prev.parentData, name: e.target.value }
                              }))}
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="parentPhone">Phone Number</Label>
                            <Input
                              id="parentPhone"
                              value={parentForm.parentData.phoneNumber}
                              onChange={(e) => setParentForm(prev => ({ 
                                ...prev, 
                                parentData: { ...prev.parentData, phoneNumber: e.target.value }
                              }))}
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="parentAddress">Address</Label>
                            <Textarea
                              id="parentAddress"
                              value={parentForm.parentData.address}
                              onChange={(e) => setParentForm(prev => ({ 
                                ...prev, 
                                parentData: { ...prev.parentData, address: e.target.value }
                              }))}
                            />
                          </div>
                        </div>
                        
                        <div className="border-t pt-4 space-y-4">
                          <h3 className="font-medium text-gray-900">Login Credentials</h3>
                          
                          <div className="space-y-2">
                            <Label htmlFor="parentEmail">Email</Label>
                            <Input
                              id="parentEmail"
                              type="email"
                              value={parentForm.parentCredentials.email}
                              onChange={(e) => setParentForm(prev => ({ 
                                ...prev, 
                                parentCredentials: { ...prev.parentCredentials, email: e.target.value }
                              }))}
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="parentPassword">Temporary Password</Label>
                            <Input
                              id="parentPassword"
                              type="password"
                              value={parentForm.parentCredentials.password}
                              onChange={(e) => setParentForm(prev => ({ 
                                ...prev, 
                                parentCredentials: { ...prev.parentCredentials, password: e.target.value }
                              }))}
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Create Parent Account</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parents.map((parent) => (
                        <TableRow key={parent.id}>
                          <TableCell>{parent.name}</TableCell>
                          <TableCell>{parent.email}</TableCell>
                          <TableCell>{parent.phoneNumber}</TableCell>
                          <TableCell>
                            <Badge variant={parent.active ? "default" : "secondary"}>
                              {parent.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(parent.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h2>
              
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <Card key={notification.id} className={`cursor-pointer transition-colors ${
                    notification.read ? 'bg-gray-50' : 'border-blue-200 bg-blue-50/30'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium text-gray-900">{notification.title}</h3>
                            {!notification.read && (
                              <Badge variant="default" className="text-xs px-2 py-1">New</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            Mark as Read
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {notifications.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No notifications yet.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
          
          {/* Add more content areas for other tabs as needed */}
          {activeTab === 'students' && user.role === 'school_admin' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Students Management</h2>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </div>
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-600">Students management interface will be here.</p>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Placeholder for other tabs */}
          {!['dashboard', 'notifications', 'schools', 'teachers', 'parents', 'students'].includes(activeTab) && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600">This section is under development.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default App