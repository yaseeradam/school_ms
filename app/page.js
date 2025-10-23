'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { School } from 'lucide-react'
import { toast } from 'sonner'
import { useAppData } from '@/hooks/useAppData'
import { useForms } from '@/hooks/useForms'
import { useFilters } from '@/hooks/useFilters'
import { useAttendance } from '@/hooks/useAttendance'
import { useNewFeatures } from '@/hooks/useNewFeatures'
import MainLayout from '@/components/layout/MainLayout'
import LoginPage from '@/components/auth/LoginPage'
import DashboardPage from '@/components/pages/DashboardPage'
import StudentsPage from '@/components/pages/StudentsPage'
import TeachersPage from '@/components/pages/TeachersPage'
import ParentsPage from '@/components/pages/ParentsPage'
import ClassesPage from '@/components/pages/ClassesPage'
import SubjectsPage from '@/components/pages/SubjectsPage'
import AssignmentsPage from '@/components/pages/AssignmentsPage'
import AttendancePage from '@/components/pages/AttendancePage'
import SchoolsPage from '@/components/pages/SchoolsPage'
import SchoolSettingsPage from '@/components/pages/SchoolSettingsPage'
import MasterSettingsPage from '@/components/pages/MasterSettingsPage'
import TeacherForm from '@/components/forms/TeacherForm'
import ParentForm from '@/components/forms/ParentForm'
import StudentForm from '@/components/forms/StudentForm'
import MessagesPage from '@/components/chat/MessagesPage'
import BillingDashboard from '@/components/billing/BillingDashboard'
import GamificationDashboard from '@/components/gamification/GamificationDashboard'
import CalculatorApp from '@/components/calculator/calculator'
import PuterAI from '@/components/ai/PuterAI'
import QuickActions from '@/components/dashboard/QuickActions'
import AttendanceCharts from '@/components/dashboard/AttendanceCharts'
import ReportDialog from '@/components/reports/ReportDialog'
import TimetablePage from '@/components/pages/TimetablePage'
import ExamsPage from '@/components/pages/ExamsPage'
import FeesPage from '@/components/pages/FeesPage'
import HomeworkPage from '@/components/pages/HomeworkPage'
import LibraryPage from '@/components/pages/LibraryPage'
import EventsPage from '@/components/pages/EventsPage'
import BehaviorPage from '@/components/pages/BehaviorPage'
import TransportPage from '@/components/pages/TransportPage'
import HealthPage from '@/components/pages/HealthPage'
import MoreFeaturesPage from '@/components/pages/MoreFeaturesPage'
import { Home, MessageCircle, Building2, Settings as SettingsIcon, Users2, Users, UserCheck, School as SchoolIcon, BookOpen, GraduationCap, Calendar, Trophy, CreditCard, BarChart3, Clock, FileText, DollarSign, BookMarked, CalendarDays, Heart, Bus, AlertCircle, Grid3x3 } from 'lucide-react'

