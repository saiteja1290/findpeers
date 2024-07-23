// app/api/get-groups/route.js
import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(req) {
    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date')

    if (!date) {
        return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    try {
        const client = await clientPromise
        const db = client.db('weekend_football_matcher')
        const slotsCollection = db.collection('slots')
        const usersCollection = db.collection('users')

        const slotData = await slotsCollection.findOne({ date })

        if (!slotData) {
            return NextResponse.json({ error: 'No bookings found for this date' }, { status: 404 })
        }

        const groups = {}

        for (const [timeSlot, userIds] of Object.entries(slotData.slots)) {
            const users = await usersCollection.find({ _id: { $in: userIds.map(id => new ObjectId(id)) } }).toArray()
            const usernames = users.map(user => user.username)

            groups[timeSlot] = []
            for (let i = 0; i < usernames.length; i += 8) {
                groups[timeSlot].push(usernames.slice(i, i + 8))
            }
        }

        return NextResponse.json({ groups }, { status: 200 })
    } catch (error) {
        console.error('Get groups error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}