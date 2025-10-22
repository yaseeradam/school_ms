import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

const client = new MongoClient(process.env.MONGO_URL)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Database connection
async function connectDB() {
  try {
    await client.connect()
    return client.db(process.env.DB_NAME || 'school_management')
  } catch (error) {
    console.error('Database connection error:', error)
    throw error
  }
}

// Middleware to check authentication
function authenticateToken(request) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader && authHeader.split(' ')[1]
  
  if (!token) {
    return null
  }
  
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Check role permissions
function hasPermission(userRole, requiredRoles) {
  return requiredRoles.includes(userRole)
}

// GET handler
export async function GET(request, { params }) {
  try {
    const db = await connectDB()
    const { path } = params
    const url = new URL(request.url)
    const pathStr = Array.isArray(path) ? path.join('/') : path || ''
    
    // Get query parameters
    const searchParams = url.searchParams
    const limit = parseInt(searchParams.get('limit')) || 50
    const skip = parseInt(searchParams.get('skip')) || 0
    
    switch (pathStr) {
      // Auth routes
      case 'auth/me':
        const userData = authenticateToken(request)
        if (!userData) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const user = await db.collection('users').findOne({ id: userData.id })
        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }
        const { password, ...userWithoutPassword } = user
        return NextResponse.json(userWithoutPassword)
      
      // Developer/Master routes
      case 'master/schools':
        const developerData = authenticateToken(request)
        if (!developerData || developerData.role !== 'developer') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const schools = await db.collection('schools').find({}).limit(limit).skip(skip).toArray()
        return NextResponse.json(schools)
      
      case 'master/stats':
        const devStatsData = authenticateToken(request)
        if (!devStatsData || devStatsData.role !== 'developer') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const totalSchools = await db.collection('schools').countDocuments()
        const totalUsers = await db.collection('users').countDocuments()
        const activeSchools = await db.collection('schools').countDocuments({ active: true })
        
        return NextResponse.json({
          totalSchools,
          totalUsers,
          activeSchools
        })
      
      // School settings
      case 'school/settings':
        const settingsUserData = authenticateToken(request)
        if (!settingsUserData || !hasPermission(settingsUserData.role, ['school_admin'])) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const schoolSettings = await db.collection('school_settings').findOne({ schoolId: settingsUserData.schoolId })
        return NextResponse.json(schoolSettings || { schoolId: settingsUserData.schoolId })
      
      // Students routes
      case 'students':
        const userDataStudents = authenticateToken(request)
        if (!userDataStudents || !hasPermission(userDataStudents.role, ['school_admin', 'teacher'])) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const students = await db.collection('students')
          .find({ schoolId: userDataStudents.schoolId })
          .limit(limit)
          .skip(skip)
          .toArray()
        return NextResponse.json(students)
      
      case 'students/by-class':
        const userDataByClass = authenticateToken(request)
        if (!userDataByClass || !hasPermission(userDataByClass.role, ['school_admin', 'teacher'])) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const classId = searchParams.get('classId')
        const studentsByClass = await db.collection('students')
          .find({ classId, schoolId: userDataByClass.schoolId })
          .toArray()
        return NextResponse.json(studentsByClass)
      
      // Teachers routes
      case 'teachers':
        const userDataTeachers = authenticateToken(request)
        if (!userDataTeachers || !hasPermission(userDataTeachers.role, ['school_admin'])) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const teachers = await db.collection('teachers')
          .find({ schoolId: userDataTeachers.schoolId })
          .limit(limit)
          .skip(skip)
          .toArray()
        return NextResponse.json(teachers)

      // Parent routes
      case 'parents':
        const userDataParents = authenticateToken(request)
        if (!userDataParents || !hasPermission(userDataParents.role, ['school_admin'])) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const parents = await db.collection('users')
          .find({ 
            role: 'parent',
            schoolId: userDataParents.schoolId 
          })
          .limit(limit)
          .skip(skip)
          .toArray()
        const parentsWithoutPassword = parents.map(parent => {
          const { password, ...parentData } = parent
          return parentData
        })
        return NextResponse.json(parentsWithoutPassword)
      
      // Classes routes
      case 'classes':
        const userDataClasses = authenticateToken(request)
        if (!userDataClasses || !hasPermission(userDataClasses.role, ['school_admin', 'teacher'])) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const classes = await db.collection('classes')
          .find({ schoolId: userDataClasses.schoolId })
          .toArray()
        return NextResponse.json(classes)
      
      // Subjects routes
      case 'subjects':
        const userDataSubjects = authenticateToken(request)
        if (!userDataSubjects || !hasPermission(userDataSubjects.role, ['school_admin', 'teacher'])) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const subjects = await db.collection('subjects')
          .find({ schoolId: userDataSubjects.schoolId })
          .toArray()
        return NextResponse.json(subjects)
      
      // Teacher assignments
      case 'teacher-assignments':
        const userDataAssign = authenticateToken(request)
        if (!userDataAssign || !hasPermission(userDataAssign.role, ['school_admin', 'teacher'])) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const teacherIdParam = searchParams.get('teacherId')
        const assignQuery = { schoolId: userDataAssign.schoolId }
        if (teacherIdParam) {
          assignQuery.teacherId = teacherIdParam
        }
        const assignments = await db.collection('teacher_assignments')
          .find(assignQuery)
          .toArray()
        return NextResponse.json(assignments)
      
      // Attendance routes
      case 'attendance':
        const userDataAttend = authenticateToken(request)
        if (!userDataAttend || !hasPermission(userDataAttend.role, ['school_admin', 'teacher', 'parent'])) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const studentId = searchParams.get('studentId')
        const date = searchParams.get('date')
        const classIdAttn = searchParams.get('classId')
        
        let query = { schoolId: userDataAttend.schoolId }
        if (studentId) query.studentId = studentId
        if (date) query.date = date
        if (classIdAttn) query.classId = classIdAttn
        
        const attendance = await db.collection('attendance')
          .find(query)
          .limit(limit)
          .skip(skip)
          .toArray()
        return NextResponse.json(attendance)
      
      // Parent dashboard - student info
      case 'parent/students':
        const parentData = authenticateToken(request)
        if (!parentData || parentData.role !== 'parent') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const parentStudents = await db.collection('students')
          .find({ parentId: parentData.id, schoolId: parentData.schoolId })
          .toArray()
        return NextResponse.json(parentStudents)
      
      // Notifications
      case 'notifications':
        try {
          const userDataNotif = authenticateToken(request)
          if (!userDataNotif) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
          }
          
          const notifQuery = { recipientId: userDataNotif.id }
          if (userDataNotif.schoolId) {
            notifQuery.schoolId = userDataNotif.schoolId
          }
          
          const notifications = await db.collection('notifications')
            .find(notifQuery)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip)
            .toArray()
          return NextResponse.json(notifications)
        } catch (notifError) {
          console.error('Notifications error:', notifError)
          return NextResponse.json([])
        }
      
      // Chat conversations
      case 'chat/conversations':
        const userDataChatConv = authenticateToken(request)
        if (!userDataChatConv) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        const chatConversations = await db.collection('chat_conversations')
          .find({
            schoolId: userDataChatConv.schoolId,
            participants: userDataChatConv.id
          })
          .sort({ lastMessageAt: -1 })
          .toArray()
        
        return NextResponse.json(chatConversations)
      
      // Dashboard stats
      case 'dashboard/stats':
        const userDataStats = authenticateToken(request)
        if (!userDataStats) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        let stats = {}
        
        if (userDataStats.role === 'developer') {
          const totalSchools = await db.collection('schools').countDocuments()
          const totalUsers = await db.collection('users').countDocuments()
          const activeSchools = await db.collection('schools').countDocuments({ active: true })
          
          stats = {
            totalSchools,
            totalUsers,
            activeSchools
          }
        } else if (userDataStats.role === 'school_admin') {
          const totalStudents = await db.collection('students').countDocuments({ schoolId: userDataStats.schoolId })
          const totalTeachers = await db.collection('teachers').countDocuments({ schoolId: userDataStats.schoolId })
          const totalParents = await db.collection('users').countDocuments({ role: 'parent', schoolId: userDataStats.schoolId })
          const totalClasses = await db.collection('classes').countDocuments({ schoolId: userDataStats.schoolId })
          const totalSubjects = await db.collection('subjects').countDocuments({ schoolId: userDataStats.schoolId })
          
          stats = {
            totalStudents,
            totalTeachers,
            totalParents,
            totalClasses,
            totalSubjects
          }
        } else if (userDataStats.role === 'teacher') {
          const myAssignments = await db.collection('teacher_assignments').countDocuments({ teacherId: userDataStats.id, schoolId: userDataStats.schoolId })
          const myClasses = await db.collection('teacher_assignments').distinct('classId', { teacherId: userDataStats.id, schoolId: userDataStats.schoolId })
          const totalStudentsInMyClasses = await db.collection('students').countDocuments({ classId: { $in: myClasses }, schoolId: userDataStats.schoolId })
          
          stats = {
            myAssignments,
            myClasses: myClasses.length,
            totalStudentsInMyClasses
          }
        } else if (userDataStats.role === 'parent') {
          const myChildren = await db.collection('students').countDocuments({ parentId: userDataStats.id, schoolId: userDataStats.schoolId })
          stats = { myChildren }
        }
        
        return NextResponse.json(stats)
      
      default:
        return NextResponse.json({ error: 'Route not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('GET Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST handler
export async function POST(request, { params }) {
  try {
    const db = await connectDB()
    const { path } = params
    const pathStr = Array.isArray(path) ? path.join('/') : path || ''
    const body = await request.json()
    
    switch (pathStr) {
      // Authentication routes
      case 'auth/setup':
        // Initial setup route to create developer account
        const { devName, devEmail, devPassword } = body
        
        if (!devName || !devEmail || !devPassword) {
          return NextResponse.json({ error: 'All fields required' }, { status: 400 })
        }
        
        // Check if developer already exists
        const existingDev = await db.collection('users').findOne({ role: 'developer' })
        if (existingDev) {
          return NextResponse.json({ error: 'Developer already exists' }, { status: 400 })
        }
        
        const hashedDevPassword = await bcrypt.hash(devPassword, 10)
        const newDev = {
          id: uuidv4(),
          name: devName,
          email: devEmail,
          password: hashedDevPassword,
          role: 'developer',
          createdAt: new Date().toISOString(),
          active: true
        }
        
        await db.collection('users').insertOne(newDev)
        
        return NextResponse.json({ message: 'Developer account created successfully' })
      
      case 'auth/login':
        try {
          const { email, password } = body
          
          if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
          }
          
          const user = await db.collection('users').findOne({ email })
          if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
          }
          
          const passwordMatch = await bcrypt.compare(password, user.password)
          if (!passwordMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
          }
          
          // Get school info if user is not developer
          let schoolInfo = null
          if (user.role !== 'developer' && user.schoolId) {
            const school = await db.collection('schools').findOne({ id: user.schoolId })
            if (school) {
              schoolInfo = {
                id: school.id,
                name: school.name,
                logo: school.logo,
                theme: school.theme
              }
            }
          }
          
          const token = jwt.sign(
            { 
              id: user.id, 
              email: user.email, 
              role: user.role,
              schoolId: user.schoolId || null
            },
            JWT_SECRET,
            { expiresIn: '24h' }
          )
          
          const { password: _, ...userWithoutPassword } = user
          return NextResponse.json({ 
            user: userWithoutPassword, 
            token,
            school: schoolInfo
          })
        } catch (loginError) {
          console.error('Login error:', loginError)
          return NextResponse.json({ error: 'Login failed: ' + loginError.message }, { status: 500 })
        }
      
      // Master/Developer routes
      case 'master/schools':
        const devData = authenticateToken(request)
        if (!devData || devData.role !== 'developer') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        const { schoolName, adminName, adminEmail, adminPassword } = body
        
        if (!schoolName || !adminName || !adminEmail || !adminPassword) {
          return NextResponse.json({ error: 'All fields required' }, { status: 400 })
        }
        
        // Check if admin email already exists
        const existingAdmin = await db.collection('users').findOne({ email: adminEmail })
        if (existingAdmin) {
          return NextResponse.json({ error: 'Admin email already exists' }, { status: 400 })
        }
        
        const schoolId = uuidv4()
        const adminId = uuidv4()
        
        // Create school
        const newSchool = {
          id: schoolId,
          name: schoolName,
          active: true,
          createdAt: new Date().toISOString(),
          adminId: adminId
        }
        
        // Create school admin
        const hashedPassword = await bcrypt.hash(adminPassword, 10)
        const newAdmin = {
          id: adminId,
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          role: 'school_admin',
          schoolId: schoolId,
          createdAt: new Date().toISOString(),
          active: true
        }
        
        await db.collection('schools').insertOne(newSchool)
        await db.collection('users').insertOne(newAdmin)
        
        return NextResponse.json({
          school: newSchool,
          admin: { ...newAdmin, password: undefined }
        })
      
      // School settings
      case 'school/settings':
        const settingsUserData = authenticateToken(request)
        if (!settingsUserData || settingsUserData.role !== 'school_admin') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        const settings = {
          schoolId: settingsUserData.schoolId,
          ...body,
          updatedAt: new Date().toISOString()
        }
        
        await db.collection('school_settings').updateOne(
          { schoolId: settingsUserData.schoolId },
          { $set: settings },
          { upsert: true }
        )
        
        // Also update school name in schools collection
        if (body.schoolName) {
          await db.collection('schools').updateOne(
            { id: settingsUserData.schoolId },
            { $set: { name: body.schoolName, updatedAt: new Date().toISOString() } }
          )
        }
        
        return NextResponse.json(settings)
      
      // Create teacher account (School Admin only)
      case 'teachers':
        const userDataCreateTeacher = authenticateToken(request)
        if (!userDataCreateTeacher || userDataCreateTeacher.role !== 'school_admin') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        const { teacherData, credentials } = body
        
        if (!teacherData || !credentials?.email || !credentials?.password) {
          return NextResponse.json({ error: 'Teacher data and credentials required' }, { status: 400 })
        }
        
        // Check if email already exists
        const existingTeacher = await db.collection('users').findOne({ email: credentials.email })
        if (existingTeacher) {
          return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
        }
        
        const teacherId = uuidv4()
        const hashedTeacherPassword = await bcrypt.hash(credentials.password, 10)
        
        // Create teacher record
        const newTeacherRecord = {
          id: teacherId,
          ...teacherData,
          schoolId: userDataCreateTeacher.schoolId,
          createdAt: new Date().toISOString(),
          active: true
        }
        
        // Create teacher user account
        const newTeacherUser = {
          id: teacherId,
          name: `${teacherData.firstName} ${teacherData.lastName}`,
          email: credentials.email,
          password: hashedTeacherPassword,
          role: 'teacher',
          schoolId: userDataCreateTeacher.schoolId,
          createdAt: new Date().toISOString(),
          active: true
        }
        
        await db.collection('teachers').insertOne(newTeacherRecord)
        await db.collection('users').insertOne(newTeacherUser)
        
        return NextResponse.json({
          teacher: newTeacherRecord,
          credentials: { email: credentials.email, tempPassword: credentials.password }
        })
      
      // Create parent account (School Admin only)
      case 'parents':
        const userDataCreateParent = authenticateToken(request)
        if (!userDataCreateParent || userDataCreateParent.role !== 'school_admin') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        const { parentData, parentCredentials } = body
        
        if (!parentData || !parentCredentials?.email || !parentCredentials?.password) {
          return NextResponse.json({ error: 'Parent data and credentials required' }, { status: 400 })
        }
        
        // Check if email already exists
        const existingParent = await db.collection('users').findOne({ email: parentCredentials.email })
        if (existingParent) {
          return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
        }
        
        const parentId = uuidv4()
        const hashedParentPassword = await bcrypt.hash(parentCredentials.password, 10)
        
        // Create parent user account
        const newParentUser = {
          id: parentId,
          name: parentData.name,
          email: parentCredentials.email,
          password: hashedParentPassword,
          role: 'parent',
          schoolId: userDataCreateParent.schoolId,
          phoneNumber: parentData.phoneNumber || '',
          address: parentData.address || '',
          createdAt: new Date().toISOString(),
          active: true
        }
        
        await db.collection('users').insertOne(newParentUser)
        
        return NextResponse.json({
          parent: { ...newParentUser, password: undefined },
          credentials: { email: parentCredentials.email, tempPassword: parentCredentials.password }
        })
      
      // Students routes (updated for multi-tenant)
      case 'students':
        const userDataCreateStudent = authenticateToken(request)
        if (!userDataCreateStudent || userDataCreateStudent.role !== 'school_admin') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        const newStudent = {
          id: uuidv4(),
          ...body,
          schoolId: userDataCreateStudent.schoolId,
          createdAt: new Date().toISOString(),
          active: true
        }
        
        await db.collection('students').insertOne(newStudent)
        return NextResponse.json(newStudent)
      
      // Classes routes (updated for multi-tenant)
      case 'classes':
        const userDataCreateClass = authenticateToken(request)
        if (!userDataCreateClass || userDataCreateClass.role !== 'school_admin') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        const newClass = {
          id: uuidv4(),
          ...body,
          schoolId: userDataCreateClass.schoolId,
          createdAt: new Date().toISOString(),
          active: true
        }
        
        await db.collection('classes').insertOne(newClass)
        return NextResponse.json(newClass)
      
      // Subjects routes (updated for multi-tenant)
      case 'subjects':
        const userDataCreateSubject = authenticateToken(request)
        if (!userDataCreateSubject || userDataCreateSubject.role !== 'school_admin') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        const newSubject = {
          id: uuidv4(),
          ...body,
          schoolId: userDataCreateSubject.schoolId,
          createdAt: new Date().toISOString(),
          active: true
        }
        
        await db.collection('subjects').insertOne(newSubject)
        return NextResponse.json(newSubject)
      
      // Teacher assignments (updated for multi-tenant)
      case 'teacher-assignments':
        const userDataAssignTeacher = authenticateToken(request)
        if (!userDataAssignTeacher || userDataAssignTeacher.role !== 'school_admin') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        const assignment = {
          id: uuidv4(),
          ...body,
          schoolId: userDataAssignTeacher.schoolId,
          createdAt: new Date().toISOString(),
          active: true
        }
        
        await db.collection('teacher_assignments').insertOne(assignment)
        
        // Create notification for teacher
        const notification = {
          id: uuidv4(),
          recipientId: body.teacherId,
          schoolId: userDataAssignTeacher.schoolId,
          title: 'New Subject Assignment',
          message: `You have been assigned to teach ${body.subjectName} for ${body.className}`,
          type: 'assignment',
          read: false,
          createdAt: new Date().toISOString()
        }
        
        await db.collection('notifications').insertOne(notification)
        
        return NextResponse.json(assignment)
      
      // Attendance routes (updated for multi-tenant)
      case 'attendance':
        const userDataMarkAttendance = authenticateToken(request)
        if (!userDataMarkAttendance || !hasPermission(userDataMarkAttendance.role, ['school_admin', 'teacher'])) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        const attendanceRecord = {
          id: uuidv4(),
          ...body,
          schoolId: userDataMarkAttendance.schoolId,
          markedBy: userDataMarkAttendance.id,
          createdAt: new Date().toISOString()
        }
        
        await db.collection('attendance').insertOne(attendanceRecord)
        return NextResponse.json(attendanceRecord)
      
      // Bulk attendance marking (updated for multi-tenant)
      case 'attendance/bulk':
        const userDataBulkAttendance = authenticateToken(request)
        if (!userDataBulkAttendance || !hasPermission(userDataBulkAttendance.role, ['school_admin', 'teacher'])) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        const { attendanceList } = body
        
        if (!attendanceList || attendanceList.length === 0) {
          return NextResponse.json({ error: 'No attendance data provided' }, { status: 400 })
        }
        
        // Get date from first record
        const attendanceDate = attendanceList[0].date
        
        // Delete existing records for this date
        if (userDataBulkAttendance.role === 'school_admin') {
          // Admin marking teacher attendance
          await db.collection('attendance').deleteMany({
            schoolId: userDataBulkAttendance.schoolId,
            date: attendanceDate,
            teacherId: { $exists: true }
          })
        } else {
          // Teacher marking student attendance for a class
          const classId = attendanceList[0].classId
          await db.collection('attendance').deleteMany({
            schoolId: userDataBulkAttendance.schoolId,
            date: attendanceDate,
            classId: classId,
            studentId: { $exists: true }
          })
        }
        
        // Insert new records
        const bulkAttendance = attendanceList.map(record => ({
          id: uuidv4(),
          ...record,
          schoolId: userDataBulkAttendance.schoolId,
          markedBy: userDataBulkAttendance.id,
          createdAt: new Date().toISOString()
        }))
        
        await db.collection('attendance').insertMany(bulkAttendance)
        return NextResponse.json({ success: true, count: bulkAttendance.length })
      
      // Mark notifications as read (updated for multi-tenant)
      case 'notifications/mark-read':
        const userDataNotifRead = authenticateToken(request)
        if (!userDataNotifRead) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { notificationId } = body
        await db.collection('notifications').updateOne(
          {
            id: notificationId,
            recipientId: userDataNotifRead.id,
            schoolId: userDataNotifRead.schoolId
          },
          { $set: { read: true, readAt: new Date().toISOString() } }
        )

        return NextResponse.json({ success: true })

      // Create chat conversation
      case 'chat/conversations':
        const userDataConversations = authenticateToken(request)
        if (!userDataConversations) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { type, name, participants } = body

        if (type === 'private') {
          // Check if conversation already exists
          const existingConv = await db.collection('chat_conversations').findOne({
            schoolId: userDataConversations.schoolId,
            type: 'private',
            participants: { $all: [userDataConversations.id, participants[0]], $size: 2 }
          })

          if (existingConv) {
            return NextResponse.json(existingConv)
          }

          const newConv = {
            id: uuidv4(),
            schoolId: userDataConversations.schoolId,
            type: 'private',
            participants: [userDataConversations.id, participants[0]],
            createdBy: userDataConversations.id,
            status: 'approved',
            lastMessageAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
          }

          await db.collection('chat_conversations').insertOne(newConv)
          return NextResponse.json(newConv)
        } else if (type === 'group') {
          if (userDataConversations.role !== 'school_admin') {
            return NextResponse.json({ error: 'Only admins can create groups' }, { status: 403 })
          }

          const newGroup = {
            id: uuidv4(),
            schoolId: userDataConversations.schoolId,
            type: 'group',
            name,
            participants: [userDataConversations.id, ...participants],
            createdBy: userDataConversations.id,
            status: 'approved',
            lastMessageAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
          }

          await db.collection('chat_conversations').insertOne(newGroup)
          return NextResponse.json(newGroup)
        }

        return NextResponse.json({ error: 'Invalid conversation type' }, { status: 400 })

      // Get chat conversations
      case 'chat/conversations/list':
        const userDataListConv = authenticateToken(request)
        if (!userDataListConv) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const convList = await db.collection('chat_conversations')
          .find({
            schoolId: userDataListConv.schoolId,
            participants: userDataListConv.id
          })
          .sort({ lastMessageAt: -1 })
          .toArray()

        return NextResponse.json(convList)

      // Get conversation messages
      case 'chat/messages':
        const userDataMessages = authenticateToken(request)
        if (!userDataMessages) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const messageConversationId = searchParams.get('conversationId')
        if (!messageConversationId) {
          return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 })
        }

        // Verify access to conversation
        const conversation = await db.collection('chat_conversations').findOne({
          id: messageConversationId,
          schoolId: userDataMessages.schoolId,
          $or: [
            { participants: userDataMessages.id },
            { type: 'group' }
          ]
        })

        if (!conversation) {
          return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
        }

        const messages = await db.collection('chat_messages')
          .find({ conversationId: messageConversationId, schoolId: userDataMessages.schoolId })
          .sort({ createdAt: 1 })
          .limit(limit)
          .skip(skip)
          .toArray()

        return NextResponse.json(messages)

      // Request chat approval (for private chats)
      case 'chat/request-approval':
        const userDataRequestApproval = authenticateToken(request)
        if (!userDataRequestApproval) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { conversationId: reqConversationId, message: requestMessage } = body

        // Update conversation status to pending
        await db.collection('chat_conversations').updateOne(
          {
            id: reqConversationId,
            schoolId: userDataRequestApproval.schoolId,
            participants: userDataRequestApproval.id
          },
          { $set: { status: 'pending' } }
        )

        // Create notification for the other participant
        const conversationForNotif = await db.collection('chat_conversations').findOne({
          id: reqConversationId,
          schoolId: userDataRequestApproval.schoolId
        })

        const otherParticipant = conversationForNotif.participants.find(p => p !== userDataRequestApproval.id)

        const approvalNotification = {
          id: uuidv4(),
          schoolId: userDataRequestApproval.schoolId,
          recipientId: otherParticipant,
          senderId: userDataRequestApproval.id,
          title: 'Chat Request',
          message: requestMessage || 'Someone wants to start a chat with you',
          type: 'chat_request',
          priority: 'medium',
          read: false,
          metadata: { conversationId: reqConversationId },
          createdAt: new Date().toISOString()
        }

        await db.collection('notifications').insertOne(approvalNotification)

        return NextResponse.json({ success: true })

      // Approve chat request
      case 'chat/approve-request':
        const userDataApproveRequest = authenticateToken(request)
        if (!userDataApproveRequest) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { conversationId: approveConvId } = body

        await db.collection('chat_conversations').updateOne(
          {
            id: approveConvId,
            schoolId: userDataApproveRequest.schoolId,
            participants: userDataApproveRequest.id
          },
          { $set: { status: 'approved' } }
        )

        return NextResponse.json({ success: true })

      // Reject chat request
      case 'chat/reject-request':
        const userDataRejectRequest = authenticateToken(request)
        if (!userDataRejectRequest) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { conversationId: rejectConvId } = body

        await db.collection('chat_conversations').updateOne(
          {
            id: rejectConvId,
            schoolId: userDataRejectRequest.schoolId,
            participants: userDataRejectRequest.id
          },
          { $set: { status: 'rejected' } }
        )

        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: 'Route not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('POST Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT handler (updated for multi-tenant)
export async function PUT(request, { params }) {
  try {
    const db = await connectDB()
    const { path } = params
    const pathStr = Array.isArray(path) ? path.join('/') : path || ''
    const body = await request.json()
    const url = new URL(request.url)
    const searchParams = url.searchParams
    const id = searchParams.get('id')
    
    const userData = authenticateToken(request)
    if (!userData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    switch (pathStr) {
      case 'students':
        if (!hasPermission(userData.role, ['school_admin'])) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        await db.collection('students').updateOne(
          { id, schoolId: userData.schoolId },
          { $set: { ...body, updatedAt: new Date().toISOString() } }
        )
        
        const updatedStudent = await db.collection('students').findOne({ id, schoolId: userData.schoolId })
        return NextResponse.json(updatedStudent)
      
      case 'teachers':
        if (!hasPermission(userData.role, ['school_admin'])) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        await db.collection('teachers').updateOne(
          { id, schoolId: userData.schoolId },
          { $set: { ...body, updatedAt: new Date().toISOString() } }
        )
        
        const updatedTeacher = await db.collection('teachers').findOne({ id, schoolId: userData.schoolId })
        return NextResponse.json(updatedTeacher)
      
      case 'classes':
        if (!hasPermission(userData.role, ['school_admin'])) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        await db.collection('classes').updateOne(
          { id, schoolId: userData.schoolId },
          { $set: { ...body, updatedAt: new Date().toISOString() } }
        )
        
        const updatedClass = await db.collection('classes').findOne({ id, schoolId: userData.schoolId })
        return NextResponse.json(updatedClass)
      
      default:
        return NextResponse.json({ error: 'Route not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('PUT Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE handler (updated for multi-tenant)
export async function DELETE(request, { params }) {
  try {
    const db = await connectDB()
    const { path } = params
    const pathStr = Array.isArray(path) ? path.join('/') : path || ''
    const url = new URL(request.url)
    const searchParams = url.searchParams
    const id = searchParams.get('id')
    
    const userData = authenticateToken(request)
    if (!userData || !hasPermission(userData.role, ['school_admin', 'developer'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    switch (pathStr) {
      case 'students':
        if (userData.role !== 'school_admin') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        await db.collection('students').updateOne(
          { id, schoolId: userData.schoolId },
          { $set: { active: false, deletedAt: new Date().toISOString() } }
        )
        return NextResponse.json({ success: true })
      
      case 'teachers':
        if (userData.role !== 'school_admin') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        await db.collection('teachers').updateOne(
          { id, schoolId: userData.schoolId },
          { $set: { active: false, deletedAt: new Date().toISOString() } }
        )
        
        // Also deactivate user account
        await db.collection('users').updateOne(
          { id, schoolId: userData.schoolId },
          { $set: { active: false, deletedAt: new Date().toISOString() } }
        )
        
        return NextResponse.json({ success: true })
      
      case 'parents':
        if (userData.role !== 'school_admin') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        await db.collection('users').updateOne(
          { id, role: 'parent', schoolId: userData.schoolId },
          { $set: { active: false, deletedAt: new Date().toISOString() } }
        )
        
        return NextResponse.json({ success: true })
      
      case 'classes':
        if (userData.role !== 'school_admin') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        await db.collection('classes').updateOne(
          { id, schoolId: userData.schoolId },
          { $set: { active: false, deletedAt: new Date().toISOString() } }
        )
        return NextResponse.json({ success: true })
      
      case 'master/schools':
        if (userData.role !== 'developer') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        await db.collection('schools').updateOne(
          { id },
          { $set: { active: false, deletedAt: new Date().toISOString() } }
        )
        
        // Also deactivate all users of this school
        await db.collection('users').updateMany(
          { schoolId: id },
          { $set: { active: false, deletedAt: new Date().toISOString() } }
        )
        
        return NextResponse.json({ success: true })
      
      default:
        return NextResponse.json({ error: 'Route not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('DELETE Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
