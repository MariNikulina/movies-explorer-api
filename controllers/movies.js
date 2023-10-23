const httpConstants = require("http2").constants;

const MovieModel = require("../models/movie");

const BadRequestError = require("../errors/bad-request-error");
const NotFoundError = require("../errors/not-found-error");
const ForbiddenError = require("../errors/forbidden-error");

const getMovies = (req, res, next) => {
  const { _id } = req.user;
  MovieModel.find()
    .then((movies) => {
      const savedMovie = movies.filter((movie) => movie.owner.equals(_id));
      return res.send(savedMovie);
    })
    .catch(next);
};

const createMovie = (req, res, next) => {
  const { _id } = req.user;
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;
  return MovieModel.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner: _id,
  })
    .then((movie) => res.status(httpConstants.HTTP_STATUS_CREATED).send(movie))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(
          new BadRequestError(
            "Переданы некорректные данные при создании фильма",
          ),
        );
      }
      return next(err);
    });
};

const deleteMovieById = (req, res, next) => {
  const { id } = req.params;
  const { _id } = req.user;
  return MovieModel.findById(id)
    .then((movie) => {
      if (!movie) {
        return next(new NotFoundError("Фильм с указанным _id не найден"));
      }
      if (!movie.owner.equals(_id)) {
        return next(new ForbiddenError("Попытка удалить чужой фильм"));
      }
      return MovieModel.findByIdAndRemove(id).then((movieForRemove) =>
        res.send(movieForRemove),
      );
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return next(new BadRequestError("Передан невалидный _id"));
      }
      return next(err);
    });
};

module.exports = {
  getMovies,
  createMovie,
  deleteMovieById,
};
