const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
	try {
		console.log("Attempting to find trips with taxiId: null");
		const trips = await prisma.trip.findMany({
			where: {
				status: "REQUESTED",
				taxiId: null,
			},
		});
		console.log("Success:", trips);
	} catch (e) {
		console.error("Error:", e);
	} finally {
		await prisma.$disconnect();
	}
}

main();
