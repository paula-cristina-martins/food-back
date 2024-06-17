exports.up = (knex) =>
	knex.schema.createTable("orders", (table) => {
		table.increments("id");

		table
			.enum("status", ["awaiting_payment", "pending", "preparing", "delivered", "canceled"], {
				useNative: true,
				enumName: "status",
			})
			.notNullable()
			.default("awaiting_payment");

		table.decimal("price");
		table.boolean("pix");
		table.boolean("card");
		table.text("expiring_date_card");
		table.text("number_card");
		table.text("cvc_card");

		table.integer("user_id").references("id").inTable("users");

		table.timestamp("created_at").default(knex.fn.now());
		table.timestamp("updated_at").default(knex.fn.now());
	});

exports.down = (knex) => knex.schema.dropTable("orders");
