// app/my-matches/page.js
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MyMatches() {
    const [matches, setMatches] = useState([])
    const router = useRouter()

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/login')
        } else {
            fetchMatches(token)
        }
    }, [])

    const fetchMatches = async (token) => {
        const response = await fetch('/api/my-matches', {
            headers: { Authorization: `Bearer ${token}` },
        })
        if (response.ok) {
            const matchesData = await response.json()
            setMatches(matchesData)
        } else {
            alert('Failed to fetch matches')
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-24">
            <h1 className="text-2xl font-bold mb-4">My Matches</h1>
            {matches.length === 0 ? (
                <p>No matches booked yet.</p>
            ) : (
                <ul>
                    {matches.map((match) => (
                        <li key={match._id} className="mb-2">
                            Date: {new Date(match.date).toLocaleDateString()}, Time: {match.timeSlot}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}