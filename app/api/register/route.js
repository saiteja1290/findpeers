// app/api/register/route.js
import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import clientPromise from '@/lib/mongodb'

export async function POST(req) {
    const { username, password } = await req.json()
    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        const client = await clientPromise
        const db = client.db('weekend_football_matcher')
        const usersCollection = db.collection('users')

        const existingUser = await usersCollection.findOne({ username })
        if (existingUser) {
            return NextResponse.json({ error: 'Username already exists' }, { status: 400 })
        }

        await usersCollection.insertOne({
            username,
            password: hashedPassword,
        })

        return NextResponse.json({ message: 'User created successfully' }, { status: 201 })
    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}