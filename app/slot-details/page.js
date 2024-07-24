'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function BookingsPage() {
    const [date, setDate] = useState('');
    const [slotsData, setSlotsData] = useState(null);

    const fetchSlots = async (selectedDate) => {
        try {
            const response = await axios.get(`/api/slots?date=${selectedDate}`);
            setSlotsData(response.data.slots);
            console.log()
        } catch (error) {
            console.error('Error fetching slots:', error);
        }
    };

    useEffect(() => {
        if (date) {
            fetchSlots(date);
        }
    }, [date]);

    return (
        <div className='p-4 m-4 '>
            <h1>Select Date</h1>
            <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
            />

            {slotsData && (
                <div>
                    <h2>Available Slots</h2>
                    {Object.entries(slotsData.slots).map(([timeSlot, groups], index) => (
                        <div key={index}>
                            <h3 className='pt-4 mt-4'>{timeSlot}</h3>
                            {groups && groups.length > 0 ? (
                                groups.map((group, groupIndex) => (
                                    <div key={groupIndex}>

                                        <h4 className='pt-4 mt-4'>Group {group.groupNumber}</h4>
                                        <ul>
                                            {group.players && group.players.length > 0 ? (
                                                group.players.map((playerId) => (
                                                    <li key={playerId}>{playerId}</li>
                                                ))
                                            ) : (
                                                <li>No players in this group</li>
                                            )}
                                        </ul>
                                    </div>
                                ))
                            ) : (
                                <p>No groups available</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
