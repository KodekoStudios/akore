/**
 * Converts a given value to its corresponding type as a string representation.
 *
 * @param value The value to convert to a type string.
 * @param level The current level of indentation for nested structures.
 * @returns The type of the value as a string representation.
 *
 * @example
 * typify("hello");   // "string"
 * typify(42);        // "number"
 * typify([1, 2, 3]); // "number[]"
 * typify({ name: "Alice", age: 30 }); // "{\n\tname: string;\n\tage: number;\n}"
 */
export function typify(value: unknown, level = 1): string {
	const indent = "\t".repeat(level > 0 ? level : 0);

	if (typeof value === "string") {
		return "string";
	}

	if (typeof value === "number") {
		return "number";
	}

	if (typeof value === "boolean") {
		return "boolean";
	}

	if (value === null) {
		return "null";
	}

	if (value === undefined) {
		return "undefined";
	}

	if (Array.isArray(value)) {
		if (value.length === 0) return "any[]";
		const types = new Set(value.map((el) => typify(el, 0)));
		if (types.size === 1) return `${types.values().next().value}[]`;
		return `(${[...types].join(" | ")})[]`;
	}

	if (typeof value === "object") {
		// Handle class instances
		if (value.constructor && value.constructor !== Object) {
			return `${value.constructor.name}`;
		}

		// Handle plain objects
		const entries = Object.entries(value)
			.map(([key, val]) => `${"\t".repeat(level + 1)}${key}: ${typify(val, level + 1)}`)
			.join(";\n");
		return `${"\t".repeat(level - 1 || 0)}{\n${entries}\n${indent}}`;
	}

	if (typeof value === "function") {
		return "function";
	}

	return "unknown";
}
