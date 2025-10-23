'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, FileText, Edit, Trash2, Award, ArrowLeft } from 'lucide-react'

export default function ExamsPage({ exams, classes, subjects, students, showModal, setShowModal, showGradeModal, setShowGradeModal, form, setForm, gradeForm, setGradeForm, handleSubmit, handleGradeSubmit, handleDelete, onBack }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
          <h2 className="text-2xl font-bold text-gray-800">Exams & Grading</h2>
        </div>
        <Button onClick={() => { setForm({ classId: '', subjectId: '', title: '', date: '', totalMarks: '', passingMarks: '', duration: '', term: '' }); setShowModal(true) }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" /> Create Exam
        </Button>
      </div>

      <div className="grid gap-4">
        {exams.map(exam => {
          const cls = classes.find(c => c.id === exam.classId)
          const subject = subjects.find(s => s.id === exam.subjectId)
          const grades = exam.grades || []
          return (
            <Card key={exam.id || exam._id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    {exam.title}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setGradeForm({ examId: exam.id || exam._id, studentId: '', marksObtained: '', grade: '', remarks: '' }); setShowGradeModal(true) }}>
                      <Award className="h-4 w-4 mr-1" /> Add Grade
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setForm(exam); setShowModal(true) }}><Edit className="h-4 w-4" /></Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(exam.id || exam._id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div><span className="text-gray-600">Class:</span> <span className="font-semibold">{cls?.name}</span></div>
                  <div><span className="text-gray-600">Subject:</span> <span className="font-semibold">{subject?.name}</span></div>
                  <div><span className="text-gray-600">Date:</span> <span className="font-semibold">{new Date(exam.date).toLocaleDateString()}</span></div>
                  <div><span className="text-gray-600">Total Marks:</span> <span className="font-semibold">{exam.totalMarks}</span></div>
                </div>
                {grades.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-2 text-left">Student</th>
                          <th className="p-2 text-center">Marks</th>
                          <th className="p-2 text-center">Grade</th>
                          <th className="p-2 text-left">Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grades.map((g, i) => {
                          const student = students.find(s => s.id === g.studentId)
                          return (
                            <tr key={i} className="border-t">
                              <td className="p-2">{student?.firstName} {student?.lastName}</td>
                              <td className="p-2 text-center">{g.marksObtained}/{exam.totalMarks}</td>
                              <td className="p-2 text-center"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">{g.grade}</span></td>
                              <td className="p-2">{g.remarks}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>{form.id || form._id ? 'Edit' : 'Create'} Exam</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Class</Label>
                <Select value={form.classId} onValueChange={(v) => setForm({...form, classId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Subject</Label>
                <Select value={form.subjectId} onValueChange={(v) => setForm({...form, subjectId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} required />
              </div>
              <div>
                <Label>Duration (mins)</Label>
                <Input type="number" value={form.duration} onChange={(e) => setForm({...form, duration: e.target.value})} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Total Marks</Label>
                <Input type="number" value={form.totalMarks} onChange={(e) => setForm({...form, totalMarks: e.target.value})} required />
              </div>
              <div>
                <Label>Passing Marks</Label>
                <Input type="number" value={form.passingMarks} onChange={(e) => setForm({...form, passingMarks: e.target.value})} required />
              </div>
            </div>
            <div>
              <Label>Term</Label>
              <Select value={form.term} onValueChange={(v) => setForm({...form, term: v})}>
                <SelectTrigger><SelectValue placeholder="Select term" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="First Term">First Term</SelectItem>
                  <SelectItem value="Second Term">Second Term</SelectItem>
                  <SelectItem value="Third Term">Third Term</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">{form.id || form._id ? 'Update' : 'Create'} Exam</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showGradeModal} onOpenChange={setShowGradeModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Grade</DialogTitle></DialogHeader>
          <form onSubmit={handleGradeSubmit} className="space-y-4">
            <div>
              <Label>Student</Label>
              <Select value={gradeForm.studentId} onValueChange={(v) => setGradeForm({...gradeForm, studentId: v})}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id}>{s.firstName} {s.lastName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Marks Obtained</Label>
              <Input type="number" value={gradeForm.marksObtained} onChange={(e) => setGradeForm({...gradeForm, marksObtained: e.target.value})} required />
            </div>
            <div>
              <Label>Grade</Label>
              <Select value={gradeForm.grade} onValueChange={(v) => setGradeForm({...gradeForm, grade: v})}>
                <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A - Excellent</SelectItem>
                  <SelectItem value="B">B - Very Good</SelectItem>
                  <SelectItem value="C">C - Good</SelectItem>
                  <SelectItem value="D">D - Fair</SelectItem>
                  <SelectItem value="F">F - Fail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Remarks</Label>
              <Textarea value={gradeForm.remarks} onChange={(e) => setGradeForm({...gradeForm, remarks: e.target.value})} />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Add Grade</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
