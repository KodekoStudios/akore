import { isChild, isImplementing } from "@common/classes";
import { format } from "@common/format";
import { Node } from "./node";

/**
 * Represents a schema object that defines the structure and type of data.
 *
 * @template Type The type of the schema structure.
 */
export class Schema<Type> {
	/** The identifier of the schema. */
	public readonly identifier: string;

	/** The structure of the object defined by the schema. */
	public readonly structure: Type;

	/**
	 * Creates a new Schema instance.
	 *
	 * @param identifier The identifier for the schema.
	 * @param schema The structure of the schema.
	 */
	constructor(identifier: string, schema: Type) {
		this.identifier = identifier;
		this.structure = schema;
	}

	/**
	 * Compares a value against the schema structure.
	 *
	 * @param value The value to compare.
	 * @returns `true` if the value matches the schema, `false` otherwise.
	 */
	public compare(value: unknown): boolean {
		return this._compare(value, this.structure);
	}

	/**
	 * Returns a string representation of the Schema object.
	 *
	 * @param indent The indentation level for the string representation. Default is 0.
	 * @returns A string representation of the Schema object.
	 */
	public toString(indent = 0): string {
		return `Schema <${this.identifier}>: ${format(this._toString(this.structure), indent).trimStart()}`;
	}

	/**
	 * Compares a value against a schema structure.
	 *
	 * This method handles various schema types including primitive types,
	 * arrays, objects, and constructor functions.
	 *
	 * @param value The value to compare.
	 * @param schema The schema to compare against.
	 * @returns `true` if the value matches the schema, `false` otherwise.
	 */
	protected _compare(value: unknown, schema: unknown): boolean {
		if (typeof schema === "string") {
			// biome-ignore lint/suspicious/useValidTypeof: This is a valid use of typeof.
			return typeof value === schema;
		}

		if (Array.isArray(schema)) {
			if (!Array.isArray(value)) return false; // Ensure both are arrays
			for (const item of value) {
				if (schema.length === 1) {
					if (!this._compare(item, schema[0])) return false; // Single type check
				} else if (!schema.some((type) => this._compare(item, type))) {
					return false; // Multiple type check
				}
			}
			return true;
		}

		if (typeof schema === "object" && schema !== null) {
			if (typeof value !== "object" || value === null) return false; // Ensure both are objects
			for (const key in schema) {
				if (
					!(key in value) ||
					!this._compare(
						(value as Record<string, unknown>)[key],
						(schema as Record<string, unknown>)[key],
					)
				) {
					return false; // Check for missing keys or mismatched values
				}
			}
			return true;
		}

		if (typeof schema === "function") {
			if (schema === Node) {
				return (
					isImplementing((value as Node<string, unknown>).constructor, Node) ||
					isChild((value as Node<string, unknown>).constructor, Node)
				);
			}
			return value instanceof schema; // Check instance against constructor
		}

		return false; // Return false for unsupported schema types
	}

	/**
	 * Returns a string representation of the given schema.
	 *
	 * This method converts various schema types, including nested schemas,
	 * arrays, and objects, into a human-readable format.
	 *
	 * @param schema The schema to convert to a string.
	 * @param indent The indentation level for the string representation.
	 * @returns The string representation of the schema.
	 */
	protected _toString(schema = this.structure, indent = 0): string {
		if (schema instanceof Schema) {
			return schema.toString(indent + 1); // Recursively get string representation of nested Schema
		}

		if (schema === null) {
			return "null"; // Handle null value
		}

		if (typeof schema === "string") {
			const primitives = [
				"string",
				"number",
				"boolean",
				"function",
				"undefined",
				"object",
				"bigint",
				"symbol",
			];
			return primitives.includes(schema) ? schema : `"${schema}"`; // Return primitive or quoted string
		}

		if (Array.isArray(schema)) {
			if (schema.length === 0) return "never[]"; // Handle empty array
			const types = new Set(schema.map((type) => this._toString(type, 0))); // Deduplicate types
			if (types.size === 0) return "any[]"; // Handle case with no types
			if (types.size === 1) return `${[...types][0]}[]`; // Single type array
			return `(${[...types].join(" | ")})[]`; // Multiple types array
		}

		if (typeof schema === "object") {
			const entries = Object.entries(schema as Type & object).map(
				([key, value]) => `${key}: ${this._toString(value, indent)};`,
			); // Convert object to string
			return `{\n${format(entries.join("\n"), indent + 1)}\n}`; // Format object representation
		}

		if (typeof schema === "function") {
			return schema.name; // Return constructor name
		}

		return typeof schema; // Return type as string for other cases
	}
}
