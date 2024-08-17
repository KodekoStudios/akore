import { Logger } from "@common/logger";
import type { BaseCompetence } from "./base.competence";
import type { BaseTranspiler } from "./base.transpiler";
import { Token } from "./token";

/**
 * Represents the options used for tokenization.
 */
export enum LexerOptions {
	/**
	 * Throws an error when there is a gap between tokens.
	 */
	FailWhenUnmatch = 1,
}

/**
 * Represents a lexer that tokenizes input strings based on a set of competences.
 *
 * @template Transpiler - The type of the transpiler associated with the lexer.
 */
export class Lexer<Transpiler extends BaseTranspiler> {
	/** The competences available for tokenization. */
	public readonly competences: Map<string, BaseCompetence<Transpiler>>;

	/** The logger used for logging lexer-related messages. */
	public readonly logger: Logger;

	/** The options used for tokenization. */
	public readonly options: 0 | LexerOptions;

	/**
	 * Constructs a new instance of the Lexer class.
	 *
	 * @param competences An array of competences to be used for tokenization.
	 * @param options The options used for tokenization.
	 */
	constructor({
		competences = [],
		options,
	}: { competences?: BaseCompetence<Transpiler>[]; options?: LexerOptions } = {}) {
		this.competences = new Map(competences.map((c) => [c.identifier, c]));
		this.logger = new Logger({ from: "LEXER" });
		this.options = options ?? 0;
	}

	/**
	 * Creates a regular expression pattern based on the competences.
	 *
	 * This pattern respects the order of iteration.
	 *
	 * @param flags The flags to be used for the regular expression.
	 * @returns A regular expression pattern.
	 */
	public createPattern(flags = "gm"): RegExp {
		// Get the competences.
		const competences: BaseCompetence<Transpiler>[] = [];
		for (const value of this.competences.values()) {
			competences.push(value);
		}

		// Create a pattern based on the competences.
		const pattern = competences.map((c) => `(?:${c.patterns.foremost.source})`).join("|");

		// Return the regular expression.
		return new RegExp(pattern, flags);
	}

	/**
	 * Tokenizes the input string and yields tokens.
	 *
	 * @param input The input string to be tokenized.
	 * @param flags The flags to be used for the regular expression.
	 * @yields Tokens generated from the input string.
	 */
	public *tokenize(input: string, flags = "gm"): Generator<Token<Transpiler>> {
		// Get the competences.
		const competences: BaseCompetence<Transpiler>[] = [];
		for (const value of this.competences.values()) {
			competences.push(value);
		}

		// Create a pattern based on the competences.
		const pattern = this.createPattern(flags);

		// Last token processed.
		let last: Token<Transpiler> | undefined;

		// Iterate over the matches.
		for (let match = pattern.exec(input); match !== null; match = pattern.exec(input)) {
			// Find the competence that matches the current match.
			const competence = competences.find((c) => c.patterns.foremost.test(match[0]));

			// If no competence is found, log a warning and continue.
			if (!competence) {
				this.logger.warn(`No competence found for "${match[0]}"`);
				continue;
			}

			// Create a token from the match and competence.
			const token = new Token({ competence, match });

			// If the FailWhenUnmatch option is set, throw an error if there is a gap between tokens.
			if (this.options & LexerOptions.FailWhenUnmatch) {
				if (last) {
					// Get the text between the last token and the current token.
					const between = input.slice(last.end, token.start - 1);
					const trimmed = between.trim();

					// If the text is not empty, throw an error.
					if (trimmed !== "") {
						const column = token.start - trimmed.length - 1;
						this.logger.throw(
							`Unexpected token {underline;italic:${trimmed}} at Ln ${token.line}, Col ${column + 1}.`,
							input
								.split(/\n+/g)
								.slice(Math.max(0, token.line - 4), token.line)
								.join("\n"),
							`${" ".repeat(1 + Math.round(column / token.line))}{italic:${"^".repeat(trimmed.length)} Here!}`,
						);
					}
				}

				last = token; // Update the last token.
			}

			yield token; // Yield the token.
			pattern.lastIndex = token.end; // Update the pattern's last index.
		}
	}
}
