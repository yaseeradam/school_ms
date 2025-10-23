'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCheck, Users2, School } from 'lucide-react'

export default function DashboardPage({ stats, students, teachers, parents, classes }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-blue-900 mb-2">
              {stats.totalStudents || students.length || 0}
            </CardTitle>
            <CardDescription className="text-blue-700 font-medium">Total Students</CardDescription>
          </CardHeader>
        </Card>

        <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-emerald-900 mb-2">
              {stats.totalTeachers || teachers.length || 0}
            </CardTitle>
            <CardDescription className="text-emerald-700 font-medium">Total Teachers</CardDescription>
          </CardHeader>
        </Card>

        <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-amber-50 to-amber-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-500 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users2 className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-amber-900 mb-2">
              {stats.totalParents || parents.length || 0}
            </CardTitle>
            <CardDescription className="text-amber-700 font-medium">Total Parents</CardDescription>
          </CardHeader>
        </Card>

        <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <School className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-purple-900 mb-2">
              {stats.totalClasses || classes.length || 0}
            </CardTitle>
            <CardDescription className="text-purple-700 font-medium">Total Classes</CardDescription>
          </CardHeader>
        </Card>
      </div>
  )
}
