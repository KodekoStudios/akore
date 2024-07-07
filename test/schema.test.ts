import { describe, it, expect } from 'bun:test';
import { Schema } from '../src/core/schema';

describe("Schema", () => {
    it("should compare values against the schema", () => {
        const schema = new Schema<string>("stringSchema", "string");
        expect(schema.compare("hello")).toBe(true);
        expect(schema.compare(123)).toBe(false);
    });

    it("should return a string representation of the schema", () => {
        const schema = new Schema<number[]>("numberArraySchema", [1, 2, 3]);
        expect(schema.toString()).toBe('Schema <numberArraySchema>: number[]');
    });
});