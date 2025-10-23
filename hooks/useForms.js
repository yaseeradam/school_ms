import { useState } from 'react'
import { toast } from 'sonner'

export function useForms(apiCall, loadDashboardData) {
  const [teacherForm, setTeacherForm] = useState({
    teacherData: { firstName: '', lastName: '', email: '', phoneNumber: '', address: '', qualification: '', experience: '', specialization: '', dateOfJoining: '', photo: '' },
    credentials: { email: '', password: '' }
  })
  const [parentForm, setParentForm] = useState({
    parentData: { name: '', phoneNumber: '', address: '', photo: '' },
    parentCredentials: { email: '', password: '' }
  })
  const [studentForm, setStudentForm] = useState({
    firstName: '', lastName: '', email: '', dateOfBirth: '', gender: '', address: '', phoneNumber: '', parentId: '', classId: '', admissionNumber: '', emergencyContact: '', photo: ''
  })
  const [classForm, setClassForm] = useState({ name: '', description: '', capacity: '', academicYear: new Date().getFullYear().toString() })
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', description: '', credits: '' })
  const [assignmentForm, setAssignmentForm] = useState({ teacherId: '', classId: '', subjectId: '', subjectName: '', className: '' })
  const [masterSchoolForm, setMasterSchoolForm] = useState({ schoolName: '', adminName: '', adminEmail: '', adminPassword: '' })

  const [teacherPhotoPreview, setTeacherPhotoPreview] = useState('')
  const [parentPhotoPreview, setParentPhotoPreview] = useState('')
  const [studentPhotoPreview, setStudentPhotoPreview] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePhotoUpload = (e, formType) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Please select an image file')
    if (file.size > 5 * 1024 * 1024) return toast.error('Image size should be less than 5MB')

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result
      if (formType === 'student') {
        setStudentPhotoPreview(base64String)
        setStudentForm(prev => ({ ...prev, photo: base64String }))
      } else if (formType === 'teacher') {
        setTeacherPhotoPreview(base64String)
        setTeacherForm(prev => ({ ...prev, teacherData: { ...prev.teacherData, photo: base64String } }))
      } else if (formType === 'parent') {
        setParentPhotoPreview(base64String)
        setParentForm(prev => ({ ...prev, parentData: { ...prev.parentData, photo: base64String } }))
      }
    }
    reader.readAsDataURL(file)
  }

  const handleCreateTeacher = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const result = await apiCall('teachers', { method: 'POST', body: JSON.stringify(teacherForm) })
      toast.success(`Teacher created successfully! Login: ${result.credentials.email} / ${result.credentials.tempPassword}`)
      setTeacherForm({ teacherData: { firstName: '', lastName: '', email: '', phoneNumber: '', address: '', qualification: '', experience: '', specialization: '', dateOfJoining: '', photo: '' }, credentials: { email: '', password: '' } })
      setTeacherPhotoPreview('')
      loadDashboardData()
      return true
    } catch (error) {
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateParent = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const result = await apiCall('parents', { method: 'POST', body: JSON.stringify(parentForm) })
      toast.success(`Parent account created successfully! Login: ${result.credentials.email} / ${result.credentials.tempPassword}`)
      setParentForm({ parentData: { name: '', phoneNumber: '', address: '', photo: '' }, parentCredentials: { email: '', password: '' } })
      setParentPhotoPreview('')
      loadDashboardData()
      return true
    } catch (error) {
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateStudent = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await apiCall('students', { method: 'POST', body: JSON.stringify(studentForm) })
      toast.success('Student created successfully!')
      setStudentForm({ firstName: '', lastName: '', email: '', dateOfBirth: '', gender: '', address: '', phoneNumber: '', parentId: '', classId: '', admissionNumber: '', emergencyContact: '', photo: '' })
      setStudentPhotoPreview('')
      loadDashboardData()
      return true
    } catch (error) {
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateClass = async (e) => {
    e.preventDefault()
    try {
      await apiCall('classes', { method: 'POST', body: JSON.stringify(classForm) })
      toast.success('Class created successfully!')
      setClassForm({ name: '', description: '', capacity: '', academicYear: new Date().getFullYear().toString() })
      loadDashboardData()
    } catch (error) {}
  }

  const handleCreateSubject = async (e) => {
    e.preventDefault()
    try {
      await apiCall('subjects', { method: 'POST', body: JSON.stringify(subjectForm) })
      toast.success('Subject created successfully!')
      setSubjectForm({ name: '', code: '', description: '', credits: '' })
      loadDashboardData()
    } catch (error) {}
  }

  const handleCreateAssignment = async (e, subjects, classes) => {
    e.preventDefault()
    try {
      const selectedSubject = subjects.find(s => s.id === assignmentForm.subjectId)
      const selectedClass = classes.find(c => c.id === assignmentForm.classId)
      await apiCall('teacher-assignments', { method: 'POST', body: JSON.stringify({ ...assignmentForm, subjectName: selectedSubject?.name || '', className: selectedClass?.name || '' }) })
      toast.success('Teacher assigned successfully!')
      setAssignmentForm({ teacherId: '', classId: '', subjectId: '', subjectName: '', className: '' })
      loadDashboardData()
    } catch (error) {}
  }

  const handleCreateSchool = async (e) => {
    e.preventDefault()
    try {
      await apiCall('master/schools', { method: 'POST', body: JSON.stringify(masterSchoolForm) })
      toast.success('School created successfully!')
      setMasterSchoolForm({ schoolName: '', adminName: '', adminEmail: '', adminPassword: '' })
      loadDashboardData()
    } catch (error) {}
  }

  return {
    teacherForm, setTeacherForm, parentForm, setParentForm, studentForm, setStudentForm,
    classForm, setClassForm, subjectForm, setSubjectForm, assignmentForm, setAssignmentForm,
    masterSchoolForm, setMasterSchoolForm, teacherPhotoPreview, parentPhotoPreview, studentPhotoPreview,
    isSubmitting, handlePhotoUpload, handleCreateTeacher, handleCreateParent, handleCreateStudent,
    handleCreateClass, handleCreateSubject, handleCreateAssignment, handleCreateSchool
  }
}
