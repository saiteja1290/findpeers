import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = 'weekend_football_matcher';
const COLLECTION_NAME = 'slots';

let cachedClient = null;

async function connectToDatabase() {
    if (cachedClient) return cachedClient;

    const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    cachedClient = client;
    return client;
}

export async function GET(request) {
    const url = new URL(request.url);
    const date = url.searchParams.get('date');

    const client = await connectToDatabase();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const slots = await collection.findOne({ date });
    console.log(slots)
    return new Response(JSON.stringify({ slots }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}
