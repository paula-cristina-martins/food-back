const { Router } = require("express");
const FoodsController = require("../controllers/FoodsController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");
const verifyUserAuthorization = require("../middlewares/verifyUserAuthorization");

const foodsRoutes = Router();

const foodsController = new FoodsController();

foodsRoutes.use(ensureAuthenticated);

foodsRoutes.get("/", verifyUserAuthorization(["admin", "common_user"]), foodsController.index);
foodsRoutes.get("/:id", verifyUserAuthorization(["admin", "common_user"]), foodsController.show);
foodsRoutes.get("/search/title", verifyUserAuthorization(["admin", "common_user"]), foodsController.searchByTitle);
foodsRoutes.get(
	"/search/ingredients",
	verifyUserAuthorization(["admin", "common_user"]),
	foodsController.searchByIngredients
);

foodsRoutes.post("/", verifyUserAuthorization(["admin"]), foodsController.create);
foodsRoutes.put("/:id", verifyUserAuthorization(["admin"]), foodsController.update);
foodsRoutes.delete("/:id", verifyUserAuthorization(["admin"]), foodsController.delete);

module.exports = foodsRoutes;
