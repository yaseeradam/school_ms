'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Send,
  Paperclip,
  Image,
  Phone,
  Video,
  MoreVertical,
  Check,
  CheckCheck,
  Clock,
  MessageCircle,
  Users,
  User,
  Plus,
  Trash2,
  Archive,
  Bell,
  BellOff,
  Smile,
  Mic,
  X,
  Download,
  Reply,
  Copy,
  Forward,
  Trash
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import socketManager from '@/lib/socket-client'
import CallDialog from './CallDialog'
import { uploadFile, getFileSize } from '@/lib/file-storage'

function ChatWindow({ conversation, onClose, currentUser }) {
  console.log('ChatWindow loaded - Features active:', { conversation, currentUser })
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState([])
  const [isOnline, setIsOnline] = useState(false)
  const [lastSeen, setLastSeen] = useState(null)
  const [otherUserInfo, setOtherUserInfo] = useState(null)
  const [callDialog, setCallDialog] = useState({ open: false, type: null })
  const [isMuted, setIsMuted] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [selectedMessages, setSelectedMessages] = useState([])
  const [replyingTo, setReplyingTo] = useState(null)
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, message: null })
  const messagesEndRef = useRef(null)
  const recordingIntervalRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const fileInputRef = useRef(null)
  const imageInputRef = useRef(null)

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load messages when conversation changes
  useEffect(() => {
    if (conversation?.id) {
      loadMessages()
      loadOtherUserInfo()
      socketManager.joinConversation(conversation.id)

      // Set up socket event listeners
      const handleNewMessage = (message) => {
        if (message.conversationId === conversation.id) {
          setMessages(prev => [...prev, message])
        }
      }

      const handleMessagesRead = (data) => {
        if (data.conversationId === conversation.id) {
          setMessages(prev => prev.map(msg =>
            msg.senderId !== currentUser.id && !msg.readBy.includes(data.readBy)
              ? { ...msg, readBy: [...msg.readBy, data.readBy] }
              : msg
          ))
        }
      }

      const handleUserTyping = (data) => {
        if (data.conversationId === conversation.id && data.userId !== currentUser.id) {
          setTypingUsers(prev => [...new Set([...prev, data.userId])])
        }
      }

      const handleUserStoppedTyping = (data) => {
        if (data.conversationId === conversation.id) {
          setTypingUsers(prev => prev.filter(id => id !== data.userId))
        }
      }

      socketManager.on('new_message', handleNewMessage)
      socketManager.on('messages_read', handleMessagesRead)
      socketManager.on('user_typing', handleUserTyping)
      socketManager.on('user_stopped_typing', handleUserStoppedTyping)

      return () => {
        socketManager.off('new_message', handleNewMessage)
        socketManager.off('messages_read', handleMessagesRead)
        socketManager.off('user_typing', handleUserTyping)
        socketManager.off('user_stopped_typing', handleUserStoppedTyping)
        socketManager.leaveConversation(conversation.id)
      }
    }
  }, [conversation?.id, currentUser.id])

  const loadMessages = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/chat/messages?conversationId=${conversation.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const loadOtherUserInfo = async () => {
    if (conversation.type !== 'private') return
    if (!conversation.participants || conversation.participants.length < 2) return
    
    try {
      const otherUserId = conversation.participants.find(p => p !== currentUser.id)
      if (!otherUserId) return
      
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/chat/user-info?userId=${otherUserId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setOtherUserInfo(data)
        setIsOnline(data.isOnline || false)
        setLastSeen(data.lastSeen || null)
      }
    } catch (error) {
      console.error('Error loading user info:', error)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      const token = localStorage.getItem('token')
      const messageData = {
        conversationId: conversation.id,
        messageType: 'text',
        content: newMessage.trim()
      }

      // Add reply reference if replying
      if (replyingTo) {
        messageData.replyTo = replyingTo.id
      }

      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(messageData)
      })

      if (response.ok) {
        const message = await response.json()
        setMessages(prev => [...prev, message])
        socketManager.sendMessage(message)
      }
      
      setNewMessage('')
      setReplyingTo(null)
      stopTyping()
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleFileUpload = async (file, type) => {
    if (file.size > 10 * 1024 * 1024) {
      alert('File must be less than 10MB')
      return
    }

    setUploading(true)
    try {
      const { url, storage } = await uploadFile(file, 'chat')
      
      const token = localStorage.getItem('token')
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          conversationId: conversation.id,
          messageType: type,
          content: url,
          fileName: file.name,
          fileSize: file.size,
          storageType: storage
        })
      })

      if (response.ok) {
        const message = await response.json()
        setMessages(prev => [...prev, message])
        socketManager.sendMessage(message)
      }
      setUploading(false)
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Failed to upload file')
      setUploading(false)
    }
  }

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true)
      socketManager.startTyping(conversation.id)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping()
    }, 1000)
  }

  const stopTyping = () => {
    if (isTyping) {
      setIsTyping(false)
      socketManager.stopTyping(conversation.id)
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date

    if (diff < 60000) { // Less than 1 minute
      return 'Just now'
    } else if (diff < 3600000) { // Less than 1 hour
      return `${Math.floor(diff / 60000)}m ago`
    } else if (diff < 86400000) { // Less than 1 day
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString()
    }
  }

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Offline'
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date

    if (diff < 60000) return 'Active now'
    if (diff < 3600000) return `Active ${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `Active ${Math.floor(diff / 3600000)}h ago`
    return `Last seen ${date.toLocaleDateString()}`
  }

  const getMessageStatus = (message) => {
    if (message.senderId !== currentUser.id) return null

    if (message.read && message.readBy.length > 1) {
      return <CheckCheck className="h-3 w-3 text-blue-500" />
    } else if (message.read) {
      return <Check className="h-3 w-3 text-gray-500" />
    } else {
      return <Clock className="h-3 w-3 text-gray-400" />
    }
  }

  const getOtherParticipant = () => {
    if (conversation.type === 'private') {
      return conversation.participants.find(p => p !== currentUser.id)
    }
    return null
  }

  const otherParticipant = getOtherParticipant()

  const handleDeleteConversation = async () => {
    if (!confirm('Delete this conversation?')) return
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/chat/conversations/${conversation.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      onClose()
    } catch (error) {
      console.error('Error deleting conversation:', error)
    }
  }

  const handleDeleteMessage = async (messageId) => {
    if (!confirm('Delete this message?')) return
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/chat/messages/${messageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setMessages(prev => prev.filter(msg => msg.id !== messageId))
      setContextMenu({ show: false, x: 0, y: 0, message: null })
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }

  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(content)
    setContextMenu({ show: false, x: 0, y: 0, message: null })
  }

  const handleReplyToMessage = (message) => {
    setReplyingTo(message)
    setContextMenu({ show: false, x: 0, y: 0, message: null })
  }

  const handleMessageContextMenu = (e, message) => {
    e.preventDefault()
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      message
    })
  }

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setIsRecording(true)
      setRecordingTime(0)
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

      // In a real implementation, you'd use MediaRecorder API here
      // For now, we'll just simulate recording
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone')
    }
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    setRecordingTime(0)
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
    }
    // In a real implementation, you'd save and send the audio here
  }

  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
  }

  const commonEmojis = ['😊', '😂', '❤️', '👍', '🙏', '😍', '🎉', '🔥', '✨', '💯', '👏', '🤔', '😢', '😎', '🥰', '😘']

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <CallDialog
        isOpen={callDialog.open}
        onClose={() => setCallDialog({ open: false, type: null })}
        callType={callDialog.type}
        participant={otherParticipant}
      />
      
      {/* Profile View Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            <Avatar className="h-32 w-32">
              {otherUserInfo?.profilePicture ? (
                <img src={otherUserInfo.profilePicture} alt={otherUserInfo.name} className="h-full w-full object-cover" />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-4xl">
                  {otherUserInfo?.name?.charAt(0).toUpperCase() || <User className="h-16 w-16" />}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-semibold">{otherUserInfo?.name || 'User'}</h3>
              <p className="text-sm text-gray-500">{otherUserInfo?.email}</p>
              {otherUserInfo?.bio && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 italic">"{otherUserInfo.bio}"</p>
                </div>
              )}
              <div className="flex items-center justify-center space-x-2 mt-4">
                <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-600">
                  {isOnline ? 'Active now' : formatLastSeen(lastSeen)}
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b shadow-sm">
        <div className="flex items-center space-x-3">
          <div 
            className="relative cursor-pointer" 
            onClick={() => conversation.type === 'private' && setShowProfileDialog(true)}
          >
            <Avatar className="h-10 w-10">
              {conversation.type === 'private' && otherUserInfo?.profilePicture ? (
                <img src={otherUserInfo.profilePicture} alt={otherUserInfo.name} className="h-full w-full object-cover" />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {conversation.type === 'group' ? (
                    <Users className="h-5 w-5" />
                  ) : (
                    otherUserInfo?.name?.charAt(0).toUpperCase() || <User className="h-5 w-5" />
                  )}
                </AvatarFallback>
              )}
            </Avatar>
            {conversation.type === 'private' && isOnline && (
              <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-base">
              {conversation.type === 'group' ? conversation.name : (otherUserInfo?.name || 'Chat')}
            </h3>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              {conversation.type === 'private' && (
                <>
                  {typingUsers.length > 0 ? (
                    <span className="text-blue-500 italic">typing...</span>
                  ) : (
                    <span className={isOnline ? 'text-green-600' : ''}>
                      {isOnline ? 'Active now' : formatLastSeen(lastSeen)}
                    </span>
                  )}
                </>
              )}
              {conversation.type === 'group' && (
                <span>{conversation.participants?.length || 0} members</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {conversation.type === 'private' && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full hover:bg-gray-100"
                onClick={() => setCallDialog({ open: true, type: 'voice' })}
              >
                <Phone className="h-5 w-5 text-blue-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full hover:bg-gray-100"
                onClick={() => setCallDialog({ open: true, type: 'video' })}
              >
                <Video className="h-5 w-5 text-blue-500" />
              </Button>
            </>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-gray-100">
                <MoreVertical className="h-5 w-5 text-blue-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {conversation.type === 'private' && (
                <>
                  <DropdownMenuItem onClick={() => setShowProfileDialog(true)}>
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <Bell className="h-4 w-4 mr-2" /> : <BellOff className="h-4 w-4 mr-2" />}
                {isMuted ? 'Unmute' : 'Mute'} Notifications
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Archive className="h-4 w-4 mr-2" />
                Archive Chat
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDeleteConversation} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Conversation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="space-y-2">
            {messages.map((message) => {
              const isOwnMessage = message.senderId === currentUser.id
              return (
                <div
                  key={message.id}
                  className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end gap-2 max-w-xs lg:max-w-md`}>
                    {!isOwnMessage && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        {otherUserInfo?.profilePicture ? (
                          <img src={otherUserInfo.profilePicture} alt={otherUserInfo.name} className="h-full w-full object-cover" />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-xs">
                            {otherUserInfo?.name?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    )}
                    <div className="flex flex-col">
                      {!isOwnMessage && (
                        <span className="text-xs text-gray-600 font-medium mb-1 px-1">
                          {otherUserInfo?.name || message.senderName || 'User'}
                        </span>
                      )}
                      <div
                        className={`px-4 py-2 shadow-sm ${
                          isOwnMessage
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl rounded-br-md'
                            : 'bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md border border-gray-200'
                        }`}
                      >
                        {message.messageType === 'image' ? (
                          <img src={message.content} alt="Shared" className="max-w-xs rounded-lg" />
                        ) : message.messageType === 'file' ? (
                          <a href={message.content} download={message.fileName} className="flex items-center space-x-2 hover:underline">
                            <Paperclip className="h-4 w-4" />
                            <span className="text-sm">{message.fileName} ({(message.fileSize / 1024).toFixed(1)}KB)</span>
                          </a>
                        ) : (
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        )}
                      </div>
                      <div className={`flex items-center mt-1 space-x-1 px-1 ${
                        isOwnMessage ? 'justify-end' : 'justify-start'
                      }`}>
                        <span className={`text-xs ${
                          isOwnMessage ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          {formatTime(message.createdAt)}
                        </span>
                        {getMessageStatus(message)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'file')}
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'image')}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full hover:bg-gray-100"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Paperclip className="h-5 w-5 text-blue-500" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full hover:bg-gray-100"
            onClick={() => imageInputRef.current?.click()}
            disabled={uploading}
          >
            <Image className="h-5 w-5 text-blue-500" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value)
              handleTyping()
            }}
            placeholder="Aa"
            className="flex-1 rounded-full bg-gray-100 border-0 px-4"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage(e)
              }
            }}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!newMessage.trim()}
            className="h-9 w-9 rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

export default ChatWindow
