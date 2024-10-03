import type { BaseTranspiler } from "./base.transpiler";
import type { Node } from "./node";
import type { Token } from "./token";

/**
 * Flags that control the lexical analysis behavior.
 */
export enum LexicalFlags {
	/**
	 * If this flag is active, the tokenizer will continue tokenizing even if there is a pattern for inside,
	 * and that pattern does not match a character. The invalid character will be completely ignored.
	 */
	UNSTOPPABLE = 1,

	/**
	 * If this flag is active, the tokenizer will start tokenizing the inside even if there is no opening pattern.
	 *
	 * It will continue tokenizing until it reaches the closing pattern.
	 */
	DIRECT_ENTRY = 2,
}

/**
 * Represents a set of patterns used for matching and manipulating strings.
 */
export interface Patterns {
	/**
	 * The foremost pattern used for matching.
	 */
	readonly foremost: RegExp;

	/**
	 * An optional pattern used for matching the opening part of a string.
	 */
	readonly opener?: RegExp;

	/**
	 * An optional pattern used for matching the beginning of parameters.
	 */
	readonly inside?: RegExp;

	/**
	 * An optional pattern used for matching the closing of parameters.
	 */
	readonly closer?: RegExp;
}

/**
 * Represents the previous and subsequent competences that will be consumed.
 */
export interface Eaters {
	/**
	 * Specifies the competences that should be consumed before the current competence.
	 */
	readonly before?: string[];

	/**
	 * Specifies the competences that should be consumed after the current competence.
	 */
	readonly after?: string[];
}

/**
 * Represents a base competence class.
 *
 * @template Transpiler The type of the transpiler.
 */
export abstract class BaseCompetence<Transpiler extends BaseTranspiler> {
	/** The transpiler instance. */
	protected readonly transpiler: Transpiler;

	/** The identifier of the competence. */
	public abstract readonly identifier: string;

	/** The patterns used by the competence. */
	public abstract readonly patterns: Patterns;

	/** The eaters used by the competence. */
	public readonly eaters?: Eaters;

	/**
	 * The flags that control the lexical analysis behavior.
	 */
	public readonly flags?: LexicalFlags;

	/**
	 * Creates a new instance of the BaseCompetence class.
	 *
	 * @param transpiler The transpiler instance.
	 */
	constructor(transpiler: Transpiler) {
		this.transpiler = transpiler;
	}

	/**
	 * Resolves the competence.
	 *
	 * @returns The resolved node.
	 */
	abstract resolve(token: Token<Transpiler>): Node<string, unknown>;

	/**
	 * Splits a string by a specified delimiter while respecting nested structures defined by opener and closer patterns.
	 *
	 * This method tokenizes a string into segments based on a delimiter. It takes into account any nested
	 * structures by utilizing the provided patterns for opener and closer. If an opener is found, the method
	 * increases the depth count, and if a closer is encountered, it decreases the depth count. The method
	 * only splits the string at the delimiter when the depth is zero, ensuring that nested structures remain
	 * intact.
	 *
	 * @param inside The string to split. This string can contain nested structures that the method will respect.
	 * @param delimiter The delimiter to use for splitting the string. The default value is `";"`.
	 *                  It can be overridden by passing a different delimiter.
	 * @returns A generator of the split strings. Each call to the generator yields the next segment of the
	 *          string that was split based on the provided delimiter, while honoring nested structures.
	 *
	 * @example
	 * // Example usage of splitByDelimiter
	 * const competence = new SomeCompetence(transpiler);
	 * const input = "item1;item2{nested1;nested2};item3";
	 * const generator = competence.splitByDelimiter(input);
	 * for (const segment of generator) {
	 *     console.log(segment); // Outputs: "item1", "item2{nested1;nested2}", "item3"
	 * }
	 */
	protected *splitByDelimiter(inside: string, delimiter = ";"): Generator<string> {
		let current = "";
		let index = 0;
		let depth = 0;

		while (index < inside.length) {
			const char = inside.charAt(index++);
			if (char === delimiter && depth === 0) {
				yield current;
				current = "";
			} else if (this.patterns.opener?.test(char)) {
				current += char;
				depth++;
			} else if (this.patterns.closer?.test(char)) {
				current += char;
				depth--;
			} else {
				current += char;
			}
		}

		if (current) {
			yield current;
		}

		// TODO: Error handling for unbalanced patterns can be added here.
	}
}
