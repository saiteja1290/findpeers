// app/api/login/route.js
import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import clientPromise from '@/lib/mongodb'

export async function POST(req) {
    const { username, password } = await req.json()
    // Add this line to check if JWT_SECRET is set
    console.log('JWT_SECRET:', process.env.JWT_SECRET)
    try {
        const client = await clientPromise
        const db = client.db('weekend_football_matcher')
        const usersCollection = db.collection('users')

        const user = await usersCollection.findOne({ username })
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 400 })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 400 })
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' })

        return NextResponse.json({ token }, { status: 200 })
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}