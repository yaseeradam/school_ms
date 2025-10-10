'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  MessageCircle,
  Users,
  User,
  Plus,
  Search,
  Clock,
  Check,
  CheckCheck
} from 'lucide-react'

function ConversationList({ onSelectConversation, selectedConversationId, currentUser }) {
  const [conversations, setConversations] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewChatDialog, setShowNewChatDialog] = useState(false)
  const [showNewGroupDialog, setShowNewGroupDialog] = useState(false)
  const [availableUsers, setAvailableUsers] = useState([])
  const [userProfiles, setUserProfiles] = useState({})
  const [newChatForm, setNewChatForm] = useState({
    targetUserId: '',
    initialMessage: ''
  })
  const [newGroupForm, setNewGroupForm] = useState({
    name: '',
    participants: [],
    initialMessage: ''
  })

  // Load conversations on component mount
  useEffect(() => {
    loadConversations()
    loadAvailableUsers()
  }, [])

  // Load user profiles for conversations
  useEffect(() => {
    if (conversations.length > 0) {
      loadUserProfiles()
    }
  }, [conversations])

  const loadUserProfiles = async () => {
    try {
      const token = localStorage.getItem('token')
      const userIds = new Set()
      
      conversations.forEach(conv => {
        if (conv.type === 'private') {
          const otherUserId = conv.participants?.find(p => p !== currentUser.id)
          if (otherUserId) userIds.add(otherUserId)
        }
      })

      const profiles = {}
      for (const userId of userIds) {
        try {
          const response = await fetch(`/api/chat/user-info?userId=${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          if (response.ok) {
            const data = await response.json()
            profiles[userId] = data
          }
        } catch (error) {
          console.error(`Error loading profile for user ${userId}:`, error)
        }
      }
      
      setUserProfiles(profiles)
    } catch (error) {
      console.error('Error loading user profiles:', error)
    }
  }

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/chat/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    }
  }

  const loadAvailableUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = {
        'Authorization': `Bearer ${token}`
      }
      let users = []

      if (currentUser.role === 'parent') {
        const teachersResponse = await fetch('/api/teachers', { headers })
        if (teachersResponse.ok) {
          const teachers = await teachersResponse.json()
          users = teachers.map(teacher => ({
            id: teacher.id,
            name: `${teacher.firstName} ${teacher.lastName}`,
            role: 'teacher',
            email: teacher.email
          }))
        }
      } else if (currentUser.role === 'teacher') {
        const parentsResponse = await fetch('/api/parents', { headers })
        if (parentsResponse.ok) {
          const parents = await parentsResponse.json()
          users = parents.map(parent => ({
            id: parent.id,
            name: parent.name,
            role: 'parent',
            email: parent.email
          }))
        }
      } else if (currentUser.role === 'school_admin') {
        const [teachersRes, parentsRes] = await Promise.all([
          fetch('/api/teachers', { headers }),
          fetch('/api/parents', { headers })
        ])

        if (teachersRes.ok) {
          const teachers = await teachersRes.json()
          users.push(...teachers.map(teacher => ({
            id: teacher.id,
            name: `${teacher.firstName} ${teacher.lastName}`,
            role: 'teacher',
            email: teacher.email
          })))
        }

        if (parentsRes.ok) {
          const parents = await parentsRes.json()
          users.push(...parents.map(parent => ({
            id: parent.id,
            name: parent.name,
            role: 'parent',
            email: parent.email
          })))
        }
      }

      setAvailableUsers(users)
    } catch (error) {
      console.error('Error loading available users:', error)
    }
  }

  const handleStartNewChat = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'private',
          participants: [newChatForm.targetUserId]
        })
      })

      if (response.ok) {
        const conversation = await response.json()
        setConversations(prev => [conversation, ...prev])
        onSelectConversation(conversation)
        setShowNewChatDialog(false)
        setNewChatForm({ targetUserId: '', initialMessage: '' })
      }
    } catch (error) {
      console.error('Error starting new chat:', error)
    }
  }

  const handleCreateGroupChat = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'group',
          name: newGroupForm.name,
          participants: newGroupForm.participants
        })
      })

      if (response.ok) {
        const conversation = await response.json()
        setConversations(prev => [conversation, ...prev])
        onSelectConversation(conversation)
        setShowNewGroupDialog(false)
        setNewGroupForm({ name: '', participants: [], initialMessage: '' })
      }
    } catch (error) {
      console.error('Error creating group chat:', error)
    }
  }

  const filteredConversations = conversations.filter(conversation => {
    if (!searchTerm) return true

    if (conversation.type === 'group') {
      return conversation.name.toLowerCase().includes(searchTerm.toLowerCase())
    } else {
      // For private chats, we might want to show participant names
      // This would require additional API calls to get user details
      return true // For now, show all private chats
    }
  })

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return ''

    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date

    if (diff < 60000) { // Less than 1 minute
      return 'now'
    } else if (diff < 3600000) { // Less than 1 hour
      return `${Math.floor(diff / 60000)}m`
    } else if (diff < 86400000) { // Less than 1 day
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const getConversationDisplayName = (conversation) => {
    if (conversation.type === 'group') {
      return conversation.name
    } else {
      // For private chats, show the other participant's name
      const otherUserId = conversation.participants?.find(p => p !== currentUser.id)
      const profile = userProfiles[otherUserId]
      return profile?.name || 'Private Chat'
    }
  }

  const getConversationAvatar = (conversation) => {
    if (conversation.type === 'group') {
      return <Users className="h-5 w-5" />
    } else {
      const otherUserId = conversation.participants?.find(p => p !== currentUser.id)
      const profile = userProfiles[otherUserId]
      
      if (profile?.profilePicture) {
        return <img src={profile.profilePicture} alt={profile.name} className="h-full w-full object-cover" />
      }
      return profile?.name?.charAt(0).toUpperCase() || <User className="h-5 w-5" />
    }
  }

  const getUserOnlineStatus = (conversation) => {
    if (conversation.type !== 'private') return false
    const otherUserId = conversation.participants?.find(p => p !== currentUser.id)
    const profile = userProfiles[otherUserId]
    return profile?.isOnline || false
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold">Chats</h2>
          <div className="flex space-x-2">
            {currentUser.role !== 'developer' && (
              <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Start New Chat</DialogTitle>
                    <DialogDescription>
                      Start a private conversation with a teacher or parent.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleStartNewChat} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Person</label>
                      <Select
                        value={newChatForm.targetUserId}
                        onValueChange={(value) => setNewChatForm(prev => ({ ...prev, targetUserId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose who to chat with" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableUsers.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} ({user.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Initial Message (Optional)</label>
                      <Textarea
                        value={newChatForm.initialMessage}
                        onChange={(e) => setNewChatForm(prev => ({ ...prev, initialMessage: e.target.value }))}
                        placeholder="Type your first message..."
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowNewChatDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={!newChatForm.targetUserId}>
                        Start Chat
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}

            {currentUser.role === 'school_admin' && (
              <Dialog open={showNewGroupDialog} onOpenChange={setShowNewGroupDialog}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Users className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Group Chat</DialogTitle>
                    <DialogDescription>
                      Create a group conversation for announcements or discussions.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateGroupChat} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Group Name</label>
                      <Input
                        value={newGroupForm.name}
                        onChange={(e) => setNewGroupForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter group name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Add Members</label>
                      <Select
                        value=""
                        onValueChange={(value) => {
                          if (!newGroupForm.participants.includes(value)) {
                            setNewGroupForm(prev => ({
                              ...prev,
                              participants: [...prev.participants, value]
                            }))
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Add members to the group" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableUsers.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} ({user.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {newGroupForm.participants.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {newGroupForm.participants.map((participantId) => {
                            const user = availableUsers.find(u => u.id === participantId)
                            return (
                              <Badge key={participantId} variant="secondary" className="text-xs">
                                {user?.name || 'Unknown'}
                                <button
                                  type="button"
                                  onClick={() => setNewGroupForm(prev => ({
                                    ...prev,
                                    participants: prev.participants.filter(id => id !== participantId)
                                  }))}
                                  className="ml-1 hover:text-red-500"
                                >
                                  ×
                                </button>
                              </Badge>
                            )
                          })}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowNewGroupDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={!newGroupForm.name || newGroupForm.participants.length === 0}>
                        Create Group
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search Messenger"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-full bg-gray-100 border-0"
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-1 p-2">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No conversations yet</p>
                <p className="text-sm">Start a new chat to get connected</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`w-full p-3 text-left hover:bg-gray-100 transition-colors relative ${
                    selectedConversationId === conversation.id ? 'bg-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-14 w-14">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          {getConversationAvatar(conversation)}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.type === 'private' && getUserOnlineStatus(conversation) && (
                        <div className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm truncate ${
                          conversation.unreadCount > 0 ? 'font-semibold' : 'font-normal'
                        }`}>
                          {getConversationDisplayName(conversation)}
                        </h3>
                        {conversation.lastMessageAt && (
                          <span className="text-xs text-gray-500 ml-2">
                            {formatLastMessageTime(conversation.lastMessageAt)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-sm truncate ${
                          conversation.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-600'
                        }`}>
                          {conversation.type === 'group'
                            ? `${conversation.participants?.length || 0} members`
                            : getUserOnlineStatus(conversation) ? 'Active now' : 'Offline'
                          }
                        </p>
                        {conversation.unreadCount > 0 && (
                          <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

export default ConversationList
