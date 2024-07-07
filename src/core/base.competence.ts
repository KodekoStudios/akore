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
	 * Specifies whether the pattern is unstoppable, meaning it cannot be interrupted by other patterns.
	 * @deprecated Use the LexicalFlags.UNSTOPPABLE flag instead.
	 */
	readonly unstoppable?: boolean;

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
	 * Splits a string by a delimiter.
	 *
	 * @param inside The string to split.
	 * @param delimiter The delimiter to use (default: ";").
	 * @returns A generator of the split strings.
	 */
	protected *splitByDelimiter(inside: string, delimiter = ";"): Generator<string> {
		let current = "";
		let index = 0;
		let depth = 0;
		let char: string;

		while (index < inside.length) {
			char = inside.charAt(index++);
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
	}
}