function App() {
  const [user, setUser] = useState(null)
  const [school, setSchool] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showFormView, setShowFormView] = useState(null)
  const [showCalculator, setShowCalculator] = useState(false)
  const [authData, setAuthData] = useState({ email: '', password: '' })
  const [schoolSettings, setSchoolSettings] = useState({ schoolName: '', logo: '', primaryColor: '#3b82f6', secondaryColor: '#64748b', address: '', phoneNumber: '', email: '' })
  const [masterSettings, setMasterSettings] = useState({ systemName: 'EduManage Nigeria', systemEmail: 'admin@edumanage.ng', defaultCurrency: 'NGN', timezone: 'Africa/Lagos', maintenanceMode: false, allowRegistration: true, maxSchools: 1000, systemVersion: '1.0.0' })
  
  const [showClassModal, setShowClassModal] = useState(false)
  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [showMasterSchoolModal, setShowMasterSchoolModal] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  
  const [showTimetableModal, setShowTimetableModal] = useState(false)
  const [timetableForm, setTimetableForm] = useState({})
  const [showExamModal, setShowExamModal] = useState(false)
  const [showGradeModal, setShowGradeModal] = useState(false)
  const [examForm, setExamForm] = useState({})
  const [gradeForm, setGradeForm] = useState({})
  const [showFeeModal, setShowFeeModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [feeForm, setFeeForm] = useState({})
  const [paymentForm, setPaymentForm] = useState({})
  const [showHomeworkModal, setShowHomeworkModal] = useState(false)
  const [homeworkForm, setHomeworkForm] = useState({})
  const [showBookModal, setShowBookModal] = useState(false)
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [bookForm, setBookForm] = useState({})
  const [issueForm, setIssueForm] = useState({})
  const [bookSearch, setBookSearch] = useState('')
  const [showEventModal, setShowEventModal] = useState(false)
  const [eventForm, setEventForm] = useState({})
  const [showBehaviorModal, setShowBehaviorModal] = useState(false)
  const [behaviorForm, setBehaviorForm] = useState({})
  const [showRouteModal, setShowRouteModal] = useState(false)
  const [showAssignRouteModal, setShowAssignRouteModal] = useState(false)
  const [routeForm, setRouteForm] = useState({})
  const [assignRouteForm, setAssignRouteForm] = useState({})
  const [showHealthModal, setShowHealthModal] = useState(false)
  const [healthForm, setHealthForm] = useState({})
  const [selectedStudent, setSelectedStudent] = useState(null)

  const { stats, students, teachers, parents, classes, subjects, assignments, attendance, notifications, schools, setStudents, setTeachers, setParents, setClasses, setSubjects, setAssignments, setAttendance, setNotifications, setSchools, apiCall, loadDashboardData, loadNotifications, loadTodayAttendance } = useAppData(user, token)
  
  const formHandlers = useForms(apiCall, loadDashboardData)
  const filterHandlers = useFilters()
  const attendanceHandlers = useAttendance(user, apiCall, students, teachers, loadTodayAttendance)
  const newFeatures = useNewFeatures(user, token, apiCall, loadDashboardData)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    const savedSchool = localStorage.getItem('school')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      if (savedSchool) setSchool(JSON.parse(savedSchool))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (user?.role === 'school_admin' && school) {
      apiCall('school/settings').then(settings => {
        setSchoolSettings({ schoolName: settings?.schoolName || school?.name || '', logo: settings?.logo || '', primaryColor: settings?.primaryColor || '#3b82f6', secondaryColor: settings?.secondaryColor || '#64748b', address: settings?.address || '', phoneNumber: settings?.phoneNumber || '', email: settings?.email || '' })
      }).catch(() => {})
    }
  }, [user, school])

  const handleAuth = async (authData) => {
    try {
      const result = await apiCall('auth/login', { method: 'POST', body: JSON.stringify(authData) })
      setToken(result.token)
      setUser(result.user)
      setSchool(result.school)
      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result.user))
      if (result.school) localStorage.setItem('school', JSON.stringify(result.school))
      toast.success('Logged in successfully!')
    } catch (error) {}
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

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Please select an image file')
    if (file.size > 2 * 1024 * 1024) return toast.error('Image size should be less than 2MB')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('/api/upload', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData })
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
      await apiCall('school/settings', { method: 'POST', body: JSON.stringify(schoolSettings) })
      toast.success('Settings saved successfully!')
      if (school) {
        const updatedSchool = { ...school, name: schoolSettings.schoolName, logo: schoolSettings.logo }
        setSchool(updatedSchool)
        localStorage.setItem('school', JSON.stringify(updatedSchool))
      }
    } catch (error) {}
  }

  const getNavigationItems = () => {
    const baseItems = [{ id: 'dashboard', label: 'Dashboard', icon: Home }, { id: 'messages', label: 'Messages', icon: MessageCircle }]
    if (user?.role === 'developer') return [...baseItems, { id: 'schools', label: 'Schools', icon: Building2 }, { id: 'master-settings', label: 'Master Settings', icon: SettingsIcon }]
    if (user?.role === 'school_admin') return [...baseItems, { id: 'parents', label: 'Parents', icon: Users2 }, { id: 'students', label: 'Students', icon: Users }, { id: 'teachers', label: 'Teachers', icon: UserCheck }, { id: 'classes', label: 'Classes', icon: SchoolIcon }, { id: 'subjects', label: 'Subjects', icon: BookOpen }, { id: 'assignments', label: 'Assignments', icon: GraduationCap }, { id: 'attendance', label: 'Attendance', icon: Calendar }, { id: 'more-features', label: 'More Features', icon: Grid3x3 }, { id: 'gamification', label: 'Gamification', icon: Trophy }, { id: 'billing', label: 'Billing', icon: CreditCard }, { id: 'school-settings', label: 'School Settings', icon: SettingsIcon }]
    if (user?.role === 'teacher') return [...baseItems, { id: 'my-assignments', label: 'My Assignments', icon: BookOpen }, { id: 'attendance', label: 'Mark Attendance', icon: Calendar }, { id: 'students', label: 'My Students', icon: Users }]
    if (user?.role === 'parent') return [...baseItems, { id: 'my-children', label: 'My Children', icon: Users }, { id: 'attendance', label: 'Attendance Records', icon: Calendar }, { id: 'payments', label: 'Payments', icon: CreditCard }, { id: 'results', label: 'Results', icon: BarChart3 }]
    return baseItems
  }

  const handleQuickAction = (actionId) => {
    if (actionId === 'add-student') {
      setShowFormView('student')
      setActiveTab('students')
    } else if (actionId === 'add-teacher') {
      setShowFormView('teacher')
      setActiveTab('teachers')
    } else if (actionId === 'add-parent') {
      setShowFormView('parent')
      setActiveTab('parents')
    } else if (actionId === 'mark-attendance') {
      const today = new Date().toISOString().split('T')[0]
      attendanceHandlers.setAttendanceDate(today)
      attendanceHandlers.setSelectedClass('')
      attendanceHandlers.setAttendanceList([])
      attendanceHandlers.setShowAttendanceModal(true)
    } else if (actionId === 'generate-report') {
      setShowReportDialog(true)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100"><div className="text-center"><div className="relative"><div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div><School className="h-8 w-8 text-blue-600 mx-auto mb-4 absolute top-4 left-1/2 transform -translate-x-1/2" /></div><p className="text-gray-600">Loading EduManage...</p></div></div>
  if (!user) return <LoginPage onLogin={handleAuth} />

  return (
    <MainLayout user={user} school={school} schoolSettings={schoolSettings} activeTab={activeTab} setActiveTab={setActiveTab} navigationItems={getNavigationItems()} handleLogout={handleLogout} setShowCalculator={setShowCalculator}>
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {(user.role === 'school_admin' || user.role === 'teacher') && <QuickActions userRole={user.role} onAction={handleQuickAction} />}
          <DashboardPage stats={stats} students={students} teachers={teachers} parents={parents} classes={classes} />
          {(user.role === 'school_admin' || user.role === 'teacher') && <AttendanceCharts attendance={attendance} students={students} teachers={teachers} classes={classes} userRole={user.role} />}
        </div>
      )}
      
      {showFormView === 'teacher' && <TeacherForm {...formHandlers} setShowFormView={setShowFormView} />}
      {showFormView === 'parent' && <ParentForm {...formHandlers} setShowFormView={setShowFormView} />}
      {showFormView === 'student' && <StudentForm {...formHandlers} setShowFormView={setShowFormView} parents={parents} classes={classes} />}
      
      {activeTab === 'teachers' && user.role === 'school_admin' && !showFormView && <TeachersPage teachers={teachers} school={school} {...filterHandlers} setShowFormView={setShowFormView} toast={toast} />}
      {activeTab === 'parents' && user.role === 'school_admin' && !showFormView && <ParentsPage parents={parents} students={students} school={school} {...filterHandlers} setShowFormView={setShowFormView} toast={toast} />}
      {activeTab === 'students' && user.role === 'school_admin' && !showFormView && <StudentsPage students={students} classes={classes} parents={parents} school={school} {...filterHandlers} setShowFormView={setShowFormView} toast={toast} />}
      {activeTab === 'classes' && user.role === 'school_admin' && <ClassesPage classes={classes} students={students} showClassModal={showClassModal} setShowClassModal={setShowClassModal} classForm={formHandlers.classForm} setClassForm={formHandlers.setClassForm} handleCreateClass={formHandlers.handleCreateClass} />}
      {activeTab === 'subjects' && user.role === 'school_admin' && <SubjectsPage subjects={subjects} showSubjectModal={showSubjectModal} setShowSubjectModal={setShowSubjectModal} subjectForm={formHandlers.subjectForm} setSubjectForm={formHandlers.setSubjectForm} handleCreateSubject={formHandlers.handleCreateSubject} />}
      {activeTab === 'assignments' && user.role === 'school_admin' && <AssignmentsPage assignments={assignments} teachers={teachers} classes={classes} subjects={subjects} showAssignmentModal={showAssignmentModal} setShowAssignmentModal={setShowAssignmentModal} assignmentForm={formHandlers.assignmentForm} setAssignmentForm={formHandlers.setAssignmentForm} handleCreateAssignment={(e) => formHandlers.handleCreateAssignment(e, subjects, classes)} />}
      {activeTab === 'attendance' && (user.role === 'school_admin' || user.role === 'teacher') && <AttendancePage user={user} attendance={attendance} students={students} teachers={teachers} classes={classes} {...attendanceHandlers} />}
      {activeTab === 'schools' && user.role === 'developer' && <SchoolsPage schools={schools} showMasterSchoolModal={showMasterSchoolModal} setShowMasterSchoolModal={setShowMasterSchoolModal} masterSchoolForm={formHandlers.masterSchoolForm} setMasterSchoolForm={formHandlers.setMasterSchoolForm} handleCreateSchool={formHandlers.handleCreateSchool} />}
      {activeTab === 'school-settings' && user.role === 'school_admin' && <SchoolSettingsPage schoolSettings={schoolSettings} setSchoolSettings={setSchoolSettings} handleLogoUpload={handleLogoUpload} handleSaveSettings={handleSaveSettings} />}
      {activeTab === 'master-settings' && user.role === 'developer' && <MasterSettingsPage masterSettings={masterSettings} stats={stats} />}
      {activeTab === 'more-features' && user.role === 'school_admin' && <MoreFeaturesPage setActiveTab={setActiveTab} />}
      {activeTab === 'timetable' && user.role === 'school_admin' && <TimetablePage timetables={newFeatures.timetables} classes={classes} subjects={subjects} teachers={teachers} showModal={showTimetableModal} setShowModal={setShowTimetableModal} form={timetableForm} setForm={setTimetableForm} handleSubmit={(e) => newFeatures.handleTimetableSubmit(e, timetableForm, setShowTimetableModal)} handleDelete={newFeatures.handleTimetableDelete} onBack={() => setActiveTab('more-features')} school={school} schoolSettings={schoolSettings} />}
      {activeTab === 'exams' && user.role === 'school_admin' && <ExamsPage exams={newFeatures.exams} classes={classes} subjects={subjects} students={students} showModal={showExamModal} setShowModal={setShowExamModal} showGradeModal={showGradeModal} setShowGradeModal={setShowGradeModal} form={examForm} setForm={setExamForm} gradeForm={gradeForm} setGradeForm={setGradeForm} handleSubmit={(e) => newFeatures.handleExamSubmit(e, examForm, setShowExamModal)} handleGradeSubmit={(e) => newFeatures.handleGradeSubmit(e, gradeForm, setShowGradeModal)} handleDelete={(id) => {}} onBack={() => setActiveTab('more-features')} school={school} schoolSettings={schoolSettings} />}
      {activeTab === 'fees' && user.role === 'school_admin' && <FeesPage fees={newFeatures.fees} students={students} classes={classes} showModal={showFeeModal} setShowModal={setShowFeeModal} showPaymentModal={showPaymentModal} setShowPaymentModal={setShowPaymentModal} form={feeForm} setForm={setFeeForm} paymentForm={paymentForm} setPaymentForm={setPaymentForm} handleSubmit={(e) => newFeatures.handleFeeSubmit(e, feeForm, setShowFeeModal)} handlePayment={(e) => newFeatures.handlePayment(e, paymentForm, setShowPaymentModal)} onBack={() => setActiveTab('more-features')} />}
      {activeTab === 'homework' && user.role === 'school_admin' && <HomeworkPage homework={newFeatures.homework} classes={classes} subjects={subjects} students={students} userRole={user.role} showModal={showHomeworkModal} setShowModal={setShowHomeworkModal} form={homeworkForm} setForm={setHomeworkForm} handleSubmit={(e) => newFeatures.handleHomeworkSubmit(e, homeworkForm, setShowHomeworkModal)} handleGrade={() => {}} onBack={() => setActiveTab('more-features')} />}
      {activeTab === 'library' && user.role === 'school_admin' && <LibraryPage books={newFeatures.books} students={students} showModal={showBookModal} setShowModal={setShowBookModal} showIssueModal={showIssueModal} setShowIssueModal={setShowIssueModal} form={bookForm} setForm={setBookForm} issueForm={issueForm} setIssueForm={setIssueForm} handleSubmit={(e) => newFeatures.handleBookSubmit(e, bookForm, setShowBookModal)} handleIssue={(e) => newFeatures.handleIssueBook(e, issueForm, setShowIssueModal)} handleReturn={newFeatures.handleReturnBook} searchTerm={bookSearch} setSearchTerm={setBookSearch} onBack={() => setActiveTab('more-features')} />}
      {activeTab === 'events' && user.role === 'school_admin' && <EventsPage events={newFeatures.events} classes={classes} showModal={showEventModal} setShowModal={setShowEventModal} form={eventForm} setForm={setEventForm} handleSubmit={(e) => newFeatures.handleEventSubmit(e, eventForm, setShowEventModal)} handleDelete={newFeatures.handleEventDelete} onBack={() => setActiveTab('more-features')} />}
      {activeTab === 'behavior' && user.role === 'school_admin' && <BehaviorPage behaviors={newFeatures.behaviors} students={students} classes={classes} showModal={showBehaviorModal} setShowModal={setShowBehaviorModal} form={behaviorForm} setForm={setBehaviorForm} handleSubmit={(e) => newFeatures.handleBehaviorSubmit(e, behaviorForm, setShowBehaviorModal)} onBack={() => setActiveTab('more-features')} />}
      {activeTab === 'transport' && user.role === 'school_admin' && <TransportPage routes={newFeatures.routes} students={students} showModal={showRouteModal} setShowModal={setShowRouteModal} showAssignModal={showAssignRouteModal} setShowAssignModal={setShowAssignRouteModal} form={routeForm} setForm={setRouteForm} assignForm={assignRouteForm} setAssignForm={setAssignRouteForm} handleSubmit={(e) => newFeatures.handleRouteSubmit(e, routeForm, setShowRouteModal)} handleAssign={(e) => newFeatures.handleAssignRoute(e, assignRouteForm, setShowAssignRouteModal)} onBack={() => setActiveTab('more-features')} />}
      {activeTab === 'health' && user.role === 'school_admin' && <HealthPage healthRecords={newFeatures.healthRecords} students={students} showModal={showHealthModal} setShowModal={setShowHealthModal} form={healthForm} setForm={setHealthForm} handleSubmit={(e) => newFeatures.handleHealthSubmit(e, healthForm, setShowHealthModal)} selectedStudent={selectedStudent} setSelectedStudent={setSelectedStudent} onBack={() => setActiveTab('more-features')} />}
      {activeTab === 'billing' && user.role === 'school_admin' && <BillingDashboard currentUser={user} school={school} />}
      {activeTab === 'gamification' && <GamificationDashboard currentUser={user} />}
      {activeTab === 'messages' && <MessagesPage currentUser={user} onBack={() => setActiveTab('dashboard')} />}
      
      {!['dashboard', 'notifications', 'schools', 'teachers', 'parents', 'students', 'classes', 'subjects', 'assignments', 'timetable', 'attendance', 'exams', 'homework', 'fees', 'library', 'events', 'behavior', 'transport', 'health', 'billing', 'payments', 'gamification', 'messages', 'school-settings', 'master-settings', 'more-features'].includes(activeTab) && <Card><CardContent className="p-8 text-center"><p className="text-gray-600">This section is under development.</p></CardContent></Card>}
      
      {attendanceHandlers.showAttendanceModal && activeTab === 'dashboard' && (
        <AttendancePage user={user} attendance={attendance} students={students} teachers={teachers} classes={classes} {...attendanceHandlers} />
      )}
      
      <ReportDialog 
        open={showReportDialog} 
        onOpenChange={setShowReportDialog}
        students={students}
        teachers={teachers}
        parents={parents}
        classes={classes}
        attendance={attendance}
        stats={stats}
        userRole={user.role}
        schoolName={school?.name}
      />
      
      <div data-puter-ai><PuterAI /></div>
      {showCalculator && <CalculatorApp isOpen={showCalculator} onClose={() => setShowCalculator(false)} />}
    </MainLayout>
  )
}

export default App
