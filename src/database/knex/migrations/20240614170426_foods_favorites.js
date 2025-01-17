exports.up = (knex) =>
	knex.schema.createTable("foods_favorites", (table) => {
		table.increments("id");
		table.integer("food_id").references("id").inTable("foods").onDelete("CASCADE");
		table.integer("user_id").references("id").inTable("users");
	});

exports.down = (knex) => knex.schema.dropTable("foods_favorites");
