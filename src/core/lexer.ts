import { Logger } from "@common/logger";
import type { BaseCompetence } from "./base.competence";
import type { BaseTranspiler } from "./base.transpiler";
import { Token } from "./token";

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

	/** The flags used for regular expression matching. */
	public flags: string;

	/**
	 * Constructs a new instance of the Lexer class.
	 *
	 * @param competences An array of competences to be used for tokenization.
	 * @param flags The flags used for regular expression matching (default: "gm").
	 */
	constructor(competences: BaseCompetence<Transpiler>[] = [], flags = "gm") {
		this.competences = new Map(competences.map((c) => [c.identifier, c]));
		this.logger = new Logger({ from: "LEXER" });
		this.flags = flags;
	}

	/**
	 * Creates a regular expression pattern based on the competences.
	 *
	 * @returns A regular expression pattern.
	 */
	public createPattern(): RegExp {
		const pattern = [...this.competences.values()]
			.map((c) => `(?:${c.patterns.foremost.source})`)
			.join("|");
		return new RegExp(pattern, this.flags);
	}

	/**
	 * Tokenizes the input string and yields tokens.
	 *
	 * @param input The input string to be tokenized.
	 * @yields Tokens generated from the input string.
	 */
	public *tokenize(input: string): Generator<Token<Transpiler>> {
		const pattern = this.createPattern();
		for (let match = pattern.exec(input); match !== null; match = pattern.exec(input)) {
			const competence = [...this.competences.values()].find((c) =>
				c.patterns.foremost.test(match[0]),
			);

			if (!competence) {
				this.logger.warn(`No competence found for "${match[0]}"`);
				continue;
			}

			const token = new Token({ competence, match });
			yield token;
			pattern.lastIndex = match.index + token.total.length;
		}
	}
}
