'use client'

import React, { useState, useEffect, useRef } from 'react'
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
import ConversationList from '@/components/chat/ConversationList'
import ChatWindow from '@/components/chat/ChatWindow'
import MessagesPage from '@/components/chat/MessagesPage'
import NotificationCenter from '@/components/notifications/NotificationCenter'
import BroadcastNotification from '@/components/notifications/BroadcastNotification'
import BillingDashboard from '@/components/billing/BillingDashboard'
import GamificationDashboard from '@/components/gamification/GamificationDashboard'
import { GenderDistributionChart, NewEnrollmentsChart } from '@/components/dashboard/Charts'
import AIAssistant from '@/components/ai/AIAssistant'
import { exportStudentsToCSV, exportTeachersToCSV, exportParentsToCSV } from '@/lib/csv-export'
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
  Shield,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Megaphone,
  Trophy,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Bot,
  Download
} from 'lucide-react'

export default function App() {
  // Core state
  const [user, setUser] = useState(null)
  const [school, setSchool] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
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

  // Chat state
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [isSocketConnected, setIsSocketConnected] = useState(false)

  // Initialize socket connection
  useEffect(() => {
    if (!user || !token) return
    
    const socketManager = require('@/lib/socket-client').default
    
    if (!socketManager.socket?.connected) {
      socketManager.connect(token)
    }
    
    const handleConnected = () => setIsSocketConnected(true)
    const handleDisconnected = () => setIsSocketConnected(false)
    
    socketManager.on('connected', handleConnected)
    socketManager.on('disconnected', handleDisconnected)
    
    return () => {
      socketManager.off('connected', handleConnected)
      socketManager.off('disconnected', handleDisconnected)
    }
  }, [user?.id, token])

  // Parent payment state
  const [parentPayments, setParentPayments] = useState([])
  const [paymentForm, setPaymentForm] = useState({
    paymentType: '',
    amount: '',
    description: '',
    studentId: ''
  })
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const paymentsLoadedRef = useRef(false)

  // Search states
  const [studentSearch, setStudentSearch] = useState('')
  const [teacherSearch, setTeacherSearch] = useState('')
  const [parentSearch, setParentSearch] = useState('')

  // Filter states
  const [studentFilters, setStudentFilters] = useState({
    class: 'all_classes',
    gender: 'all_genders',
    status: 'all_status'
  })
  const [teacherFilters, setTeacherFilters] = useState({
    specialization: '',
    status: 'all_status'
  })
  const [parentFilters, setParentFilters] = useState({
    childrenCount: 'all_parents',
    status: 'all_status'
  })

  // Form validation states
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Master settings state
  const [masterSettings, setMasterSettings] = useState({
    systemName: 'EduManage Nigeria',
    systemEmail: 'admin@edumanage.ng',
    defaultCurrency: 'NGN',
    timezone: 'Africa/Lagos',
    maintenanceMode: false,
    allowRegistration: true,
    maxSchools: 1000,
    systemVersion: '1.0.0'
  })

  // Payment analytics state
  const [paymentAnalytics, setPaymentAnalytics] = useState({
    totalRevenue: 0,
    monthlyRevenue: [],
    paymentStatusBreakdown: [],
    recentTransactions: []
  })

  // Form validation functions
  const validateForm = (formType, data) => {
    const errors = {}
    
    switch (formType) {
      case 'student':
        if (!data.firstName?.trim()) errors.firstName = 'First name is required'
        if (!data.lastName?.trim()) errors.lastName = 'Last name is required'
        if (!data.dateOfBirth) errors.dateOfBirth = 'Date of birth is required'
        if (!data.gender) errors.gender = 'Gender is required'
        if (!data.admissionNumber?.trim()) errors.admissionNumber = 'Admission number is required'
        if (!data.classId) errors.classId = 'Class is required'
        if (!data.parentId) errors.parentId = 'Parent is required'
        break
        
      case 'teacher':
        if (!data.teacherData?.firstName?.trim()) errors.firstName = 'First name is required'
        if (!data.teacherData?.lastName?.trim()) errors.lastName = 'Last name is required'
        if (!data.teacherData?.phoneNumber?.trim()) errors.phoneNumber = 'Phone number is required'
        if (!data.teacherData?.qualification?.trim()) errors.qualification = 'Qualification is required'
        if (!data.credentials?.email?.trim()) errors.email = 'Email is required'
        if (!data.credentials?.password?.trim()) errors.password = 'Password is required'
        if (data.credentials?.password && data.credentials.password.length < 6) errors.password = 'Password must be at least 6 characters'
        break
        
      case 'parent':
        if (!data.parentData?.name?.trim()) errors.name = 'Name is required'
        if (!data.parentData?.phoneNumber?.trim()) errors.phoneNumber = 'Phone number is required'
        if (!data.parentCredentials?.email?.trim()) errors.email = 'Email is required'
        if (!data.parentCredentials?.password?.trim()) errors.password = 'Password is required'
        if (data.parentCredentials?.password && data.parentCredentials.password.length < 6) errors.password = 'Password must be at least 6 characters'
        break
        
      case 'class':
        if (!data.name?.trim()) errors.name = 'Class name is required'
        if (!data.capacity || data.capacity < 1) errors.capacity = 'Valid capacity is required'
        if (!data.academicYear?.trim()) errors.academicYear = 'Academic year is required'
        break
        
      case 'subject':
        if (!data.name?.trim()) errors.name = 'Subject name is required'
        if (!data.code?.trim()) errors.code = 'Subject code is required'
        break
    }
    
    return errors
  }

  // Load parent payment history
  const loadParentPayments = async () => {
    try {
      const paymentsData = await apiCall('payments/parent')
      setParentPayments(paymentsData.payments || [])
    } catch (error) {
      console.error('Error loading parent payments:', error)
    }
  }

  // Load payment analytics
  const loadPaymentAnalytics = async () => {
    try {
      const analytics = await apiCall('reports/payments')
      setPaymentAnalytics(analytics)
    } catch (error) {
      console.error('Error loading payment analytics:', error)
    }
  }

  // Load master settings
  const loadMasterSettings = async () => {
    try {
      const settings = await apiCall('master/settings')
      setMasterSettings(prev => ({ ...prev, ...settings }))
    } catch (error) {
      console.error('Error loading master settings:', error)
    }
  }

  // Filter functions
  const filterStudents = (students) => {
    return students.filter((student) => {
      const matchesSearch = !studentSearch || 
        student.firstName?.toLowerCase().includes(studentSearch.toLowerCase()) ||
        student.lastName?.toLowerCase().includes(studentSearch.toLowerCase()) ||
        student.admissionNumber?.toLowerCase().includes(studentSearch.toLowerCase())
      
      const matchesClass = studentFilters.class === 'all_classes' || student.classId === studentFilters.class
      const matchesGender = studentFilters.gender === 'all_genders' || student.gender === studentFilters.gender
      const matchesStatus = studentFilters.status === 'all_status' || 
        (studentFilters.status === 'active' && student.active) ||
        (studentFilters.status === 'inactive' && !student.active)
      
      return matchesSearch && matchesClass && matchesGender && matchesStatus
    })
  }

  const filterTeachers = (teachers) => {
    return teachers.filter((teacher) => {
      const matchesSearch = !teacherSearch ||
        teacher.firstName?.toLowerCase().includes(teacherSearch.toLowerCase()) ||
        teacher.lastName?.toLowerCase().includes(teacherSearch.toLowerCase()) ||
        teacher.email?.toLowerCase().includes(teacherSearch.toLowerCase())
      
      const matchesSpecialization = !teacherFilters.specialization || 
        teacher.specialization?.toLowerCase().includes(teacherFilters.specialization.toLowerCase())
      const matchesStatus = teacherFilters.status === 'all_status' ||
        (teacherFilters.status === 'active' && teacher.active) ||
        (teacherFilters.status === 'inactive' && !teacher.active)
      
      return matchesSearch && matchesSpecialization && matchesStatus
    })
  }

  const filterParents = (parents) => {
    return parents.filter((parent) => {
      const matchesSearch = !parentSearch ||
        parent.name?.toLowerCase().includes(parentSearch.toLowerCase()) ||
        parent.email?.toLowerCase().includes(parentSearch.toLowerCase())
      
      const childrenCount = students.filter(s => s.parentId === parent.id).length
      const matchesChildrenCount = parentFilters.childrenCount === 'all_parents' ||
        (parentFilters.childrenCount === '1' && childrenCount === 1) ||
        (parentFilters.childrenCount === '2+' && childrenCount >= 2)
      
      const matchesStatus = parentFilters.status === 'all_status' ||
        (parentFilters.status === 'active' && parent.active) ||
        (parentFilters.status === 'inactive' && !parent.active)
      
      return matchesSearch && matchesChildrenCount && matchesStatus
    })
  }

  // Handle parent payment processing
  const handleParentPayment = async (provider) => {
    if (!paymentForm.paymentType || !paymentForm.amount) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsProcessingPayment(true)
    try {
      const paymentData = {
        amount: parseFloat(paymentForm.amount),
        paymentType: paymentForm.paymentType,
        description: paymentForm.description,
        studentId: paymentForm.studentId,
        provider: 'paystack'
      }

      const result = await apiCall('payments/parent', {
        method: 'POST',
        body: JSON.stringify(paymentData)
      })

      if (result.authorizationUrl) {
        window.location.href = result.authorizationUrl
      } else {
        toast.success('Payment initiated! Redirecting...')
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Payment failed. Please try again.')
    } finally {
      setIsProcessingPayment(false)
    }
  }

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
        loadMasterSettings()
      } else if (user.role === 'school_admin') {
        loadPaymentAnalytics()
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
        schoolName: settings?.schoolName || school?.name || '',
        logo: settings?.logo || '',
        primaryColor: settings?.primaryColor || '#3b82f6',
        secondaryColor: settings?.secondaryColor || '#64748b',
        address: settings?.address || '',
        phoneNumber: settings?.phoneNumber || '',
        email: settings?.email || ''
      })
    } catch (error) {
      console.error('Error loading school settings:', error)
      // Set default values if loading fails
      setSchoolSettings({
        schoolName: school?.name || '',
        logo: '',
        primaryColor: '#3b82f6',
        secondaryColor: '#64748b',
        address: '',
        phoneNumber: '',
        email: ''
      })
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
    
    const errors = validateForm('teacher', teacherForm)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    
    setIsSubmitting(true)
    setFormErrors({})
    
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
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleCreateParent = async (e) => {
    e.preventDefault()
    
    const errors = validateForm('parent', parentForm)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    
    setIsSubmitting(true)
    setFormErrors({})
    
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
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleCreateStudent = async (e) => {
    e.preventDefault()
    
    const errors = validateForm('student', studentForm)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    
    setIsSubmitting(true)
    setFormErrors({})
    
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
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleCreateClass = async (e) => {
    e.preventDefault()
    
    const errors = validateForm('class', classForm)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    
    setIsSubmitting(true)
    setFormErrors({})
    
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
    } finally {
      setIsSubmitting(false)
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
    if (!selectedClass || !attendanceDate) return
    
    try {
      console.log('Loading attendance for class:', selectedClass, 'Total students:', students.length)
      
      // Get students in the selected class
      const classStudents = students.filter(student => student.classId === selectedClass)
      console.log('Students in class:', classStudents.length)
      
      if (classStudents.length === 0) {
        console.log('No students found in class')
        setAttendanceList([])
        return
      }
      
      // Get existing attendance records for this date
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
      
      console.log('Attendance data:', attendanceData)
      setAttendanceList(attendanceData)
    } catch (error) {
      console.error('Error loading attendance:', error)
      setAttendanceList([])
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
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'messages', label: 'Messages', icon: MessageCircle }
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
        { id: 'gamification', label: 'Gamification', icon: Trophy },
        { id: 'billing', label: 'Billing', icon: CreditCard },
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
        { id: 'payments', label: 'Payments', icon: CreditCard },
        { id: 'results', label: 'Results', icon: BarChart3 }
      ]
    }
    
    return baseItems
  }
  
  const [activeTab, setActiveTab] = useState('dashboard')

  // Load attendance when class or date changes
  useEffect(() => {
    if (selectedClass && attendanceDate && students.length > 0) {
      loadAttendanceForClass()
    }
  }, [selectedClass, attendanceDate, students])

  // Load parent payments when on payments tab
  useEffect(() => {
    if (user && user.role === 'parent' && activeTab === 'payments' && !paymentsLoadedRef.current) {
      loadParentPayments()
      paymentsLoadedRef.current = true
    } else if (activeTab !== 'payments') {
      paymentsLoadedRef.current = false
    }
  }, [user, activeTab])

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
      <div></div>
      
      
      {/* Sidebar - Fixed responsive positioning */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 
        ${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white shadow-lg border-r border-gray-200
        transform transition-all duration-300 ease-in-out 
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
            {!sidebarCollapsed && (
              <div>
                <span className="text-lg font-bold text-gray-900 block leading-tight">
                  {school?.name || 'EduManage'}
                </span>
                {user.role === 'developer' && (
                  <span className="text-xs text-blue-600 font-medium">Master System</span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {/* Collapse/Expand Button - Hidden on mobile */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:block text-gray-400 hover:text-gray-600 p-1 rounded"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
            {/* Mobile close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
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
                title={sidebarCollapsed ? item.label : ''}
              >
                <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <div className="flex items-center">
                    <span className="flex-1">{item.label}</span>
                    {item.id === 'notifications' && notifications.filter(n => !n.read).length > 0 && (
                      <Badge variant="destructive" className="ml-2 text-xs px-1.5 py-0.5">
                        {notifications.filter(n => !n.read).length}
                      </Badge>
                    )}
                  </div>
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
            {!sidebarCollapsed && (
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
            )}
          </div>
          <Button
            onClick={handleLogout}
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
            <NotificationCenter
              currentUser={user}
              isOpen={false}
              onToggle={() => {}}
            />
            {user.role === 'school_admin' && activeTab !== 'school-settings' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('school-settings')}
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
                <div>
                  <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-900">Total Schools</CardTitle>
                      <Building2 className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">{stats.totalSchools || 0}</div>
                      <div className="flex items-center text-xs mt-2">
                        <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                        <span className="text-green-600 font-medium">+8%</span>
                        <span className="text-gray-600 ml-1">vs last month</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500 bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-900">Active Schools</CardTitle>
                      <Shield className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">{stats.activeSchools || 0}</div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center text-xs">
                          <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                          <span className="text-green-600 font-medium">+12%</span>
                          <span className="text-gray-600 ml-1">vs last month</span>
                        </div>
                        <Button size="sm" variant="outline" className="text-xs px-2 py-1 h-6">
                          <Activity className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500 bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-900">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center text-xs">
                          <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                          <span className="text-green-600 font-medium">+15%</span>
                          <span className="text-gray-600 ml-1">vs last month</span>
                        </div>
                        <Button size="sm" variant="outline" className="text-xs px-2 py-1 h-6">
                          <BarChart3 className="h-3 w-3 mr-1" />
                          Analytics
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {user.role === 'school_admin' && (
                <div>
                  <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-900">Total Students</CardTitle>
                      <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">{stats.totalStudents || 0}</div>
                      <div className="flex items-center text-xs mt-2">
                        <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                        <span className="text-green-600 font-medium">+5%</span>
                        <span className="text-gray-600 ml-1">vs last month</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-amber-500 bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-900">Broadcast Message</CardTitle>
                      <Megaphone className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-700 mb-3">
                        Send announcements to teachers, parents, or all users
                      </div>
                      <BroadcastNotification
                        currentUser={user}
                        trigger={
                          <Button size="sm" className="w-full">
                            <Megaphone className="h-4 w-4 mr-2" />
                            Send Broadcast
                          </Button>
                        }
                      />
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-emerald-500 bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-900">Total Teachers</CardTitle>
                      <UserCheck className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">{stats.totalTeachers || 0}</div>
                      <div className="flex items-center text-xs mt-2">
                        <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                        <span className="text-green-600 font-medium">+2%</span>
                        <span className="text-gray-600 ml-1">vs last month</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500 bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-900">Total Parents</CardTitle>
                      <Users2 className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">{stats.totalParents || 0}</div>
                      <div className="flex items-center text-xs mt-2">
                        <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                        <span className="text-green-600 font-medium">+7%</span>
                        <span className="text-gray-600 ml-1">vs last month</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-orange-500 bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-900">Total Classes</CardTitle>
                      <School className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">{stats.totalClasses || 0}</div>
                      <div className="flex items-center text-xs mt-2">
                        <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                        <span className="text-green-600 font-medium">+3%</span>
                        <span className="text-gray-600 ml-1">vs last month</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-teal-500 bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-900">New Enrollments</CardTitle>
                      <UserPlus className="h-4 w-4 text-teal-600" />
                    </CardHeader>
                    <CardContent>
                      {stats.newEnrollments && <NewEnrollmentsChart data={stats.newEnrollments} />}
                    </CardContent>
                  </Card>
                </div>
              )}

              {user.role === 'teacher' && (
                <>
                  <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-indigo-500 bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-900">My Assignments</CardTitle>
                      <BookOpen className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">{stats.myAssignments || 0}</div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center text-xs">
                          <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                          <span className="text-green-600 font-medium">+1</span>
                          <span className="text-gray-500 ml-1">this week</span>
                        </div>
                        <Button size="sm" variant="outline" className="text-xs px-2 py-1 h-6">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-orange-500 bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-900">My Classes</CardTitle>
                      <School className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">{stats.myClasses || 0}</div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center text-xs">
                          <Minus className="h-3 w-3 text-gray-500 mr-1" />
                          <span className="text-gray-500 font-medium">No change</span>
                        </div>
                        <Button size="sm" variant="outline" className="text-xs px-2 py-1 h-6">
                          <Calendar className="h-3 w-3 mr-1" />
                          Schedule
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-cyan-500 bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-900">Students in My Classes</CardTitle>
                      <Users className="h-4 w-4 text-cyan-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">{stats.totalStudentsInMyClasses || 0}</div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center text-xs">
                          <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                          <span className="text-green-600 font-medium">+3</span>
                          <span className="text-gray-500 ml-1">new students</span>
                        </div>
                        <Button size="sm" variant="outline" className="text-xs px-2 py-1 h-6">
                          <Users className="h-3 w-3 mr-1" />
                          Manage
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {user.role === 'parent' && (
                <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-pink-500 bg-white">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-900">My Children</CardTitle>
                    <Users className="h-4 w-4 text-pink-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stats.myChildren || 0}</div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center text-xs">
                        <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                        <span className="text-green-600 font-medium">All active</span>
                        <span className="text-gray-500 ml-1">this term</span>
                      </div>
                      <Button size="sm" variant="outline" className="text-xs px-2 py-1 h-6">
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          {/* Master Settings (Developer) */}
          {activeTab === 'master-settings' && user.role === 'developer' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Master Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Configuration</CardTitle>
                    <CardDescription>Core system settings and preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>System Name</Label>
                      <Input value={masterSettings.systemName} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label>System Email</Label>
                      <Input value={masterSettings.systemEmail} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label>Default Currency</Label>
                      <Input value={masterSettings.defaultCurrency} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Input value={masterSettings.timezone} readOnly />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Limits</CardTitle>
                    <CardDescription>Platform limitations and quotas</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Maximum Schools</Label>
                      <Input value={masterSettings.maxSchools} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label>System Version</Label>
                      <Input value={masterSettings.systemVersion} readOnly />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={masterSettings.allowRegistration} disabled />
                      <Label>Allow New School Registration</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={masterSettings.maintenanceMode} disabled />
                      <Label>Maintenance Mode</Label>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Statistics</CardTitle>
                    <CardDescription>Current system usage and metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.totalSchools || 0}</div>
                        <div className="text-sm text-gray-600">Total Schools</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.activeSchools || 0}</div>
                        <div className="text-sm text-gray-600">Active Schools</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{stats.totalUsers || 0}</div>
                        <div className="text-sm text-gray-600">Total Users</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">99.9%</div>
                        <div className="text-sm text-gray-600">Uptime</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
                {schools.map((school, index) => {
                  const colors = [
                    'border-l-4 border-l-blue-500 bg-white',
                    'border-l-4 border-l-green-500 bg-white',
                    'border-l-4 border-l-purple-500 bg-white',
                    'border-l-4 border-l-orange-500 bg-white',
                    'border-l-4 border-l-pink-500 bg-white',
                    'border-l-4 border-l-indigo-500 bg-white',
                    'border-l-4 border-l-teal-500 bg-white',
                    'border-l-4 border-l-red-500 bg-white'
                  ]
                  const colorClass = colors[index % colors.length]

                  return (
                    <Card key={school.id} className={`hover:shadow-lg transition-all duration-300 ${colorClass}`}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${school.active ? 'bg-green-100' : 'bg-gray-100'}`}>
                              <School className={`h-5 w-5 ${school.active ? 'text-green-600' : 'text-gray-600'}`} />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{school.name}</CardTitle>
                              <Badge variant={school.active ? "default" : "secondary"} className="mt-1">
                                {school.active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <CardDescription className="mt-2">
                          Created: {new Date(school.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Admin ID:</span>
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{school.adminId}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Status:</span>
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${school.active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                              <span className={school.active ? 'text-green-600 font-medium' : 'text-gray-500'}>
                                {school.active ? 'Operational' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
          
          {/* School Settings */}
          {activeTab === 'school-settings' && user.role === 'school_admin' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">School Settings</h2>
              <Card>
                <CardHeader>
                  <CardTitle>School Information</CardTitle>
                  <CardDescription>Configure your school's information and appearance</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveSettings} className="space-y-4">
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
                      <Input
                        id="logo"
                        value={schoolSettings.logo}
                        onChange={(e) => setSchoolSettings(prev => ({ ...prev, logo: e.target.value }))}
                        placeholder="Enter logo URL"
                      />
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
                    
                    <div className="flex justify-end">
                      <Button type="submit">Save Settings</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Teachers Management (School Admin) */}
          {activeTab === 'teachers' && user.role === 'school_admin' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Teachers Management</h2>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => exportTeachersToCSV(filterTeachers(teachers), school?.name)}
                    disabled={teachers.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
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

              {/* Search and Filters */}
              <div className="mb-6 space-y-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search teachers by name, email, qualification..."
                    value={teacherSearch}
                    onChange={(e) => setTeacherSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Input
                    placeholder="Filter by specialization"
                    value={teacherFilters.specialization}
                    onChange={(e) => setTeacherFilters(prev => ({ ...prev, specialization: e.target.value }))}
                    className="w-48"
                  />

                  <Select value={teacherFilters.status} onValueChange={(value) => setTeacherFilters(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_status">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                        <TableHead>Specialization</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterTeachers(teachers).map((teacher) => (
                        <TableRow key={teacher.id}>
                          <TableCell className="font-medium">
                            {teacher.firstName} {teacher.lastName}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{teacher.email}</TableCell>
                          <TableCell>{teacher.phoneNumber || 'N/A'}</TableCell>
                          <TableCell className="max-w-xs truncate">{teacher.qualification || 'N/A'}</TableCell>
                          <TableCell>{teacher.specialization || 'N/A'}</TableCell>
                          <TableCell>{teacher.experience || 'N/A'}</TableCell>
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

              {teachers.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No teachers added yet.</p>
                    <p className="text-sm text-gray-500 mt-1">Add your first teacher to get started.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          {/* Parents Management (School Admin) */}
          {activeTab === 'parents' && user.role === 'school_admin' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Parents Management</h2>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => exportParentsToCSV(filterParents(parents), students, school?.name)}
                    disabled={parents.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
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

              {/* Search and Filters */}
              <div className="mb-6 space-y-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search parents by name, email, phone..."
                    value={parentSearch}
                    onChange={(e) => setParentSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <Select value={parentFilters.childrenCount} onValueChange={(value) => setParentFilters(prev => ({ ...prev, childrenCount: value }))}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by children count" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_parents">All Parents</SelectItem>
                      <SelectItem value="1">1 Child</SelectItem>
                      <SelectItem value="2+">2+ Children</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={parentFilters.status} onValueChange={(value) => setParentFilters(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_status">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Children</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterParents(parents).map((parent) => (
                        <TableRow key={parent.id}>
                          <TableCell className="font-medium">{parent.name}</TableCell>
                          <TableCell className="max-w-xs truncate">{parent.email}</TableCell>
                          <TableCell>{parent.phoneNumber || 'N/A'}</TableCell>
                          <TableCell className="max-w-xs truncate">{parent.address || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {students.filter(s => s.parentId === parent.id).length} children
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={parent.active ? "default" : "secondary"}>
                              {parent.active ? 'Active' : 'Inactive'}
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

              {parents.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No parents registered yet.</p>
                    <p className="text-sm text-gray-500 mt-1">Add your first parent to get started.</p>
                  </CardContent>
                </Card>
              )}
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
          
          {/* Students Management (School Admin) */}
          {activeTab === 'students' && user.role === 'school_admin' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Students Management</h2>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => exportStudentsToCSV(filterStudents(students), classes, parents, school?.name)}
                    disabled={students.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Dialog open={showStudentModal} onOpenChange={setShowStudentModal}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Student
                      </Button>
                    </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Add New Student</DialogTitle>
                      <DialogDescription>
                        Fill in student information to create a new student record.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateStudent}>
                      <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
                        <div className="space-y-4">
                          <h3 className="font-medium text-gray-900">Personal Information</h3>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="studentFirstName">First Name</Label>
                              <Input
                                id="studentFirstName"
                                value={studentForm.firstName}
                                onChange={(e) => setStudentForm(prev => ({ ...prev, firstName: e.target.value }))}
                                className={formErrors.firstName ? 'border-red-500' : ''}
                                required
                              />
                              {formErrors.firstName && (
                                <p className="text-sm text-red-500">{formErrors.firstName}</p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="studentLastName">Last Name</Label>
                              <Input
                                id="studentLastName"
                                value={studentForm.lastName}
                                onChange={(e) => setStudentForm(prev => ({ ...prev, lastName: e.target.value }))}
                                className={formErrors.lastName ? 'border-red-500' : ''}
                                required
                              />
                              {formErrors.lastName && (
                                <p className="text-sm text-red-500">{formErrors.lastName}</p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="studentEmail">Email (Optional)</Label>
                              <Input
                                id="studentEmail"
                                type="email"
                                value={studentForm.email}
                                onChange={(e) => setStudentForm(prev => ({ ...prev, email: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="studentPhone">Phone Number</Label>
                              <Input
                                id="studentPhone"
                                value={studentForm.phoneNumber}
                                onChange={(e) => setStudentForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="studentDOB">Date of Birth</Label>
                              <Input
                                id="studentDOB"
                                type="date"
                                value={studentForm.dateOfBirth}
                                onChange={(e) => setStudentForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="studentGender">Gender</Label>
                              <Select
                                value={studentForm.gender}
                                onValueChange={(value) => setStudentForm(prev => ({ ...prev, gender: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="male">Male</SelectItem>
                                  <SelectItem value="female">Female</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="studentAddress">Address</Label>
                            <Textarea
                              id="studentAddress"
                              value={studentForm.address}
                              onChange={(e) => setStudentForm(prev => ({ ...prev, address: e.target.value }))}
                              rows={2}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="studentAdmission">Admission Number</Label>
                              <Input
                                id="studentAdmission"
                                value={studentForm.admissionNumber}
                                onChange={(e) => setStudentForm(prev => ({ ...prev, admissionNumber: e.target.value }))}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="studentEmergency">Emergency Contact</Label>
                              <Input
                                id="studentEmergency"
                                value={studentForm.emergencyContact}
                                onChange={(e) => setStudentForm(prev => ({ ...prev, emergencyContact: e.target.value }))}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="studentParent">Parent</Label>
                              <Select
                                value={studentForm.parentId}
                                onValueChange={(value) => setStudentForm(prev => ({ ...prev, parentId: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select parent" />
                                </SelectTrigger>
                                <SelectContent>
                                  {parents.map((parent) => (
                                    <SelectItem key={parent.id} value={parent.id}>
                                      {parent.name} - {parent.email}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="studentClass">Class</Label>
                              <Select
                                value={studentForm.classId}
                                onValueChange={(value) => setStudentForm(prev => ({ ...prev, classId: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select class" />
                                </SelectTrigger>
                                <SelectContent>
                                  {classes.map((cls) => (
                                    <SelectItem key={cls.id} value={cls.id}>
                                      {cls.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? 'Creating...' : 'Create Student'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Search and Filters */}
              <div className="mb-6 space-y-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search students by name, admission number..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <Select value={studentFilters.class} onValueChange={(value) => setStudentFilters(prev => ({ ...prev, class: value }))}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_classes">All Classes</SelectItem>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={studentFilters.gender} onValueChange={(value) => setStudentFilters(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_genders">All Genders</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={studentFilters.status} onValueChange={(value) => setStudentFilters(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_status">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Admission Number</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Parent</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterStudents(students).map((student) => {
                        const studentClass = classes.find(c => c.id === student.classId)
                        const studentParent = parents.find(p => p.id === student.parentId)
                        return (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">
                              {student.firstName} {student.lastName}
                            </TableCell>
                            <TableCell className="font-mono text-sm">{student.admissionNumber}</TableCell>
                            <TableCell>{studentClass?.name || 'Not assigned'}</TableCell>
                            <TableCell className="max-w-xs truncate">{studentParent?.name || 'Not assigned'}</TableCell>
                            <TableCell>{student.phoneNumber || 'N/A'}</TableCell>
                            <TableCell className="capitalize">{student.gender || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge variant={student.active ? "default" : "secondary"}>
                                {student.active ? 'Active' : 'Inactive'}
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
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {students.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No students enrolled yet.</p>
                    <p className="text-sm text-gray-500 mt-1">Add your first student to get started.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          {/* Classes Management (School Admin) */}
          {activeTab === 'classes' && user.role === 'school_admin' && (
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
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Class</DialogTitle>
                      <DialogDescription>
                        Set up a new class with capacity and academic year information.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateClass}>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-4">
                          <h3 className="font-medium text-gray-900">Class Information</h3>

                          <div className="space-y-2">
                            <Label htmlFor="className">Class Name</Label>
                            <Input
                              id="className"
                              value={classForm.name}
                              onChange={(e) => setClassForm(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="e.g., Grade 1A, JSS 2, Year 10"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="classDescription">Description</Label>
                            <Textarea
                              id="classDescription"
                              value={classForm.description}
                              onChange={(e) => setClassForm(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Brief description of the class"
                              rows={2}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="classCapacity">Capacity</Label>
                              <Input
                                id="classCapacity"
                                type="number"
                                value={classForm.capacity}
                                onChange={(e) => setClassForm(prev => ({ ...prev, capacity: e.target.value }))}
                                placeholder="Maximum number of students"
                                min="1"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="academicYear">Academic Year</Label>
                              <Input
                                id="academicYear"
                                value={classForm.academicYear}
                                onChange={(e) => setClassForm(prev => ({ ...prev, academicYear: e.target.value }))}
                                placeholder="e.g., 2024"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Create Class</Button>
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
                        <TableHead>Class Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Academic Year</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classes.map((cls) => {
                        const enrolledStudents = students.filter(student => student.classId === cls.id).length
                        const isFull = enrolledStudents >= parseInt(cls.capacity)

                        return (
                          <TableRow key={cls.id}>
                            <TableCell className="font-medium">{cls.name}</TableCell>
                            <TableCell className="max-w-xs truncate">{cls.description || 'No description'}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span>{enrolledStudents}/{cls.capacity}</span>
                                {isFull && (
                                  <Badge variant="destructive" className="text-xs">Full</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{cls.academicYear}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {enrolledStudents} students
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={cls.active ? "default" : "secondary"}>
                                {cls.active ? 'Active' : 'Inactive'}
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
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Subjects Management (School Admin) */}
          {activeTab === 'subjects' && user.role === 'school_admin' && (
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
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Subject</DialogTitle>
                      <DialogDescription>
                        Add a new subject to the curriculum.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubject}>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-4">
                          <h3 className="font-medium text-gray-900">Subject Information</h3>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="subjectName">Subject Name</Label>
                              <Input
                                id="subjectName"
                                value={subjectForm.name}
                                onChange={(e) => setSubjectForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g., Mathematics, English Language"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="subjectCode">Subject Code</Label>
                              <Input
                                id="subjectCode"
                                value={subjectForm.code}
                                onChange={(e) => setSubjectForm(prev => ({ ...prev, code: e.target.value }))}
                                placeholder="e.g., MATH101, ENG201"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="subjectDescription">Description</Label>
                            <Textarea
                              id="subjectDescription"
                              value={subjectForm.description}
                              onChange={(e) => setSubjectForm(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Brief description of the subject"
                              rows={2}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="subjectCredits">Credits</Label>
                            <Input
                              id="subjectCredits"
                              type="number"
                              value={subjectForm.credits}
                              onChange={(e) => setSubjectForm(prev => ({ ...prev, credits: e.target.value }))}
                              placeholder="Number of credits"
                              min="1"
                              step="0.5"
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Create Subject</Button>
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
                        <TableHead>Subject Name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Credits</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subjects.map((subject) => (
                        <TableRow key={subject.id}>
                          <TableCell className="font-medium">{subject.name}</TableCell>
                          <TableCell className="font-mono text-sm">{subject.code}</TableCell>
                          <TableCell className="max-w-xs truncate">{subject.description || 'No description'}</TableCell>
                          <TableCell>{subject.credits || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={subject.active ? "default" : "secondary"}>
                              {subject.active ? 'Active' : 'Inactive'}
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

          {/* Billing Dashboard (School Admin) */}
          {activeTab === 'billing' && user.role === 'school_admin' && (
            <BillingDashboard currentUser={user} school={school} />
          )}

          {/* Parent Payments */}
          {activeTab === 'payments' && user.role === 'parent' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Payments</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Make Payment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Make a Payment</DialogTitle>
                      <DialogDescription>
                        Pay school fees or make a donation.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {/* School Bank Details */}
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-gray-900 mb-2">School Bank Details (For Direct Transfer)</h4>
                        <div className="text-sm text-gray-700 space-y-1">
                          <div><strong>Account Name:</strong> {school?.name || 'School Account'}</div>
                          <div><strong>Account Number:</strong> 1234567890</div>
                          <div><strong>Bank:</strong> First Bank Nigeria</div>
                          <div className="mt-2 pt-2 border-t border-blue-200">
                            <p className="text-xs text-gray-600">After transfer, send proof to school admin for confirmation</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {students.length > 1 && (
                          <div className="space-y-2">
                            <Label>Select Child</Label>
                            <Select
                              value={paymentForm.studentId || ''}
                              onValueChange={(value) => setPaymentForm(prev => ({ ...prev, studentId: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select child" />
                              </SelectTrigger>
                              <SelectContent>
                                {students.map((student) => (
                                  <SelectItem key={student.id} value={student.id}>
                                    {student.firstName} {student.lastName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>Payment Type</Label>
                          <Select
                            value={paymentForm.paymentType}
                            onValueChange={(value) => setPaymentForm(prev => ({ ...prev, paymentType: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="school_fees">School Fees</SelectItem>
                              <SelectItem value="uniform">Uniform</SelectItem>
                              <SelectItem value="books">Books & Materials</SelectItem>
                              <SelectItem value="transport">Transport</SelectItem>
                              <SelectItem value="lunch">Lunch</SelectItem>
                              <SelectItem value="excursion">Excursion</SelectItem>
                              <SelectItem value="donation">Donation</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Amount (₦)</Label>
                          <Input
                            type="number"
                            placeholder="Enter amount in Naira"
                            min="1"
                            step="1"
                            value={paymentForm.amount}
                            onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Description (Optional)</Label>
                          <Textarea
                            placeholder="Payment description"
                            rows={2}
                            value={paymentForm.description}
                            onChange={(e) => setPaymentForm(prev => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-3 pt-4">
                        <p className="text-sm font-medium text-gray-700">Select Payment Method:</p>
                        
                        <Button
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleParentPayment('paystack')}
                          disabled={isProcessingPayment}
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          {isProcessingPayment ? 'Processing...' : 'Pay with Card (Paystack)'}
                        </Button>

                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleParentPayment('paystack')}
                          disabled={isProcessingPayment}
                        >
                          <Building2 className="h-4 w-4 mr-2" />
                          Bank Transfer
                        </Button>

                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => handleParentPayment('paystack')}
                            disabled={isProcessingPayment}
                          >
                            OPay
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => handleParentPayment('paystack')}
                            disabled={isProcessingPayment}
                          >
                            PalmPay
                          </Button>
                        </div>

                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleParentPayment('paystack')}
                          disabled={isProcessingPayment}
                        >
                          USSD Payment
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Outstanding Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">$0.00</div>
                    <p className="text-sm text-gray-600 mt-1">No outstanding payments</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Total Paid This Year
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      ${parentPayments.reduce((total, payment) => total + (payment.status === 'completed' ? parseFloat(payment.amount) : 0), 0).toFixed(2)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{parentPayments.filter(p => p.status === 'completed').length} payments made</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>View all your payment transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  {parentPayments.length > 0 ? (
                    <div className="space-y-4">
                      {parentPayments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-full ${payment.status === 'completed' ? 'bg-green-100' : payment.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'}`}>
                              <CreditCard className={`h-4 w-4 ${payment.status === 'completed' ? 'text-green-600' : payment.status === 'pending' ? 'text-yellow-600' : 'text-red-600'}`} />
                            </div>
                            <div>
                              <p className="font-medium capitalize">{payment.paymentType.replace('_', ' ')}</p>
                              <p className="text-sm text-gray-600">{payment.description || 'No description'}</p>
                              <p className="text-xs text-gray-400">{new Date(payment.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">${parseFloat(payment.amount).toFixed(2)}</p>
                            <Badge variant={payment.status === 'completed' ? 'default' : payment.status === 'pending' ? 'secondary' : 'destructive'}>
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No payment history yet</p>
                      <p className="text-sm text-gray-500 mt-1">Your payment transactions will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Gamification Dashboard (All Users) */}
          {activeTab === 'gamification' && (
            <GamificationDashboard currentUser={user} />
          )}

          {/* Attendance Management */}
          {activeTab === 'attendance' && (user.role === 'school_admin' || user.role === 'teacher') && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Attendance Management</h2>
                <Dialog open={showAttendanceModal} onOpenChange={setShowAttendanceModal}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setSelectedClass('')
                      setAttendanceList([])
                      setAttendanceDate(new Date().toISOString().split('T')[0])
                    }}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Mark Attendance
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Mark Attendance</DialogTitle>
                      <DialogDescription>
                        Select class and date to mark attendance for students.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Select Class</Label>
                          <Select
                            value={selectedClass}
                            onValueChange={(value) => {
                              setSelectedClass(value)
                              setAttendanceList([])
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a class" />
                            </SelectTrigger>
                            <SelectContent>
                              {classes.map((cls) => (
                                <SelectItem key={cls.id} value={cls.id}>
                                  {cls.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Date</Label>
                          <Input
                            type="date"
                            value={attendanceDate}
                            onChange={(e) => {
                              setAttendanceDate(e.target.value)
                              if (selectedClass) {
                                setAttendanceList([])
                              }
                            }}
                          />
                        </div>
                      </div>

                      {selectedClass && attendanceDate && (
                        <div className="space-y-4">
                          {attendanceList.length === 0 ? (
                            <div className="text-center py-4">
                              <p className="text-gray-500">Loading students...</p>
                            </div>
                          ) : (
                            <>
                              <h3 className="font-medium">Students Attendance ({attendanceList.length} students)</h3>
                              <div className="max-h-96 overflow-y-auto space-y-2">
                                {attendanceList.map((student, index) => (
                                  <div key={student.studentId} className="flex items-center justify-between p-3 border rounded-lg">
                                    <span className="font-medium">{student.studentName}</span>
                                    <div className="flex space-x-2">
                                      <Button
                                        size="sm"
                                        variant={student.status === 'present' ? 'default' : 'outline'}
                                        onClick={() => {
                                          const newList = [...attendanceList]
                                          newList[index].status = 'present'
                                          setAttendanceList(newList)
                                        }}
                                      >
                                        Present
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant={student.status === 'absent' ? 'destructive' : 'outline'}
                                        onClick={() => {
                                          const newList = [...attendanceList]
                                          newList[index].status = 'absent'
                                          setAttendanceList(newList)
                                        }}
                                      >
                                        Absent
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant={student.status === 'late' ? 'secondary' : 'outline'}
                                        onClick={() => {
                                          const newList = [...attendanceList]
                                          newList[index].status = 'late'
                                          setAttendanceList(newList)
                                        }}
                                      >
                                        Late
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setShowAttendanceModal(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleMarkAttendance}>
                                  Save Attendance
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                      
                      {!selectedClass && (
                        <div className="text-center py-4">
                          <p className="text-gray-500">Please select a class to view students</p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Attendance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                      Present Today
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">0</div>
                    <p className="text-sm text-gray-600 mt-1">Students present</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <XCircle className="h-5 w-5 mr-2 text-red-600" />
                      Absent Today
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">0</div>
                    <p className="text-sm text-gray-600 mt-1">Students absent</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-yellow-600" />
                      Late Today
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-yellow-600">0</div>
                    <p className="text-sm text-gray-600 mt-1">Students late</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Attendance Records */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Attendance Records</CardTitle>
                  <CardDescription>View recent attendance data across all classes</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Present</TableHead>
                        <TableHead>Absent</TableHead>
                        <TableHead>Late</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No attendance records found
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Teacher Assignments (School Admin) */}
          {activeTab === 'assignments' && user.role === 'school_admin' && (
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
                      <DialogTitle>Assign Teacher to Subject</DialogTitle>
                      <DialogDescription>
                        Assign a teacher to teach a specific subject for a class.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateAssignment}>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label>Teacher</Label>
                          <Select
                            value={assignmentForm.teacherId}
                            onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, teacherId: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select teacher" />
                            </SelectTrigger>
                            <SelectContent>
                              {teachers.map((teacher) => (
                                <SelectItem key={teacher.id} value={teacher.id}>
                                  {teacher.firstName} {teacher.lastName} - {teacher.specialization}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Class</Label>
                          <Select
                            value={assignmentForm.classId}
                            onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, classId: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                            <SelectContent>
                              {classes.map((cls) => (
                                <SelectItem key={cls.id} value={cls.id}>
                                  {cls.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Subject</Label>
                          <Select
                            value={assignmentForm.subjectId}
                            onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, subjectId: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                              {subjects.map((subject) => (
                                <SelectItem key={subject.id} value={subject.id}>
                                  {subject.name} ({subject.code})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Assign Teacher</Button>
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
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.map((assignment) => {
                        const teacher = teachers.find(t => t.id === assignment.teacherId)
                        return (
                          <TableRow key={assignment.id}>
                            <TableCell>
                              {teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown Teacher'}
                            </TableCell>
                            <TableCell>{assignment.subjectName}</TableCell>
                            <TableCell>{assignment.className}</TableCell>
                            <TableCell>
                              {new Date(assignment.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant={assignment.active ? "default" : "secondary"}>
                                {assignment.active ? 'Active' : 'Inactive'}
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
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {assignments.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No teacher assignments yet.</p>
                    <p className="text-sm text-gray-500 mt-1">Assign teachers to subjects and classes to get started.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="fixed inset-0 z-50">
              <MessagesPage
                currentUser={user}
                onBack={() => setActiveTab('dashboard')}
              />
            </div>
          )}

          {/* Placeholder for other tabs */}
          {!['dashboard', 'notifications', 'schools', 'teachers', 'parents', 'students', 'classes', 'subjects', 'assignments', 'attendance', 'billing', 'payments', 'gamification', 'messages'].includes(activeTab) && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600">This section is under development.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* AI Assistant Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
              title="AI Assistant"
            >
              <Bot className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl h-[80vh] p-0">
            <DialogHeader className="p-4 border-b">
              <DialogTitle className="flex items-center">
                <Bot className="h-5 w-5 mr-2" />
                EduManage AI Assistant
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 h-full">
              <AIAssistant currentUser={user} />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}