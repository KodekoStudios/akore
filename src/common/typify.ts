import { uniq } from "lodash";
import { format } from "./format";

/**
 * Converts a given value to its corresponding type as a string representation.
 *
 * @param value The value to convert to a type string.
 * @param indent The current level of indentation for nested structures.
 * @returns The type of the value as a string representation.
 *
 * @example
 * typify("hello");   // "string"
 * typify(42);        // "number"
 * typify([1, 2, 3]); // "number[]"
 * typify({ name: "Alice", age: 30 }); // "{\n\tname: string;\n\tage: number;\n}"
 */
export function typify(value: unknown, indent = 1): string {
	if (value === undefined || value === null) {
		return `${value}`;
	}

	const type = typeof value;

	if (
		type === "string" ||
		type === "number" ||
		type === "boolean" ||
		type === "function" ||
		type === "bigint" ||
		type === "symbol"
	) {
		return type;
	}

	if (Array.isArray(value)) {
		// If the array is empty, return "never[]".
		if (value.length === 0) {
			return "never[]";
		}

		// Create a set of all types in the array.
		// Set is used to remove duplicates.
		const types = uniq(value.map((el) => typify(el, 0)));

		// If theres no types, return "any[]".
		if (types[0] === undefined) {
			return "any[]";
		}

		// If theres only one type, return "{type}[]".
		if (types.length === 1) {
			return `${types[0]}[]`;
		}

		// If there are multiple types, return a union of all types.
		return `(${types.join(" | ")})[]`;
	}

	if (typeof value === "object") {
		// Handle class instances
		if (value.constructor && value.constructor !== Object) {
			return `${value.constructor.name}`;
		}

		// Handle plain objects
		const entries = Object.entries(value).map(([key, val]) => `${key}: ${typify(val, indent)};`);
		return `{\n${format(entries.join("\n"), indent + 1)}\n}`;
	}

	return "unknown";
}
