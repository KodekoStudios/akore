import { promises as fs } from "node:fs";
import path from "node:path";
import type { BaseTranspiler } from "./base.transpiler";

/**
 * Represents a reader that reads files and transpiles their content.
 *
 * @template Transpiler The type of the transpiler.
 */
export class Reader<Transpiler extends BaseTranspiler> {
	/** The transpiler instance used for transpiling file content. */
	private readonly transpiler: Transpiler;

	/** The base directory path for file operations. */
	private readonly basePath: string;

	/**
	 * Creates a new instance of the Reader class.
	 *
	 * @param transpiler The transpiler instance used for transpilation.
	 * @param base_path The base directory path for reading files.
	 */
	constructor(transpiler: Transpiler, base_path: string) {
		this.transpiler = transpiler;
		this.basePath = base_path;
	}

	/**
	 * Reads a file from the specified path and transpiles its content.
	 *
	 * @param mod The relative path to the file to be transpiled.
	 * @returns The transpiled content of the file.
	 * @throws If the file cannot be read or the transpilation fails.
	 */
	public async transpileFile(mod: string): Promise<string> {
		const abs_path = path.join(this.basePath, mod);
		const content = await fs.readFile(abs_path, "utf-8");
		return this.transpiler.transpile(content);
	}
}
