'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Eye, Edit, School } from 'lucide-react'

export default function SchoolsPage({ 
  schools,
  showMasterSchoolModal,
  setShowMasterSchoolModal,
  masterSchoolForm,
  setMasterSchoolForm,
  handleCreateSchool
}) {
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

  return (
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
  )
}
