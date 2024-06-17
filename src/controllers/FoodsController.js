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

	async searchByCategories(request, response) {
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

			const foodsByCategory = foodsWithIngredients.reduce((categories, food) => {
				if (!categories[food.category]) {
					categories[food.category] = [];
				}
				categories[food.category].push(food);
				return categories;
			}, {});

			return response.status(201).json(foodsByCategory);
		} catch (error) {
			throw new AppError("Erro interno.", 500);
		}
	}

	async searchByTitle(request, response) {
		try {
			const { title } = request.query;

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
		try {
			const { ingredients } = request.query;

			if (!ingredients) {
				return response.status(400).json({ error: "Os ingredientes não foram fornecidos." });
			}

			const ingredientsArray = ingredients.split(",");

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
