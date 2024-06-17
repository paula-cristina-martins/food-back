const { Router } = require("express");

const usersRouter = require("./users.routes");
const sessionsRouter = require("./sessions.routes");
const foodsRouter = require("./foods.routes");
const foodsFavoritesRouter = require("./foods.favorites.routes");
const ordersRouter = require("./orders.routes");
const orderItemsRouter = require("./order.items.routes");

const routes = Router();

routes.use("/users", usersRouter);
routes.use("/sessions", sessionsRouter);
routes.use("/foods", foodsRouter);
routes.use("/foods/favorites", foodsFavoritesRouter);
routes.use("/orders", ordersRouter);
routes.use("/order/items", orderItemsRouter);

module.exports = routes;
