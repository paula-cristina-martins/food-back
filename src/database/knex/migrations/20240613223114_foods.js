exports.up = (knex) =>
	knex.schema.createTable("foods", (table) => {
		table.increments("id");
		table.text("name").notNullable();

		table
			.enum("category", ["meals", "drinks", "desserts"], {
				useNative: true,
				enumName: "categories",
			})
			.notNullable()
			.default("meals");

		table.decimal("price").notNullable();
		table.text("photo");
		table.text("description").notNullable();

		table.integer("user_id").references("id").inTable("users");

		table.timestamp("created_at").default(knex.fn.now());
		table.timestamp("updated_at").default(knex.fn.now());
	});

exports.down = (knex) => knex.schema.dropTable("foods");
