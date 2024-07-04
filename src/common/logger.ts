/**
 * Represents a logger utility for logging messages with different log levels.
 */
export class Logger {
	private _DEBUG: boolean;
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
		this.PREFIX = this.title(prefix);
		this.FROM = from;
		this._DEBUG = debug;
	}

	/**
	 * Formats the given text as a title with the specified style.
	 *
	 * @param text The text to format as a title.
	 * @param style The style to apply to the title. Defaults to `AnsiStyle.BgBlue`.
	 * @returns The formatted title string.
	 */
	public title(text: string, style: AnsiStyle = AnsiStyle.BgBlue): string {
		return this.stylize(` ${text} `, style, AnsiStyle.Bold);
	}

	/**
	 * Applies ANSI styles to a string.
	 *
	 * @param styles The ANSI styles to apply.
	 * @returns The string with the applied ANSI styles.
	 */
	public ANSI(...styles: AnsiStyle[]): string {
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
		return this.ANSI(...styles) + text + AnsiStyle.Reset;
	}

	/**
	 * Formats the given text with a leading and trailing newline and a tab character.
	 *
	 * @param text The text to format.
	 * @returns The formatted text.
	 */
	public format(text: string): string {
		return `\n\t${text.replace(/(\n+)(\s*)/g, "$1\t$2")}\n`;
	}

	/**
	 * Logs an informational message.
	 *
	 * @param messages The messages to be logged.
	 */
	public inform(...messages: unknown[]): void {
		console.log(
			this.PREFIX,
			this.title(this.FROM, AnsiStyle.BgGreen),
			this.title("INFORMATION", AnsiStyle.BgGreen),
			this.time(),
			this.format(this.stylize(messages.join(" "), AnsiStyle.Dim)),
		);
	}

	/**
	 * Logs debug messages to the console if the DEBUG flag is enabled.
	 *
	 * @param messages The messages to be logged.
	 */
	public debug(...messages: unknown[]): void {
		if (this._DEBUG) {
			console.log(
				this.PREFIX,
				this.title(this.FROM, AnsiStyle.BgMagenta),
				this.title("DEBUG", AnsiStyle.BgMagenta),
				this.time(),
				this.format(this.stylize(messages.join(" "), AnsiStyle.Dim, AnsiStyle.Italic)),
			);
		}
	}

	/**
	 * Logs a warning message to the console.
	 *
	 * @param messages The warning messages to log.
	 */
	public warn(...messages: unknown[]): void {
		console.log(
			this.PREFIX,
			this.title(this.FROM, AnsiStyle.BgYellow),
			this.title("WARNING", AnsiStyle.BgYellow),
			this.time(),
			this.format(this.stylize(messages.join(" "), AnsiStyle.Yellow)),
		);
	}

	/**
	 * Logs an error message and throws an error.
	 *
	 * @param messages The error message(s) to log.
	 */
	public throw(...messages: unknown[]): void {
		console.log(
			this.PREFIX,
			this.title(this.FROM, AnsiStyle.BgRed),
			this.title("ERROR", AnsiStyle.BgRed),
			this.time(),
			this.format(this.stylize(messages.join(" "), AnsiStyle.Red)),
		);

		throw new Error(messages.join(" "));
	}

	/**
	 * Returns the current time as a formatted string.
	 *
	 * @returns The current time in the format "MM/DD/YYYY HH:MM:SS".
	 */
	private time() {
		const date = new Date();
		return this.stylize(`${date.toLocaleDateString()} ${date.toLocaleTimeString()}`, AnsiStyle.Dim);
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
