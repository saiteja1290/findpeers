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

        console.log('SlotData structure:', JSON.stringify(slotData, null, 2))

        const groups = {}
        for (const [timeSlot, groupsData] of Object.entries(slotData.slots)) {
            console.log(`TimeSlot: ${timeSlot}, GroupsData:, JSON.stringify(groupsData, null, 2)`)

            groups[timeSlot] = await Promise.all(groupsData.map(async (group, index) => {
                console.log("Group ${ index } structure:, JSON.stringify(group, null, 2)")

                if (!group || typeof group !== 'object') {
                    console.error("Invalid group at index ${ index }:, group")
                    return { error: 'Invalid group data', group }
                }

                if (!Array.isArray(group.players)) {
                    console.error("group.players is not an array for group ${ index }:", group.players)
                    // Try to find players in alternative locations
                    let players = []
                    if (Array.isArray(group)) {
                        players = group
                    } else if (group.members && Array.isArray(group.members)) {
                        players = group.members
                    } else if (group.bookings && Array.isArray(group.bookings)) {
                        players = group.bookings
                    }

                    if (players.length > 0) {
                        console.log("Found players in alternative location for group ${ index }:, players")
                    } else {
                        return {
                            groupNumber: group.groupNumber || index,
                            players: [],
                            error: 'No valid players data found'
                        }
                    }
                } else {
                    players = group.players
                }

                const playerIds = players.map(id => {
                    try {
                        return new ObjectId(id)
                    } catch (error) {
                        console.error('Invalid ObjectId:', id)
                        return null
                    }
                }).filter(id => id !== null)

                const users = await usersCollection.find({ _id: { $in: playerIds } }).toArray()
                const usernames = users.map(user => user.username)
                return {
                    groupNumber: group.groupNumber || index,
                    players: usernames
                }
            }))
        }
        return NextResponse.json({ groups }, { status: 200 })

    } catch (error) {
        console.error('Get groups error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}