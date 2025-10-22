// MessagesPage.jsx
'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MessageCircle } from 'lucide-react'
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
    <div className="flex h-full overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Conversations List */}
      <div className={`${selectedConversation ? 'hidden lg:block' : 'block'} w-full lg:w-80 border-r border-gray-200/50 bg-white/70 backdrop-blur-sm`}>
        <ConversationList
          onSelectConversation={handleSelectConversation}
          selectedConversationId={selectedConversation?.id}
          currentUser={currentUser}
        />
      </div>

      {/* Chat Window */}
      <div className={`${selectedConversation ? 'block' : 'hidden lg:block'} flex-1 bg-white`}>
        {selectedConversation ? (
          <ChatWindow
            conversation={selectedConversation}
            onClose={handleCloseChat}
            currentUser={currentUser}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 blur-3xl opacity-20 rounded-full"></div>
                <div className="relative p-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl">
                  <MessageCircle className="h-16 w-16 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Your Messages</h3>
              <p className="text-gray-600">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}