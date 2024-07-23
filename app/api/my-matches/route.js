// app/api/my-matches/route.js
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import clientPromise from '@/lib/mongodb'

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
        const bookingsCollection = db.collection('bookings')

        const matches = await bookingsCollection.find({ userId }).toArray()

        return NextResponse.json(matches, { status: 200 })
    } catch (error) {
        console.error('Fetch matches error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}