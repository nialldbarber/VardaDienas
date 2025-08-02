export const greys = {
	grey: "#666666",
	lightGrey: "#E5E5E5",
	lightestGrey: "#fcfcfc",
	grey1: "#E7E8EA",
	grey2: "#F5F5F7",
	grey3: "#b0b0b0",
	darkGrey: "#161616",
};

export const semantics = {
	success: "#86EFAC",
	error: "#F87171",
	info: "#60A5FA",
} as const;

export const colors = {
	primary: "#A4343A",
	white: "#FFFFFF",
	black: "#3a3a3a",
	...greys,
	...semantics,
} as const;

export type Colors = keyof typeof colors;
