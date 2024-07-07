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
	}: { prefix?: string; from?: string; debug?: boolean }) {
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
			header: { texts: [this.PREFIX, this.FROM, "INFORMATION"], style: AnsiStyle.BgGreen },
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
				header: { texts: [this.PREFIX, this.FROM, "DEBUG"], style: AnsiStyle.BgMagenta },
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
			header: { texts: [this.PREFIX, this.FROM, "WARNING"], style: AnsiStyle.BgYellow },
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
			header: { texts: [this.PREFIX, this.FROM, "ERROR"], style: AnsiStyle.BgRed },
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
		style = AnsiStyle.BgBlue,
	}: { texts: string[]; style?: AnsiStyle }): string {
		const header = this.stylize(` ${texts.join(" > ")} `, style, AnsiStyle.Bold);
		const time = this.stylize(` ${this.time()} `, style, AnsiStyle.Bold);

		const separator = "".padStart(Math.round((process.stdout.columns / 1.5) - header.length - time.length), "-")
		return `${header} ${separator} ${time}`
	}

	public body(...texts: string[]): string[] {
		return texts.map((t) => this.stylize(format(` │ ${t}`, 2), AnsiStyle.Dim));
	}

	/**
	 * Applies ANSI styles to a string.
	 *
	 * @param styles The ANSI styles to apply.
	 * @returns The string with the applied ANSI styles.
	 */
	public ANSI(...styles: AnsiStyle[]): `\u001B[${string}m` {
		return `\x1b[${styles.join(";")}m`;
	}

	/**
	 * Applies ANSI styles to the given text.
	 *
	 * @param text The text to stylize.
	 * @param styles The ANSI styles to apply.
	 * @returns The stylized text.
	 */
	public stylize(text: string, ...styles: AnsiStyle[]): string {
		const code = this.ANSI(...styles);

		// biome-ignore lint/suspicious/noControlCharactersInRegex: We need to match the control character.
		return code + text.replace(/\u001B\[0m/g, AnsiStyle.Reset + code) + AnsiStyle.Reset;
	}

	/**
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
			style?: AnsiStyle;
		};
		description: string[];
		body: string[];
	}): void {
		console.log(
			this.format(
				[
					"",
					"",
					this.header(header),
					...description.map((t) => this.format(this.stylize(t, AnsiStyle.Bold))),
					...body.flatMap(x => this.body(...x.split("\n"))),
					"",
					"",
				].join("\n"),
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
		return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
	}
}

export enum AnsiStyle {
	// Reset
	Reset = "\x1b[0m",

	// Text Styles
	Bold = "1",
	Dim = "2",
	Italic = "3",
	Underline = "4",
	Blink = "5",
	Inverse = "7",
	Hidden = "8",
	Strikethrough = "9",

	// Text Colors
	Black = "30",
	Red = "31",
	Green = "32",
	Yellow = "33",
	Blue = "34",
	Magenta = "35",
	Cyan = "36",
	White = "37",

	// Bright Text Colors
	BrightBlack = "90",
	BrightRed = "91",
	BrightGreen = "92",
	BrightYellow = "93",
	BrightBlue = "94",
	BrightMagenta = "95",
	BrightCyan = "96",
	BrightWhite = "97",

	// Background Colors
	BgBlack = "40",
	BgRed = "41",
	BgGreen = "42",
	BgYellow = "43",
	BgBlue = "44",
	BgMagenta = "45",
	BgCyan = "46",
	BgWhite = "47",

	// Bright Background Colors
	BgBrightBlack = "100",
	BgBrightRed = "101",
	BgBrightGreen = "102",
	BgBrightYellow = "103",
	BgBrightBlue = "104",
	BgBrightMagenta = "105",
	BgBrightCyan = "106",
	BgBrightWhite = "107",
}
