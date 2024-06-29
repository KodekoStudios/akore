import type { Node } from "./node";
import type { Schema } from "./schema";

/**
 * Represents a registry that maps schema types to their corresponding schemas.
 *
 * @template R The type of the schema keys.
 */
export class Registry<R extends string> extends Map<R, Schema<unknown>> {
	/**
	 * Creates a new registry.
	 *
	 * @param schemas The schemas to initialize the registry with.
	 */
	constructor(schemas?: Record<R, Schema<unknown>> | null | undefined) {
		super(Object.entries(schemas || {}).map(([k, v]) => [k as R, v as Schema<unknown>]));
	}

	/**
	 * Validates a node against its corresponding schema.
	 *
	 * @template Value The type of the node value.
	 * @param node The node to validate.
	 * @throws If no schema is found for the node type.
	 * @returns Returns true if the node passes validation.
	 */
	public validate<Value>(node: Node<R, Value>) {
		const schema = this.get(node.type);
		if (schema) return schema.compare(node.value);
		throw new Error(`No schema found for type "${node.type}".`);
	}

	/**
	 * Resolves a node by validating it and serializing it.
	 *
	 * @template Value The type of the node value.
	 * @param node The node to resolve.
	 * @throws If the node fails validation.
	 * @returns The serialized representation of the node.
	 */
	public resolve<Value>(node: Node<R, Value>): string {
		if (this.validate(node)) return node.serialize();
		throw new Error(`Node of type "${node.type}" failed validation.`);
	}
}
