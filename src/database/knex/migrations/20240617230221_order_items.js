exports.up = (knex) =>
	knex.schema.createTable("order_items", (table) => {
		table.increments("id");

		table.integer("quantity").notNullable();
		table.decimal("price").notNullable();

		table.integer("food_id").references("id").inTable("foods").onDelete("CASCADE");
		table.integer("order_id").references("id").inTable("orders").onDelete("CASCADE");
		table.integer("user_id").references("id").inTable("users");

		table.timestamp("created_at").default(knex.fn.now());
		table.timestamp("updated_at").default(knex.fn.now());
	});

exports.down = (knex) => knex.schema.dropTable("order_items");
