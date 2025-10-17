// CallDialog.jsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Phone, Video, Mic, MicOff, VideoOff, PhoneOff, User } from 'lucide-react'

export default function CallDialog({ isOpen, onClose, callType, participant }) {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [callStatus, setCallStatus] = useState('connecting')
  const intervalRef = useRef(null)

  useEffect(() => {
    if (isOpen && callStatus === 'connecting') {
      setTimeout(() => setCallStatus('connected'), 2000)
    }
  }, [isOpen, callStatus])

  useEffect(() => {
    if (callStatus === 'connected') {
      intervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1)
      }, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [callStatus])

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleEndCall = () => {
    setCallDuration(0)
    setCallStatus('connecting')
    setIsMuted(false)
    setIsVideoOff(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleEndCall}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center space-y-6 py-6">
          <Avatar className="h-24 w-24">
            <AvatarFallback className="bg-blue-500 text-white text-2xl">
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>

          <div className="text-center">
            <h3 className="text-xl font-semibold">{participant?.name || 'User'}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {callStatus === 'connecting' ? 'Connecting...' : formatDuration(callDuration)}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {callType === 'video' && (
              <Button
                variant={isVideoOff ? 'destructive' : 'secondary'}
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={() => setIsVideoOff(!isVideoOff)}
              >
                {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              </Button>
            )}

            <Button
              variant={isMuted ? 'destructive' : 'secondary'}
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>

            <Button
              variant="destructive"
              size="icon"
              className="h-14 w-14 rounded-full"
              onClick={handleEndCall}
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </div>

          <p className="text-xs text-gray-400 text-center">
            Note: This is a demo call interface. WebRTC integration required for real calls.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
