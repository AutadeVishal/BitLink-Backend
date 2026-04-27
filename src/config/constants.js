// ─── All env vars read in ONE place ───
// Every other file imports from here instead of reading process.env directly.

const SECRET_KEY = process.env.SECRET_KEY;
const MONGO_URL = process.env.mongoURL;
const BASE_URL = process.env.BASE_URL;
const PORT = process.env.PORT || 3000;
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || 10);
const JWT_EXPIRY = process.env.JWT_EXPIRY || "1h";

module.exports = {
  SECRET_KEY,
  MONGO_URL,
  BASE_URL,
  PORT,
  BCRYPT_SALT_ROUNDS,
  JWT_EXPIRY,
};
