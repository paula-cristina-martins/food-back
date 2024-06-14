const { Router } = require("express");

const FoodsFavoritesController = require("../controllers/FoodsFavoritesController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");
const verifyUserAuthorization = require("../middlewares/verifyUserAuthorization");

const foodsFavoritesRoutes = Router();

const foodsFavoritesController = new FoodsFavoritesController();

foodsFavoritesRoutes.use(ensureAuthenticated);

foodsFavoritesRoutes.get("/search/count", verifyUserAuthorization(["admin"]), foodsFavoritesController.searchByCount);
foodsFavoritesRoutes.get(
	"/search/user",
	verifyUserAuthorization(["admin", "common_user"]),
	foodsFavoritesController.searchByUser
);

foodsFavoritesRoutes.post("/", verifyUserAuthorization(["admin", "common_user"]), foodsFavoritesController.create);
foodsFavoritesRoutes.delete("/:id", verifyUserAuthorization(["admin", "common_user"]), foodsFavoritesController.delete);
foodsFavoritesRoutes.delete(
	"/exclusion/:id",
	verifyUserAuthorization(["admin"]),
	foodsFavoritesController.deleteByFood
);

module.exports = foodsFavoritesRoutes;
