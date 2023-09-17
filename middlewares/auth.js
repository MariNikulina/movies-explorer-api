const jwtModule = require("jsonwebtoken");

const { JWT_SECRET } = require("../app.config");
const UnauthorizedError = require("../errors/unauthorized-error");

module.exports = (req, res, next) => {
  const { jwt } = req.cookies;

  if (!jwt) {
    return next(new UnauthorizedError("Необходима авторизация"));
  }

  let payload;

  try {
    payload = jwtModule.verify(jwt, JWT_SECRET);
  } catch (err) {
    return next(new UnauthorizedError("Необходима авторизация"));
  }

  req.user = payload;

  next();
  return true;
};
