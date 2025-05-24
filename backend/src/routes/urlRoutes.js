const express = require('express');
const router = express.Router();
const {
  shortenUrl,
  redirectUrl,
  getUrlInfo,
  getAllUrls,
  getHealthCheck
} = require('../controllers/urlController');

// Health check route
router.get('/health', getHealthCheck);

// URL shortening endpoint
router.post('/data/shorten', shortenUrl);

// Get all URLs with pagination
router.get('/urls', getAllUrls);

// Get URL info/analytics
router.get('/info/:shortUrl', getUrlInfo);

// URL redirection endpoint (this should be last to avoid conflicts)
router.get('/:shortUrl', redirectUrl);

module.exports = router;