const knex = require("../database/knex");
const AppError = require("../utils/AppError");

class FoodsFavoritesController {
	async create(request, response) {
		try {
			const user_id = request.user.id;
			const { food } = request.body;

			await knex("foods_favorites").insert({
				food_id: food,
				user_id,
			});

			return response.status(201).json({ message: "Prato favoritado com sucesso!" });
		} catch (error) {
			throw new AppError("Erro interno.", 500);
		}
	}

	async delete(request, response) {
		try {
			const { id } = request.params;

			const food = await knex("foods_favorites").where({ id }).first();

			if (!food) {
				return response.status(404).json({ error: "Prato não encontrado." });
			}

			await knex("foods_favorites").where({ id }).del();

			return response.status(201).json({ message: "Prato excluído dos favoritos com sucesso!" });
		} catch (error) {
			throw new AppError("Erro interno.", 500);
		}
	}

	async deleteByFood(request, response) {
		try {
			const { id } = request.params;

			const food = await knex("foods_favorites").where({ food_id: id }).first();

			if (!food) {
				return response.status(404).json({ error: "Prato não encontrado." });
			}

			await knex("foods_favorites").where({ food_id: id }).del();

			return response.status(201).json({ message: "Prato excluído dos favoritos dos usuários com sucesso!" });
		} catch (error) {
			throw new AppError("Erro interno.", 500);
		}
	}

	async searchByUser(request, response) {
		try {
			const user_id = request.user.id;

			const favoriteFoods = await knex("foods_favorites").where({ user_id }).select("food_id");

			if (favoriteFoods.length === 0) {
				return response.status(404).json({ error: "Prato não encontrado." });
			}

			const foodIds = favoriteFoods.map((favorite) => favorite.food_id);

			const foods = await knex("foods").whereIn("id", foodIds).select("*");

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

	async searchByCount(request, response) {
		try {
			const foodCounts = await knex("foods_favorites").groupBy("food_id").select("food_id").count("food_id as count");

			if (foodCounts.length === 0) {
				return response.status(404).json({ error: "Prato não encontrado." });
			}

			const foodIds = foodCounts.map((favorite) => favorite.food_id);

			const foods = await knex("foods").whereIn("id", foodIds).select("*");

			const ingredients = await knex("foods_ingredients").select("*");

			const foodsWithIngredientsAndCount = foods.map((food) => {
				const foodIngredients = ingredients.filter((ingredient) => ingredient.food_id === food.id);
				const count = foodCounts.find((fav) => fav.food_id === food.id)?.count || 0;

				return {
					...food,
					ingredients: foodIngredients.map((ingredient) => ingredient.name),
					count: parseInt(count, 10),
				};
			});

			return response.status(201).json(foodsWithIngredientsAndCount);
		} catch (error) {
			throw new AppError("Erro interno.", 500);
		}
	}
}

module.exports = FoodsFavoritesController;
