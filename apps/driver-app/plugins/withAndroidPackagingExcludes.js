const { withAppBuildGradle, createRunOncePlugin } = require("@expo/config-plugins");

const OSGI_MANIFEST_PATH = "META-INF/versions/9/OSGI-INF/MANIFEST.MF";

function ensurePackagingExclude(contents) {
	if (contents.includes(OSGI_MANIFEST_PATH)) {
		return contents;
	}

	// Prefer extending the existing `resources` block under `packagingOptions`.
	if (contents.match(/packagingOptions\s*\{[\s\S]*?resources\s*\{/m)) {
		return contents.replace(/resources\s*\{/m, `resources {\n            excludes += [\"${OSGI_MANIFEST_PATH}\"]`);
	}

	// Otherwise create a `resources` block inside `packagingOptions`.
	if (contents.match(/packagingOptions\s*\{/m)) {
		return contents.replace(/packagingOptions\s*\{/m, `packagingOptions {\n        resources {\n            excludes += [\"${OSGI_MANIFEST_PATH}\"]\n        }`);
	}

	return contents;
}

const withAndroidPackagingExcludes = (config) => {
	return withAppBuildGradle(config, (gradleConfig) => {
		if (gradleConfig.modResults.language !== "groovy") {
			return gradleConfig;
		}

		gradleConfig.modResults.contents = ensurePackagingExclude(gradleConfig.modResults.contents);
		return gradleConfig;
	});
};

module.exports = createRunOncePlugin(withAndroidPackagingExcludes, "with-android-packaging-excludes", "1.0.0");
