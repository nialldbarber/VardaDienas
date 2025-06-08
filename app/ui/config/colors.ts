export const greys = {
	grey: "#666666",
	lightGrey: "#E5E5E5",
	lightestGrey: "#fcfcfc",
	grey1: "#E7E8EA",
};

export const semantics = {
	success: "#22C55E",
	error: "#EF4444",
	info: "#3B82F6",
} as const;

export const colors = {
	primary: "#A4343A",
	white: "#FFFFFF",
	black: "#111111",
	...greys,
	...semantics,
} as const;

export type Colors = keyof typeof colors;
