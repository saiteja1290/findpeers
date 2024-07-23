// app/book-match/page.js
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BookMatch() {
    const [date, setDate] = useState('')
    const [timeSlot, setTimeSlot] = useState('')
    const router = useRouter()

    const handleSubmit = async (e) => {
        e.preventDefault()
        const token = localStorage.getItem('token')
        const response = await fetch('/api/book-match', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ date, timeSlot }),
        })
        if (response.ok) {
            router.push('/my-matches')
        } else {
            alert('Booking failed')
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-24">
            <h1 className="text-2xl font-bold mb-4">Book a Match</h1>
            <form onSubmit={handleSubmit} className="w-full max-w-xs">
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 mb-3 text-sm leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                />
                <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 mb-3 text-sm leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                >
                    <option value="">Select time slot</option>
                    <option value="9am-12pm">9am - 12pm</option>
                    <option value="12pm-3pm">12pm - 3pm</option>
                    <option value="3pm-6pm">3pm - 6pm</option>
                    <option value="6pm-9pm">6pm - 9pm</option>
                </select>
                <button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    Book Match
                </button>
            </form>
        </div>
    )
}