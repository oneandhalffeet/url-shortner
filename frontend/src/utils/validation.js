// Validation utilities for URL shortener frontend

export const validateUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'URL is required' };
  }

  // Remove whitespace
  const trimmedUrl = url.trim();
  
  if (!trimmedUrl) {
    return { isValid: false, error: 'URL cannot be empty' };
  }

  // Check minimum length
  if (trimmedUrl.length < 3) {
    return { isValid: false, error: 'URL is too short' };
  }

  // Check maximum length (reasonable limit)
  if (trimmedUrl.length > 2048) {
    return { isValid: false, error: 'URL is too long (max 2048 characters)' };
  }

  // Add protocol if missing
  let urlToValidate = trimmedUrl;
  if (!urlToValidate.match(/^https?:\/\//i)) {
    urlToValidate = 'https://' + urlToValidate;
  }

  // Validate URL format
  try {
    const urlObject = new URL(urlToValidate);
    
    // Check for valid protocol
    if (!['http:', 'https:'].includes(urlObject.protocol)) {
      return { isValid: false, error: 'Only HTTP and HTTPS URLs are supported' };
    }

    // Check for valid hostname
    if (!urlObject.hostname || urlObject.hostname.length < 1) {
      return { isValid: false, error: 'Invalid hostname' };
    }

    // Check for localhost or private IPs in production
    if (process.env.NODE_ENV === 'production') {
      const hostname = urlObject.hostname.toLowerCase();
      if (hostname === 'localhost' || 
          hostname.startsWith('127.') || 
          hostname.startsWith('192.168.') ||
          hostname.startsWith('10.') ||
          hostname.match(/^169\.254\./)) {
        return { isValid: false, error: 'Private/localhost URLs are not allowed' };
      }
    }

    return { 
      isValid: true, 
      normalizedUrl: urlToValidate,
      originalUrl: trimmedUrl 
    };
  } catch (error) {
    return { isValid: false, error: 'Invalid URL format' };
  }
};

export const validateShortUrl = (shortUrl) => {
  if (!shortUrl || typeof shortUrl !== 'string') {
    return { isValid: false, error: 'Short URL is required' };
  }

  const trimmedShortUrl = shortUrl.trim();
  
  if (!trimmedShortUrl) {
    return { isValid: false, error: 'Short URL cannot be empty' };
  }

  // Base62 pattern: alphanumeric characters only
  const base62Pattern = /^[0-9a-zA-Z]+$/;
  if (!base62Pattern.test(trimmedShortUrl)) {
    return { isValid: false, error: 'Short URL contains invalid characters' };
  }

  if (trimmedShortUrl.length < 1 || trimmedShortUrl.length > 10) {
    return { isValid: false, error: 'Short URL length should be between 1-10 characters' };
  }

  return { isValid: true, shortUrl: trimmedShortUrl };
};

export const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatNumber = (number) => {
  if (typeof number !== 'number') return '0';
  
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + 'M';
  } else if (number >= 1000) {
    return (number / 1000).toFixed(1) + 'K';
  }
  
  return number.toString();
};

export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

export const truncateUrl = (url, maxLength = 50) => {
  if (!url || url.length <= maxLength) return url;
  
  const start = url.substring(0, maxLength - 3);
  return start + '...';
};