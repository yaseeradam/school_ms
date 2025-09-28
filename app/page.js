'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarInitials } from '@/components/ui/avatar'
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
  ChevronDown,
  Menu,
  X,
  LogOut,
  Home,
  BarChart3,
  FileText,
  Clock
} from 'lucide-react'

function App() {
  // Core state
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Auth state
  const [authMode, setAuthMode] = useState('login')
  const [authData, setAuthData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'parent',
    phoneNumber: ''
  })
  
  // Dashboard data
  const [stats, setStats] = useState({})
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [assignments, setAssignments] = useState([])
  const [attendance, setAttendance] = useState([])
  const [notifications, setNotifications] = useState([])
  
  // Form states
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
  
  const [teacherForm, setTeacherForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    qualification: '',
    experience: '',
    specialization: '',
    dateOfJoining: ''
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
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [showTeacherModal, setShowTeacherModal] = useState(false)
  const [showClassModal, setShowClassModal] = useState(false)
  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  
  // Check authentication on load
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])
  
  // Load data when user is authenticated
  useEffect(() => {
    if (user && token) {
      loadDashboardData()
      loadNotifications()
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
      const endpoint = authMode === 'login' ? 'auth/login' : 'auth/register'
      const result = await apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify(authData)
      })
      
      setToken(result.token)
      setUser(result.user)
      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result.user))
      
      toast.success(`${authMode === 'login' ? 'Logged in' : 'Registered'} successfully!`)
    } catch (error) {
      // Error already handled in apiCall
    }
  }
  
  const handleLogout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('Logged out successfully')
  }
  
  // Data loading functions
  const loadDashboardData = async () => {
    try {
      const [statsData, classesData, subjectsData] = await Promise.all([
        apiCall('dashboard/stats'),
        apiCall('classes'),
        apiCall('subjects')
      ])
      
      setStats(statsData)
      setClasses(classesData)
      setSubjects(subjectsData)
      
      if (user.role === 'admin') {
        const [studentsData, teachersData] = await Promise.all([
          apiCall('students'),
          apiCall('teachers')
        ])
        setStudents(studentsData)
        setTeachers(teachersData)
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
  
  const loadNotifications = async () => {
    try {
      const notificationsData = await apiCall('notifications')
      setNotifications(notificationsData)
    } catch (error) {
      // Error already handled in apiCall
    }
  }
  
  // CRUD functions
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
  
  const handleCreateTeacher = async (e) => {
    e.preventDefault()
    try {
      await apiCall('teachers', {
        method: 'POST',
        body: JSON.stringify(teacherForm)
      })
      
      toast.success('Teacher created successfully!')
      setShowTeacherModal(false)
      setTeacherForm({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        address: '',
        qualification: '',
        experience: '',
        specialization: '',
        dateOfJoining: ''
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
    
    if (user?.role === 'admin') {
      return [
        ...baseItems,
        { id: 'students', label: 'Students', icon: Users },
        { id: 'teachers', label: 'Teachers', icon: UserCheck },
        { id: 'classes', label: 'Classes', icon: School },
        { id: 'subjects', label: 'Subjects', icon: BookOpen },
        { id: 'assignments', label: 'Assignments', icon: GraduationCap },
        { id: 'attendance', label: 'Attendance', icon: Calendar }
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
            <Tabs value={authMode} onValueChange={setAuthMode}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleAuth} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={authData.email}
                      onChange={(e) => setAuthData(prev => ({ ...prev, email: e.target.value }))}
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
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Login
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleAuth} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={authData.name}
                      onChange={(e) => setAuthData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={authData.email}
                      onChange={(e) => setAuthData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={authData.phoneNumber}
                      onChange={(e) => setAuthData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={authData.role} onValueChange={(value) => setAuthData(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={authData.password}
                      onChange={(e) => setAuthData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Register
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center">
            <School className="h-8 w-8 text-blue-600 mr-3" />
            <span className="text-xl font-bold text-gray-900">EduManage</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="mt-6">
          {getNavigationItems().map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center px-6 py-3 text-left text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
                {item.id === 'notifications' && notifications.filter(n => !n.read).length > 0 && (
                  <Badge variant="destructive" className="ml-auto text-xs">
                    {notifications.filter(n => !n.read).length}
                  </Badge>
                )}
              </button>
            )
          })}
        </nav>
        
        <div className="absolute bottom-0 w-full p-6 border-t">
          <div className="flex items-center mb-4">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarFallback className="bg-blue-100 text-blue-700">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-gray-900 capitalize">
              {activeTab.replace('-', ' ')}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="capitalize">
              {user.role}
            </Badge>
          </div>
        </div>
        
        {/* Content area */}
        <div className="p-6">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {user.role === 'admin' && (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalStudents || 0}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalTeachers || 0}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                      <School className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalClasses || 0}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalSubjects || 0}</div>
                    </CardContent>
                  </Card>
                </>
              )}
              
              {user.role === 'teacher' && (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">My Assignments</CardTitle>
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.myAssignments || 0}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">My Classes</CardTitle>
                      <School className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.myClasses || 0}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
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
                <Card>
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
          
          {/* Students Management (Admin) */}
          {activeTab === 'students' && user.role === 'admin' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Students Management</h2>
                <Dialog open={showStudentModal} onOpenChange={setShowStudentModal}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Student
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Student</DialogTitle>
                      <DialogDescription>
                        Fill in the student information below.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateStudent}>
                      <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={studentForm.firstName}
                            onChange={(e) => setStudentForm(prev => ({ ...prev, firstName: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={studentForm.lastName}
                            onChange={(e) => setStudentForm(prev => ({ ...prev, lastName: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={studentForm.email}
                            onChange={(e) => setStudentForm(prev => ({ ...prev, email: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dateOfBirth">Date of Birth</Label>
                          <Input
                            id="dateOfBirth"
                            type="date"
                            value={studentForm.dateOfBirth}
                            onChange={(e) => setStudentForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="gender">Gender</Label>
                          <Select value={studentForm.gender} onValueChange={(value) => setStudentForm(prev => ({ ...prev, gender: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber">Phone Number</Label>
                          <Input
                            id="phoneNumber"
                            value={studentForm.phoneNumber}
                            onChange={(e) => setStudentForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="classId">Class</Label>
                          <Select value={studentForm.classId} onValueChange={(value) => setStudentForm(prev => ({ ...prev, classId: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                            <SelectContent>
                              {classes.map(cls => (
                                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="admissionNumber">Admission Number</Label>
                          <Input
                            id="admissionNumber"
                            value={studentForm.admissionNumber}
                            onChange={(e) => setStudentForm(prev => ({ ...prev, admissionNumber: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <Textarea
                            id="address"
                            value={studentForm.address}
                            onChange={(e) => setStudentForm(prev => ({ ...prev, address: e.target.value }))}
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label htmlFor="emergencyContact">Emergency Contact</Label>
                          <Input
                            id="emergencyContact"
                            value={studentForm.emergencyContact}
                            onChange={(e) => setStudentForm(prev => ({ ...prev, emergencyContact: e.target.value }))}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Create Student</Button>
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
                        <TableHead>Admission No.</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>{student.firstName} {student.lastName}</TableCell>
                          <TableCell>{student.admissionNumber}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {classes.find(c => c.id === student.classId)?.name || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>{student.email || 'N/A'}</TableCell>
                          <TableCell>{student.phoneNumber || 'N/A'}</TableCell>
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
          
          {/* Teachers Management (Admin) */}
          {activeTab === 'teachers' && user.role === 'admin' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Teachers Management</h2>
                <Dialog open={showTeacherModal} onOpenChange={setShowTeacherModal}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Teacher
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Teacher</DialogTitle>
                      <DialogDescription>
                        Fill in the teacher information below.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateTeacher}>
                      <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={teacherForm.firstName}
                            onChange={(e) => setTeacherForm(prev => ({ ...prev, firstName: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={teacherForm.lastName}
                            onChange={(e) => setTeacherForm(prev => ({ ...prev, lastName: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={teacherForm.email}
                            onChange={(e) => setTeacherForm(prev => ({ ...prev, email: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber">Phone Number</Label>
                          <Input
                            id="phoneNumber"
                            value={teacherForm.phoneNumber}
                            onChange={(e) => setTeacherForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="qualification">Qualification</Label>
                          <Input
                            id="qualification"
                            value={teacherForm.qualification}
                            onChange={(e) => setTeacherForm(prev => ({ ...prev, qualification: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="experience">Experience (Years)</Label>
                          <Input
                            id="experience"
                            type="number"
                            value={teacherForm.experience}
                            onChange={(e) => setTeacherForm(prev => ({ ...prev, experience: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="specialization">Specialization</Label>
                          <Input
                            id="specialization"
                            value={teacherForm.specialization}
                            onChange={(e) => setTeacherForm(prev => ({ ...prev, specialization: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dateOfJoining">Date of Joining</Label>
                          <Input
                            id="dateOfJoining"
                            type="date"
                            value={teacherForm.dateOfJoining}
                            onChange={(e) => setTeacherForm(prev => ({ ...prev, dateOfJoining: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <Textarea
                            id="address"
                            value={teacherForm.address}
                            onChange={(e) => setTeacherForm(prev => ({ ...prev, address: e.target.value }))}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Create Teacher</Button>
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
                        <TableHead>Experience</TableHead>
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
                          <TableCell>{teacher.experience} years</TableCell>
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
          
          {/* Classes Management (Admin) */}
          {activeTab === 'classes' && user.role === 'admin' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Classes Management</h2>
                <Dialog open={showClassModal} onOpenChange={setShowClassModal}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Class
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Class</DialogTitle>
                      <DialogDescription>
                        Fill in the class information below.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateClass}>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Class Name</Label>
                          <Input
                            id="name"
                            value={classForm.name}
                            onChange={(e) => setClassForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., JSS 1A, SS 2B"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="capacity">Capacity</Label>
                          <Input
                            id="capacity"
                            type="number"
                            value={classForm.capacity}
                            onChange={(e) => setClassForm(prev => ({ ...prev, capacity: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="academicYear">Academic Year</Label>
                          <Input
                            id="academicYear"
                            value={classForm.academicYear}
                            onChange={(e) => setClassForm(prev => ({ ...prev, academicYear: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={classForm.description}
                            onChange={(e) => setClassForm(prev => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Create Class</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((cls) => (
                  <Card key={cls.id}>
                    <CardHeader>
                      <CardTitle>{cls.name}</CardTitle>
                      <CardDescription>{cls.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Capacity:</span>
                          <span className="text-sm font-medium">{cls.capacity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Academic Year:</span>
                          <span className="text-sm font-medium">{cls.academicYear}</span>
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
          
          {/* Subjects Management (Admin) */}
          {activeTab === 'subjects' && user.role === 'admin' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Subjects Management</h2>
                <Dialog open={showSubjectModal} onOpenChange={setShowSubjectModal}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Subject
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Subject</DialogTitle>
                      <DialogDescription>
                        Fill in the subject information below.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubject}>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Subject Name</Label>
                          <Input
                            id="name"
                            value={subjectForm.name}
                            onChange={(e) => setSubjectForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Mathematics, English Language"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="code">Subject Code</Label>
                          <Input
                            id="code"
                            value={subjectForm.code}
                            onChange={(e) => setSubjectForm(prev => ({ ...prev, code: e.target.value }))}
                            placeholder="e.g., MTH101, ENG102"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="credits">Credits</Label>
                          <Input
                            id="credits"
                            type="number"
                            value={subjectForm.credits}
                            onChange={(e) => setSubjectForm(prev => ({ ...prev, credits: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={subjectForm.description}
                            onChange={(e) => setSubjectForm(prev => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Create Subject</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject) => (
                  <Card key={subject.id}>
                    <CardHeader>
                      <CardTitle>{subject.name}</CardTitle>
                      <CardDescription>Code: {subject.code}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Credits:</span>
                          <span className="text-sm font-medium">{subject.credits}</span>
                        </div>
                        {subject.description && (
                          <p className="text-sm text-gray-600 mt-2">{subject.description}</p>
                        )}
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
          
          {/* Teacher Assignments (Admin) */}
          {activeTab === 'assignments' && user.role === 'admin' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Teacher Assignments</h2>
                <Dialog open={showAssignmentModal} onOpenChange={setShowAssignmentModal}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Assign Teacher
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Assign Teacher to Subject & Class</DialogTitle>
                      <DialogDescription>
                        Select teacher, subject, and class for the assignment.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateAssignment}>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="teacherId">Teacher</Label>
                          <Select value={assignmentForm.teacherId} onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, teacherId: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select teacher" />
                            </SelectTrigger>
                            <SelectContent>
                              {teachers.map(teacher => (
                                <SelectItem key={teacher.id} value={teacher.id}>
                                  {teacher.firstName} {teacher.lastName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subjectId">Subject</Label>
                          <Select value={assignmentForm.subjectId} onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, subjectId: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                              {subjects.map(subject => (
                                <SelectItem key={subject.id} value={subject.id}>
                                  {subject.name} ({subject.code})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="classId">Class</Label>
                          <Select value={assignmentForm.classId} onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, classId: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                            <SelectContent>
                              {classes.map(cls => (
                                <SelectItem key={cls.id} value={cls.id}>
                                  {cls.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Create Assignment</Button>
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
                        <TableHead>Teacher</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Assigned Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell>
                            {teachers.find(t => t.id === assignment.teacherId)?.firstName} {teachers.find(t => t.id === assignment.teacherId)?.lastName}
                          </TableCell>
                          <TableCell>{assignment.subjectName}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{assignment.className}</Badge>
                          </TableCell>
                          <TableCell>{new Date(assignment.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-4 w-4" />
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
          
          {/* My Assignments (Teacher) */}
          {activeTab === 'my-assignments' && user.role === 'teacher' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">My Assignments</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignments.map((assignment) => (
                  <Card key={assignment.id}>
                    <CardHeader>
                      <CardTitle>{assignment.subjectName}</CardTitle>
                      <CardDescription>Class: {assignment.className}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Assigned:</span>
                          <span className="text-sm font-medium">
                            {new Date(assignment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Button size="sm" className="w-full">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Attendance Management */}
          {activeTab === 'attendance' && (user.role === 'admin' || user.role === 'teacher') && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Attendance Management</h2>
                <Dialog open={showAttendanceModal} onOpenChange={setShowAttendanceModal}>
                  <DialogTrigger asChild>
                    <Button>
                      <Calendar className="h-4 w-4 mr-2" />
                      Mark Attendance
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Mark Attendance</DialogTitle>
                      <DialogDescription>
                        Select date and class to mark attendance.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="date">Date</Label>
                          <Input
                            id="date"
                            type="date"
                            value={attendanceDate}
                            onChange={(e) => setAttendanceDate(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="class">Class</Label>
                          <Select value={selectedClass} onValueChange={setSelectedClass}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                            <SelectContent>
                              {classes.map(cls => (
                                <SelectItem key={cls.id} value={cls.id}>
                                  {cls.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <Button onClick={loadAttendanceForClass} disabled={!selectedClass}>
                        Load Students
                      </Button>
                      
                      {attendanceList.length > 0 && (
                        <div className="max-h-96 overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Student Name</TableHead>
                                <TableHead>Present</TableHead>
                                <TableHead>Absent</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {attendanceList.map((student, index) => (
                                <TableRow key={student.studentId}>
                                  <TableCell>{student.studentName}</TableCell>
                                  <TableCell>
                                    <Checkbox
                                      checked={student.status === 'present'}
                                      onCheckedChange={(checked) => {
                                        const newList = [...attendanceList]
                                        newList[index].status = checked ? 'present' : 'absent'
                                        setAttendanceList(newList)
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Checkbox
                                      checked={student.status === 'absent'}
                                      onCheckedChange={(checked) => {
                                        const newList = [...attendanceList]
                                        newList[index].status = checked ? 'absent' : 'present'
                                        setAttendanceList(newList)
                                      }}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button onClick={handleMarkAttendance} disabled={attendanceList.length === 0}>
                        Save Attendance
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Attendance Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Attendance records will be displayed here.</p>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* My Children (Parent) */}
          {activeTab === 'my-children' && user.role === 'parent' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">My Children</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map((student) => (
                  <Card key={student.id}>
                    <CardHeader>
                      <CardTitle>{student.firstName} {student.lastName}</CardTitle>
                      <CardDescription>
                        Class: {classes.find(c => c.id === student.classId)?.name || 'N/A'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Admission No:</span>
                          <span className="text-sm font-medium">{student.admissionNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Gender:</span>
                          <span className="text-sm font-medium capitalize">{student.gender}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h2>
              
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <Card key={notification.id} className={`cursor-pointer transition-colors ${
                    notification.read ? 'bg-gray-50' : 'border-blue-200'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium text-gray-900">{notification.title}</h3>
                            {!notification.read && (
                              <Badge variant="secondary" className="text-xs">New</Badge>
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
        </div>
      </div>
    </div>
  )
}

export default App