const { Pool } = require('pg');
const { toBase62 } = require('../utils/base62');

class UrlModel {
    constructor(pool) {
        this.pool = pool;
    }

    // Initialize the URLs table
    async createTable() {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS urls (
                id BIGSERIAL PRIMARY KEY,
                short_url VARCHAR(10) UNIQUE NOT NULL,
                long_url TEXT NOT NULL,
                click_count INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            
            -- Create indexes for better performance
            CREATE INDEX IF NOT EXISTS idx_urls_short_url ON urls(short_url);
            CREATE INDEX IF NOT EXISTS idx_urls_long_url ON urls(long_url);
            CREATE INDEX IF NOT EXISTS idx_urls_created_at ON urls(created_at);
            `;

        try {
            await this.pool.query(createTableQuery);
            console.log('✅ URLs table created/verified successfully');
        } catch (error) {
            console.error('❌ Error creating URLs table:', error);
            throw error;
        }
    }

    // Create a new short URL
    async create(longUrl) {
        const client = await this.pool.connect();

        try {
            await client.query('BEGIN');

            // Check if URL already exists
            const existingUrl = await this.findByLongUrl(longUrl);
            if (existingUrl) {
                await client.query('COMMIT');
                return existingUrl;
            }

            // Insert new URL and get the generated ID
            const insertQuery = `
                INSERT INTO urls (long_url, short_url) 
                VALUES ($1, 'temp') 
                RETURNING id
            `;

            const result = await client.query(insertQuery, [longUrl]);
            const id = result.rows[0].id;

            // Generate short URL using base62 encoding of the ID
            const shortUrl = toBase62(id);

            // Update the record with the actual short URL
            const updateQuery = `
                UPDATE urls 
                SET short_url = $1, updated_at = CURRENT_TIMESTAMP 
                WHERE id = $2 
                RETURNING *
            `;

            const updatedResult = await client.query(updateQuery, [shortUrl, id]);

            await client.query('COMMIT');

            return this.formatUrlResponse(updatedResult.rows[0]);

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error creating short URL:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    // Find URL by short URL
    async findByShortUrl(shortUrl) {
        try {
            const query = 'SELECT * FROM urls WHERE short_url = $1';
            const result = await this.pool.query(query, [shortUrl]);

            if (result.rows.length === 0) {
                return null;
            }

            return this.formatUrlResponse(result.rows[0]);
        } catch (error) {
            console.error('Error finding URL by short URL:', error);
            throw error;
        }
    }

    // Find URL by long URL
    async findByLongUrl(longUrl) {
        try {
            const query = 'SELECT * FROM urls WHERE long_url = $1';
            const result = await this.pool.query(query, [longUrl]);

            if (result.rows.length === 0) {
                return null;
            }

            return this.formatUrlResponse(result.rows[0]);
        } catch (error) {
            console.error('Error finding URL by long URL:', error);
            throw error;
        }
    }

    // Increment click count
    async incrementClickCount(shortUrl) {
        try {
            const query = `
                UPDATE urls 
                SET click_count = click_count + 1, updated_at = CURRENT_TIMESTAMP 
                WHERE short_url = $1 
                RETURNING *
            `;

            const result = await this.pool.query(query, [shortUrl]);

            if (result.rows.length === 0) {
                return null;
            }

            return this.formatUrlResponse(result.rows[0]);
        } catch (error) {
            console.error('Error incrementing click count:', error);
            throw error;
        }
    }

    // Get all URLs with pagination
    async findAll(limit = 10, offset = 0) {
        try {
            const query = `
                SELECT * FROM urls 
                ORDER BY created_at DESC 
                LIMIT $1 OFFSET $2
            `;

            const result = await this.pool.query(query, [limit, offset]);

            return result.rows.map(row => this.formatUrlResponse(row));
        } catch (error) {
            console.error('Error finding all URLs:', error);
            throw error;
        }
    }

    // Get URL analytics
    async getAnalytics(shortUrl) {
        try {
            const query = `
                SELECT 
                id,
                short_url,
                long_url,
                click_count,
                created_at,
                updated_at
                FROM urls 
                WHERE short_url = $1
            `;

            const result = await this.pool.query(query, [shortUrl]);

            if (result.rows.length === 0) {
                return null;
            }

            return this.formatUrlResponse(result.rows[0]);
        } catch (error) {
            console.error('Error getting analytics:', error);
            throw error;
        }
    }

    // Get total count of URLs
    async getTotalCount() {
        try {
            const query = 'SELECT COUNT(*) as count FROM urls';
            const result = await this.pool.query(query);

            return parseInt(result.rows[0].count);
        } catch (error) {
            console.error('Error getting total count:', error);
            throw error;
        }
    }

    // Delete URL by short URL (if you want to add this feature later)
    async deleteByShortUrl(shortUrl) {
        try {
            const query = 'DELETE FROM urls WHERE short_url = $1 RETURNING *';
            const result = await this.pool.query(query, [shortUrl]);

            if (result.rows.length === 0) {
                return null;
            }

            return this.formatUrlResponse(result.rows[0]);
        } catch (error) {
            console.error('Error deleting URL:', error);
            throw error;
        }
    }

    // Format database response to consistent format
    formatUrlResponse(row) {
        return {
            id: row.id,
            shortUrl: row.short_url,
            longUrl: row.long_url,
            clickCount: row.click_count,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    // Get database health
    async healthCheck() {
        try {
            const result = await this.pool.query('SELECT NOW()');
            return {
                status: 'healthy',
                timestamp: result.rows[0].now
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message
            };
        }
    }
}

module.exports = UrlModel;