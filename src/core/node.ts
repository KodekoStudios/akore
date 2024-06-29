export class Node<Type extends string, Value> {
	public readonly type: Type;
	public readonly value: Value;

	/**
	 * Creates a new Node instance.
	 *
	 * @param type The type of the Node.
	 * @param value The value of the Node.
	 */
	constructor(type: Type, value: Value) {
		this.type = type;
		this.value = value;
	}

	/**
	 * Creates a clone of the Node.
	 *
	 * @returns A new Node instance with the same type and value.
	 */
	public clone(): Node<Type, Value> {
		return new Node(this.type, this.value);
	}

	/**
	 * Serializes the node.
	 * This function is responsible for transpiling the Node into a string.
	 *
	 * @returns A string representing the serialized Node.
	 */
	public serialize(): string {
		return "UNIMPLEMENTED";
	}
}
