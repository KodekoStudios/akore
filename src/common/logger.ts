import { format } from "./format";

/**
 * Represents a logger utility for logging messages with different log levels.
 */
export class Logger {
	private DEBUG: boolean;
	public readonly PREFIX: string;
	public readonly FROM: string;

	/**
	 * Creates an instance of the Logger class.
	 *
	 * @param options The options for configuring the logger.
	 * @param options.prefix The prefix to be displayed in log messages (default is `"AKORE"`).
	 * @param options.from The source of the log messages (default is `"LOG"`).
	 * @param options.debug Whether to enable debug mode (default is `true`).
	 */
	constructor({
		prefix = "AKORE",
		from = "LOG",
		debug = true,
	}: { prefix?: string; from?: string; debug?: boolean } = {}) {
		this.PREFIX = prefix;
		this.FROM = from;
		this.DEBUG = debug;
	}

	/**
	 * Logs an informational message.
	 *
	 * @param description The description of the message.
	 * @param messages The messages to log.
	 */
	public inform(description?: string, ...messages: unknown[]): void {
		this.log({
			header: { texts: [this.PREFIX, this.FROM, "INFORMATION"], style: ANSICodes.BgGreen },
			description: description?.split(/\n/g) ?? [],
			body: messages.map(String),
		});
	}

	/**
	 * Logs debug messages to the console if the DEBUG flag is enabled.
	 *
	 * @param description The description of the debug message.
	 * @param messages The debug messages to log.
	 */
	public debug(description?: string, ...messages: unknown[]): void {
		if (this.DEBUG) {
			this.log({
				header: { texts: [this.PREFIX, this.FROM, "DEBUG"], style: ANSICodes.BgMagenta },
				description: description?.split(/\n/g) ?? [],
				body: messages.map(String),
			});
		}
	}

	/**
	 * Logs a warning message to the console.
	 *
	 * @param description The description of the debug message.
	 * @param messages The warning messages to log.
	 */
	public warn(description?: string, ...messages: unknown[]): void {
		this.log({
			header: { texts: [this.PREFIX, this.FROM, "WARNING"], style: ANSICodes.BgYellow },
			description: description?.split(/\n/g) ?? [],
			body: messages.map(String),
		});
	}

	/**
	 * Logs an error message and throws an error.
	 *
	 * @param description The description of the debug message.
	 * @param messages The error messages to log.
	 */
	public throw(description?: string, ...messages: unknown[]): void {
		this.log({
			header: { texts: [this.PREFIX, this.FROM, "ERROR"], style: ANSICodes.BgRed },
			description: description?.split(/\n/g) ?? [],
			body: messages.map(String),
		});

		throw new Error(messages.join(" "));
	}

	/**
	 * Formats the given text as a header with the specified style.
	 *
	 * @param text The text to format as a header.
	 * @param style The style to apply to the header. Defaults to `AnsiStyle.BgBlue`.
	 * @returns The formatted header string.
	 */
	public header({
		texts,
		style = ANSICodes.BgBlue,
	}: { texts: string[]; style?: ANSICodes }): string {
		const header = this.stylize(` ${texts.join(" > ")} `, style, ANSICodes.Bold);
		const time = this.stylize(` ${this.time()} `, style, ANSICodes.Bold);

		const separator = "".padStart(
			Math.round(process.stdout.columns / 1.5 - header.length - time.length),
			"-",
		);
		return `${header} ${separator} ${time}`;
	}

	/**
	 * Formats the given text as a body with a leading pipe character.
	 * @param texts The text to format as a body.
	 * @returns The formatted body text.
	 */
	public body(...texts: string[]): string[] {
		return texts.map((t) => this.stylize(format(` │ ${t}`, 2), ANSICodes.Dim));
	}

	/**
	 * Applies ANSI styles to a string.
	 *
	 * @param styles The ANSI styles to apply.
	 * @returns The string with the applied ANSI styles.
	 */
	public ANSI(...styles: (number | ANSICodes)[]): `\u001B[${string}m` {
		return `\x1b[${styles.join(";")}m`;
	}

