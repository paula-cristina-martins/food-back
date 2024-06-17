const { Router } = require("express");

const OrderItemsController = require("../controllers/OrderItemsController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");
const verifyUserAuthorization = require("../middlewares/verifyUserAuthorization");

const orderItemsRoutes = Router();

const orderItemsController = new OrderItemsController();

orderItemsRoutes.use(ensureAuthenticated);

orderItemsRoutes.post("/", verifyUserAuthorization(["admin", "common_user"]), orderItemsController.create);
orderItemsRoutes.delete("/:id", verifyUserAuthorization(["admin", "common_user"]), orderItemsController.delete);

module.exports = orderItemsRoutes;
