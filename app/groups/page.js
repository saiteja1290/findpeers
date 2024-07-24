// app/groups/page.js
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Groups() {
    const [date, setDate] = useState('')
    const [slot, setSlot] = useState(null)
    const router = useRouter()

    const fetchSlot = async () => {
        if (!date) return

        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/login')
            return
        }

        try {
            const response = await fetch(`/api/get-slot?date=${date}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (response.ok) {
                const data = await response.json()
                setSlot(data.slot)
            } else {
                throw new Error('Failed to fetch slot')
            }
        } catch (error) {
            console.error('Error fetching slot:', error)
            alert('Failed to fetch slot')
        }
    }

    useEffect(() => {
        fetchSlot()
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
            {slot && Object.entries(slot.slots).map(([timeSlot, playerIds]) => (
                <div key={timeSlot} className="mb-6 w-full max-w-2xl">
                    <h2 className="text-xl font-semibold mb-2">{timeSlot}</h2>
                    <div className="mb-4 p-4 border rounded">
                        <h3 className="font-medium mb-2">Players</h3>
                        <ul>
                            {playerIds.map((playerId, index) => (
                                <li key={index}>{playerId}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
    )
}