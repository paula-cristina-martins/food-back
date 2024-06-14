const knex = require("../database/knex");
const AppError = require("../utils/AppError");

class FoodsController {
	async create(request, response) {
		const { name, category, price, description, ingredients } = request.body;
		const user_id = request.user.id;

		try {
			const [food_id] = await knex("foods").insert({
				name,
				category,
				price,
				description,
				user_id,
			});

			const ingredientsInsert = ingredients.map((name) => {
				return {
					food_id,
					name,
					user_id,
				};
			});

			await knex("foods_ingredients").insert(ingredientsInsert);

			return response.status(201).json({ id: food_id, message: "Alimento inserido com sucesso!" });
		} catch (error) {
			throw new AppError("Erro interno.", 500);
		}
	}

	async update(request, response) {
		const { id } = request.params;
		const { name, category, price, description, ingredients } = request.body;
		const user_id = request.user.id;

		try {
			await knex("foods").where({ id }).update({
				name,
				category,
				price,
				description,
				user_id,
				updated_at: knex.fn.now(),
			});

			if (ingredients && ingredients.length > 0) {
				await knex("foods_ingredients").where({ food_id: id }).del();

				const ingredientsInsert = ingredients.map((name) => {
					return {
						food_id: id,
						name,
						user_id,
					};
				});

				await knex("foods_ingredients").insert(ingredientsInsert);
			}

			return response.status(201).json({ message: "Alimento atualizado com sucesso!" });
		} catch (error) {
			throw new AppError("Erro interno.", 500);
		}
	}

	async delete(request, response) {
		const { id } = request.params;

		try {
			const food = await knex("foods").where({ id }).first();

			if (!food) {
				return response.status(404).json({ error: "Alimento não encontrado." });
			}

			await knex("foods_ingredients").where({ food_id: id }).del();

			await knex("foods").where({ id }).del();

			return response.status(201).json({ message: "Alimento excluído com sucesso!" });
		} catch (error) {
			console.error("Erro ao excluir alimento:", error);
			throw new AppError("Erro interno.", 500);
		}
	}

	async index(request, response) {
		try {
			const foods = await knex("foods").select("*");

			const ingredients = await knex("foods_ingredients").select("*");

			const foodsWithIngredients = foods.map((food) => {
				const foodIngredients = ingredients.filter((ingredient) => ingredient.food_id === food.id);

				return {
					...food,
					ingredients: foodIngredients.map((ingredient) => ingredient.name),
				};
			});

			return response.status(201).json(foodsWithIngredients);
		} catch (error) {
			throw new AppError("Erro interno.", 500);
		}
	}

	async show(request, response) {
		const { id } = request.params;

		try {
			const food = await knex("foods").where({ id }).first();

			if (!food) {
				return response.status(404).json({ error: "Alimento não encontrado." });
			}

			const ingredients = await knex("foods_ingredients").where({ food_id: id }).select("name");

			const ingredientNames = ingredients.map((ingredient) => ingredient.name);

			const foodWithIngredients = {
				...food,
				ingredients: ingredientNames,
			};

			return response.status(201).json(foodWithIngredients);
		} catch (error) {
			throw new AppError("Erro interno.", 500);
		}
	}

	async searchByTitle(request, response) {
		const { title } = request.query;

		try {
			const foods = await knex("foods").where("name", "like", `%${title}%`).select("*");

			const ingredients = await knex("foods_ingredients").select("*");

			const foodsWithIngredients = foods.map((food) => {
				const foodIngredients = ingredients.filter((ingredient) => ingredient.food_id === food.id);
				return {
					...food,
					ingredients: foodIngredients.map((ingredient) => ingredient.name),
				};
			});

			return response.status(201).json(foodsWithIngredients);
		} catch (error) {
			throw new AppError("Erro interno.", 500);
		}
	}

	async searchByIngredients(request, response) {
		const { ingredients } = request.query;

		if (!ingredients) {
			return response.status(400).json({ error: "Os ingredientes não foram fornecidos." });
		}

		const ingredientsArray = ingredients.split(",");

		try {
			const searchIngredients = await knex("foods_ingredients")
				.whereIn("name", ingredientsArray)
				.orWhere(function () {
					ingredientsArray.forEach((ingredient) => {
						this.orWhere("name", "like", `%${ingredient}%`);
					});
				})
				.select("food_id")
				.groupBy("food_id");

			if (searchIngredients.length === 0) {
				return response.status(404).json({ message: "Nenhum prato encontrado com esses ingredientes." });
			}

			const foodIds = searchIngredients.map((ingredient) => ingredient.food_id);

			const foods = await knex("foods").whereIn("id", foodIds).select("*");

			const allIngredients = await knex("foods_ingredients").select("*");

			const foodsWithIngredients = foods.map((food) => {
				const foodIngredients = allIngredients.filter((ingredient) => ingredient.food_id === food.id);
				return {
					...food,
					ingredients: foodIngredients.map((ingredient) => ingredient.name),
				};
			});

			return response.status(201).json(foodsWithIngredients);
		} catch (error) {
			throw new AppError("Erro interno.", 500);
		}
	}
}

module.exports = FoodsController;
