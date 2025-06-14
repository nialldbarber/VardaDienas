import {colors} from "@/app/ui/config/colors";

export const tokens = {
	dark: {
		text: {
			primary: colors.white,
			fadedText: colors.white,
			header: colors.white,
		},
		background: {
			primary: colors.black,
			row: colors.darkGrey,
			textInput: colors.darkGrey,
		},
		toast: {
			success: colors.success,
			error: colors.error,
			info: colors.info,
		},
	},
	light: {
		text: {
			primary: colors.black,
			fadedText: colors.grey,
			header: colors.black,
		},
		background: {
			primary: colors.white,
			row: colors.grey2,
			textInput: colors.grey1,
		},
		toast: {
			success: colors.success,
			error: colors.error,
			info: colors.info,
		},
	},
} as const;
