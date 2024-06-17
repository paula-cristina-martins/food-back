const { Router } = require("express");

const OrdersController = require("../controllers/OrdersController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");
const verifyUserAuthorization = require("../middlewares/verifyUserAuthorization");

const ordersRoutes = Router();

const ordersController = new OrdersController();

ordersRoutes.use(ensureAuthenticated);

ordersRoutes.get("/", verifyUserAuthorization(["admin"]), ordersController.index);
ordersRoutes.get("/show", verifyUserAuthorization(["admin", "common_user"]), ordersController.searchByUser);
ordersRoutes.get("/details/:id", verifyUserAuthorization(["admin", "common_user"]), ordersController.show);
ordersRoutes.get("/await", verifyUserAuthorization(["admin", "common_user"]), ordersController.searchByStatus);
ordersRoutes.post("/", verifyUserAuthorization(["admin", "common_user"]), ordersController.create);
ordersRoutes.put("/:id", verifyUserAuthorization(["admin", "common_user"]), ordersController.update);

module.exports = ordersRoutes;
