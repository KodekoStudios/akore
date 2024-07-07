/**
 * Formats the given source code by adding the specified indentation.
 *
 * @param source The source code to format.
 * @param indent The number of indentation levels to add.
 * @param fill The string to use for indentation.
 * @returns The formatted source code.
 */
export function format(source: string, indent: number, fill = " "): string {
	// Split the source into lines, indent each line, and join them back together.
	return source.replace(/^/gm, fill.repeat(indent));
}
