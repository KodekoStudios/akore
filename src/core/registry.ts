import type { Node } from "./node";
import type { Schema } from "./schema";

export class SchemaNotFoundError extends Error {
	constructor(type: string) {
		super(`No schema found for type "${type}".`);
		this.name = "SchemaNotFoundError";
	}
}

/**
 * Represents a registry that maps schema types to their corresponding schemas.
 *
 * @template Type The type of the schema keys.
 */
export class Registry<Type extends string> extends Map<Type, Schema<unknown>> {
	public readonly serializations: Map<Node<Type, unknown>, string>;

	/**
	 * Creates a new registry.
	 *
	 * @param schemas The schemas to initialize the registry with.
	 */
	constructor(schemas?: Record<Type, Schema<unknown>> | null | undefined) {
		super();
		this.serializations = new Map();
		if (schemas) {
			for (const [key, value] of Object.entries(schemas)) {
				this.set(key as Type, value as Schema<unknown>);
			}
		}
	}

	/**
	 * Checks if the registry contains a schema for the specified node type.
	 *
	 * This method acts as a type guard, ensuring that if a schema exists
	 * for the node, the node type is valid for the registry. This allows
	 * subsequent operations on the node to assume a matching schema exists.
	 *
	 * @param node The node to check against the registry.
	 * @returns True if a schema exists for the node type; otherwise, false.
	 */
	public check(node: Node<Type, unknown>): node is Node<Type, unknown> {
		return this.has(node.type);
	}

	/**
	 * Validates a node against its corresponding schema.
	 *
	 * Ensures that the node’s value conforms to the schema associated with
	 * its type. If no schema is found, an error is thrown.
	 *
	 * @template Value The type of the node value.
	 * @param node The node to validate.
	 * @throws SchemaNotFoundError If no schema is found for the node type.
	 * @returns True if the node passes validation.
	 */
	public validate<Value>(node: Node<Type, Value>): boolean {
		if (!this.has(node.type)) {
			throw new SchemaNotFoundError(node.type);
		}
		const schema = this.get(node.type);
		return (schema as Schema<unknown>).compare(node.value); // Assert schema exists
	}

	/**
	 * Validates a batch of nodes against their corresponding schemas.
	 *
	 * Checks each node in the array to see if its value adheres to the
	 * schema associated with its type. The result is an array of booleans
	 * indicating whether each node passes validation.
	 *
	 * @template Value The type of the node values.
	 * @param nodes An array of nodes to validate.
	 * @returns An array of booleans indicating the validation result for each node.
	 */
	public batch<Value>(nodes: Node<Type, Value>[]): boolean[] {
		return nodes.map((node) => {
			try {
				this.validate(node);
				return true;
			} catch {
				return false;
			}
		});
	}

	/**
	 * Resolves a node by validating and serializing it.
	 *
	 * First ensures that the node passes validation, then either serializes
	 * the node using a cached result (if available) or freshly serializes
	 * and caches it.
	 *
	 * @template Value The type of the node value.
	 * @param node The node to resolve.
	 * @param skip_cache If true, bypasses the cache and forces re-serialization.
	 * @throws SchemaNotFoundError If the node fails validation.
	 * @returns The serialized representation of the node.
	 */
	public resolve<Value>(node: Node<Type, Value>, skip_cache = false): string {
		if (this.validate(node)) {
			return skip_cache ? node.serialize() : this.serialize(node);
		}
		throw new Error(`Node of type "${node.type}" failed validation.`);
	}

	/**
	 * Serializes a node, using a cache to avoid redundant operations.
	 *
	 * If the node has already been serialized, the cached result is returned;
	 * otherwise, the node is serialized and its result is cached for future use.
	 *
	 * @template Value The type of the node value.
	 * @param node The node to serialize.
	 * @returns The serialized representation of the node.
	 */
	private serialize<Value>(node: Node<Type, Value>): string {
		if (this.serializations.has(node)) {
			return this.serializations.get(node) as string; // Return cached value
		}
		const serialized = node.serialize();
		this.serializations.set(node, serialized); // Cache the result
		return serialized;
	}

	/**
	 * Checks if the registry contains a schema for the specified type.
	 *
	 * @param type The type to check.
	 * @returns True if the registry contains a schema for the type; otherwise, false.
	 */
	public override has(type: Type): type is Type {
		return super.has(type);
	}
}
