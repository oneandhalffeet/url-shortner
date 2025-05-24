# URL Shortener Backend

A robust and scalable URL shortening service backend built with Node.js, Express, and PostgreSQL. This service provides REST APIs for creating short URLs, redirecting to original URLs, and tracking analytics.

## 🚀 Features

- **URL Shortening**: Convert long URLs to short, shareable links using Base62 encoding
- **URL Redirection**: Fast redirection to original URLs with click tracking
- **Analytics**: Track click counts and URL statistics
- **Rate Limiting**: Prevent abuse with configurable rate limits
- **Security**: Helmet for security headers, CORS protection
- **Database**: PostgreSQL with connection pooling via Neon
- **Validation**: Comprehensive input validation and error handling
- **Health Monitoring**: Health check endpoints for monitoring

## 🏗️ Architecture

The backend follows the system design principles from "Designing Data-Intensive Applications" and implements:

- **Base62 Encoding**: Uses auto-incrementing database IDs converted to Base62 for short URLs
- **Connection Pooling**: Efficient PostgreSQL connection management
- **Caching Strategy**: Optimized for read-heavy workloads (10:1 read-to-write ratio)
- **Scalable Design**: Stateless architecture ready for horizontal scaling

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.js              # Express application setup
│   ├── server.js           # Server entry point
│   ├── config/
│   │   └── database.js     # PostgreSQL configuration
│   ├── controllers/
│   │   └── urlController.js # Route handlers
│   ├── models/
│   │   └── url.js          # Database model
│   ├── routes/
│   │   └── urlRoutes.js    # Route definitions
│   └── utils/
│       └── base62.js       # Base62 encoding utilities
├── .env                    # Environment variables
├── package.json            # Dependencies
└── README.md              # This file
```

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon)
- **Security**: Helmet, CORS, Rate Limiting
- **Utilities**: Base62 encoding, Input validation
- **Deployment**: Render (Backend), Vercel (Frontend)

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database (Neon account recommended)
- npm or yarn package manager

## ⚡ Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd backend
npm install
```

### 2. Environment Setup

Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://username:password@host:port/database
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

### 3. Database Setup

The application will automatically create the required tables on first run:

```sql
CREATE TABLE urls (
  id BIGSERIAL PRIMARY KEY,
  short_url VARCHAR(10) UNIQUE NOT NULL,
  long_url TEXT NOT NULL,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Run the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📖 API Documentation

### Base URL
- **Development**: `http://localhost:5000/api/v1`
- **Production**: `https://your-app.render.com/api/v1`

### Endpoints

#### 1. Shorten URL
Create a new short URL from a long URL.

```http
POST /api/v1/data/shorten
Content-Type: application/json

{
  "longUrl": "https://www.example.com/very/long/url"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1234567890,
    "longUrl": "https://www.example.com/very/long/url",
    "shortUrl": "abc123",
    "fullShortUrl": "http://localhost:5000/api/v1/abc123",
    "clickCount": 0,
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

#### 2. Redirect URL
Redirect a short URL to its original URL.

```http
GET /api/v1/{shortUrl}
```

**Response:** `301 Redirect` to the original URL

#### 3. Get URL Analytics
Retrieve analytics for a specific short URL.

```http
GET /api/v1/info/{shortUrl}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1234567890,
    "shortUrl": "abc123",
    "longUrl": "https://www.example.com/very/long/url",
    "clickCount": 42,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T15:45:00Z"
  }
}
```

#### 4. List All URLs
Get paginated list of all URLs.

```http
GET /api/v1/urls?page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 50,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### 5. Health Check
Check server and database health.

```http
GET /api/v1/health
```

**Response:**
```json
{
  "success": true,
  "database": {
    "status": "healthy",
    "timestamp": "2025-01-15T16:00:00Z"
  },
  "server": {
    "status": "healthy",
    "uptime": 3600,
    "timestamp": "2025-01-15T16:00:00Z"
  }
}
```

## 🔒 Security Features

### Rate Limiting
- **General API**: 100 requests per 15 minutes per IP
- **URL Shortening**: 10 requests per 15 minutes per IP

### Security Headers
- Helmet.js for security headers
- CORS protection with configurable origins
- Input validation and sanitization

### Error Handling
- Comprehensive error handling with appropriate HTTP status codes
- No sensitive information leaked in production errors

## 🗄️ Database Schema

### URLs Table
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Auto-incrementing primary key |
| short_url | VARCHAR(10) | Base62-encoded short URL |
| long_url | TEXT | Original long URL |
| click_count | INTEGER | Number of clicks/redirects |
| created_at | TIMESTAMP | When the URL was created |
| updated_at | TIMESTAMP | Last modification time |

### Indexes
- `idx_urls_short_url` - Fast lookups for redirects
- `idx_urls_long_url` - Duplicate detection
- `idx_urls_created_at` - Chronological sorting

## 🧪 Base62 Encoding

The service uses Base62 encoding to convert numeric IDs to short strings:

- **Character Set**: `0-9`, `a-z`, `A-Z` (62 characters)
- **Example**: ID `2009215674938` → Short URL `zn9edcu`
- **Benefits**: 
  - Collision-free (unique IDs)
  - URL-safe characters
  - Compact representation

## 📊 Performance Considerations

### Estimated Capacity
- **Write Operations**: 1,160 URLs/second
- **Read Operations**: 11,600 redirects/second (10:1 ratio)
- **Storage**: ~36.5 TB for 10 years (365 billion URLs)

### Optimizations
- Connection pooling for database efficiency
- Indexes for fast lookups
- 301 redirects for browser caching
- Async click count updates

## 🚀 Deployment

### Render Deployment

1. **Connect Repository**: Link your GitHub repository to Render
2. **Environment Variables**: Set all required environment variables
3. **Build Settings**:
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`

### Environment Variables for Production
```env
NODE_ENV=production
DATABASE_URL=your_neon_database_url
BASE_URL=https://your-app.render.com
FRONTEND_URL=https://your-app.vercel.app
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check your DATABASE_URL format
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
```

#### 2. CORS Errors
```javascript
// Update FRONTEND_URL in .env
FRONTEND_URL=https://your-actual-frontend-domain.com
```

#### 3. Rate Limit Exceeded
- Wait for the rate limit window to reset (15 minutes)
- Consider implementing user authentication for higher limits

## 🔧 Development

### Available Scripts
```bash
npm start        # Start production server
npm run dev      # Start development server with nodemon
```

### Adding New Features
1. **Database Changes**: Update `src/models/url.js`
2. **API Endpoints**: Add to `src/controllers/urlController.js` and `src/routes/urlRoutes.js`
3. **Utilities**: Add to `src/utils/`

## 📈 Monitoring

### Health Checks
- **Endpoint**: `GET /health`
- **Use**: Load balancer health checks, monitoring systems

### Logging
- **Development**: Detailed console logs
- **Production**: Structured logging with Morgan

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- System design inspired by "Designing Data-Intensive Applications"
- Base62 encoding algorithm
- Express.js and Node.js communities