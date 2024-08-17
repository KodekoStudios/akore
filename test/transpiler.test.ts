import { describe, it, expect } from "bun:test";

import {
	type Registry,
	type Patterns,
	type Token,
	BaseTranspiler,
	BaseCompetence,
	LexicalFlags,
	LexerOptions,
	Schema,
	Lexer,
	Node,
} from "../src/";

type NodeTypes = "program" | "literal";

class Program extends Node<"program", Node<NodeTypes, unknown>[]> {
	constructor(value: Iterable<Node<NodeTypes, unknown>> = []) {
		super("program", [...value]);
	}

	public push(node: Iterable<Node<NodeTypes, unknown>>): void {
		this.value.push(...node);
	}

	public serialize(): string {
		return this.value.map((node) => node.serialize()).join("\n");
	}
}

class Literal<Value extends string> extends Node<"literal", Value> {
	constructor(value: Value) {
		super("literal", value);
	}

	public serialize(): string {
		return this.value;
	}
}

class CLiteral extends BaseCompetence<TRS> {
	public readonly identifier = "test:literal";
	public readonly patterns: Patterns = {
		foremost: /literal/,
		opener: /\(/,
		closer: /\)/,
		unstoppable: true,
	};

	resolve({ inside = "" }: Token<TRS>): Node<string, unknown> {
		return new Literal(inside);
	}
}

class CBlock extends BaseCompetence<TRS> {
	public readonly identifier = "test:block";
	public readonly patterns: Patterns = {
		foremost: /\{/,
		closer: /\}/,
	};
	public readonly flags = LexicalFlags.DIRECT_ENTRY | LexicalFlags.UNSTOPPABLE;

	resolve({ inside = "" }: Token<TRS>): Node<string, unknown> {
		return new Literal(inside);
	}
}

class TRS extends BaseTranspiler {
	public declare registry: Registry<NodeTypes>;

	constructor() {
		super({
			schemas: {
				literal: new Schema("literal", "string"),
				program: new Schema("program", [Node]),
			},
			lexer: new Lexer({
				options: LexerOptions.FailWhenUnmatch
			}),
		});
	}

	public transpile(source: string): string {
		const tokens = this.lexer.tokenize(source, "gim");

		const nodes = this.synthesize(tokens) as Generator<Node<NodeTypes, unknown>>;

		const program = new Program();

		for (const node of nodes) {
			this.registry.validate(node);
			program.push([node]);
		}

		return this.registry.resolve(program);
	}
}

describe("transpiler", () => {
	it("should transpile a simple program", () => {
		const transpiler = new TRS();

		transpiler.declare(new CLiteral(transpiler), new CBlock(transpiler));

		const result = transpiler.transpile([
			"literal(line 1)",
			"literal(line 2)",
			"literal(line 3)",
			"literal(line 4)",
			"literal(testing) GO FUCK YOURSELF { block! }"
		].join("\n"));
		expect(result).toBe("testing\nblock! ");
	});
});