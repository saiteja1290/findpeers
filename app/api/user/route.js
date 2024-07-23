// app/api/user/route.js
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(req) {
    const token = req.headers.get('authorization')?.split(' ')[1]

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        const userId = decodedToken.userId

        const client = await clientPromise
        const db = client.db('weekend_football_matcher')
        const usersCollection = db.collection('users')

        const user = await usersCollection.findOne({ _id: new ObjectId(userId) })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Don't send the password back to the client
        const { password, ...userWithoutPassword } = user

        return NextResponse.json(userWithoutPassword, { status: 200 })
    } catch (error) {
        console.error('Fetch user error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}