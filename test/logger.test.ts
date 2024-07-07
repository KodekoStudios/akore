import { describe, it, expect, spyOn } from 'bun:test';
import { Logger } from "../src/common/logger";

describe("Logger", () => {
	it("should log an informational message", () => {
		const logger = new Logger({});
		const logSpy = spyOn(console, "log")

		logger.inform("This is an informational message", "Message 1", "Message 2");

		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("AKORE > LOG > INFORMATION"));
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("This is an informational message"));
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Message 1"));
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Message 2"));

		logSpy.mockRestore();
	});

	it("should log a debug message when debug mode is enabled", () => {
		const logger = new Logger({ debug: true });
		const logSpy = spyOn(console, "log")

		logger.debug("This is a debug message", "Debug message 1", "Debug message 2");

		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("AKORE > LOG > DEBUG"));
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("This is a debug message"));
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Debug message 1"));
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Debug message 2"));

		logSpy.mockRestore();
	});

	it("should not log a debug message when debug mode is disabled", () => {
		const logger = new Logger({ debug: false });
		const logSpy = spyOn(console, "log");

		logger.debug("This is a debug message", "Debug message 1", "Debug message 2");

		expect(logSpy).not.toHaveBeenCalled();

		logSpy.mockRestore();
	});

	it("should log a warning message", () => {
		const logger = new Logger({});
		const logSpy = spyOn(console, "log");

		logger.warn("This is a warning message", "Warning message 1", "Warning message 2");

		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("AKORE > LOG > WARNING"));
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("This is a warning message"));
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Warning message 1"));
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Warning message 2"));

		logSpy.mockRestore();
	});

	it("should log an error message and throw an error", () => {
		const logger = new Logger({});
		const logSpy = spyOn(console, "log")

		expect(() => {
			logger.throw("This is an error message", "Error message 1", "Error message 2");
		}).toThrowError("Error message 1 Error message 2");

		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("AKORE > LOG > ERROR"));
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("This is an error message"));
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Error message 1"));
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Error message 2"));

		logSpy.mockRestore();
	});
});