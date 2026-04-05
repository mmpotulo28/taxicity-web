import ConfigPlugins from "@expo/config-plugins";
const { withProjectBuildGradle, withAppBuildGradle, createRunOncePlugin } = ConfigPlugins;

const withNewRelicAndroid = (config: any) => {
	// Update android/build.gradle
	config = withProjectBuildGradle(config, (config: any) => {
		if (config.modResults.language === "groovy") {
			const buildGradle = config.modResults.contents;
			// Add the New Relic classpath dependency if it doesn't exist
			if (!buildGradle.includes("com.newrelic.agent.android:agent-gradle-plugin")) {
				config.modResults.contents = buildGradle.replace(
					/dependencies\s?{/,
					`dependencies {
        classpath "com.newrelic.agent.android:agent-gradle-plugin:7.5.1"`,
				);
			}
		}
		return config;
	});

	// Update android/app/build.gradle
	config = withAppBuildGradle(config, (config: any) => {
		if (config.modResults.language === "groovy") {
			const appBuildGradle = config.modResults.contents;
			// Apply the New Relic plugin if it hasn't been applied yet
			if (!appBuildGradle.includes('apply plugin: "newrelic"')) {
				config.modResults.contents = appBuildGradle.replace(
					/apply plugin: "com.facebook.react"/,
					`apply plugin: "com.facebook.react"
apply plugin: "newrelic"`,
				);
			}
		}
		return config;
	});

	return config;
};

const withNewRelic = (config: any) => {
	return withNewRelicAndroid(config);
};

export default createRunOncePlugin(withNewRelic, "with-new-relic", "1.0.0");
