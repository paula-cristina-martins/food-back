const knex = require("../database/knex");
const AppError = require("../utils/AppError");
const DiskStorage = require("../providers/DiskStorage");

class FoodPhotoController {
	async update(request, response) {
		const food_id = request.params.id;
		const user_id = request.user.id;
		const photoFilename = request.file.filename;

		const diskStorage = new DiskStorage();

		const food = await knex("foods").where({ id: food_id }).first();

		if (!food) {
			throw new AppError("Prato não localizado!", 404);
		}

		if (!user_id) {
			throw new AppError("Não autorizado!", 401);
		}

		if (food.photo) {
			await diskStorage.deleteFile(food.photo);
		}

		const filename = await diskStorage.saveFile(photoFilename);
		food.photo = filename;

		await knex("foods")
			.update({ photo: food.photo, user_id: user_id, updated_at: knex.fn.now() })
			.where({ id: food_id });

		return response.json(food);
	}
}

module.exports = FoodPhotoController;
