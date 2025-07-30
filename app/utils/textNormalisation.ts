/**
 * Normalises Latvian text by removing diacritical marks for fuzzy search
 * This allows searching for "Ruta" to match "Rūta" and vice versa
 */
export function normaliseLatvianText(text: string): string {
	return text
		.toLowerCase()
		.replace(/ā/g, "a")
		.replace(/č/g, "c")
		.replace(/ē/g, "e")
		.replace(/ģ/g, "g")
		.replace(/ī/g, "i")
		.replace(/ķ/g, "k")
		.replace(/ļ/g, "l")
		.replace(/ņ/g, "n")
		.replace(/š/g, "s")
		.replace(/ū/g, "u")
		.replace(/ž/g, "z");
}

/**
 * Checks if a name matches a search query using fuzzy matching
 * that ignores diacritical marks
 */
export function fuzzyMatchName(name: string, searchQuery: string): boolean {
	const normalisedName = normaliseLatvianText(name);
	const normalisedQuery = normaliseLatvianText(searchQuery);

	return normalisedName.includes(normalisedQuery);
}
