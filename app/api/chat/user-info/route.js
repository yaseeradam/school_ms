import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import jwt from 'jsonwebtoken'

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    jwt.verify(token, process.env.JWT_SECRET)
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const db = await connectDB()
    const user = await db.collection('users').findOne(
      { _id: userId },
      { projection: { name: 1, email: 1, profilePicture: 1, lastSeen: 1, isOnline: 1 } }
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture || '',
      bio: user.bio || '',
      lastSeen: user.lastSeen || null,
      isOnline: user.isOnline || false
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
