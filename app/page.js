'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import QuickActions from '@/components/dashboard/QuickActions'
import AttendanceCharts from '@/components/dashboard/AttendanceCharts'
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
  Download,
  Calculator,
  Bot,
  Camera
} from 'lucide-react'
import CalculatorApp from '@/components/calculator/calculator'
import PuterAI from '@/components/ai/PuterAI'
import { exportStudentsToCSV, exportTeachersToCSV, exportParentsToCSV } from '@/lib/csv-export'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

function App() {
  // Core state
  const [user, setUser] = useState(null)
  const [school, setSchool] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showCalculator, setShowCalculator] = useState(false)
  
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
      dateOfJoining: '',
      photo: ''
    },
    credentials: {
      email: '',
      password: ''
    }
  })
  const [teacherPhotoPreview, setTeacherPhotoPreview] = useState('')
  
  const [parentForm, setParentForm] = useState({
    parentData: {
      name: '',
      phoneNumber: '',
      address: '',
      photo: ''
    },
    parentCredentials: {
      email: '',
      password: ''
    }
  })
  const [parentPhotoPreview, setParentPhotoPreview] = useState('')
  
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
    emergencyContact: '',
    photo: ''
  })
  const [studentPhotoPreview, setStudentPhotoPreview] = useState('')
  
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

  // Handle photo upload
  const handlePhotoUpload = (e, formType) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result
      
      if (formType === 'student') {
        setStudentPhotoPreview(base64String)
        setStudentForm(prev => ({ ...prev, photo: base64String }))
      } else if (formType === 'teacher') {
        setTeacherPhotoPreview(base64String)
        setTeacherForm(prev => ({
          ...prev,
          teacherData: { ...prev.teacherData, photo: base64String }
        }))
      } else if (formType === 'parent') {
        setParentPhotoPreview(base64String)
        setParentForm(prev => ({
          ...prev,
          parentData: { ...prev.parentData, photo: base64String }
        }))
      }
    }
    reader.readAsDataURL(file)
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
      if (user.role === 'school_admin' || user.role === 'teacher') {
        loadTodayAttendance()
      }
      if (user.role === 'school_admin') {
        loadSchoolSettings()
      }
    }
  }, [user, token])
  
  // Apply school colors to website
  useEffect(() => {
    const hexToHSL = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      if (!result) return null
      
      let r = parseInt(result[1], 16) / 255
      let g = parseInt(result[2], 16) / 255
      let b = parseInt(result[3], 16) / 255
      
      const max = Math.max(r, g, b), min = Math.min(r, g, b)
      let h, s, l = (max + min) / 2
      
      if (max === min) {
        h = s = 0
      } else {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
          case g: h = ((b - r) / d + 2) / 6; break
          case b: h = ((r - g) / d + 4) / 6; break
        }
      }
      
      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
    }
    
    if (schoolSettings.primaryColor) {
      const hsl = hexToHSL(schoolSettings.primaryColor)
      if (hsl) {
        document.documentElement.style.setProperty('--primary', hsl)
        document.documentElement.style.setProperty('--theme-primary', schoolSettings.primaryColor)
      }
    }
    if (schoolSettings.secondaryColor) {
      const hsl = hexToHSL(schoolSettings.secondaryColor)
      if (hsl) {
        document.documentElement.style.setProperty('--secondary', hsl)
      }
    }
  }, [schoolSettings.primaryColor, schoolSettings.secondaryColor])
  
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
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB')
      return
    }
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      
      if (!response.ok) throw new Error('Upload failed')
      
      const data = await response.json()
      setSchoolSettings(prev => ({ ...prev, logo: data.url }))
      toast.success('Logo uploaded successfully!')
    } catch (error) {
      toast.error('Failed to upload logo')
    }
  }
  
  const handleSaveSettings = async (e) => {
    e.preventDefault()
    try {
      await apiCall('school/settings', {
        method: 'POST',
        body: JSON.stringify(schoolSettings)
      })
      
      toast.success('Settings saved successfully!')
      setShowSettingsModal(false)
      
      // Update local school data
      if (school) {
        const updatedSchool = { 
          ...school, 
          name: schoolSettings.schoolName,
          logo: schoolSettings.logo
        }
        setSchool(updatedSchool)
        localStorage.setItem('school', JSON.stringify(updatedSchool))
      }
      
      // Apply colors to document
      document.documentElement.style.setProperty('--primary-color', schoolSettings.primaryColor)
      document.documentElement.style.setProperty('--secondary-color', schoolSettings.secondaryColor)
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
          dateOfJoining: '',
          photo: ''
        },
        credentials: {
          email: '',
          password: ''
        }
      })
      setTeacherPhotoPreview('')
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
          address: '',
          photo: ''
        },
        parentCredentials: {
          email: '',
          password: ''
        }
      })
      setParentPhotoPreview('')
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
        emergencyContact: '',
        photo: ''
      })
      setStudentPhotoPreview('')
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
    if (!attendanceDate) return
    
    try {
      if (user.role === 'school_admin') {
        // Admin marks teacher attendance - ensure teachers are loaded
        if (teachers.length === 0) {
          console.log('No teachers loaded yet')
          return
        }
        
        const attendanceRecords = await apiCall(`attendance?date=${attendanceDate}`)
        
        const attendanceMap = {}
        attendanceRecords.forEach(record => {
          if (record.teacherId) {
            attendanceMap[record.teacherId] = record.status
          }
        })
        
        const attendanceData = teachers.map(teacher => ({
          teacherId: teacher.id,
          teacherName: `${teacher.firstName} ${teacher.lastName}`,
          status: attendanceMap[teacher.id] || 'present'
        }))
        
        setAttendanceList(attendanceData)
      } else if (user.role === 'teacher') {
        // Teacher marks student attendance
        if (!selectedClass) return
        
        const classStudents = students.filter(student => student.classId === selectedClass)
        
        if (classStudents.length === 0) {
          setAttendanceList([])
          return
        }
        
        const attendanceRecords = await apiCall(`attendance?classId=${selectedClass}&date=${attendanceDate}`)
        
        const attendanceMap = {}
        attendanceRecords.forEach(record => {
          if (record.studentId) {
            attendanceMap[record.studentId] = record.status
          }
        })
        
        const attendanceData = classStudents.map(student => ({
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          status: attendanceMap[student.id] || 'present'
        }))
        
        setAttendanceList(attendanceData)
      }
    } catch (error) {
      console.error('Error loading attendance:', error)
      setAttendanceList([])
    }
  }
  
  const handleMarkAttendance = async () => {
    try {
      if (user.role === 'school_admin') {
        const attendanceData = attendanceList.map(item => ({
          teacherId: item.teacherId,
          date: attendanceDate,
          status: item.status
        }))
        
        await apiCall('attendance/bulk', {
          method: 'POST',
          body: JSON.stringify({ attendanceList: attendanceData })
        })
      } else {
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
      }
      
      toast.success('Attendance marked successfully!')
      setShowAttendanceModal(false)
      loadTodayAttendance()
    } catch (error) {
      // Error already handled in apiCall
    }
  }

  const loadTodayAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const records = await apiCall(`attendance?date=${today}`)
      setAttendance(records)
    } catch (error) {
      console.error('Error loading today attendance:', error)
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

  // Load attendance when modal opens or date/class changes
  useEffect(() => {
    if (!showAttendanceModal) return
    
    if (user?.role === 'school_admin' && attendanceDate && teachers.length > 0) {
      loadAttendanceForClass()
    } else if (user?.role === 'teacher' && selectedClass && attendanceDate && students.length > 0) {
      loadAttendanceForClass()
    }
  }, [showAttendanceModal, selectedClass, attendanceDate, students.length, teachers.length, user?.role])

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
      
      {/* Sidebar - Fixed responsive positioning */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 
        ${sidebarCollapsed ? 'w-16' : 'w-64'} bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl
        transform transition-all duration-300 ease-in-out 
        lg:translate-x-0 lg:block
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-700/50 bg-slate-800/50">
          <div className="flex items-center">
            {schoolSettings?.logo ? (
              <img src={schoolSettings.logo} alt="School Logo" className="h-12 w-12 mr-3 rounded-xl object-cover ring-2 ring-blue-400/50" />
            ) : school?.logo ? (
              <img src={school.logo} alt="School Logo" className="h-12 w-12 mr-3 rounded-xl object-cover ring-2 ring-blue-400/50" />
            ) : (
              <div className="h-12 w-12 mr-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <School className="h-7 w-7 text-white" />
              </div>
            )}
            {!sidebarCollapsed && (
              <div>
                <span className="text-lg font-bold text-white block leading-tight">
                  {school?.name || 'EduManage'}
                </span>
                {user.role === 'developer' && (
                  <span className="text-xs text-blue-400 font-medium">Master System</span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {/* Collapse/Expand Button - Hidden on mobile */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:block text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700/50 transition-all"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
            {/* Mobile close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700/50 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {getNavigationItems().map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center px-3 py-2.5 text-left text-sm font-medium rounded-xl transition-all duration-200 group ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/50 scale-105'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                }`}
                title={sidebarCollapsed ? item.label : ''}
              >
                <Icon className={`h-5 w-5 mr-3 flex-shrink-0 transition-transform duration-200 ${
                  activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'
                }`} />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.id === 'messages' && notifications.filter(n => !n.read).length > 0 && (
                      <Badge className="ml-2 text-xs px-2 py-0.5 bg-red-500 text-white animate-pulse">
                        {notifications.filter(n => !n.read).length}
                      </Badge>
                    )}
                  </>
                )}
              </button>
            )
          })}
        </nav>
        
        {/* User Profile Section */}
        <div className="border-t border-slate-700/50 p-4 bg-slate-800/30">
          <div className="flex items-center mb-3">
            <Avatar className="h-10 w-10 mr-3 ring-2 ring-blue-400/50">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <div className="flex items-center space-x-1">
                  <Badge className="text-xs capitalize bg-blue-500/20 text-blue-300 border-blue-400/30">
                    {user.role === 'school_admin' ? 'Admin' : user.role}
                  </Badge>
                  {user.role === 'developer' && (
                    <Crown className="h-3 w-3 text-yellow-400" />
                  )}
                </div>
              </div>
            )}
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className={`${sidebarCollapsed ? 'w-10 h-10 p-0' : 'w-full'} justify-center bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all`}
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
        <div className="bg-white shadow-md h-16 flex items-center justify-between px-4 lg:px-6 border-b border-gray-100">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900 mr-4 p-2 rounded-xl hover:bg-gray-100 transition-all"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent capitalize">
                  {activeTab.replace('-', ' ')}
                </h1>
              </div>
              {user.role !== 'developer' && school && (
                <Badge className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200">
                  {school.name}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {user.role === 'school_admin' && (
                <BroadcastNotification
                  currentUser={user}
                  trigger={
                    <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg transition-all" size="sm">
                      <Megaphone className="h-4 w-4 mr-2" />
                      Broadcast
                    </Button>
                  }
                />
              )}
              <button
                onClick={() => document.querySelector('[data-puter-trigger]')?.click()}
                className="p-2.5 rounded-xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 transition-all text-gray-600 hover:text-blue-600 group"
                title="AI Assistant"
              >
                <Bot className="h-5 w-5 group-hover:scale-110 transition-transform" />
              </button>
              <button
                onClick={() => setShowCalculator(true)}
                className="p-2.5 rounded-xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 transition-all text-gray-600 hover:text-purple-600 group"
                title="Calculator"
              >
                <Calculator className="h-5 w-5 group-hover:scale-110 transition-transform" />
              </button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 transition-all group">
                    <Avatar className="h-9 w-9 ring-2 ring-gray-200 group-hover:ring-blue-400 transition-all">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role === 'school_admin' ? 'Admin' : user.role}</p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <Badge variant="secondary" className="text-xs w-fit capitalize">
                      {user.role === 'school_admin' ? 'Admin' : user.role.replace('_', ' ')}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === 'school_admin' && (
                  <DropdownMenuItem onClick={() => setActiveTab('school-settings')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
        
        {/* Content area - with proper scrolling */}
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
            {/* Quick Actions */}
            {(user.role === 'school_admin' || user.role === 'teacher') && (
              <QuickActions 
                userRole={user.role}
                onAction={(actionId) => {
                  if (actionId === 'add-student') setShowStudentModal(true)
                  else if (actionId === 'add-teacher') setShowTeacherModal(true)
                  else if (actionId === 'add-parent') setShowParentModal(true)
                  else if (actionId === 'mark-attendance') setShowAttendanceModal(true)
                  else if (actionId === 'generate-report') toast.info('Report generation coming soon!')
                }}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Students Card */}
              <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-4 bg-blue-500 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <Badge className="bg-blue-500 text-white px-3 py-1 text-xs font-semibold">
                      Active
                    </Badge>
                  </div>
                  <CardTitle className="text-3xl font-bold text-blue-900 mb-2">
                    {stats.totalStudents || 0}
                  </CardTitle>
                  <CardDescription className="text-blue-700 font-medium text-lg">
                    Total Students
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="flex items-center justify-between pt-4 border-t border-blue-200">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-600">+5% this month</span>
                    </div>
                    {user.role === 'school_admin' && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-blue-700 hover:bg-blue-200"
                        onClick={() => setActiveTab('students')}
                      >
                        View All
                        <Eye className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Teachers Card */}
              <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-4 bg-emerald-500 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <UserCheck className="h-8 w-8 text-white" />
                    </div>
                    <Badge className="bg-emerald-500 text-white px-3 py-1 text-xs font-semibold">
                      Active
                    </Badge>
                  </div>
                  <CardTitle className="text-3xl font-bold text-emerald-900 mb-2">
                    {stats.totalTeachers || 0}
                  </CardTitle>
                  <CardDescription className="text-emerald-700 font-medium text-lg">
                    Total Teachers
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="flex items-center justify-between pt-4 border-t border-emerald-200">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-600">+2% this month</span>
                    </div>
                    {user.role === 'school_admin' && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-emerald-700 hover:bg-emerald-200"
                        onClick={() => setActiveTab('teachers')}
                      >
                        View All
                        <Eye className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Unread Messages Card */}
              <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-4 bg-purple-500 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 relative">
                      <MessageCircle className="h-8 w-8 text-white" />
                      {notifications.filter(n => !n.read).length > 0 && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                          {notifications.filter(n => !n.read).length}
                        </div>
                      )}
                    </div>
                    <Badge className="bg-purple-500 text-white px-3 py-1 text-xs font-semibold">
                      New
                    </Badge>
                  </div>
                  <CardTitle className="text-3xl font-bold text-purple-900 mb-2">
                    {notifications.filter(n => !n.read).length}
                  </CardTitle>
                  <CardDescription className="text-purple-700 font-medium text-lg">
                    Unread Messages
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="flex items-center justify-between pt-4 border-t border-purple-200">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-semibold text-purple-600">
                        {notifications.filter(n => !n.read).length > 0 ? 'Action needed' : 'All caught up'}
                      </span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-purple-700 hover:bg-purple-200"
                      onClick={() => setActiveTab('messages')}
                    >
                      View All
                      <MessageCircle className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Attendance Charts */}
            {(user.role === 'school_admin' || user.role === 'teacher') && (
              <AttendanceCharts />
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
                      <Label htmlFor="logo">School Logo</Label>
                      <div className="flex items-center gap-4">
                        {schoolSettings.logo && (
                          <img src={schoolSettings.logo} alt="Logo" className="h-16 w-16 object-contain border rounded" />
                        )}
                        <div className="flex-1">
                          <Input
                            id="logoFile"
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="cursor-pointer"
                          />
                          <p className="text-xs text-gray-500 mt-1">Upload image (max 2MB)</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="primaryColor">Primary Color</Label>
                        <div className="flex gap-2">
                          <Input
                            id="primaryColor"
                            type="color"
                            value={schoolSettings.primaryColor}
                            onChange={(e) => setSchoolSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="w-20 h-10 cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={schoolSettings.primaryColor}
                            onChange={(e) => setSchoolSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="secondaryColor">Secondary Color</Label>
                        <div className="flex gap-2">
                          <Input
                            id="secondaryColor"
                            type="color"
                            value={schoolSettings.secondaryColor}
                            onChange={(e) => setSchoolSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                            className="w-20 h-10 cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={schoolSettings.secondaryColor}
                            onChange={(e) => setSchoolSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                            className="flex-1"
                          />
                        </div>
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
          
          {/* School Settings Modal - REMOVED */}
          <Dialog open={false} onOpenChange={() => {}}>
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
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => exportTeachersToCSV(teachers, school?.name)}>
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
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                    <DialogHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 -mx-6 -mt-6 px-6 py-4 border-b border-emerald-100">
                      <DialogTitle className="text-2xl font-bold text-emerald-900">Create Teacher Account</DialogTitle>
                      <DialogDescription className="text-emerald-700 text-base">
                        Fill in teacher information and create login credentials.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateTeacher}>
                      <div className="overflow-y-auto max-h-[calc(90vh-200px)] px-1 py-6">
                        <div className="space-y-6">
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-100">
                            <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                              <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-3"></div>
                              Personal Information
                            </h3>

                            <div className="space-y-5">
                              <div className="bg-white p-4 rounded-xl border border-blue-100">
                                <Label className="text-base font-semibold text-gray-700 mb-3 block">Photo</Label>
                                <div className="flex items-center gap-4">
                                  {teacherPhotoPreview && (
                                    <img src={teacherPhotoPreview} alt="Preview" className="h-24 w-24 rounded-2xl object-cover border-4 border-blue-200 shadow-lg" />
                                  )}
                                  <div className="flex-1 space-y-3">
                                    <div className="flex gap-3">
                                      <label className="flex-1 cursor-pointer">
                                        <Input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => handlePhotoUpload(e, 'teacher')}
                                          className="cursor-pointer h-12 text-base"
                                        />
                                      </label>
                                      <label className="cursor-pointer">
                                        <Input
                                          type="file"
                                          accept="image/*"
                                          capture="environment"
                                          onChange={(e) => handlePhotoUpload(e, 'teacher')}
                                          className="hidden"
                                          id="teacher-camera"
                                        />
                                        <Button type="button" variant="outline" className="h-12 px-6" onClick={() => document.getElementById('teacher-camera').click()}>
                                          <Camera className="h-5 w-5 mr-2" />
                                          Camera
                                        </Button>
                                      </label>
                                    </div>
                                    <p className="text-sm text-gray-500">Upload photo or use camera (max 5MB)</p>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="bg-white p-4 rounded-xl border border-blue-100">
                                  <Label htmlFor="firstName" className="text-base font-semibold text-gray-700 mb-2 block">First Name *</Label>
                                  <Input
                                    id="firstName"
                                    value={teacherForm.teacherData.firstName}
                                    onChange={(e) => setTeacherForm(prev => ({
                                      ...prev,
                                      teacherData: { ...prev.teacherData, firstName: e.target.value }
                                    }))}
                                    className="h-12 text-lg"
                                    placeholder="Enter first name"
                                    required
                                  />
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-blue-100">
                                  <Label htmlFor="lastName" className="text-base font-semibold text-gray-700 mb-2 block">Last Name *</Label>
                                  <Input
                                    id="lastName"
                                    value={teacherForm.teacherData.lastName}
                                    onChange={(e) => setTeacherForm(prev => ({
                                      ...prev,
                                      teacherData: { ...prev.teacherData, lastName: e.target.value }
                                    }))}
                                    className="h-12 text-lg"
                                    placeholder="Enter last name"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="bg-white p-4 rounded-xl border border-blue-100">
                                  <Label htmlFor="teacherPhone" className="text-base font-semibold text-gray-700 mb-2 block">Phone Number *</Label>
                                  <Input
                                    id="teacherPhone"
                                    value={teacherForm.teacherData.phoneNumber}
                                    onChange={(e) => setTeacherForm(prev => ({
                                      ...prev,
                                      teacherData: { ...prev.teacherData, phoneNumber: e.target.value }
                                    }))}
                                    className="h-12 text-lg"
                                    placeholder="Enter phone number"
                                    required
                                  />
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-blue-100">
                                  <Label htmlFor="qualification" className="text-base font-semibold text-gray-700 mb-2 block">Qualification *</Label>
                                  <Input
                                    id="qualification"
                                    value={teacherForm.teacherData.qualification}
                                    onChange={(e) => setTeacherForm(prev => ({
                                      ...prev,
                                      teacherData: { ...prev.teacherData, qualification: e.target.value }
                                    }))}
                                    className="h-12 text-lg"
                                    placeholder="e.g., B.Ed, M.Sc"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="bg-white p-4 rounded-xl border border-blue-100">
                                <Label htmlFor="teacherAddress" className="text-base font-semibold text-gray-700 mb-2 block">Address</Label>
                                <Textarea
                                  id="teacherAddress"
                                  value={teacherForm.teacherData.address}
                                  onChange={(e) => setTeacherForm(prev => ({
                                    ...prev,
                                    teacherData: { ...prev.teacherData, address: e.target.value }
                                  }))}
                                  className="min-h-[100px] text-lg"
                                  placeholder="Enter full address"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-100">
                            <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center">
                              <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full mr-3"></div>
                              Login Credentials
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <div className="bg-white p-4 rounded-xl border border-purple-100">
                                <Label htmlFor="teacherEmail" className="text-base font-semibold text-gray-700 mb-2 block">Email *</Label>
                                <Input
                                  id="teacherEmail"
                                  type="email"
                                  value={teacherForm.credentials.email}
                                  onChange={(e) => setTeacherForm(prev => ({
                                    ...prev,
                                    credentials: { ...prev.credentials, email: e.target.value }
                                  }))}
                                  className="h-12 text-lg"
                                  placeholder="teacher@school.com"
                                  required
                                />
                              </div>
                              <div className="bg-white p-4 rounded-xl border border-purple-100">
                                <Label htmlFor="teacherPassword" className="text-base font-semibold text-gray-700 mb-2 block">Temporary Password *</Label>
                                <Input
                                  id="teacherPassword"
                                  type="password"
                                  value={teacherForm.credentials.password}
                                  onChange={(e) => setTeacherForm(prev => ({
                                    ...prev,
                                    credentials: { ...prev.credentials, password: e.target.value }
                                  }))}
                                  className="h-12 text-lg"
                                  placeholder="Enter password"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <DialogFooter className="bg-gradient-to-r from-gray-50 to-gray-100 -mx-6 -mb-6 px-6 py-4 border-t mt-6">
                        <Button type="submit" size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 h-12 text-base font-semibold shadow-lg">
                          Create Teacher Account
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
                </div>
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
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => exportParentsToCSV(parents, students, school?.name)}>
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
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
                    <DialogHeader className="bg-gradient-to-r from-amber-50 to-orange-50 -mx-6 -mt-6 px-6 py-4 border-b border-amber-100">
                      <DialogTitle className="text-2xl font-bold text-amber-900">Create Parent Account</DialogTitle>
                      <DialogDescription className="text-amber-700 text-base">
                        Create a parent account with login credentials.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateParent}>
                      <div className="overflow-y-auto max-h-[calc(90vh-200px)] px-1 py-6">
                        <div className="space-y-6">
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-100">
                            <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                              <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-3"></div>
                              Parent Information
                            </h3>

                            <div className="space-y-5">
                              <div className="bg-white p-4 rounded-xl border border-blue-100">
                                <Label className="text-base font-semibold text-gray-700 mb-3 block">Photo</Label>
                                <div className="flex items-center gap-4">
                                  {parentPhotoPreview && (
                                    <img src={parentPhotoPreview} alt="Preview" className="h-24 w-24 rounded-2xl object-cover border-4 border-blue-200 shadow-lg" />
                                  )}
                                  <div className="flex-1 space-y-3">
                                    <div className="flex gap-3">
                                      <label className="flex-1 cursor-pointer">
                                        <Input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => handlePhotoUpload(e, 'parent')}
                                          className="cursor-pointer h-12 text-base"
                                        />
                                      </label>
                                      <label className="cursor-pointer">
                                        <Input
                                          type="file"
                                          accept="image/*"
                                          capture="environment"
                                          onChange={(e) => handlePhotoUpload(e, 'parent')}
                                          className="hidden"
                                          id="parent-camera"
                                        />
                                        <Button type="button" variant="outline" className="h-12 px-6" onClick={() => document.getElementById('parent-camera').click()}>
                                          <Camera className="h-5 w-5 mr-2" />
                                          Camera
                                        </Button>
                                      </label>
                                    </div>
                                    <p className="text-sm text-gray-500">Upload photo or use camera (max 5MB)</p>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-white p-4 rounded-xl border border-blue-100">
                                <Label htmlFor="parentName" className="text-base font-semibold text-gray-700 mb-2 block">Full Name *</Label>
                                <Input
                                  id="parentName"
                                  value={parentForm.parentData.name}
                                  onChange={(e) => setParentForm(prev => ({
                                    ...prev,
                                    parentData: { ...prev.parentData, name: e.target.value }
                                  }))}
                                  className="h-12 text-lg"
                                  placeholder="Enter full name"
                                  required
                                />
                              </div>

                              <div className="bg-white p-4 rounded-xl border border-blue-100">
                                <Label htmlFor="parentPhone" className="text-base font-semibold text-gray-700 mb-2 block">Phone Number *</Label>
                                <Input
                                  id="parentPhone"
                                  value={parentForm.parentData.phoneNumber}
                                  onChange={(e) => setParentForm(prev => ({
                                    ...prev,
                                    parentData: { ...prev.parentData, phoneNumber: e.target.value }
                                  }))}
                                  className="h-12 text-lg"
                                  placeholder="Enter phone number"
                                  required
                                />
                              </div>

                              <div className="bg-white p-4 rounded-xl border border-blue-100">
                                <Label htmlFor="parentAddress" className="text-base font-semibold text-gray-700 mb-2 block">Address</Label>
                                <Textarea
                                  id="parentAddress"
                                  value={parentForm.parentData.address}
                                  onChange={(e) => setParentForm(prev => ({
                                    ...prev,
                                    parentData: { ...prev.parentData, address: e.target.value }
                                  }))}
                                  className="min-h-[100px] text-lg"
                                  placeholder="Enter full address"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-100">
                            <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center">
                              <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full mr-3"></div>
                              Login Credentials
                            </h3>

                            <div className="space-y-5">
                              <div className="bg-white p-4 rounded-xl border border-purple-100">
                                <Label htmlFor="parentEmail" className="text-base font-semibold text-gray-700 mb-2 block">Email *</Label>
                                <Input
                                  id="parentEmail"
                                  type="email"
                                  value={parentForm.parentCredentials.email}
                                  onChange={(e) => setParentForm(prev => ({
                                    ...prev,
                                    parentCredentials: { ...prev.parentCredentials, email: e.target.value }
                                  }))}
                                  className="h-12 text-lg"
                                  placeholder="parent@email.com"
                                  required
                                />
                              </div>

                              <div className="bg-white p-4 rounded-xl border border-purple-100">
                                <Label htmlFor="parentPassword" className="text-base font-semibold text-gray-700 mb-2 block">Temporary Password *</Label>
                                <Input
                                  id="parentPassword"
                                  type="password"
                                  value={parentForm.parentCredentials.password}
                                  onChange={(e) => setParentForm(prev => ({
                                    ...prev,
                                    parentCredentials: { ...prev.parentCredentials, password: e.target.value }
                                  }))}
                                  className="h-12 text-lg"
                                  placeholder="Enter password"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <DialogFooter className="bg-gradient-to-r from-gray-50 to-gray-100 -mx-6 -mb-6 px-6 py-4 border-t mt-6">
                        <Button type="submit" size="lg" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-8 h-12 text-base font-semibold shadow-lg">
                          Create Parent Account
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
                </div>
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
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => exportStudentsToCSV(students, classes, parents, school?.name)}>
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
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                    <DialogHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 -mx-6 -mt-6 px-6 py-4 border-b border-blue-100">
                      <DialogTitle className="text-2xl font-bold text-blue-900">Add New Student</DialogTitle>
                      <DialogDescription className="text-blue-700 text-base">
                        Fill in student information to create a new student record.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateStudent}>
                      <div className="overflow-y-auto max-h-[calc(90vh-200px)] px-1 py-6">
                        <div className="space-y-4">
                          <h3 className="font-medium text-gray-900">Personal Information</h3>

                          <div className="space-y-2">
                            <Label>Photo</Label>
                            <div className="flex items-center gap-4">
                              {studentPhotoPreview && (
                                <img src={studentPhotoPreview} alt="Preview" className="h-20 w-20 rounded-full object-cover border-2 border-gray-200" />
                              )}
                              <div className="flex-1 space-y-2">
                                <div className="flex gap-2">
                                  <label className="flex-1 cursor-pointer">
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handlePhotoUpload(e, 'student')}
                                      className="cursor-pointer"
                                    />
                                  </label>
                                  <label className="cursor-pointer">
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      capture="environment"
                                      onChange={(e) => handlePhotoUpload(e, 'student')}
                                      className="hidden"
                                      id="student-camera"
                                    />
                                    <Button type="button" variant="outline" className="w-full" onClick={() => document.getElementById('student-camera').click()}>
                                      <Camera className="h-4 w-4 mr-2" />
                                      Camera
                                    </Button>
                                  </label>
                                </div>
                                <p className="text-xs text-gray-500">Upload photo or use camera (max 5MB)</p>
                              </div>
                            </div>
                          </div>

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
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Attendance Management</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {user.role === 'school_admin' ? 'Mark and track teacher attendance' : 'Mark and track student attendance'}
                  </p>
                </div>
                <Dialog open={showAttendanceModal} onOpenChange={setShowAttendanceModal}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      const today = new Date().toISOString().split('T')[0]
                      setSelectedClass('')
                      setAttendanceList([])
                      setAttendanceDate(today)
                      setShowAttendanceModal(true)
                    }} size="lg">
                      <Calendar className="h-4 w-4 mr-2" />
                      Mark {user.role === 'school_admin' ? 'Teacher' : 'Student'} Attendance
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl max-h-[90vh]">
                    <DialogHeader>
                      <DialogTitle className="text-xl">Mark {user.role === 'school_admin' ? 'Teacher' : 'Student'} Attendance</DialogTitle>
                      <DialogDescription>
                        {user.role === 'school_admin' ? 'Select date to mark attendance for all teachers.' : 'Select class and date to mark attendance for students.'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className={user.role === 'school_admin' ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-2 gap-4'}>
                        {user.role === 'teacher' && (
                          <div className="space-y-2">
                            <Label className="text-base font-medium">Select Class</Label>
                            <Select
                              value={selectedClass}
                              onValueChange={(value) => {
                                setSelectedClass(value)
                                setAttendanceList([])
                              }}
                            >
                              <SelectTrigger className="h-11">
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
                        )}
                        <div className="space-y-2">
                          <Label className="text-base font-medium">Date</Label>
                          <Input
                            type="date"
                            className="h-11"
                            value={attendanceDate}
                            max={new Date().toISOString().split('T')[0]}
                            onChange={(e) => {
                              setAttendanceDate(e.target.value)
                            }}
                          />
                        </div>
                      </div>

                      {((user.role === 'school_admin' && attendanceDate) || (user.role === 'teacher' && selectedClass && attendanceDate)) && (
                        <div className="space-y-4">
                          {attendanceList.length === 0 ? (
                            <div className="text-center py-8">
                              <div className="animate-pulse">
                                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500">Loading {user.role === 'school_admin' ? 'teachers' : 'students'}...</p>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-lg">
                                  {user.role === 'school_admin' ? `${attendanceList.length} Teachers` : `${attendanceList.length} Students`}
                                </h3>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const newList = attendanceList.map(item => ({ ...item, status: 'present' }))
                                      setAttendanceList(newList)
                                    }}
                                  >
                                    Mark All Present
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const newList = attendanceList.map(item => ({ ...item, status: 'absent' }))
                                      setAttendanceList(newList)
                                    }}
                                  >
                                    Mark All Absent
                                  </Button>
                                </div>
                              </div>
                              <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
                                {attendanceList.map((item, index) => (
                                  <div key={item.teacherId || item.studentId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                                          {(item.teacherName || item.studentName).split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <span className="font-medium text-base">{item.teacherName || item.studentName}</span>
                                        <p className="text-xs text-gray-500">ID: {(item.teacherId || item.studentId).slice(0, 8)}</p>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        className="min-w-[90px]"
                                        variant={item.status === 'present' ? 'default' : 'outline'}
                                        onClick={() => {
                                          const newList = [...attendanceList]
                                          newList[index].status = 'present'
                                          setAttendanceList(newList)
                                        }}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Present
                                      </Button>
                                      <Button
                                        size="sm"
                                        className="min-w-[90px]"
                                        variant={item.status === 'absent' ? 'destructive' : 'outline'}
                                        onClick={() => {
                                          const newList = [...attendanceList]
                                          newList[index].status = 'absent'
                                          setAttendanceList(newList)
                                        }}
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Absent
                                      </Button>
                                      <Button
                                        size="sm"
                                        className="min-w-[90px]"
                                        variant={item.status === 'late' ? 'secondary' : 'outline'}
                                        onClick={() => {
                                          const newList = [...attendanceList]
                                          newList[index].status = 'late'
                                          setAttendanceList(newList)
                                        }}
                                      >
                                        <Clock className="h-4 w-4 mr-1" />
                                        Late
                                      </Button>
                                      <Button
                                        size="sm"
                                        className="min-w-[90px]"
                                        variant={item.status === 'sick' ? 'default' : 'outline'}
                                        onClick={() => {
                                          const newList = [...attendanceList]
                                          newList[index].status = 'sick'
                                          setAttendanceList(newList)
                                        }}
                                      >
                                        <Activity className="h-4 w-4 mr-1" />
                                        Sick
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-between items-center pt-4 border-t">
                                <div className="text-sm text-gray-600">
                                  Present: <span className="font-semibold text-green-600">{attendanceList.filter(i => i.status === 'present').length}</span> | 
                                  Absent: <span className="font-semibold text-red-600">{attendanceList.filter(i => i.status === 'absent').length}</span> | 
                                  Late: <span className="font-semibold text-yellow-600">{attendanceList.filter(i => i.status === 'late').length}</span> | 
                                  Sick: <span className="font-semibold text-orange-600">{attendanceList.filter(i => i.status === 'sick').length}</span>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" onClick={() => setShowAttendanceModal(false)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={handleMarkAttendance} size="lg">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Save Attendance
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                      
                      {user.role === 'teacher' && !selectedClass && (
                        <div className="text-center py-8">
                          <School className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500">Please select a class to view students</p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Attendance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                      Present Today
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {attendance.filter(a => a.status === 'present').length}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {user.role === 'school_admin' ? 'Teachers present' : 'Students present'}
                    </p>
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
                    <div className="text-3xl font-bold text-red-600">
                      {attendance.filter(a => a.status === 'absent').length}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {user.role === 'school_admin' ? 'Teachers absent' : 'Students absent'}
                    </p>
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
                    <div className="text-3xl font-bold text-yellow-600">
                      {attendance.filter(a => a.status === 'late').length}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {user.role === 'school_admin' ? 'Teachers late' : 'Students late'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-orange-600" />
                      Sick Today
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-600">
                      {attendance.filter(a => a.status === 'sick').length}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {user.role === 'school_admin' ? 'Teachers sick' : 'Students sick'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Attendance Records */}
              <Card>
                <CardHeader>
                  <CardTitle>Today's Attendance Details</CardTitle>
                  <CardDescription>Individual attendance records for today</CardDescription>
                </CardHeader>
                <CardContent>
                  {attendance.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{user.role === 'school_admin' ? 'Teacher' : 'Student'}</TableHead>
                          {user.role === 'teacher' && <TableHead>Class</TableHead>}
                          <TableHead>Status</TableHead>
                          <TableHead>Marked By</TableHead>
                          <TableHead>Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendance.map((record) => {
                          const person = user.role === 'school_admin' 
                            ? teachers.find(t => t.id === record.teacherId)
                            : students.find(s => s.id === record.studentId)
                          const className = user.role === 'teacher' ? classes.find(c => c.id === record.classId)?.name : null
                          
                          return (
                            <TableRow key={record.id}>
                              <TableCell className="font-medium">
                                {person ? `${person.firstName} ${person.lastName}` : 'Unknown'}
                              </TableCell>
                              {user.role === 'teacher' && <TableCell>{className || 'N/A'}</TableCell>}
                              <TableCell>
                                <Badge 
                                  variant={record.status === 'present' ? 'default' : record.status === 'absent' ? 'destructive' : record.status === 'sick' ? 'default' : 'secondary'}
                                  className={record.status === 'sick' ? 'bg-orange-600' : ''}
                                >
                                  {record.status === 'present' && <CheckCircle className="h-3 w-3 mr-1" />}
                                  {record.status === 'absent' && <XCircle className="h-3 w-3 mr-1" />}
                                  {record.status === 'late' && <Clock className="h-3 w-3 mr-1" />}
                                  {record.status === 'sick' && <Activity className="h-3 w-3 mr-1" />}
                                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {record.markedBy === user.id ? 'You' : 'Admin'}
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {new Date(record.createdAt).toLocaleTimeString()}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No attendance marked for today</p>
                      <p className="text-sm text-gray-500 mt-1">Click "Mark Attendance" to get started</p>
                    </div>
                  )}
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
            <MessagesPage
              currentUser={user}
              onBack={() => setActiveTab('dashboard')}
            />
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

      <div data-puter-ai>
        <PuterAI />
      </div>
      
      {showCalculator && <CalculatorApp isOpen={showCalculator} onClose={() => setShowCalculator(false)} />}
    </div>
  )
}

export default App