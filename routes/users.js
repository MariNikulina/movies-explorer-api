const router = require("express").Router();
const { getUser, updateProfile } = require("../controllers/users");
const { validationSchemaUpdateProfile } = require("../middlewares/validation");

// возвращает информацию о пользователе (email и имя)
router.get("/users/me", getUser);

// обновляет информацию о пользователе (email и имя)
router.patch("/users/me", validationSchemaUpdateProfile, updateProfile);

module.exports = router;
