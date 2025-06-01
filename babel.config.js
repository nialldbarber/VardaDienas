module.exports = {
	presets: ["module:@react-native/babel-preset"],
	plugins: [
		[
			"module-resolver",
			{
				alias: {
					"@/app": "./app",
				},
			},
		],
		[
			"react-native-unistyles/plugin",
			{
				root: "app",
			},
		],
		"react-native-reanimated/plugin",
	],
};
