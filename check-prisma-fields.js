const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Access the internal DMMF to see the model definition
const dmmf = prisma._dmmf;
if (dmmf) {
	const driverModel = dmmf.datamodel.models.find((m) => m.name === "Driver");
	if (driverModel) {
		console.log(
			"Driver fields:",
			driverModel.fields.map((f) => f.name),
		);
	} else {
		console.log("Driver model not found");
	}
} else {
	console.log("No DMMF found on instance");
}
