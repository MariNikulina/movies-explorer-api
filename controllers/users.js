const httpConstants = require("http2").constants;
const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 10;
const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../app.config");

const UserModel = require("../models/user");

const ForbiddenError = require("../errors/forbidden-error");
const NotFoundError = require("../errors/not-found-error");
const BadRequestError = require("../errors/bad-request-error");
const ConflictError = require("../errors/conflict-error");
const UnauthorizedError = require("../errors/unauthorized-error");

const createUser = (req, res, next) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return next(
      new BadRequestError(
        "Переданы некорректные данные при создании пользователя",
      ),
    );
  }

  return bcrypt
    .hash(password, SALT_ROUNDS)
    .then((hash) => UserModel.create({ email, password: hash, name }))
    .then((user) => {
      const { _id } = user;
      return res
        .status(httpConstants.HTTP_STATUS_CREATED)
        .send({ _id, email, name });
    })
    .catch((err) => {
      if (err.code === 11000) {
        return next(
          new ConflictError(
            "При регистрации указан email, который уже существует на сервере",
          ),
        );
      }
      if (err.name === "ValidationError") {
        return next(
          new BadRequestError(
            "Переданы некорректные данные при создании пользователя",
          ),
        );
      }
      return next(err);
    });
};

const getUser = (req, res, next) => {
  const { _id } = req.user;
  return UserModel.findOne({ _id })
    .then((user) => {
      if (!user) {
        return next(
          new ForbiddenError("Попытка вернуть данные чужого пользователя"),
        );
      }
      return res.send(user);
    })
    .catch(next);
};

const updateProfile = (req, res, next) => {
  const { email, name } = req.body;
  const { _id } = req.user;
  return UserModel.findByIdAndUpdate(
    _id,
    { email, name },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        return next(
          new NotFoundError("Пользователь по указанному _id не найден"),
        );
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(
          new BadRequestError(
            "Переданы некорректные данные при обновлении профиля",
          ),
        );
      }
      if (err.code === 11000) {
        return next(
          new ConflictError(
            "При обновлении профиля передан email, который уже существует на сервере",
          ),
        );
      }
      return next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  return UserModel.findOne({ email })
    .select("+password")
    .then((user) => {
      if (!user) {
        return next(new UnauthorizedError("Передан неверный логин или пароль"));
      }
      return bcrypt.compare(password, user.password, (err, isValidPassword) => {
        if (!isValidPassword) {
          return next(
            new UnauthorizedError("Передан неверный логин или пароль"),
          );
        }
        const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
          expiresIn: "7d",
        });
        return res
          .cookie("jwt", token, {
            maxAge: 3600000,
            httpOnly: true,
            secure: true,
            sameSite: "none",
          })
          .send({ jwt: "token" });
      });
    })
    .catch(next);
};

const logout = (req, res) => {
  res.clearCookie("jwt").send({ message: "Выход" });
};

module.exports = {
  createUser,
  getUser,
  updateProfile,
  login,
  logout,
};
