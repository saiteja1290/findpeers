// app/api/book-match/route.js
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(req) {
    const { date, timeSlot } = await req.json()
    const token = req.headers.get('authorization')?.split(' ')[1]

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

    // Validate timeSlot
    const validTimeSlots = ['9am-12pm', '12pm-3pm', '3pm-6pm', '6pm-9pm']
    if (!validTimeSlots.includes(timeSlot)) {
        return NextResponse.json({ error: 'Invalid time slot' }, { status: 400 })
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        const userId = decodedToken.userId

        const client = await clientPromise
        const db = client.db('weekend_football_matcher')
        const slotsCollection = db.collection('slots')

        // Check if the user has already booked this slot
        const existingBooking = await slotsCollection.findOne({
            date: date,
            [`slots.${timeSlot}`]: new ObjectId(userId)
        })

        if (existingBooking) {
            return NextResponse.json({ error: 'You have already booked this slot' }, { status: 400 })
        }

        // Check if the slot is already full
        const slot = await slotsCollection.findOne({ date: date })
        if (slot && slot.slots[timeSlot] && slot.slots[timeSlot].length >= 8) {
            return NextResponse.json({ error: 'This slot is already full' }, { status: 400 })
        }

        // Update the slot document, adding the user to the appropriate time slot
        const result = await slotsCollection.updateOne(
            { date: date },
            {
                $addToSet: { [`slots.${timeSlot}`]: new ObjectId(userId) }
            },
            { upsert: true }
        )

        if (result.modifiedCount === 0 && result.upsertedCount === 0) {
            return NextResponse.json({ error: 'Booking failed' }, { status: 400 })
        }

        // Check if this booking completed a group of 8
        const updatedSlot = await slotsCollection.findOne({ date: date })
        if (updatedSlot.slots[timeSlot].length === 8) {
            // Here you could trigger notifications or other actions when a group is formed
            console.log(`A group of 8 has been formed for ${date} at ${timeSlot}`)
        }

        return NextResponse.json({ message: 'Booking successful' }, { status: 201 })
    } catch (error) {
        console.error('Booking error:', error)
        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}