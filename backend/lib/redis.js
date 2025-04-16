import redis from 'redis';
import dotenv from "dotenv";
import { promisify } from "util";

dotenv.config();

const client = redis.createClient({
    url: process.env.REDIS_URL,
    socket: {
        reconnectStrategy: (retries) => Math.min(retries * 100, 3000)
    }
})

client.on('error', (err) => console.error('Redis Client Error:', err));

const connectRedis = async () => {
    try {
        await client.connect();
        console.log('Connected to Redis');
    } catch (error) {
        console.error('Redis connection failed:', error);
    }
};



export {
    client,
    connectRedis
};

