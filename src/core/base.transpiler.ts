import { Logger } from "@common/logger";
import { typify } from "@common/typify";
import type { BaseCompetence } from "./base.competence";
import { Lexer } from "./lexer";
import type { Node } from "./node";
import { Registry } from "./registry";
import type { Schema } from "./schema";
import type { Token } from "./token";

/**
 * The base class for all transpilers.
 */
export abstract class BaseTranspiler {
	/** The registry of schemas. */
	public readonly registry: Registry<string>;

	/** The logger instance. */
	public readonly logger: Logger;

	/** The lexer instance. */
	public readonly lexer: Lexer<typeof this>;

	/**
	 * Creates a new instance of the base transpiler.
	 *
	 * @param schemas The schemas to register.
	 * @param logger The logger instance.
	 * @param lexer The lexer instance.
	 */
	constructor({
		schemas,
		logger = new Logger({ from: this.constructor.name }),
		lexer = new Lexer(),
	}: {
		schemas?: Record<string, Schema<unknown>> | null;
		logger?: Logger;
		lexer?: Lexer<BaseTranspiler>;
	} = {}) {
		this.registry = new Registry(schemas);
		this.logger = logger;
		this.lexer = lexer as unknown as Lexer<typeof this>;
	}

	/**
	 * Transpile the source code.
	 *
	 * @param source The source code to transpile.
	 */
	abstract transpile(source: string): string;

	/**
	 * Declares one or more competences and adds them to the lexer's competence map.
	 *
	 * If a competence with the same identifier already exists, it will be overwritten.
	 *
	 * @param competences The competences to declare.
	 */
	public declare(...competences: BaseCompetence<typeof this>[]) {
		for (const competence of competences) {
			// Check if the competence is already defined
			if (this.lexer.competences.has(competence.identifier)) {
				this.logger.warn(
					`Competence "${competence.identifier}" is already defined, so it will be overwritten.`,
				);
			}

			// Set the competence
			this.lexer.competences.set(competence.identifier, competence);
		}
	}

	/**
	 * Removes the specified identifiers from the list of competences.
	 * If an identifier is not defined, a warning message will be logged.
	 *
	 * @param identifiers The identifiers to be removed.
	 */
	public undeclare(...identifiers: string[]) {
		for (const identifier of identifiers) {
			// Check if the competence is already defined
			if (!this.lexer.competences.has(identifier)) {
				this.logger.warn(`Competence "${identifier}" is not defined, so it cannot be undeclared.`);
			}

			// Remove the competence
			this.lexer.competences.delete(identifier);
		}
	}

	/**
	 * Synthesizes a sequence of tokens into a generator of nodes.
	 *
	 * @param tokens The tokens to synthesize.
	 * @returns A generator that yields nodes.
	 */
	public *synthesize(tokens: Iterable<Token<typeof this>>): Generator<Node<string, unknown>> {
		for (const token of tokens) {
			try {
				yield this.nodify(token);
			} catch (error) {
				this.logger.throw(
					`Error processing "${token.total}" at Ln ${token.line}, Col ${token.column}`,
					(<Error>error).stack,
				);
				break;
			}
		}
	}

	/**
	 * Converts a token into a node.
	 *
	 * @param token The token to convert.
	 * @returns The converted node.
	 * @throws Error if the converted node does not match the expected schema.
	 */
	public nodify(token: Token<typeof this>): Node<string, unknown> {
		const node = token.competence.resolve(token);
		if (this.registry.validate(node)) return node;

		const expected = this.registry.get(node.type);
		if (!expected) {
			throw new Error(`The type "${node.type}" does not match any schema.`);
		}

		throw new Error(`The following value does not match the expected schema:\nExpected:\n ${expected.toString(2)}\n\nReceived:\n Node <${node.constructor.name}>: ${typify(node.value, 2)}`,
		);
	}
}
