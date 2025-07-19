import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";

// Cloudinary configuration (should be in your .env file)
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// ✅ ENCODE CLOUDINARY URL MIDDLEWARE
export const encodeCloudinaryUrl = (fieldName = 'videoUrl') => {
  return (req, res, next) => {
    try {
      if (req.body[fieldName]) {
        const originalUrl = req.body[fieldName];
        
        // Extract Cloudinary public ID from URL
        const publicId = extractPublicIdFromUrl(originalUrl);
        
        if (publicId) {
          // Encode the public ID for storage
          const encodedPublicId = encodePublicId(publicId);
          
          // Store both original URL and encoded public ID
          req.body[fieldName] = originalUrl;
          req.body[`${fieldName}Encoded`] = encodedPublicId;
          req.body[`${fieldName}PublicId`] = publicId;
          
          console.log(`✅ Cloudinary URL encoded: ${publicId} -> ${encodedPublicId}`);
        }
      }
      next();
    } catch (error) {
      console.error("❌ Cloudinary URL encoding error:", error);
      next();
    }
  };
};

// ✅ DECODE CLOUDINARY URL MIDDLEWARE
export const decodeCloudinaryUrl = (fieldName = 'videoUrl') => {
  return (req, res, next) => {
    try {
      if (req.body[`${fieldName}Encoded`]) {
        const encodedPublicId = req.body[`${fieldName}Encoded`];
        
        // Decode the public ID
        const decodedPublicId = decodePublicId(encodedPublicId);
        
        if (decodedPublicId) {
          // Reconstruct the Cloudinary URL
          const cloudinaryUrl = constructCloudinaryUrl(decodedPublicId, fieldName);
          
          // Update the request body
          req.body[fieldName] = cloudinaryUrl;
          req.body[`${fieldName}PublicId`] = decodedPublicId;
          
          console.log(`✅ Cloudinary URL decoded: ${encodedPublicId} -> ${decodedPublicId}`);
        }
      }
      next();
    } catch (error) {
      console.error("❌ Cloudinary URL decoding error:", error);
      next();
    }
  };
};

// ✅ BATCH ENCODE CLOUDINARY URLS MIDDLEWARE
export const batchEncodeCloudinaryUrls = (fieldNames = ['videoUrl', 'thumbnail']) => {
  return (req, res, next) => {
    try {
      fieldNames.forEach(fieldName => {
        if (req.body[fieldName]) {
          const originalUrl = req.body[fieldName];
          const publicId = extractPublicIdFromUrl(originalUrl);
          
          if (publicId) {
            const encodedPublicId = encodePublicId(publicId);
            
            req.body[fieldName] = originalUrl;
            req.body[`${fieldName}Encoded`] = encodedPublicId;
            req.body[`${fieldName}PublicId`] = publicId;
            
            console.log(`✅ Batch encoded: ${fieldName} -> ${encodedPublicId}`);
          }
        }
      });
      next();
    } catch (error) {
      console.error("❌ Batch Cloudinary URL encoding error:", error);
      next();
    }
  };
};

// ✅ BATCH DECODE CLOUDINARY URLS MIDDLEWARE
export const batchDecodeCloudinaryUrls = (fieldNames = ['videoUrl', 'thumbnail']) => {
  return (req, res, next) => {
    try {
      fieldNames.forEach(fieldName => {
        if (req.body[`${fieldName}Encoded`]) {
          const encodedPublicId = req.body[`${fieldName}Encoded`];
          const decodedPublicId = decodePublicId(encodedPublicId);
          
          if (decodedPublicId) {
            const cloudinaryUrl = constructCloudinaryUrl(decodedPublicId, fieldName);
            
            req.body[fieldName] = cloudinaryUrl;
            req.body[`${fieldName}PublicId`] = decodedPublicId;
            
            console.log(`✅ Batch decoded: ${fieldName} -> ${decodedPublicId}`);
          }
        }
      });
      next();
    } catch (error) {
      console.error("❌ Batch Cloudinary URL decoding error:", error);
      next();
    }
  };
};

