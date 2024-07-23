// app/dashboard/page.js
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
    const [user, setUser] = useState(null)
    const router = useRouter()

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/login')
        } else {
            fetchUser(token)
        }
    }, [])

    const fetchUser = async (token) => {
        try {
            const response = await fetch('/api/user', {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (response.ok) {
                const userData = await response.json()
                setUser(userData)
            } else {
                throw new Error('Failed to fetch user data')
            }
        } catch (error) {
            console.error('Error fetching user data:', error)
            localStorage.removeItem('token')
            router.push('/login')
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        router.push('/login')
    }

    if (!user) return <div>Loading...</div>

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-24">
            <h1 className="text-2xl font-bold mb-4">Welcome, {user.username}!</h1>
            <div className="flex gap-4 mb-4">
                <Link href="/book-match" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Book a Match
                </Link>
                <Link href="/my-matches" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    My Matches
                </Link>
            </div>
            <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
                Logout
            </button>
        </div>
    )
}