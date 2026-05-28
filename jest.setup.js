process.env.TZ = 'UTC';

// Default safe env for tests (override per-test as needed)
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

