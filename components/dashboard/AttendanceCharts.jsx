'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useMemo } from 'react'

export default function AttendanceCharts({ attendance = [], students = [], teachers = [], classes = [], userRole }) {
  const chartData = useMemo(() => {
    if (!attendance.length) {
      return {
        weeklyData: [],
        statusData: [],
        classRates: []
      }
    }

    // Calculate status distribution
    const statusCounts = attendance.reduce((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1
      return acc
    }, {})

    const total = attendance.length || 1
    const statusData = [
      { name: 'Present', value: Math.round((statusCounts.present || 0) / total * 100), color: '#10b981' },
      { name: 'Absent', value: Math.round((statusCounts.absent || 0) / total * 100), color: '#ef4444' },
      { name: 'Late', value: Math.round((statusCounts.late || 0) / total * 100), color: '#f59e0b' },
      { name: 'Sick', value: Math.round((statusCounts.sick || 0) / total * 100), color: '#f97316' }
    ].filter(item => item.value > 0)

    // Calculate weekly data (last 7 days)
    const today = new Date()
    const weeklyData = []
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayRecords = attendance.filter(r => r.date?.startsWith(dateStr))
      const present = dayRecords.filter(r => r.status === 'present').length
      const absent = dayRecords.filter(r => r.status === 'absent').length
      
      weeklyData.push({
        day: days[date.getDay()],
        present,
        absent
      })
    }

    // Calculate class-wise rates
    const classRates = classes.map(cls => {
      const classStudents = students.filter(s => s.classId === cls.id)
      const classAttendance = attendance.filter(r => 
        classStudents.some(s => s.id === r.studentId)
      )
      
      const presentCount = classAttendance.filter(r => r.status === 'present').length
      const rate = classAttendance.length ? Math.round((presentCount / classAttendance.length) * 100) : 0
      
      return {
        class: cls.name,
        rate
      }
    }).filter(c => c.rate > 0)

    return { weeklyData, statusData, classRates }
  }, [attendance, students, classes])

  const { weeklyData, statusData, classRates } = chartData

  if (!attendance.length) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">No attendance data available yet.</p>
          <p className="text-sm text-gray-500 mt-1">Start marking attendance to see charts.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Weekly Trends */}
      {weeklyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Attendance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="#10b981" name="Present" />
                <Bar dataKey="absent" fill="#ef4444" name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Status Distribution */}
        {statusData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Attendance Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Class-wise Comparison */}
        {classRates.length > 0 && userRole === 'school_admin' && (
          <Card>
            <CardHeader>
              <CardTitle>Attendance Rates by Class</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={classRates} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="class" type="category" width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="rate" fill="#8b5cf6" name="Attendance Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
