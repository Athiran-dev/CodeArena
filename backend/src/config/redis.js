const { createClient } = require('redis');

console.log('🔍 Loading Redis configuration...');

console.log('📍 Redis Port:', process.env.REDIS_PORT);

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

redisClient.on('error', (err) => {
    console.error('❌ Redis Client Error:', err.message);
});

redisClient.on('connect', () => {
    console.log('🔄 Redis connecting...');
});

redisClient.on('ready', () => {
    console.log('✅ Redis Connected Successfully');
});

// Auto-connect when module is loaded
(async () => {
    try {
        console.log('🚀 Attempting Redis connection...');
        await redisClient.connect();
    } catch (error) {
        console.error('❌ Redis Connection Failed:', error.message);
        console.error('Full error:', error);
    }
})();

module.exports = redisClient;