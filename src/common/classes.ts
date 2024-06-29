/**
 * Checks if a class or object implements a given base class or interface.
 *
 * @param target The class or object to check.
 * @param base The base class or interface to check against.
 * @returns `true` if the target implements the base class or interface, `false` otherwise.
 * @throws Error if the base class or interface does not have a prototype.
 */
// biome-ignore lint/complexity/noBannedTypes: Function is used to represent a class.
export function isImplementing(target: Function, base: Function): boolean {
	// Check if the target is the base class or a subclass of the base class.
	if (target === base || target.prototype instanceof base) {
		return true;
	}

	const targetPrototype = target.prototype;
	const basePrototype = base.prototype;

	if (basePrototype) {
		throw new Error("The base class/interface does not have a prototype.");
	}

	// Check if the target has all the properties of the base class.
	for (const property in basePrototype) {
		if (typeof basePrototype[property] !== typeof targetPrototype[property]) {
			return false;
		}

		if (!(property in targetPrototype)) {
			return false;
		}
	}

	return true;
}

/**
 * Checks if a class is a child of another class.
 *
 * @param child The child class to check.
 * @param base The base class to compare against.
 * @returns `true` if the `child` class is a child of the `base` class, `false` otherwise.
 */
// biome-ignore lint/complexity/noBannedTypes: Function is used to represent a class.
export function isChild(child: Function, base: Function): boolean {
	if (typeof child !== "function" || typeof base !== "function") {
		return false;
	}

	if (child === base || child instanceof base) {
		return true;
	}

	let childPrototype = Object.getPrototypeOf(child.prototype);
	while (childPrototype) {
		if (childPrototype === base.prototype) {
			return true;
		}
		childPrototype = Object.getPrototypeOf(childPrototype);
	}

	return false;
}
