import { isChild, isImplementing } from "@common/classes";
import { format } from "@common/format";
import { Node } from "./node";

export class Schema<Type> {
	/** The identifier of the schema. */
	public readonly identifier: string;

	/** The structure of the object. */
	public readonly structure: Type;

	/**
	 * Represents a schema object.
	 *
	 * @param identifier The identifier for the schema.
	 * @param schema The structure of the schema.
	 */
	constructor(identifier: string, schema: Type) {
		this.identifier = identifier;
		this.structure = schema;
	}

	/**
	 * Compares a value against the schema.
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
	 * @param indent The indentation level for the string representation. Default is 1.
	 * @returns A string representation of the Schema object.
	 */
	public toString(indent = 0): string {
		return `Schema <${this.identifier}>: ${format(this._toString(this.structure), indent).trimStart()}`;
	}

	/**
	 * Compares a value against a schema.
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
			if (!Array.isArray(value)) return false;
			return value.every((item: unknown) =>
				schema.length === 1
					? this._compare(item, schema[0])
					: schema.some((type) => this._compare(item, type)),
			);
		}

		if (typeof schema === "object") {
			if (typeof value !== "object" || value === null) return false;
			for (const key in schema) {
				if (
					!(key in value) ||
					!this._compare(
						(value as Record<string, unknown>)[key],
						(schema as Record<string, unknown>)[key],
					)
				) {
					return false;
				}
			}
			return true;
		}

		if (typeof schema === "function" && schema.prototype) {
			if (schema === Node) {
				return (
					isImplementing((value as Node<string, unknown>).constructor, Node) ||
					isChild((value as Node<string, unknown>).constructor, Node)
				);
			}
			return value instanceof schema;
		}

		return false;
	}

	/**
	 * Returns a string representation of the given schema.
	 *
	 * @param schema The schema to convert to a string.
	 * @param indent The indentation level for the string representation.
	 * @returns The string representation of the schema.
	 */
	protected _toString(schema = this.structure, indent = 0): string {
		// If the schema is an instance of Schema, return the string representation of the schema.
		if (schema instanceof Schema) {
			return schema.toString(indent + 1);
		}

		// If the schema is null, return "null".
		if (schema === null) {
			return "null";
		}

		// If the schema is a string, return the string wrapped in quotes.
		if (typeof schema === "string") {
			if (schema === "string" ||
				schema === "number" ||
				schema === "boolean" ||
				schema === "function" ||
				schema === "undefined" ||
				schema === "object" ||
				schema === "bigint" ||
				schema === "symbol") {
				return schema;
			}

			return `"${schema}"`;
		}

		// If the schema is a number, return the number as a string.
		if (Array.isArray(schema)) {
			// If the array is empty, return "never[]".
			if (schema.length === 0) {
				return "never[]";
			}

			// Create a set of all types in the array.
			// Set is used to remove duplicates.
			const types = new Set(schema.map((type) => this._toString(type, 0)));

			// If theres no types, return "any[]".
			if (types.size === 0) {
				return "any[]";
			}

			// If theres only one type, return "{type}[]".
			if (types.size === 1) {
				return `${types.values().next().value}[]`;
			}

			// If there are multiple types, return a union of all types.
			return `(${[...types].join(" | ")})[]`;
		}

		// If the schema is an object, return a string representation of the object.
		if (typeof schema === "object" && schema !== null) {
			const entries = Object.entries(schema as Type & object).map(([key, value]) => {
				return `${key}: ${this._toString(value, indent)};`;
			});

			return `{\n${format(entries.join("\n"), indent + 1)}\n}`;
		}

		// If the schema is a class, return the class name.
		if (typeof schema === "function" && schema.prototype) {
			return schema.name;
		}

		// If the schema is of any other type, return the type as a string.
		return typeof schema;
	}
}
