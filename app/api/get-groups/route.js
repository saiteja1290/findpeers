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
        for (const [timeSlot, playerIds] of Object.entries(slotData.slots)) {
            const validPlayerIds = playerIds.map(id => {
                try {
                    return new ObjectId(id)
                } catch (error) {
                    console.error('Invalid ObjectId:', id)
                    return null
                }
            }).filter(id => id !== null)

            const users = await usersCollection.find({ _id: { $in: validPlayerIds } }).toArray()
            const usernames = users.map(user => user.username)

            groups[timeSlot] = []

            // Create Group 0 with up to 8 players
            groups[timeSlot].push({
                groupNumber: 0,
                players: usernames.slice(0, 8)
            })

            // If there are more than 8 players, create Group 1 with the rest
            if (usernames.length > 8) {
                groups[timeSlot].push({
                    groupNumber: 1,
                    players: usernames.slice(8)
                })
            }
        }

        return NextResponse.json({ groups }, { status: 200 })
    } catch (error) {
        console.error('Get groups error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}