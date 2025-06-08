import {colors} from "@/app/ui/config/colors";

export const tokens = {
	dark: {
		text: {
			primary: colors.white,
		},
		background: {
			primary: colors.black,
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
		},
		background: {
			primary: colors.white,
		},
		toast: {
			success: colors.success,
			error: colors.error,
			info: colors.info,
		},
	},
} as const;
