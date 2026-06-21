const crypto = require("node:crypto");

function id(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function hashPassword(password, salt) {
  return crypto.createHash("sha256").update(`${salt}:${password}`).digest("hex");
}

function normalizePasswordUser(user) {
  if (user.passwordHash && user.passwordSalt) return user;
  const passwordSalt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(user.password || "123456", passwordSalt);
  delete user.password;
  user.passwordSalt = passwordSalt;
  user.passwordHash = passwordHash;
  return user;
}

function verifyPassword(user, password) {
  if (user.passwordHash && user.passwordSalt) {
    return hashPassword(password, user.passwordSalt) === user.passwordHash;
  }
  return user.password === password;
}

function publicUser(user) {
  if (!user) return null;
  const { password, passwordHash, passwordSalt, ...safe } = user;
  return safe;
}

function token() {
  return crypto.randomBytes(32).toString("hex");
}

module.exports = {
  id,
  hashPassword,
  normalizePasswordUser,
  verifyPassword,
  publicUser,
  token
};
