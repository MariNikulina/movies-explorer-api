const router = require("express").Router();
const userRouter = require("./users");
const movieRouter = require("./movies");
const auth = require("../middlewares/auth");
const { createUser, login, logout } = require("../controllers/users");
const NotFoundError = require("../errors/not-found-error");
const {
  validationSchemaSignIn,
  validationSchemaSignup,
} = require("../middlewares/validation");

// создаёт пользователя с переданными в теле email, password и name
router.post("/signup", validationSchemaSignup, createUser);

// проверяет переданные в теле почту и пароль
router.post("/signin", validationSchemaSignIn, login);

// Защита API авторизацией
router.use(auth);

router.use("/", userRouter);
router.use("/", movieRouter);

router.get("/signout", logout);

router.use("*", (req, res, next) => {
  next(new NotFoundError("Страница не найдена"));
});

module.exports = router;
