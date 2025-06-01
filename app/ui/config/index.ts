import {StyleSheet} from "react-native-unistyles";

import {colors} from "@/app/ui/config/colors";
import {sizes} from "@/app/ui/config/sizes";

const lightTheme = {
	colors,
	sizes,
	gap: (v: number) => v * 8,
};

const otherTheme = {
	colors,
	sizes,
	gap: (v: number) => v * 8,
};

const appThemes = {
	light: lightTheme,
	other: otherTheme,
};

type AppThemes = typeof appThemes;

declare module "react-native-unistyles" {
	export interface UnistylesThemes extends AppThemes {}
}

StyleSheet.configure({
	settings: {
		initialTheme: "light",
	},
	themes: appThemes,
});
