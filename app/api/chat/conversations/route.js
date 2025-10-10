import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import jwt from 'jsonwebtoken'

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const db = await connectDB()
    
    const conversations = await db.collection('conversations')
      .find({
        schoolId: decoded.schoolId,
        participants: decoded.userId
      })
      .sort({ lastMessageAt: -1 })
      .toArray()

    return NextResponse.json(conversations)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const body = await request.json()
    const db = await connectDB()
    
    const conversation = {
      id: `conv_${Date.now()}`,
      schoolId: decoded.schoolId,
      type: body.type || 'private',
      name: body.name || null,
      participants: [decoded.userId, ...(body.participants || [])],
      createdBy: decoded.userId,
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0
    }

    await db.collection('conversations').insertOne(conversation)
    return NextResponse.json(conversation)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
