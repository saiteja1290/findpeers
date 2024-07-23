// app/api/my-matches/route.js
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
        const userId = new ObjectId(decodedToken.userId)

        const client = await clientPromise
        const db = client.db('weekend_football_matcher')
        const slotsCollection = db.collection('slots')

        const matches = await slotsCollection.aggregate([
            { $match: { "slots.9am-12pm": userId } },
            { $project: { date: 1, timeSlot: "9am-12pm" } },
            {
                $unionWith: {
                    coll: "slots",
                    pipeline: [
                        { $match: { "slots.12pm-3pm": userId } },
                        { $project: { date: 1, timeSlot: "12pm-3pm" } }
                    ]
                }
            },
            {
                $unionWith: {
                    coll: "slots",
                    pipeline: [
                        { $match: { "slots.3pm-6pm": userId } },
                        { $project: { date: 1, timeSlot: "3pm-6pm" } }
                    ]
                }
            },
            {
                $unionWith: {
                    coll: "slots",
                    pipeline: [
                        { $match: { "slots.6pm-9pm": userId } },
                        { $project: { date: 1, timeSlot: "6pm-9pm" } }
                    ]
                }
            }
        ]).toArray()

        return NextResponse.json(matches, { status: 200 })
    } catch (error) {
        console.error('Fetch matches error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}