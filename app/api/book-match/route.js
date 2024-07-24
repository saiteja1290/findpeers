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

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

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
        const usersCollection = db.collection('users')

        const existingBooking = await slotsCollection.findOne({
            date: date,
            [`slots.${timeSlot}.players`]: new ObjectId(userId)
        })

        if (existingBooking) {
            return NextResponse.json({ error: 'You have already booked this slot' }, { status: 400 })
        }

        const slotDocument = await slotsCollection.findOne({ date: date })

        let groupIndex = 0
        let updated = false
        let groupNumber = 0

        if (slotDocument && slotDocument.slots[timeSlot]) {
            groupIndex = slotDocument.slots[timeSlot].findIndex(group => group.players.length < 8)

            if (groupIndex !== -1) {
                groupNumber = slotDocument.slots[timeSlot][groupIndex].groupNumber
                const result = await slotsCollection.updateOne(
                    { date: date },
                    { $addToSet: { [`slots.${timeSlot}.${groupIndex}.players`]: new ObjectId(userId) } }
                )
                updated = result.modifiedCount > 0
            }
        }

        if (!updated) {
            groupNumber = slotDocument ? slotDocument.slots[timeSlot]?.length + 1 : 1
            const result = await slotsCollection.updateOne(
                { date: date },
                {
                    $push: {
                        [`slots.${timeSlot}`]: {
                            groupNumber,
                            players: [new ObjectId(userId)]
                        }
                    }
                },
                { upsert: true }
            )
            updated = result.modifiedCount > 0 || result.upsertedCount > 0
        }

        if (updated) {
            // Update the user document with group number and slot ID
            await usersCollection.updateOne(
                { _id: new ObjectId(userId) },
                {
                    $push: {
                        bookings: {
                            date,
                            timeSlot,
                            groupNumber,
                            slotId: slotDocument ? slotDocument._id : 'new_slot_id'
                        }
                    }
                }
            )
        }

        if (!updated) {
            return NextResponse.json({ error: 'Booking failed' }, { status: 400 })
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
