const router = require("express").Router();
const {
  getMovies,
  createMovie,
  deleteMovieById,
} = require("../controllers/movies");

const {
  validationSchemaCreateMovie,
  validationSchemaDeleteMovie,
} = require("../middlewares/validation");

// возвращает все фильмы
router.get("/movies", getMovies);

// создаёт фильм с переданными в теле параметрами
router.post("/movies", validationSchemaCreateMovie, createMovie);

// удаляет сохранённый фильм по id
router.delete("/movies/_:id", validationSchemaDeleteMovie, deleteMovieById);

module.exports = router;
