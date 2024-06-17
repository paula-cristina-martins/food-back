const knex = require("../database/knex");
const { hash } = require("bcryptjs");
const AppError = require("../utils/AppError");

class UsersController {
	async create(request, response) {
		try {
			const { name, email, password, role } = request.body;

			const checkUserExists = await knex("users").where({ email }).first();

			if (checkUserExists) {
				return response.status(400).json({ error: "E-mail já cadastrado." });
			}

			const hashedPassword = await hash(password, 8);

			const newUser = {
				name,
				email,
				password: hashedPassword,
			};

			if (role !== undefined) {
				newUser.role = role;
			}

			await knex("users").insert(newUser);

			return response.status(201).json({ message: "Usuário inserido com sucesso!" });
		} catch (error) {
			throw new AppError("Erro interno.", 500);
		}
	}
}

module.exports = UsersController;
