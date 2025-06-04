export function reduceArrayToObject<T extends Record<string, unknown>>(
	array: T[],
): Record<string, unknown> {
	return array.reduce((acc, item) => Object.assign(acc, item), {});
}
