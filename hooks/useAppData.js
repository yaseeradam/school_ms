import { useState, useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'

export function useAppData(user, token) {
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
  const isMountedRef = useRef(true)

  const apiCall = useCallback(async (endpoint, options = {}) => {
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
        const errorMessage = error.error || `HTTP ${response.status}: ${response.statusText}`
        throw new Error(errorMessage)
      }
      
      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('❌ Network error: Please check your connection')
      } else {
        toast.error('❌ ' + (error.message || 'Something went wrong'))
      }
      throw error
    }
  }, [token])

  const loadDashboardData = useCallback(async () => {
    if (!isMountedRef.current) return
    
    try {
      // Show loading toast for long operations
      const loadingToast = toast.loading('🔄 Loading dashboard data...')
      
      const [statsData, classesData, subjectsData] = await Promise.all([
        apiCall('dashboard/stats'),
        user.role !== 'developer' ? apiCall('classes') : Promise.resolve([]),
        user.role !== 'developer' ? apiCall('subjects') : Promise.resolve([])
      ])
      
      if (!isMountedRef.current) return
      
      setStats(statsData)
      setClasses(classesData)
      setSubjects(subjectsData)
      
      if (user.role === 'developer') {
        const schoolsData = await apiCall('master/schools')
        if (isMountedRef.current) setSchools(schoolsData)
      } else if (user.role === 'school_admin') {
        const [studentsData, teachersData, parentsData, assignmentsData] = await Promise.all([
          apiCall('students'),
          apiCall('teachers'),
          apiCall('parents'),
          apiCall('teacher-assignments')
        ])
        if (isMountedRef.current) {
          setStudents(studentsData)
          setTeachers(teachersData)
          setParents(parentsData)
          setAssignments(assignmentsData)
        }
      } else if (user.role === 'teacher') {
        const assignmentsData = await apiCall('teacher-assignments')
        if (isMountedRef.current) setAssignments(assignmentsData)
      } else if (user.role === 'parent') {
        const childrenData = await apiCall('parent/students')
        if (isMountedRef.current) setStudents(childrenData)
      }
      
      toast.dismiss(loadingToast)
      if (isMountedRef.current) toast.success('✅ Dashboard loaded successfully!')
    } catch (error) {
      if (isMountedRef.current) toast.error('❌ Failed to load dashboard data')
    }
  }, [user?.role, apiCall])

  const loadNotifications = useCallback(async () => {
    if (!isMountedRef.current) return
    try {
      const notificationsData = await apiCall('notifications')
      if (isMountedRef.current) setNotifications(notificationsData)
    } catch (error) {
      // Error already handled
    }
  }, [apiCall])

  const loadTodayAttendance = useCallback(async () => {
    if (!isMountedRef.current) return
    try {
      const today = new Date().toISOString().split('T')[0]
      const records = await apiCall(`attendance?date=${today}`)
      if (isMountedRef.current) setAttendance(records)
    } catch (error) {
      console.error('Error loading today attendance:', error)
    }
  }, [apiCall])

  useEffect(() => {
    isMountedRef.current = true
    
    if (user && token) {
      loadDashboardData()
      loadNotifications()
      if (user.role === 'school_admin' || user.role === 'teacher') {
        loadTodayAttendance()
      }
    }
    
    return () => {
      isMountedRef.current = false
    }
  }, [user, token, loadDashboardData, loadNotifications, loadTodayAttendance])

  return {
    stats, students, teachers, parents, classes, subjects, assignments, attendance, notifications, schools,
    setStudents, setTeachers, setParents, setClasses, setSubjects, setAssignments, setAttendance, setNotifications, setSchools,
    apiCall, loadDashboardData, loadNotifications, loadTodayAttendance
  }
}
