// app/api/get-teams/route.js
import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(req) {
    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date')
    const timeSlot = searchParams.get('timeSlot')

    if (!date || !timeSlot) {
        return NextResponse.json({ error: 'Date and time slot are required' }, { status: 400 })
    }

    try {
        const client = await clientPromise
        const db = client.db('weekend_football_matcher')
        const slotsCollection = db.collection('slots')

        const slotData = await slotsCollection.findOne({ date })

        if (!slotData || !slotData.slots[timeSlot]) {
            return NextResponse.json({ error: 'No bookings found for this slot' }, { status: 404 })
        }

        const users = slotData.slots[timeSlot]
        const teams = []

        // Group users into teams of 8
        for (let i = 0; i < users.length; i += 8) {
            teams.push(users.slice(i, i + 8))
        }

        return NextResponse.json({ teams }, { status: 200 })
    } catch (error) {
        console.error('Get teams error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}