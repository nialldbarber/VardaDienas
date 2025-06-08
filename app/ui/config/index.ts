import {StyleSheet} from "react-native-unistyles";

import {colors} from "@/app/ui/config/colors";
import {sizes} from "@/app/ui/config/sizes";
import {tokens} from "@/app/ui/config/tokens";

const lightTheme = {
	colors,
	tokens: tokens.light,
	sizes,
	gap: (v: number) => v * 8,
};

const darkTheme = {
	colors,
	tokens: tokens.dark,
	sizes,
	gap: (v: number) => v * 8,
};

const appThemes = {
	light: lightTheme,
	dark: darkTheme,
};

type AppThemes = typeof appThemes;

declare module "react-native-unistyles" {
	export interface UnistylesThemes extends AppThemes {}
}

StyleSheet.configure({
	themes: appThemes,
	settings: {
		adaptiveThemes: true,
	},
});
