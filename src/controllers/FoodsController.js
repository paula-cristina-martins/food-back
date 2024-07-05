const knex = require("../database/knex");
const AppError = require("../utils/AppError");

class FoodsController {
	async create(request, response) {
		try {
			const user_id = request.user.id;
			const { name, category, price, description, ingredients } = request.body;

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

			return response.status(201).json({ id: food_id, message: "Prato inserido com sucesso!" });
		} catch (error) {
			throw new AppError("Erro interno.", 500);
		}
	}

	async update(request, response) {
		try {
			const { id } = request.params;
			const user_id = request.user.id;
			const { name, category, price, description, ingredients } = request.body;

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

			return response.status(201).json({ message: "Prato atualizado com sucesso!" });
		} catch (error) {
			throw new AppError("Erro interno.", 500);
		}
	}

	async delete(request, response) {
		try {
			const { id } = request.params;

			const food = await knex("foods").where({ id }).first();

			if (!food) {
				return response.status(404).json({ error: "Prato não encontrado." });
			}

			await knex("foods_ingredients").where({ food_id: id }).del();

			await knex("foods").where({ id }).del();

			return response.status(201).json({ message: "Prato excluído com sucesso!" });
		} catch (error) {
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
		try {
			const { id } = request.params;

			const food = await knex("foods").where({ id }).first();

			if (!food) {
				return response.status(404).json({ error: "Prato não encontrado." });
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

	async searchFood(request, response) {
		try {
			const user_id = request.user.id;
			const { search } = request.query;

			let foods = [];
			const allIngredients = await knex("foods_ingredients").select("*");

			if (search) {
				foods = await knex("foods").where("name", "like", `%${search}%`).select("*");

				if (foods.length === 0) {
					const searchIngredients = await knex("foods_ingredients")
						.where("name", "like", `%${search}%`)
						.select("food_id")
						.groupBy("food_id");

					if (searchIngredients.length === 0) {
						return response.status(404).json({ message: "Nenhum prato encontrado com esse termo de pesquisa." });
					}

					const foodIds = searchIngredients.map((ingredient) => ingredient.food_id);
					foods = await knex("foods").whereIn("id", foodIds).select("*");
				}
			} else {
				foods = await knex("foods").select("*");
			}

			const userFavorites = await knex("foods_favorites").select("food_id", "id").where({ user_id });

			const favoriteMap = userFavorites.reduce((map, favorite) => {
				map[favorite.food_id] = favorite.id;
				return map;
			}, {});

			const foodsWithIngredientsAndFavorite = foods.map((food) => {
				const foodIngredients = allIngredients
					.filter((ingredient) => ingredient.food_id === food.id)
					.map((ingredient) => ingredient.name);

				return {
					...food,
					ingredients: foodIngredients,
					favorite: {
						status: !!favoriteMap[food.id],
						id: favoriteMap[food.id] || null,
					},
				};
			});

			const foodsByCategory = foodsWithIngredientsAndFavorite.reduce((categories, food) => {
				if (!categories[food.category]) {
					categories[food.category] = [];
				}
				categories[food.category].push(food);
				return categories;
			}, {});

			return response.status(200).json(foodsByCategory);
		} catch (error) {
			throw new AppError("Não foi possível a localização dos pratos!", 500);
		}
	}
}

module.exports = FoodsController;
