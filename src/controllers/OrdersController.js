const knex = require("../database/knex");
const AppError = require("../utils/AppError");

class OrdersController {
	async create(request, response) {
		try {
			const user_id = request.user.id;
			const { status, price, pix, card, expiringCard, numberCard, cvcCard } = request.body;

			const [order_id] = await knex("orders").insert({
				status,
				price,
				pix,
				card,
				expiring_date_card: expiringCard,
				number_card: numberCard,
				cvc_card: cvcCard,
				user_id,
			});

			return response.status(201).json({ id: order_id, message: "Pedido solicitado com sucesso!" });
		} catch (error) {
			throw new AppError("Erro interno.", 500);
		}
	}

	async update(request, response) {
		try {
			const { id } = request.params;
			const user_id = request.user.id;
			const { status, price, pix, card, expiringCard, numberCard, cvcCard } = request.body;

			await knex("orders").where({ id }).update({
				status,
				price,
				pix,
				card,
				expiring_date_card: expiringCard,
				number_card: numberCard,
				cvc_card: cvcCard,
				user_id,
				updated_at: knex.fn.now(),
			});

			return response.status(201).json({ message: "Pedido atualizado com sucesso!" });
		} catch (error) {
			throw new AppError("Erro interno.", 500);
		}
	}

	async index(request, response) {
		try {
			const orders = await knex("orders").select("*").orderBy("id", "desc");

			const orderItems = await knex("order_items").select("*");

			const foods = await knex("foods").select("*");

			const ordersWithFoods = orders.map((order) => {
				const items = orderItems.filter((item) => item.order_id === order.id);
				const orderFoods = items.map((item) => {
					const foodDetails = foods.find((food) => food.id === item.food_id);
					return {
						...foodDetails,
						quantity: item.quantity,
						price: item.price,
					};
				});
				return {
					...order,
					foods: orderFoods,
				};
			});

			return response.status(201).json(ordersWithFoods);
		} catch (error) {
			throw new AppError("Erro interno.", 500);
		}
	}

	async show(request, response) {
		try {
			const { id } = request.params;

			const order = await knex("orders").where({ id }).first();
			if (!order) {
				return response.status(404).json({ error: "Pedido não encontrado." });
			}

			const orderItems = await knex("order_items").where({ order_id: id });

			const foodIds = orderItems.map((item) => item.food_id);
			const foods = await knex("foods").whereIn("id", foodIds);

			const orderFoods = orderItems.map((item) => {
				const foodDetails = foods.find((food) => food.id === item.food_id);
				return {
					...foodDetails,
					quantity: item.quantity,
					price: item.price,
				};
			});

			const orderWithFoods = {
				...order,
				foods: orderFoods,
			};

			return response.status(201).json(orderWithFoods);
		} catch (error) {
			throw new AppError("Erro interno.", 500);
		}
	}

	async searchByUser(request, response) {
		try {
			const userId = request.user.id;

			const orders = await knex("orders").where({ user_id: userId }).orderBy("id", "desc");

			if (orders.length === 0) {
				return response.status(200).json({ error: "Nenhum pedido encontrado para este usuário." });
			}

			const orderIds = orders.map((order) => order.id);

			const orderItems = await knex("order_items").whereIn("order_id", orderIds);

			const foodIds = orderItems.map((item) => item.food_id);
			const foods = await knex("foods").whereIn("id", foodIds);

			let quantityFood = 0;

			const ordersWithFoods = orders.map((order) => {
				const items = orderItems.filter((item) => item.order_id === order.id);
				const orderFoods = items.map((item) => {
					const foodDetails = foods.find((food) => food.id === item.food_id);
					quantityFood = quantityFood + item.quantity;
					return {
						...foodDetails,
						quantity: item.quantity,
						price: item.price,
					};
				});
				return {
					...order,
					foods: orderFoods,
					totalAmount: quantityFood,
				};
			});

			return response.status(201).json(ordersWithFoods);
		} catch (error) {
			throw new AppError("Erro interno.", 500);
		}
	}

	async searchByStatus(request, response) {
		try {
			const user_id = request.user.id;

			const order = await knex("orders").where({ user_id: user_id, status: "awaiting_payment" }).first();
			if (!order) {
				return response.status(200).json({ count: 0, message: "Pedido aguardando pagamento não encontrado." });
			}

			const orderItems = await knex("order_items").where({ order_id: order.id });

			const foodIds = orderItems.map((item) => item.food_id);
			const foods = await knex("foods").whereIn("id", foodIds);

			let quantityFood = 0;

			const orderFoods = orderItems.map((item) => {
				const foodDetails = foods.find((food) => food.id === item.food_id);
				quantityFood = quantityFood + item.quantity;
				return {
					...foodDetails,
					quantity: item.quantity,
					price: item.price,
				};
			});

			const orderWithFoods = {
				...order,
				foods: orderFoods,
				totalAmount: quantityFood,
			};

			return response.status(201).json(orderWithFoods);
		} catch (error) {
			throw new AppError("Erro interno.", 500);
		}
	}
}

module.exports = OrdersController;
