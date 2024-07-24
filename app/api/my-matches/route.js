import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'

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
        const slotsCollection = db.collection('slots')

        const user = await usersCollection.findOne({ _id: new ObjectId(userId) })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const bookings = user.bookings || []

        const matchDetails = await Promise.all(bookings.map(async booking => {
            const slotDocument = await slotsCollection.findOne({ date: booking.date })
            const slot = slotDocument.slots[booking.timeSlot].find(group => group.groupNumber === booking.groupNumber)

            const playerUsernames = await Promise.all(slot.players.map(async playerId => {
                const player = await usersCollection.findOne({ _id: new ObjectId(playerId) })
                return player ? player.username : 'Unknown'
            }))

            return {
                ...booking,
                playerUsernames
            }
        }))

        return NextResponse.json({ matches: matchDetails }, { status: 200 })
    } catch (error) {
        console.error('Error fetching matches:', error)
        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
