import { defineBuildConfig } from "unbuild";
import { readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * Recursively finds all files with the name "index.ts" in the specified directory.
 *
 * @param dir The directory to search in.
 * @param list An optional array to store the file paths. Defaults to an empty array.
 * @returns An array of file paths that match the criteria.
 */
function findFiles(dir: string, list: string[] = []) {
	const files = readdirSync(dir);

	for (const file of files) {
		const FilePath = join(dir, file);
		const FileStat = statSync(FilePath);

		if (FileStat.isDirectory()) {
			findFiles(FilePath, list);
		} else if (file === "index.ts") {
			list.push(FilePath);
		}
	}

	return list;
}

export default defineBuildConfig({
	entries: findFiles("src").map((file) => ({
		input: file,
		outDir: file.replace("src", "lib").replace("index.ts", ""),
		format: ["esm", "cjs"],
	})),
	outDir: "lib/",
	declaration: true,
	rollup: {
		esbuild: { minifySyntax: true },
		emitCJS: true,
		alias: {
			entries: [
				{
					find: "@common",
					replacement: resolve(__dirname, "./src/common"),
				},
				{
					find: "@core",
					replacement: resolve(__dirname, "./src/core"),
				},
			],
		},
	},
	failOnWarn: false,
});
