export const colors = {
	primary: "#A4343A",

	white: "#FFFFFF",
	black: "#111111",
} as const;

export type Colors = keyof typeof colors;
