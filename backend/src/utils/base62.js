// Base62 character set: 0-9, a-z, A-Z (62 characters total)
const BASE62_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE = 62;

/**
 * Convert a decimal number to Base62 string
 * @param {number} num - The decimal number to convert
 * @returns {string} - Base62 encoded string
 */
function toBase62(num) {
    if (num === 0) return BASE62_CHARS[0];

    let result = '';
    let number = Math.abs(num); // Handle negative numbers by taking absolute value

    while (number > 0) {
        result = BASE62_CHARS[number % BASE] + result;
        number = Math.floor(number / BASE);
    }

    return result;
}

/**
 * Convert a Base62 string back to decimal number
 * @param {string} base62String - The Base62 string to convert
 * @returns {number} - Decimal number
 */
function fromBase62(base62String) {
    if (!base62String || typeof base62String !== 'string') {
        throw new Error('Invalid Base62 string');
    }

    let result = 0;
    const length = base62String.length;

    for (let i = 0; i < length; i++) {
        const char = base62String[i];
        const charIndex = BASE62_CHARS.indexOf(char);

        if (charIndex === -1) {
            throw new Error(`Invalid character '${char}' in Base62 string`);
        }

        result = result * BASE + charIndex;
    }

    return result;
}

/**
 * Validate if a string is a valid Base62 encoded string
 * @param {string} str - String to validate
 * @returns {boolean} - True if valid Base62 string
 */
function isValidBase62(str) {
    if (!str || typeof str !== 'string') {
        return false;
    }

    // Check if all characters are in the Base62 character set
    for (let i = 0; i < str.length; i++) {
        if (BASE62_CHARS.indexOf(str[i]) === -1) {
            return false;
        }
    }

    return true;
}

/**
 * Generate a random Base62 string of specified length
 * @param {number} length - Length of the random string
 * @returns {string} - Random Base62 string
 */
function generateRandomBase62(length = 7) {
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * BASE);
        result += BASE62_CHARS[randomIndex];
    }

    return result;
}

// Export functions
module.exports = {
    toBase62,
    fromBase62,
    isValidBase62,
    generateRandomBase62,
    BASE62_CHARS,
    BASE
};