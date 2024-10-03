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
	public readonly lexer: Lexer<this>;

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
		this.lexer = lexer as unknown as Lexer<this>;
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
	public declare(...competences: BaseCompetence<this>[]) {
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
	public *synthesize(tokens: Iterable<Token<this>>): Generator<Node<string, unknown>> {
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
	public nodify(token: Token<this>): Node<string, unknown> {
		const node = token.competence.resolve(token);
		if (this.registry.validate(node)) return node;

		const expected = this.registry.get(node.type);
		if (!expected) {
			throw new Error(`The type "${node.type}" does not match any schema.`);
		}

		throw new Error(
			`The following value does not match the expected schema:\nExpected:\n ${expected.toString(2)}\n\nReceived:\n Node <${node.constructor.name}>: ${typify(node.value, 2)}`,
		);
	}

	/**
	 * Tokenizes the input string and returns a tokens array.
	 *
	 * @param source The input string to be tokenized.
	 * @returns Tokens generated from the input string.
	 */
	public tokenize(source: string): Token<this>[] {
		return this.parse(this.lexer.tokenize(source));
	}

	public parse(tokens: IterableIterator<Token<this>>): Token<this>[] {
		const result: Token<this>[] = [];
		let current = tokens.next();

		while (current.done === false) {
			if (current.value.competence.eaters) {
				const { before, after } = current.value.competence.eaters;
				if (before) {
					this._handleBefore(before, result, current.value);
				}
				if (after) {
					this._handleAfter(after, tokens, current.value);
				}
			}

			result.push(current.value);
			current = tokens.next();
		}

		return result;
	}

	protected _handleBefore(before: string[], result: Token<this>[], token: Token<this>) {
		for (const expected of before) {
			const prev = result.pop();

			if (!prev) {
				this.logger.throw(
					`Illegal token {underline;italic:${token.total}} at Ln ${token.line}, Col ${token.column}.`,
					token.match.input
						?.split(/\n/g)
						.slice(Math.max(0, token.line - 4), token.line)
						.join("\n"),
					// TODO: I don't really know if this would work.
					`${" ".repeat(token.column - 1)}{italic:${"^".repeat(token.total.length)} Here!}`,

				);
				break; // Unreachable
			}

			if (prev.competence.identifier === expected) {
				token.eated.before.push(prev);
				continue;
			}

			this.logger.throw(`Unexpected token ${prev?.total}`);
		}
	}

	protected _handleAfter(
		after: string[],
		tokens: IterableIterator<Token<this>>,
		token: Token<this>,
	) {
		for (const expected of after) {
			const next = tokens.next();

			if (next.done) {
				this.logger.throw("Unexpected end of input!");
				break; // Unreachable
			}

			if (next.value.competence.identifier === expected) {
				token.eated.after.push(next.value);
				continue;
			}

			const { value } = next;

			this.logger.throw(
				`Unexpected token {underline;italic:${value.total}} at Ln ${value.line}, Col ${value.column}.`,
				value.match.input
					?.split(/\n+/g)
					.slice(Math.max(0, token.line - 4), token.line)
					.join("\n"),
				`${" ".repeat(value.column - 1)}{italic:${"^".repeat(value.total.length)} Here!}`,
			);
		}
	}
}
