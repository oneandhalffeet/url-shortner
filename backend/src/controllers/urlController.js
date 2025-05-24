const { urlModel } = require('../config/database');
const { isValidBase62 } = require('../utils/base62');

// URL validation regex
const URL_REGEX = /^https?:\/\/(?:[-\w.])+(?:[:\d]+)?(?:\/(?:[\w\-._~:/?#[\]@!$&'()*+,;=%])*)?$/;

// Validate URL format
const isValidUrl = (url) => {
    try {
        new URL(url);
        return URL_REGEX.test(url);
    } catch {
        return false;
    }
};

// Shorten URL
const shortenUrl = async (req, res) => {
    try {
        const { longUrl } = req.body;

        // Validate input
        if (!longUrl) {
            return res.status(400).json({
                error: 'longUrl is required'
            });
        }

        if (typeof longUrl !== 'string') {
            return res.status(400).json({
                error: 'longUrl must be a string'
            });
        }

        // Validate URL format
        if (!isValidUrl(longUrl)) {
            return res.status(400).json({
                error: 'Invalid URL format. URL must start with http:// or https://'
            });
        }

        // Check URL length (reasonable limit)
        if (longUrl.length > 2048) {
            return res.status(400).json({
                error: 'URL is too long. Maximum length is 2048 characters'
            });
        }

        // Create short URL
        const urlData = await urlModel.create(longUrl);

        // Build the full short URL
        const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
        const fullShortUrl = `${baseUrl}/api/v1/${urlData.shortUrl}`;

        res.status(201).json({
            success: true,
            data: {
                id: urlData.id,
                longUrl: urlData.longUrl,
                shortUrl: urlData.shortUrl,
                fullShortUrl: fullShortUrl,
                clickCount: urlData.clickCount,
                createdAt: urlData.createdAt
            }
        });

    } catch (error) {
        console.error('Error in shortenUrl:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

// Redirect to original URL
const redirectUrl = async (req, res) => {
    try {
        const { shortUrl } = req.params;

        // Validate short URL format
        if (!shortUrl || !isValidBase62(shortUrl)) {
            return res.status(400).json({
                error: 'Invalid short URL format'
            });
        }

        // Find the URL
        const urlData = await urlModel.findByShortUrl(shortUrl);

        if (!urlData) {
            return res.status(404).json({
                error: 'Short URL not found'
            });
        }

        // Increment click count (fire and forget)
        urlModel.incrementClickCount(shortUrl).catch(err => {
            console.error('Error incrementing click count:', err);
        });

        // Redirect to original URL
        // Using 301 redirect for better performance (as mentioned in system design)
        res.redirect(301, urlData.longUrl);

    } catch (error) {
        console.error('Error in redirectUrl:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

// Get URL info (for analytics)
const getUrlInfo = async (req, res) => {
    try {
        const { shortUrl } = req.params;

        // Validate short URL format
        if (!shortUrl || !isValidBase62(shortUrl)) {
            return res.status(400).json({
                error: 'Invalid short URL format'
            });
        }

        // Get URL analytics
        const urlData = await urlModel.getAnalytics(shortUrl);

        if (!urlData) {
            return res.status(404).json({
                error: 'Short URL not found'
            });
        }

        res.json({
            success: true,
            data: {
                id: urlData.id,
                shortUrl: urlData.shortUrl,
                longUrl: urlData.longUrl,
                clickCount: urlData.clickCount,
                createdAt: urlData.createdAt,
                updatedAt: urlData.updatedAt
            }
        });

    } catch (error) {
        console.error('Error in getUrlInfo:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

// Get all URLs (with pagination)
const getAllUrls = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Validate pagination parameters
        if (page < 1 || limit < 1 || limit > 100) {
            return res.status(400).json({
                error: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100'
            });
        }

        // Get URLs and total count
        const [urls, totalCount] = await Promise.all([
            urlModel.findAll(limit, offset),
            urlModel.getTotalCount()
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        res.json({
            success: true,
            data: urls,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.error('Error in getAllUrls:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

// Get database health
const getHealthCheck = async (req, res) => {
    try {
        const dbHealth = await urlModel.healthCheck();

        res.json({
            success: true,
            database: dbHealth,
            server: {
                status: 'healthy',
                uptime: process.uptime(),
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error in health check:', error);
        res.status(500).json({
            error: 'Health check failed',
            database: { status: 'unhealthy' }
        });
    }
};

module.exports = {
    shortenUrl,
    redirectUrl,
    getUrlInfo,
    getAllUrls,
    getHealthCheck
};