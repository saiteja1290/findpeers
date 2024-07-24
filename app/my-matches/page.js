'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MyMatches() {
    const [matches, setMatches] = useState([])
    const router = useRouter()

    useEffect(() => {
        const fetchMatches = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/login')
                return
            }

            const response = await fetch('/api/my-matches', {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (response.ok) {
                const data = await response.json()
                setMatches(data.matches)
            } else {
                console.error('Failed to fetch matches')
            }
        }

        fetchMatches()
    }, [router])

    if (!matches.length) return <div>Loading...</div>

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-black">
            <h1 className="text-2xl font-bold mb-4 text-white">My Matches</h1>
            {matches.map((match, index) => (
                <div key={index} className="bg-white p-4 shadow-md rounded-md w-full max-w-xl mb-4">
                    <h2 className="text-lg font-semibold">Date: {match.date}</h2>
                    <p className="text-gray-600">Time Slot: {match.timeSlot}</p>
                    <p className="text-gray-600">Group Number: {match.groupNumber}</p>
                    <ul className="list-disc pl-6">
                        {match.playerUsernames.map((username, idx) => (
                            <li key={idx}>{username}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    )
}
