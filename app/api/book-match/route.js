// app/api/book-match/route.js
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import clientPromise from '@/lib/mongodb'

export async function POST(req) {
    const { date, timeSlot } = await req.json()
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

        await bookingsCollection.insertOne({
            userId,
            date,
            timeSlot,
        })

        return NextResponse.json({ message: 'Booking successful' }, { status: 201 })
    } catch (error) {
        console.error('Booking error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}