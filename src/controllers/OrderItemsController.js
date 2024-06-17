const knex = require("../database/knex");
const AppError = require("../utils/AppError");

class OrderItensController {
	async create(request, response) {
		try {
			const user_id = request.user.id;
			const { quantity, price, foodId, orderId } = request.body;

			const [order_item_id] = await knex("order_items").insert({
				quantity,
				price,
				food_id: foodId,
				order_id: orderId,
				user_id,
			});

			return response.status(201).json({ id: order_item_id, message: "Item associado ao pedido com sucesso!" });
		} catch (error) {
			throw new AppError("Erro interno.", 500);
		}
	}

	async delete(request, response) {
		try {
			const { id } = request.params;

			const food = await knex("order_items").where({ id }).first();

			if (!food) {
				return response.status(404).json({ error: "Item do pedido não encontrado." });
			}

			await knex("order_items").where({ id }).del();

			return response.status(201).json({ message: "Item do pedido excluído com sucesso!" });
		} catch (error) {
			throw new AppError("Erro interno.", 500);
		}
	}
}

module.exports = OrderItensController;