	/**
	 * Applies ANSI styles to the given text.
	 *
	 * @param text The text to stylize.
	 * @param styles The ANSI styles to apply.
	 * @returns The stylized text.
	 */
	public stylize(text: string, ...styles: (number | ANSICodes)[]): string {
		const reset = styles
			.map((x) => {
				const style = ANSICodes[+x];
				return (typeof x === "number" && ((x >= 30 && x <= 37) || (x >= 90 && x <= 97))) ||
					x === ANSICodes.RGBColor ||
					x === ANSICodes.BITColor
					? ANSICodes.ResetColor
					: (typeof x === "number" && ((x >= 40 && x <= 47) || (x >= 100 && x <= 107))) ||
							x === ANSICodes.RGBBackground ||
							x === ANSICodes.BITBackground
						? ANSICodes.ResetBgColor
						: style && !style.startsWith("Reset")
							? ANSICodes[`Reset${style}` as unknown as keyof typeof ANSICodes]
							: undefined;
			})
			.filter((x, i, y) => x && y.indexOf(x) === i) as ANSICodes[];

		return this.ANSI(...styles) + text + this.ANSI(...reset);
	}

	/**
	 * Parses the given text and applies ANSI styles.
	 *
	 * @param text The text to parse.
	 * @returns The parsed text with ANSI styles applied.
	 */
	public parse(text: string) {
		const codes = Object.fromEntries(
			Object.keys(ANSICodes)
				.filter((k) => Number.isNaN(+k))
				.map((k) => [k.toLowerCase(), ANSICodes[k as keyof typeof ANSICodes]]),
		);
		const regex = /{\s*([\w\d;]+)\s*:\s*([^{}]+)}/gim;

		while (regex.test(text)) {
			text = text.replace(regex, (_, code: string, content: string) =>
				this.stylize(content, ...code.split(";").map((x) => codes[x.toLowerCase()] ?? +x)),
			);
		}

		return text;
	}

	/**
	 *
	 * Formats the given text with a leading and trailing newline and a tab character.
	 *
	 * @param text The text to format.
	 * @returns The formatted text.
	 */
	public format(text: string): string {
		return format(text, 1);
	}

	/**
	 * Logs a message to the console.
	 * @param options The message to log.
	 * @param options.header The header of the log message.
	 * @param options.description The description of the log message.
	 * @param options.body The body of the log message.
	 */
	protected log({
		header,
		description,
		body,
	}: {
		header: {
			texts: string[];
			style?: ANSICodes;
		};
		description: string[];
		body: string[];
	}): void {
		console.log(
			this.format(
				`\n\n${this.header(header)}\n${description.map((t) => this.format(this.parse(`{bold:${t}}`))).join("\n")}\n${body
					.flatMap((x) => this.body(...x.split("\n")))
					.map((x) => this.parse(x))
					.join("\n")}\n\n\n`,
			),
		);
	}

	/**
	 * Returns the current time as a formatted string.
	 *
	 * @returns The current time in the format "MM/DD/YYYY HH:MM:SS".
	 */
	protected time() {
		const date = new Date();
		return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
	}
}

export enum ANSICodes {
	// Reset
	ResetAll = 0,
	ResetBold = 22,
	ResetItalic = 23,
	ResetUnderline = 24,
	ResetBlik = 25,
	ResetInverse = 27,
	ResetHidden = 28,
	ResetStrikethrough = 29,
	ResetColor = 39,
	ResetBgColor = 49,

	// Text Styles
	Bold = 1,
	Dim = 2,
	Italic = 3,
	Underline = 4,
	Blink = 5,
	Inverse = 7,
	Hidden = 8,
	Strikethrough = 9,

	// Text Colors
	RGBColor = "38;2",
	BITColor = "38;5",
	RGBBackground = "48;2",
	BITBackground = "48;5",

	// Text Colors
	Black = 30,
	Red = 31,
	Green = 32,
	Yellow = 33,
	Blue = 34,
	Magenta = 35,
	Cyan = 36,
	White = 37,

	// Bright Text Colors
	BrightBlack = 90,
	BrightRed = 91,
	BrightGreen = 92,
	BrightYellow = 93,
	BrightBlue = 94,
	BrightMagenta = 95,
	BrightCyan = 96,
	BrightWhite = 97,

	// Background Colors
	BgBlack = 40,
	BgRed = 41,
	BgGreen = 42,
	BgYellow = 43,
	BgBlue = 44,
	BgMagenta = 45,
	BgCyan = 46,
	BgWhite = 47,

	// Bright Background Colors
	BgBrightBlack = 100,
	BgBrightRed = 101,
	BgBrightGreen = 102,
	BgBrightYellow = 103,
	BgBrightBlue = 104,
	BgBrightMagenta = 105,
	BgBrightCyan = 106,
	BgBrightWhite = 107,
}