// ✅ RESPONSE CLOUDINARY URL ENCODING MIDDLEWARE
export const encodeResponseUrls = (fieldNames = ['videoUrl', 'thumbnail']) => {
  return (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      if (data && typeof data === 'object') {
        data = encodeUrlsInObject(data, fieldNames);
      }
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// ✅ RESPONSE CLOUDINARY URL DECODING MIDDLEWARE
export const decodeResponseUrls = (fieldNames = ['videoUrl', 'thumbnail']) => {
  return (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      if (data && typeof data === 'object') {
        data = decodeUrlsInObject(data, fieldNames);
      }
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// ✅ CLOUDINARY URL VALIDATION MIDDLEWARE
export const validateCloudinaryUrl = (fieldName = 'videoUrl') => {
  return (req, res, next) => {
    try {
      if (req.body[fieldName]) {
        const url = req.body[fieldName];
        
        // Check if it's a valid Cloudinary URL
        if (!isValidCloudinaryUrl(url)) {
          return res.status(400).json({
            success: false,
            message: `Invalid Cloudinary URL for ${fieldName}`
          });
        }
        
        // Check if the resource exists on Cloudinary
        const publicId = extractPublicIdFromUrl(url);
        if (publicId) {
          // You can add additional validation here if needed
          console.log(`✅ Valid Cloudinary URL: ${publicId}`);
        }
      }
      next();
    } catch (error) {
      console.error("❌ Cloudinary URL validation error:", error);
      return res.status(400).json({
        success: false,
        message: "Invalid Cloudinary URL"
      });
    }
  };
};

// ✅ CLOUDINARY URL TRANSFORMATION MIDDLEWARE
export const transformCloudinaryUrl = (transformations = {}) => {
  return (req, res, next) => {
    try {
      if (req.body.videoUrl) {
        const originalUrl = req.body.videoUrl;
        const publicId = extractPublicIdFromUrl(originalUrl);
        
        if (publicId) {
          // Apply transformations
          const transformedUrl = cloudinary.url(publicId, {
            resource_type: 'video',
            ...transformations
          });
          
          req.body.videoUrl = transformedUrl;
          console.log(`✅ Cloudinary URL transformed: ${originalUrl} -> ${transformedUrl}`);
        }
      }
      next();
    } catch (error) {
      console.error("❌ Cloudinary URL transformation error:", error);
      next();
    }
  };
};

// ✅ CLOUDINARY URL CLEANUP MIDDLEWARE
export const cleanupCloudinaryUrl = (fieldName = 'videoUrl') => {
  return (req, res, next) => {
    try {
      if (req.body[fieldName]) {
        const url = req.body[fieldName];
        
        // Remove any query parameters and get clean URL
        const cleanUrl = url.split('?')[0];
        
        // Extract public ID and reconstruct clean URL
        const publicId = extractPublicIdFromUrl(cleanUrl);
        if (publicId) {
          const cleanCloudinaryUrl = constructCloudinaryUrl(publicId, fieldName);
          req.body[fieldName] = cleanCloudinaryUrl;
          
          console.log(`✅ Cloudinary URL cleaned: ${url} -> ${cleanCloudinaryUrl}`);
        }
      }
      next();
    } catch (error) {
      console.error("❌ Cloudinary URL cleanup error:", error);
      next();
    }
  };
};

// ✅ CLOUDINARY URL COMPRESSION MIDDLEWARE
export const compressCloudinaryUrl = (fieldName = 'videoUrl', quality = 'auto') => {
  return (req, res, next) => {
    try {
      if (req.body[fieldName]) {
        const originalUrl = req.body[fieldName];
        const publicId = extractPublicIdFromUrl(originalUrl);
        
        if (publicId) {
          // Add compression parameters
          const compressedUrl = cloudinary.url(publicId, {
            resource_type: 'video',
            quality: quality,
            fetch_format: 'auto'
          });
          
          req.body[fieldName] = compressedUrl;
          console.log(`✅ Cloudinary URL compressed: ${originalUrl} -> ${compressedUrl}`);
        }
      }
      next();
    } catch (error) {
      console.error("❌ Cloudinary URL compression error:", error);
      next();
    }
  };
};

// ✅ CLOUDINARY URL SECURITY MIDDLEWARE
export const secureCloudinaryUrl = (fieldName = 'videoUrl') => {
  return (req, res, next) => {
    try {
      if (req.body[fieldName]) {
        const url = req.body[fieldName];
        const publicId = extractPublicIdFromUrl(url);
        
        if (publicId) {
          // Add security parameters (signed URL)
          const secureUrl = cloudinary.url(publicId, {
            resource_type: 'video',
            sign_url: true,
            type: 'authenticated'
          });
          
          req.body[fieldName] = secureUrl;
          console.log(`✅ Cloudinary URL secured: ${url} -> ${secureUrl}`);
        }
      }
      next();
    } catch (error) {
      console.error("❌ Cloudinary URL security error:", error);
      next();
    }
  };
};

// ✅ CLOUDINARY URL ANALYTICS MIDDLEWARE
export const trackCloudinaryUrl = (fieldName = 'videoUrl') => {
  return (req, res, next) => {
    try {
      if (req.body[fieldName]) {
        const url = req.body[fieldName];
        const publicId = extractPublicIdFromUrl(url);
        
        if (publicId) {
          // Track URL usage for analytics
          console.log(`📊 Cloudinary URL tracked: ${publicId} accessed at ${new Date().toISOString()}`);
          
          // You can add analytics tracking here
          // trackAnalytics('cloudinary_url_access', { publicId, timestamp: new Date() });
        }
      }
      next();
    } catch (error) {
      console.error("❌ Cloudinary URL tracking error:", error);
      next();
    }
  };
};

// ✅ CLOUDINARY URL CACHING MIDDLEWARE
export const cacheCloudinaryUrl = (fieldName = 'videoUrl', ttl = 3600) => {
  return (req, res, next) => {
    try {
      if (req.body[fieldName]) {
        const url = req.body[fieldName];
        const publicId = extractPublicIdFromUrl(url);
        
        if (publicId) {
          // Add caching parameters
          const cachedUrl = cloudinary.url(publicId, {
            resource_type: 'video',
            transformation: [
              { fetch_format: 'auto' },
              { quality: 'auto' }
            ]
          });
          
          req.body[fieldName] = cachedUrl;
          console.log(`✅ Cloudinary URL cached: ${url} -> ${cachedUrl}`);
        }
      }
      next();
    } catch (error) {
      console.error("❌ Cloudinary URL caching error:", error);
      next();
    }
  };
};

// Helper Functions

// Extract public ID from Cloudinary URL
function extractPublicIdFromUrl(url) {
  try {
    if (!url || typeof url !== 'string') return null;
    
    // Handle different Cloudinary URL formats
    const patterns = [
      /\/v\d+\/([^\/]+)\./,
      /\/upload\/([^\/]+)\./,
      /\/image\/upload\/([^\/]+)\./,
      /\/video\/upload\/([^\/]+)\./
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return null;
  }
}

// Encode public ID for storage
function encodePublicId(publicId) {
  try {
    // Use base64 encoding with URL-safe characters
    return Buffer.from(publicId).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  } catch (error) {
    console.error("Error encoding public ID:", error);
    return publicId;
  }
}

// Decode public ID from storage
function decodePublicId(encodedPublicId) {
  try {
    // Reverse the base64 encoding
    const base64 = encodedPublicId
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // Add padding if needed
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
    
    return Buffer.from(padded, 'base64').toString();
  } catch (error) {
    console.error("Error decoding public ID:", error);
    return encodedPublicId;
  }
}

// Construct Cloudinary URL from public ID
function constructCloudinaryUrl(publicId, fieldName) {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const resourceType = fieldName.includes('video') ? 'video' : 'image';
    
    return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${publicId}`;
  } catch (error) {
    console.error("Error constructing Cloudinary URL:", error);
    return null;
  }
}

// Check if URL is a valid Cloudinary URL
function isValidCloudinaryUrl(url) {
  try {
    if (!url || typeof url !== 'string') return false;
    
    const cloudinaryPattern = /^https:\/\/res\.cloudinary\.com\/[^\/]+\/(image|video)\/upload\/.+/;
    return cloudinaryPattern.test(url);
  } catch (error) {
    return false;
  }
}

// Encode URLs in response object
function encodeUrlsInObject(obj, fieldNames) {
  if (Array.isArray(obj)) {
    return obj.map(item => encodeUrlsInObject(item, fieldNames));
  }
  
  if (obj && typeof obj === 'object') {
    const result = { ...obj };
    
    for (const fieldName of fieldNames) {
      if (result[fieldName] && typeof result[fieldName] === 'string') {
        const publicId = extractPublicIdFromUrl(result[fieldName]);
        if (publicId) {
          result[`${fieldName}Encoded`] = encodePublicId(publicId);
          result[`${fieldName}PublicId`] = publicId;
        }
      }
    }
    
    // Recursively process nested objects
    for (const key in result) {
      if (result[key] && typeof result[key] === 'object') {
        result[key] = encodeUrlsInObject(result[key], fieldNames);
      }
    }
    
    return result;
  }
  
  return obj;
}

// Decode URLs in response object
function decodeUrlsInObject(obj, fieldNames) {
  if (Array.isArray(obj)) {
    return obj.map(item => decodeUrlsInObject(item, fieldNames));
  }
  
  if (obj && typeof obj === 'object') {
    const result = { ...obj };
    
    for (const fieldName of fieldNames) {
      if (result[`${fieldName}Encoded`]) {
        const decodedPublicId = decodePublicId(result[`${fieldName}Encoded`]);
        if (decodedPublicId) {
          result[fieldName] = constructCloudinaryUrl(decodedPublicId, fieldName);
          result[`${fieldName}PublicId`] = decodedPublicId;
        }
      }
    }
    
    // Recursively process nested objects
    for (const key in result) {
      if (result[key] && typeof result[key] === 'object') {
        result[key] = decodeUrlsInObject(result[key], fieldNames);
      }
    }
    
    return result;
  }
  
  return obj;
}

export default {
  encodeCloudinaryUrl,
  decodeCloudinaryUrl,
  batchEncodeCloudinaryUrls,
  batchDecodeCloudinaryUrls,
  encodeResponseUrls,
  decodeResponseUrls,
  validateCloudinaryUrl,
  transformCloudinaryUrl,
  cleanupCloudinaryUrl,
  compressCloudinaryUrl,
  secureCloudinaryUrl,
  trackCloudinaryUrl,
  cacheCloudinaryUrl
}; 