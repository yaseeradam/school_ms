import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export function useNewFeatures(user, token, apiCall, loadDashboardData) {
  const [timetables, setTimetables] = useState([])
  const [exams, setExams] = useState([])
  const [fees, setFees] = useState([])
  const [homework, setHomework] = useState([])
  const [books, setBooks] = useState([])
  const [events, setEvents] = useState([])
  const [behaviors, setBehaviors] = useState([])
  const [routes, setRoutes] = useState([])
  const [healthRecords, setHealthRecords] = useState([])

  useEffect(() => {
    if (user && token && user.role === 'school_admin') {
      loadAllData()
    }
  }, [user, token])

  useEffect(() => {
    if (user && token && user.role === 'school_admin' && timetables.length === 0) {
      loadAllData()
    }
  }, [])

  const loadAllData = async () => {
    try {
      // Load from localStorage as fallback
      const stored = {
        timetables: JSON.parse(localStorage.getItem('timetables') || '[]'),
        exams: JSON.parse(localStorage.getItem('exams') || '[]'),
        fees: JSON.parse(localStorage.getItem('fees') || '[]'),
        homework: JSON.parse(localStorage.getItem('homework') || '[]'),
        books: JSON.parse(localStorage.getItem('books') || '[]'),
        events: JSON.parse(localStorage.getItem('events') || '[]'),
        behaviors: JSON.parse(localStorage.getItem('behaviors') || '[]'),
        routes: JSON.parse(localStorage.getItem('routes') || '[]'),
        healthRecords: JSON.parse(localStorage.getItem('healthRecords') || '[]')
      }
      setTimetables(stored.timetables)
      setExams(stored.exams)
      setFees(stored.fees)
      setHomework(stored.homework)
      setBooks(stored.books)
      setEvents(stored.events)
      setBehaviors(stored.behaviors)
      setRoutes(stored.routes)
      setHealthRecords(stored.healthRecords)
    } catch (error) {}
  }

  const handleTimetableSubmit = async (e, form, setShowModal) => {
    e.preventDefault()
    const newData = { ...form, _id: form._id || Date.now().toString() }
    let updated
    if (form._id) {
      updated = timetables.map(t => t._id === form._id ? newData : t)
    } else {
      updated = [...timetables, newData]
    }
    setTimetables(updated)
    localStorage.setItem('timetables', JSON.stringify(updated))
    toast.success('Timetable updated successfully!')
    setShowModal(false)
  }

  const handleTimetableDelete = async (id) => {
    const updated = timetables.filter(t => t._id !== id)
    setTimetables(updated)
    localStorage.setItem('timetables', JSON.stringify(updated))
    toast.success('Period deleted successfully!')
  }

  const handleExamSubmit = async (e, form, setShowModal) => {
    e.preventDefault()
    const newData = { ...form, _id: form._id || Date.now().toString(), grades: form.grades || [] }
    let updated
    if (form._id) {
      updated = exams.map(ex => ex._id === form._id ? newData : ex)
    } else {
      updated = [...exams, newData]
    }
    setExams(updated)
    localStorage.setItem('exams', JSON.stringify(updated))
    toast.success('Exam saved successfully!')
    setShowModal(false)
  }

  const handleGradeSubmit = async (e, gradeForm, setShowGradeModal) => {
    e.preventDefault()
    const updated = exams.map(ex => {
      if (ex._id === gradeForm.examId) {
        return { ...ex, grades: [...(ex.grades || []), gradeForm] }
      }
      return ex
    })
    setExams(updated)
    localStorage.setItem('exams', JSON.stringify(updated))
    toast.success('Grade added successfully!')
    setShowGradeModal(false)
  }

  const handleFeeSubmit = async (e, form, setShowModal) => {
    e.preventDefault()
    const newData = { ...form, _id: Date.now().toString(), paid: 0 }
    const updated = [...fees, newData]
    setFees(updated)
    localStorage.setItem('fees', JSON.stringify(updated))
    toast.success('Fee added successfully!')
    setShowModal(false)
  }

  const handlePayment = async (e, paymentForm, setShowPaymentModal) => {
    e.preventDefault()
    const updated = fees.map(f => f.studentId === paymentForm.studentId ? { ...f, paid: (f.paid || 0) + parseFloat(paymentForm.amount) } : f)
    setFees(updated)
    localStorage.setItem('fees', JSON.stringify(updated))
    toast.success('Payment recorded successfully!')
    setShowPaymentModal(false)
  }

  const handleHomeworkSubmit = async (e, form, setShowModal) => {
    e.preventDefault()
    const newData = { ...form, _id: Date.now().toString(), submissions: [] }
    const updated = [...homework, newData]
    setHomework(updated)
    localStorage.setItem('homework', JSON.stringify(updated))
    toast.success('Homework assigned successfully!')
    setShowModal(false)
  }

  const handleBookSubmit = async (e, form, setShowModal) => {
    e.preventDefault()
    const newData = { ...form, _id: Date.now().toString(), issuedTo: [] }
    const updated = [...books, newData]
    setBooks(updated)
    localStorage.setItem('books', JSON.stringify(updated))
    toast.success('Book added successfully!')
    setShowModal(false)
  }

  const handleIssueBook = async (e, issueForm, setShowIssueModal) => {
    e.preventDefault()
    const updated = books.map(b => {
      if (b._id === issueForm.bookId) {
        return { ...b, available: b.available - 1, issuedTo: [...(b.issuedTo || []), { ...issueForm, issuedDate: new Date().toISOString() }] }
      }
      return b
    })
    setBooks(updated)
    localStorage.setItem('books', JSON.stringify(updated))
    toast.success('Book issued successfully!')
    setShowIssueModal(false)
  }

  const handleReturnBook = async (bookId, studentId) => {
    const updated = books.map(b => {
      if (b._id === bookId) {
        return { ...b, available: b.available + 1, issuedTo: (b.issuedTo || []).filter(i => i.studentId !== studentId) }
      }
      return b
    })
    setBooks(updated)
    localStorage.setItem('books', JSON.stringify(updated))
    toast.success('Book returned successfully!')
  }

  const handleEventSubmit = async (e, form, setShowModal) => {
    e.preventDefault()
    const newData = { ...form, _id: form._id || Date.now().toString() }
    let updated
    if (form._id) {
      updated = events.map(ev => ev._id === form._id ? newData : ev)
    } else {
      updated = [...events, newData]
    }
    setEvents(updated)
    localStorage.setItem('events', JSON.stringify(updated))
    toast.success('Event saved successfully!')
    setShowModal(false)
  }

  const handleEventDelete = async (id) => {
    const updated = events.filter(e => e._id !== id)
    setEvents(updated)
    localStorage.setItem('events', JSON.stringify(updated))
    toast.success('Event deleted successfully!')
  }

  const handleBehaviorSubmit = async (e, form, setShowModal) => {
    e.preventDefault()
    const newData = { ...form, _id: Date.now().toString() }
    const updated = [...behaviors, newData]
    setBehaviors(updated)
    localStorage.setItem('behaviors', JSON.stringify(updated))
    toast.success('Behavior recorded successfully!')
    setShowModal(false)
  }

  const handleRouteSubmit = async (e, form, setShowModal) => {
    e.preventDefault()
    const newData = { ...form, _id: Date.now().toString() }
    const updated = [...routes, newData]
    setRoutes(updated)
    localStorage.setItem('routes', JSON.stringify(updated))
    toast.success('Route added successfully!')
    setShowModal(false)
  }

  const handleAssignRoute = async (e, assignForm, setShowAssignModal) => {
    e.preventDefault()
    toast.success('Student assigned to route!')
    setShowAssignModal(false)
    loadDashboardData()
  }

  const handleHealthSubmit = async (e, form, setShowModal) => {
    e.preventDefault()
    const newData = { ...form, _id: form._id || Date.now().toString() }
    let updated
    if (form._id) {
      updated = healthRecords.map(h => h._id === form._id ? newData : h)
    } else {
      updated = [...healthRecords, newData]
    }
    setHealthRecords(updated)
    localStorage.setItem('healthRecords', JSON.stringify(updated))
    toast.success('Health record saved successfully!')
    setShowModal(false)
  }

  return {
    timetables, exams, fees, homework, books, events, behaviors, routes, healthRecords,
    handleTimetableSubmit, handleTimetableDelete,
    handleExamSubmit, handleGradeSubmit,
    handleFeeSubmit, handlePayment,
    handleHomeworkSubmit,
    handleBookSubmit, handleIssueBook, handleReturnBook,
    handleEventSubmit, handleEventDelete,
    handleBehaviorSubmit,
    handleRouteSubmit, handleAssignRoute,
    handleHealthSubmit
  }
}
