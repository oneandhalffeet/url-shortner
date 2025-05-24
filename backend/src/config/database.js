const { Pool } = require('pg');
const UrlModel = require('../models/url');

// Database configuration
const dbConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

// Create connection pool
const pool = new Pool(dbConfig);

// Pool error handling
pool.on('error', (err, client) => {
    console.error('❌ Unexpected error on idle client:', err);
    process.exit(-1);
});

// Pool connection event
pool.on('connect', (client) => {
    console.log('🔗 New client connected to database');
});

// Initialize URL model
const urlModel = new UrlModel(pool);

// Database connection function
const connectDB = async () => {
    try {
        // Test the connection
        const client = await pool.connect();
        console.log('✅ PostgreSQL connected successfully');

        // Test query
        const result = await client.query('SELECT NOW()');
        console.log('📊 Database time:', result.rows[0].now);

        client.release();

        // Initialize tables
        await urlModel.createTable();

        return pool;
    } catch (error) {
        console.error('❌ PostgreSQL connection failed:', error.message);
        throw error;
    }
};

// Graceful shutdown
const closeDB = async () => {
    try {
        await pool.end();
        console.log('✅ Database connection pool closed');
    } catch (error) {
        console.error('❌ Error closing database:', error);
    }
};

// Export functions and instances
module.exports = {
    pool,
    connectDB,
    closeDB,
    urlModel
};