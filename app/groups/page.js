// app/groups/page.js
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Groups() {
    const [date, setDate] = useState('')
    const [groups, setGroups] = useState({})
    const router = useRouter()

    const fetchGroups = async () => {
        if (!date) return

        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/login')
            return
        }

        try {
            const response = await fetch(`/api/get-groups?date=${date}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (response.ok) {
                const data = await response.json()
                setGroups(data.groups)
            } else {
                throw new Error('Failed to fetch groups')
            }
        } catch (error) {
            console.error('Error fetching groups:', error)
            alert('Failed to fetch groups')
        }
    }

    useEffect(() => {
        fetchGroups()
    }, [date])

    return (
        <div className="flex min-h-screen flex-col items-center justify-start p-24">
            <h1 className="text-2xl font-bold mb-4">Football Groups</h1>
            <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mb-4 px-3 py-2 border rounded"
            />
            {Object.entries(groups).map(([timeSlot, groupsList]) => (
                <div key={timeSlot} className="mb-6 w-full max-w-2xl">
                    <h2 className="text-xl font-semibold mb-2">{timeSlot}</h2>
                    {groupsList.map((group) => (
                        <div key={group.groupNumber} className="mb-4 p-4 border rounded">
                            <h3 className="font-medium mb-2">Group {group.groupNumber}</h3>
                            <ul>
                                {group.players.map((player, playerIndex) => (
                                    <li key={playerIndex}>{player}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}