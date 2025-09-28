import { NextRequest, NextResponse } from 'next/server'
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
      
      // Students routes
      case 'students':
        const userDataStudents = authenticateToken(request)
        if (!userDataStudents || !hasPermission(userDataStudents.role, ['admin', 'teacher'])) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const students = await db.collection('students').find({}).limit(limit).skip(skip).toArray()
        return NextResponse.json(students)
      
      case 'students/by-class':
        const userDataByClass = authenticateToken(request)
        if (!userDataByClass || !hasPermission(userDataByClass.role, ['admin', 'teacher'])) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const classId = searchParams.get('classId')
        const studentsByClass = await db.collection('students').find({ classId }).toArray()
        return NextResponse.json(studentsByClass)
      
      // Teachers routes
      case 'teachers':
        const userDataTeachers = authenticateToken(request)
        if (!userDataTeachers || !hasPermission(userDataTeachers.role, ['admin'])) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const teachers = await db.collection('teachers').find({}).limit(limit).skip(skip).toArray()
        return NextResponse.json(teachers)
      
      // Classes routes
      case 'classes':
        const userDataClasses = authenticateToken(request)
        if (!userDataClasses || !hasPermission(userDataClasses.role, ['admin', 'teacher'])) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const classes = await db.collection('classes').find({}).toArray()
        return NextResponse.json(classes)
      
      // Subjects routes
      case 'subjects':
        const userDataSubjects = authenticateToken(request)
        if (!userDataSubjects || !hasPermission(userDataSubjects.role, ['admin', 'teacher'])) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const subjects = await db.collection('subjects').find({}).toArray()
        return NextResponse.json(subjects)
      
      // Teacher assignments
      case 'teacher-assignments':
        const userDataAssign = authenticateToken(request)
        if (!userDataAssign || !hasPermission(userDataAssign.role, ['admin', 'teacher'])) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const teacherId = searchParams.get('teacherId') || userDataAssign.id
        const assignments = await db.collection('teacher_assignments').find({ teacherId }).toArray()
        return NextResponse.json(assignments)
      
      // Attendance routes
      case 'attendance':
        const userDataAttend = authenticateToken(request)
        if (!userDataAttend || !hasPermission(userDataAttend.role, ['admin', 'teacher', 'parent'])) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const studentId = searchParams.get('studentId')
        const date = searchParams.get('date')
        const classIdAttn = searchParams.get('classId')
        
        let query = {}
        if (studentId) query.studentId = studentId
        if (date) query.date = date
        if (classIdAttn) query.classId = classIdAttn
        
        const attendance = await db.collection('attendance').find(query).limit(limit).skip(skip).toArray()
        return NextResponse.json(attendance)
      
      // Parent dashboard - student info
      case 'parent/students':
        const parentData = authenticateToken(request)
        if (!parentData || parentData.role !== 'parent') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const parentStudents = await db.collection('students').find({ parentId: parentData.id }).toArray()
        return NextResponse.json(parentStudents)
      
      // Notifications
      case 'notifications':
        const userDataNotif = authenticateToken(request)
        if (!userDataNotif) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const notifications = await db.collection('notifications')
          .find({ recipientId: userDataNotif.id })
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip(skip)
          .toArray()
        return NextResponse.json(notifications)
      
      // Dashboard stats
      case 'dashboard/stats':
        const userDataStats = authenticateToken(request)
        if (!userDataStats) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        let stats = {}
        
        if (userDataStats.role === 'admin') {
          const totalStudents = await db.collection('students').countDocuments()
          const totalTeachers = await db.collection('teachers').countDocuments()
          const totalClasses = await db.collection('classes').countDocuments()
          const totalSubjects = await db.collection('subjects').countDocuments()
          
          stats = {
            totalStudents,
            totalTeachers,
            totalClasses,
            totalSubjects
          }
        } else if (userDataStats.role === 'teacher') {
          const myAssignments = await db.collection('teacher_assignments').countDocuments({ teacherId: userDataStats.id })
          const myClasses = await db.collection('teacher_assignments').distinct('classId', { teacherId: userDataStats.id })
          const totalStudentsInMyClasses = await db.collection('students').countDocuments({ classId: { $in: myClasses } })
          
          stats = {
            myAssignments,
            myClasses: myClasses.length,
            totalStudentsInMyClasses
          }
        } else if (userDataStats.role === 'parent') {
          const myChildren = await db.collection('students').countDocuments({ parentId: userDataStats.id })
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
      case 'auth/login':
        const { email, password } = body
        
        if (!email || !password) {
          return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
        }
        
        const user = await db.collection('users').findOne({ email })
        if (!user || !await bcrypt.compare(password, user.password)) {
          return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }
        
        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          JWT_SECRET,
          { expiresIn: '24h' }
        )
        
        const { password: _, ...userWithoutPassword } = user
        return NextResponse.json({ user: userWithoutPassword, token })
      
      case 'auth/register':
        const { name, email: regEmail, password: regPassword, role, phoneNumber } = body
        
        if (!name || !regEmail || !regPassword || !role) {
          return NextResponse.json({ error: 'All fields required' }, { status: 400 })
        }
        
        const existingUser = await db.collection('users').findOne({ email: regEmail })
        if (existingUser) {
          return NextResponse.json({ error: 'User already exists' }, { status: 400 })
        }
        
        const hashedPassword = await bcrypt.hash(regPassword, 10)
        const newUser = {
          id: uuidv4(),
          name,
          email: regEmail,
          password: hashedPassword,
          role,
          phoneNumber: phoneNumber || '',
          createdAt: new Date().toISOString(),
          active: true
        }
        
        await db.collection('users').insertOne(newUser)
        
        const newToken = jwt.sign(
          { id: newUser.id, email: newUser.email, role: newUser.role },
          JWT_SECRET,
          { expiresIn: '24h' }
        )
        
        const { password: __, ...newUserWithoutPassword } = newUser
        return NextResponse.json({ user: newUserWithoutPassword, token: newToken })
      
      // Students routes
      case 'students':
        const userDataCreateStudent = authenticateToken(request)
        if (!userDataCreateStudent || !hasPermission(userDataCreateStudent.role, ['admin'])) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        const newStudent = {
          id: uuidv4(),
          ...body,
          createdAt: new Date().toISOString(),
          active: true
        }
        
        await db.collection('students').insertOne(newStudent)
        return NextResponse.json(newStudent)
      
      // Teachers routes
      case 'teachers':
        const userDataCreateTeacher = authenticateToken(request)
        if (!userDataCreateTeacher || !hasPermission(userDataCreateTeacher.role, ['admin'])) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        const newTeacher = {
          id: uuidv4(),
          ...body,
          createdAt: new Date().toISOString(),
          active: true
        }
        
        await db.collection('teachers').insertOne(newTeacher)
        return NextResponse.json(newTeacher)
      
      // Classes routes
      case 'classes':
        const userDataCreateClass = authenticateToken(request)
        if (!userDataCreateClass || !hasPermission(userDataCreateClass.role, ['admin'])) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        const newClass = {
          id: uuidv4(),
          ...body,
          createdAt: new Date().toISOString(),
          active: true
        }
        
        await db.collection('classes').insertOne(newClass)
        return NextResponse.json(newClass)
      
      // Subjects routes
      case 'subjects':
        const userDataCreateSubject = authenticateToken(request)
        if (!userDataCreateSubject || !hasPermission(userDataCreateSubject.role, ['admin'])) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        const newSubject = {
          id: uuidv4(),
          ...body,
          createdAt: new Date().toISOString(),
          active: true
        }
        
        await db.collection('subjects').insertOne(newSubject)
        return NextResponse.json(newSubject)
      
      // Teacher assignments
      case 'teacher-assignments':
        const userDataAssignTeacher = authenticateToken(request)
        if (!userDataAssignTeacher || !hasPermission(userDataAssignTeacher.role, ['admin'])) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        const assignment = {
          id: uuidv4(),
          ...body,
          createdAt: new Date().toISOString(),
          active: true
        }
        
        await db.collection('teacher_assignments').insertOne(assignment)
        
        // Create notification for teacher
        const notification = {
          id: uuidv4(),
          recipientId: body.teacherId,
          title: 'New Subject Assignment',
          message: `You have been assigned to teach ${body.subjectName} for ${body.className}`,
          type: 'assignment',
          read: false,
          createdAt: new Date().toISOString()
        }
        
        await db.collection('notifications').insertOne(notification)
        
        return NextResponse.json(assignment)
      
      // Attendance routes
      case 'attendance':
        const userDataMarkAttendance = authenticateToken(request)
        if (!userDataMarkAttendance || !hasPermission(userDataMarkAttendance.role, ['admin', 'teacher'])) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        const attendanceRecord = {
          id: uuidv4(),
          ...body,
          markedBy: userDataMarkAttendance.id,
          createdAt: new Date().toISOString()
        }
        
        await db.collection('attendance').insertOne(attendanceRecord)
        return NextResponse.json(attendanceRecord)
      
      // Bulk attendance marking
      case 'attendance/bulk':
        const userDataBulkAttendance = authenticateToken(request)
        if (!userDataBulkAttendance || !hasPermission(userDataBulkAttendance.role, ['admin', 'teacher'])) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        const { attendanceList } = body
        const bulkAttendance = attendanceList.map(record => ({
          id: uuidv4(),
          ...record,
          markedBy: userDataBulkAttendance.id,
          createdAt: new Date().toISOString()
        }))
        
        await db.collection('attendance').insertMany(bulkAttendance)
        return NextResponse.json({ success: true, count: bulkAttendance.length })
      
      // Mark notifications as read
      case 'notifications/mark-read':
        const userDataNotifRead = authenticateToken(request)
        if (!userDataNotifRead) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        const { notificationId } = body
        await db.collection('notifications').updateOne(
          { id: notificationId, recipientId: userDataNotifRead.id },
          { $set: { read: true, readAt: new Date().toISOString() } }
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

// PUT handler
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
        if (!hasPermission(userData.role, ['admin'])) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        await db.collection('students').updateOne(
          { id },
          { $set: { ...body, updatedAt: new Date().toISOString() } }
        )
        
        const updatedStudent = await db.collection('students').findOne({ id })
        return NextResponse.json(updatedStudent)
      
      case 'teachers':
        if (!hasPermission(userData.role, ['admin'])) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        await db.collection('teachers').updateOne(
          { id },
          { $set: { ...body, updatedAt: new Date().toISOString() } }
        )
        
        const updatedTeacher = await db.collection('teachers').findOne({ id })
        return NextResponse.json(updatedTeacher)
      
      case 'classes':
        if (!hasPermission(userData.role, ['admin'])) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        await db.collection('classes').updateOne(
          { id },
          { $set: { ...body, updatedAt: new Date().toISOString() } }
        )
        
        const updatedClass = await db.collection('classes').findOne({ id })
        return NextResponse.json(updatedClass)
      
      default:
        return NextResponse.json({ error: 'Route not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('PUT Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE handler
export async function DELETE(request, { params }) {
  try {
    const db = await connectDB()
    const { path } = params
    const pathStr = Array.isArray(path) ? path.join('/') : path || ''
    const url = new URL(request.url)
    const searchParams = url.searchParams
    const id = searchParams.get('id')
    
    const userData = authenticateToken(request)
    if (!userData || !hasPermission(userData.role, ['admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    switch (pathStr) {
      case 'students':
        await db.collection('students').updateOne(
          { id },
          { $set: { active: false, deletedAt: new Date().toISOString() } }
        )
        return NextResponse.json({ success: true })
      
      case 'teachers':
        await db.collection('teachers').updateOne(
          { id },
          { $set: { active: false, deletedAt: new Date().toISOString() } }
        )
        return NextResponse.json({ success: true })
      
      case 'classes':
        await db.collection('classes').updateOne(
          { id },
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