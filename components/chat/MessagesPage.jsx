// MessagesPage.jsx
'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import ConversationList from './ConversationList'
import ChatWindow from './ChatWindow'
import socketManager from '@/lib/socket-client'

export default function MessagesPage({ currentUser, onBack }) {
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  // Initialize socket connection
  useEffect(() => {
    if (currentUser && !socketManager.socket) {
      const token = localStorage.getItem('token')
      if (token) {
        socketManager.connect(token)
        
        socketManager.on('connected', () => setIsConnected(true))
        socketManager.on('disconnected', () => setIsConnected(false))
        socketManager.on('error', (error) => {
          console.error('Socket error:', error)
          setIsConnected(false)
        })
      }
    }
  }, [currentUser])

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation)
  }

  const handleCloseChat = () => {
    setSelectedConversation(null)
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className={`${selectedConversation ? 'hidden lg:block' : 'block'} w-full lg:w-80 bg-white border-r`}>
          <ConversationList
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedConversation?.id}
            currentUser={currentUser}
          />
        </div>

        {/* Chat Window */}
        <div className={`${selectedConversation ? 'block' : 'hidden lg:block'} flex-1 bg-white`}>
          {selectedConversation ? (
            <div className="h-full flex flex-col">
              {/* Mobile back button */}
              <div className="lg:hidden p-4 border-b">
                <Button variant="ghost" size="sm" onClick={handleCloseChat}>
                  ← Back to Messages
                </Button>
              </div>
              <div className="flex-1">
                <ChatWindow
                  conversation={selectedConversation}
                  onClose={handleCloseChat}
                  currentUser={currentUser}
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-medium mb-2">Select a conversation</h3>
                <p>Choose a conversation from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}