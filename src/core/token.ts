import { type BaseCompetence, LexicalFlags } from "./base.competence";
import type { BaseTranspiler } from "./base.transpiler";

/**
 * Represents the previous and subsequent tokens that has been consumed.
 *
 * @template Transpiler The type of the transpiler.
 */
export interface Eated<Transpiler extends BaseTranspiler> {
	/**
	 * The consumed competences before the current competence.
	 */
	before: Token<Transpiler>[];

	/**
	 * The consumed competences after the current competence.
	 */
	after: Token<Transpiler>[];
}

/**
 * Represents a token in the lexer.
 *
 * @template Transpiler The type of the transpiler.
 */

export class Token<Transpiler extends BaseTranspiler> {
	private opener = "";
	private closer = "";

	/** The competence associated with the token. */
	public readonly competence: BaseCompetence<Transpiler>;

	/** The regular expression match array. */
	public readonly match: RegExpMatchArray;

	/** The previous and subsequent tokens that has been consumed. */
	public eated: Eated<Transpiler>;

	/** The text inside the token (parameters). */
	public inside?: string;

	/**
	 * Creates a new Token instance.
	 *
	 * @param competence The competence associated with the token.
	 * @param match The regular expression match array.
	 */
	constructor({
		competence,
		match,
	}: {
		competence: BaseCompetence<Transpiler>;
		match: RegExpMatchArray;
	}) {
		this.competence = competence;
		this.match = match;
		this.eated = { before: [], after: [] };

		// Check if the match has an index and input
		if (match.index !== undefined && match.input) {
			// Get the flags from the competence
			const { flags = 0 } = competence;

			// Check if the competence is forced inside processing
			const forced = flags & LexicalFlags.DIRECT_ENTRY;

			// Get the patterns from the competence
			const { opener, closer, inside } = competence.patterns;

			if (forced || opener) {
				// Check if the closer is present
				if (closer === undefined) {
					throw new Error("Inside processing requires a closer.");
				}

				// Get the text after the match
				const after = match.input.slice(match.index + match[0].length);

				// Check if the opener is present next to the match
				if (after && (forced || opener?.test(after[0]))) {
					this.opener = forced ? "" : after[0]; // Set the opener
					this.inside = ""; // Initialize the inside

					// Loop through the text after the match
					for (let i = 1, depth = 0; i < after.length; i++) {
						const char = after[i];

						// Check if the closer is present and the depth is 0
						// This means the end of the inside has been reached
						if (competence.patterns.closer?.test(char) && depth === 0) {
							this.closer = char;
							break;
						}

						// Check if the opener is present
						// This means the depth should be increased
						if (opener?.test(char)) {
							depth++;
						}

						// Check if the closer is present (the depth is not 0 cuz it would have been caught above)
						// This means the depth should be decreased
						if (closer.test(char)) {
							depth--;
						}

						// Check if the character is allowed inside the inside
						// If not, the character should be ignored
						if (inside === undefined || inside?.test(char)) {
							this.inside += char;
							continue;
						}

						// Check if the competence is unstoppable
						// If so, the current character should be ignored and continue to the next
						if (flags & LexicalFlags.UNSTOPPABLE) {
							continue;
						}

						// If none of the above conditions are met, stop the loop
						break;
					}
				}
			}
		}
	}

	/**
	 * Gets the start index of the token.
	 *
	 * @returns The start index of the token.
	 */
	public get start(): number {
		return this.match.index ?? 0;
	}

	/**
	 * Gets the end index of the token.
	 *
	 * @returns The end index of the token.
	 */
	public get end() {
		return this.start + this.total.length;
	}

	/**
	 * Gets the line number of the token.
	 *
	 * @returns The line number of the token.
	 */
	public get line(): number {
		return 1 + (this.match.input?.slice(0, this.start).match(/\n/g)?.length ?? 0);
	}

	/**
	 * Gets the column number of the token.
	 *
	 * @returns The column number of the token.
	 */
	public get column(): number {
		return this.start - (this.match.input?.lastIndexOf("\n", this.start) ?? 0);
	}

	/**
	 * Gets the total string of the token.
	 */
	public get total(): string {
		if (this.inside) {
			return this.match[0] + this.opener + this.inside + this.closer;
		}
		return this.match[0];
	}

	/**
	 * Gets the groups of the token.
	 */
	public get groups(): Record<string, string> {
		const { groups } = this.match;
		if (!groups) return {};
		return Object.fromEntries(Object.entries(groups).filter(([, value]) => value));
	}
}
