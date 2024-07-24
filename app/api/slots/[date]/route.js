import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = 'weekend_football_matcher';
const COLLECTION_SLOTS = 'slots';
const COLLECTION_USERS = 'users';

let cachedClient = null;

async function connectToDatabase() {
    if (cachedClient) return cachedClient;

    const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    cachedClient = client;
    return client;
}

export async function GET(request, { params }) {
    const { date } = params;
    const userId = request.nextUrl.searchParams.get('userId'); // Use nextUrl to get query parameters

    if (!date || !userId) {
        return new Response(JSON.stringify({ error: 'Date or userId is missing' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const client = await connectToDatabase();
    const db = client.db(DATABASE_NAME);
    const slotsCollection = db.collection(COLLECTION_SLOTS);
    const usersCollection = db.collection(COLLECTION_USERS);

    const slots = await slotsCollection.findOne({ date });

    if (!slots) {
        return new Response(JSON.stringify({ error: 'No slots found for the given date' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const userIds = [];

    // Collect all user IDs from players arrays
    Object.values(slots.slots).forEach(groups => {
        if (Array.isArray(groups)) {
            groups.forEach(group => {
                if (group && Array.isArray(group.players)) {
                    userIds.push(...group.players);
                }
            });
        }
    });

    // Fetch user details
    const users = await usersCollection
        .find({ _id: { $in: userIds.map(id => new ObjectId(id)) } })
        .toArray();

    const userMap = users.reduce((acc, user) => {
        acc[user._id.toString()] = user.username;
        return acc;
    }, {});

    // Filter and replace user IDs with usernames
    Object.entries(slots.slots).forEach(([timeSlot, groups]) => {
        if (Array.isArray(groups)) {
            slots.slots[timeSlot] = groups
                .map(group => ({
                    ...group,
                    players: (group.players || [])
                        .filter(userId => userId.toString() === userId) // Filter groups where logged-in user is present
                        .map(userId => userMap[userId.toString()] || 'Unknown User'),
                }))
                .filter(group => group.players.length > 0); // Remove groups with no players
        }
    });

    return new Response(JSON.stringify(slots), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
