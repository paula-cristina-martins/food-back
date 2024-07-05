const multer = require("multer");
const { Router } = require("express");

const FoodsController = require("../controllers/FoodsController");
const FoodPhotoController = require("../controllers/FoodPhotoController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");
const verifyUserAuthorization = require("../middlewares/verifyUserAuthorization");

const uploadConfig = require("../configs/upload");

const foodsRoutes = Router();

const foodsController = new FoodsController();
const foodPhotoController = new FoodPhotoController();

const upload = multer(uploadConfig.MULTER);

foodsRoutes.use(ensureAuthenticated);

foodsRoutes.get("/", verifyUserAuthorization(["admin", "common_user"]), foodsController.index);
foodsRoutes.get("/:id", verifyUserAuthorization(["admin", "common_user"]), foodsController.show);
foodsRoutes.get("/search/category", verifyUserAuthorization(["admin", "common_user"]), foodsController.searchFood);

foodsRoutes.post("/", verifyUserAuthorization(["admin"]), foodsController.create);
foodsRoutes.put("/:id", verifyUserAuthorization(["admin"]), foodsController.update);
foodsRoutes.patch("/photo/:id", verifyUserAuthorization(["admin"]), upload.single("photo"), foodPhotoController.update);
foodsRoutes.delete("/:id", verifyUserAuthorization(["admin"]), foodsController.delete);

module.exports = foodsRoutes;
