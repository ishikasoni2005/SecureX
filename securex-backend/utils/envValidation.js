// Validate required environment variables and expose helpers for health checks

const REQUIRED_ENV_VARS = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_EXPIRE',
  'JWT_COOKIE_EXPIRE',
  'BCRYPT_SALT_ROUNDS'
];

const OPTIONAL_ENV_VARS = [
  'CLIENT_URL',
  'PORT',
  'RATE_LIMIT_WINDOW_MS',
  'RATE_LIMIT_MAX_REQUESTS',
  'REDIS_URL'
];

function getMissingEnvVars() {
  const missing = [];
  for (const key of REQUIRED_ENV_VARS) {
    if (!process.env[key] || String(process.env[key]).trim() === '') {
      missing.push(key);
    }
  }
  return missing;
}

function validateEnv({ failOnMissing = true } = {}) {
  const missing = getMissingEnvVars();
  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(', ')}`;
    if (failOnMissing && process.env.NODE_ENV === 'production') {
      throw new Error(message);
    }
    // Warn in non-production or when failOnMissing is false
    // eslint-disable-next-line no-console
    console.warn(`[envValidation] ${message}`);
  }
  return { missing, optional: OPTIONAL_ENV_VARS };
}

function getSafeEnvReport() {
  const missing = getMissingEnvVars();
  const present = REQUIRED_ENV_VARS.filter((k) => !missing.includes(k));
  return {
    required: {
      present,
      missing
    },
    optional: OPTIONAL_ENV_VARS.reduce((acc, key) => {
      acc[key] = Boolean(process.env[key] && String(process.env[key]).trim() !== '');
      return acc;
    }, {})
  };
}

module.exports = {
  validateEnv,
  getSafeEnvReport
};



