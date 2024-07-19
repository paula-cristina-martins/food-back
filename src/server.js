require("express-async-errors");
require("dotenv/config");

const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");

const routes = require("./routes");
const AppError = require("./utils/AppError");
const uploadConfig = require("./configs/upload");

const app = express();

const corsOptions = {
	origin: [process.env.FOOD_FRONT],
	credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.use("/files", express.static(uploadConfig.UPLOADS_FOLDER));

app.use(routes);

app.use((error, request, response, next) => {
	if (error instanceof AppError) {
		return response.status(error.statusCode).json({
			status: "error",
			message: error.message,
		});
	}

	return response.status(500).json({
		status: "error",
		message: "Internal server error",
	});
});

const PORT = process.env.SERVER_PORT || 3333;
app.listen(PORT, () => console.log(`Server is running on Port ${PORT}`));
