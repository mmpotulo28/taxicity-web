// scripts/manage.ts
import { select, checkbox, input, Separator } from "@inquirer/prompts";
import chalk from "chalk";
import { execa } from "execa";

// Define types for our configuration
type AppConfig = {
	name: string;
	path: string;
	description: string;
	dockerImage: string;
	dockerFile: string;
	port: number;
};

const APPS: Record<string, AppConfig> = {
	user: {
		name: "User App",
		path: "apps/user",
		description: "Passenger Web App",
		dockerImage: "mmpotulo28/taxyciti-user",
		dockerFile: "apps/user/Dockerfile",
		port: 3000,
	},
	driver: {
		name: "Driver App",
		path: "apps/driver",
		description: "Driver Dashboard",
		dockerImage: "mmpotulo28/taxyciti-driver",
		dockerFile: "apps/driver/Dockerfile",
		port: 3001,
	},
	websocket: {
		name: "WebSocket Server",
		path: "apps/websocket",
		description: "Realtime Server",
		dockerImage: "mmpotulo28/taxyciti-websocket",
		dockerFile: "apps/websocket/Dockerfile",
		port: 3006,
	},
};

const runCommand = async (command: string, args: string[], cwd: string = process.cwd()): Promise<void> => {
	try {
		await execa(command, args, {
			stdio: "inherit",
			cwd,
			shell: true,
		});
	} catch (error) {
		// We log the error but don't rethrow to keep the CLI alive unless fatal
		console.error(chalk.red(`Command failed: ${command} ${args.join(" ")}`), error);
	}
};

const buildAndPushDocker = async (appKeys: string[]) => {
	console.log(chalk.blue.bold("\n🚀 Starting Docker Build & Push Process..."));

	for (const key of appKeys) {
		const app = APPS[key];
		console.log(chalk.cyan(`\n📦 Processing ${app.name}...`));

		try {
			console.log(chalk.dim(`   Building ${app.dockerImage}:latest...`));
			await runCommand("docker", ["build", "--platform", "linux/amd64", "-f", app.dockerFile, "-t", `${app.dockerImage}:latest`, "."]);

			console.log(chalk.dim(`   Pushing to registry...`));
			await runCommand("docker", ["push", `${app.dockerImage}:latest`]);

			console.log(chalk.green(`✅ ${app.name} successfully deployed!`));
		} catch (error) {
			console.error(chalk.red(`❌ Failed to deploy ${app.name}`), error);
		}
	}
};

const manageDockerCompose = async () => {
	const action = await select({
		message: "Docker Compose Actions:",
		choices: [
			{ name: "🚀 Start / Update Services (up -d)", value: "up" },
			{ name: "🛑 Stop Services (down)", value: "down" },
			{ name: "📜 View Logs", value: "logs" },
			{ name: "🔙 Back to Main Menu", value: "back" },
		],
	});

	if (action === "back") return;

	if (action === "up") {
		await runCommand("docker", ["compose", "pull"]);
		await runCommand("docker", ["compose", "up", "-d", "--force-recreate"]);
	} else if (action === "down") {
		await runCommand("docker", ["compose", "down"]);
	} else if (action === "logs") {
		await runCommand("docker", ["compose", "logs", "-f"]);
	}
};

const runLocalDev = async (apps: string[]) => {
	console.log(chalk.yellow("\nwarning: Running multiple dev servers in parallel..."));
	const filterArgs = apps
		.map((key) => {
			if (key === "user") return "--filter=user-app";
			if (key === "driver") return "--filter=driver-app";
			if (key === "websocket") return "--filter=websocket-server";
			return "";
		})
		.filter(Boolean);

	if (filterArgs.length === 0) return;

	await runCommand("pnpm", ["turbo", "dev", ...filterArgs]);
};

const mainMenu = async () => {
	console.clear();
	console.log(
		chalk.blue.bold(`
╔════════════════════════════════════════╗
║    🚖 TaxiCity Operations CLI          ║
╚════════════════════════════════════════╝
`),
	);

	while (true) {
		const operation = await select({
			message: "What would you like to do?",
			choices: [{ name: "🐳 Docker Build & Push", value: "docker_build" }, { name: "🚢 Docker Compose Operations", value: "docker_compose" }, { name: "💻 Run Local Development", value: "dev" }, { name: "🗄️  Database Operations", value: "db" }, new Separator(), { name: "🚪 Exit", value: "exit" }],
		});

		if (operation === "exit") {
			console.log(chalk.green("Goodbye! 👋"));
			process.exit(0);
		}

		if (operation === "docker_build") {
			const apps = await checkbox({
				message: "Select apps to build and push:",
				choices: Object.entries(APPS).map(([key, config]) => ({
					name: `${config.name} (${config.description})`,
					value: key,
					checked: true,
				})),
				validate: (answer) => (answer.length >= 1 ? true : "You must choose at least one app."),
			});
			await buildAndPushDocker(apps);
			await input({ message: "Press Enter to continue..." });
		}

		if (operation === "docker_compose") {
			await manageDockerCompose();
			await input({ message: "Press Enter to continue..." });
		}

		if (operation === "dev") {
			const apps = await checkbox({
				message: "Select apps to run locally:",
				choices: Object.entries(APPS).map(([key, config]) => ({
					name: config.name,
					value: key,
					checked: true,
				})),
			});
			await runLocalDev(apps);
		}

		if (operation === "db") {
			const action = await select({
				message: "Database Action:",
				choices: [
					{ name: "Generate Client (prisma generate)", value: "generate" },
					{ name: "Prisma Studio", value: "studio" },
					{ name: "Cancel", value: "cancel" },
				],
			});

			if (action === "generate") {
				await runCommand("pnpm", ["db:generate"]);
			} else if (action === "studio") {
				await runCommand("pnpm", ["--filter", "database", "prisma", "studio"]);
			}
			await input({ message: "Press Enter to continue..." });
		}

		console.clear();
	}
};

mainMenu().catch((err) => {
	console.error(chalk.red("Fatal Error:"), err);
	process.exit(1);
});
