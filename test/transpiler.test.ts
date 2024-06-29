import { describe, it, expect } from "bun:test";

import type { Registry } from "../src/core/registry";
import { Lexer, type Token } from "../src/core/lexer";
import { BaseCompetence, type Patterns } from "../src/core/base.competence";
import { BaseTranspiler } from "../src/core/base.transpiler";
import { Schema } from "../src/core/schema";
import { Node } from "../src/core/node";

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

class TRS extends BaseTranspiler {
	public declare registry: Registry<NodeTypes>;

	constructor() {
		super({
			schemas: {
				literal: new Schema("literal", "string"),
				program: new Schema("program", [Node]),
			},
			lexer: new Lexer([], "gim"),
		});
	}

	public transpile(source: string): string {
		const tokens = this.lexer.tokenize(source);

		const nodes = this.synthesize(tokens) as Generator<Node<NodeTypes, unknown>>;

		const program = new Program();

		for (const node of nodes) {
			program.push([node]);
		}

		return program.serialize();
	}
}

describe("transpiler", () => {
	it("should transpile a simple program", () => {
		const transpiler = new TRS();

		transpiler.declare(new CLiteral(transpiler));

		const result = transpiler.transpile("literal(testing)");
		expect(result).toBe("testing");
	});
});
