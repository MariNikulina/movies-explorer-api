require("dotenv").config();

const {
  NODE_ENV = "production",
  PORT = 3002,
  MONGODB_URL = "mongodb://127.0.0.1:27017/bitfilmsdb",
} = process.env;

let { JWT_SECRET = "fallback-secret" } = process.env;

if (NODE_ENV === "develpoment") {
  JWT_SECRET = "dev-secret";
}

module.exports = { PORT, MONGODB_URL, JWT_SECRET };
