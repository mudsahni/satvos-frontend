import { cn } from "../cn";

describe("cn", () => {
  it("returns a single class unchanged", () => {
    expect(cn("text-red-500")).toBe("text-red-500");
  });

  it("merges multiple classes", () => {
    const result = cn("text-red-500", "bg-blue-200");
    expect(result).toBe("text-red-500 bg-blue-200");
  });

  it("excludes false values", () => {
    const result = cn("text-red-500", false && "hidden");
    expect(result).toBe("text-red-500");
  });

  it("excludes undefined values", () => {
    const result = cn("text-red-500", undefined);
    expect(result).toBe("text-red-500");
  });

  it("excludes null values", () => {
    const result = cn("text-red-500", null);
    expect(result).toBe("text-red-500");
  });

  it("excludes empty strings", () => {
    const result = cn("text-red-500", "");
    expect(result).toBe("text-red-500");
  });

  it("handles conditional classes with ternary", () => {
    const isActive = true;
    const result = cn("base", isActive ? "active" : "inactive");
    expect(result).toBe("base active");

    const resultInactive = cn("base", !isActive ? "active" : "inactive");
    expect(resultInactive).toBe("base inactive");
  });

  it("resolves conflicting Tailwind classes (last wins)", () => {
    // tailwind-merge should keep the last conflicting class
    const result = cn("p-4", "p-2");
    expect(result).toBe("p-2");
  });

  it("resolves conflicting text color classes", () => {
    const result = cn("text-red-500", "text-blue-500");
    expect(result).toBe("text-blue-500");
  });

  it("resolves conflicting background color classes", () => {
    const result = cn("bg-red-500", "bg-blue-500");
    expect(result).toBe("bg-blue-500");
  });

  it("does not merge non-conflicting classes", () => {
    const result = cn("p-4", "m-2", "text-red-500");
    expect(result).toBe("p-4 m-2 text-red-500");
  });

  it("handles object syntax from clsx", () => {
    const result = cn({ "text-red-500": true, hidden: false, flex: true });
    expect(result).toBe("text-red-500 flex");
  });

  it("handles array syntax from clsx", () => {
    const result = cn(["text-red-500", "bg-blue-200"]);
    expect(result).toBe("text-red-500 bg-blue-200");
  });

  it("handles mixed inputs", () => {
    const result = cn(
      "base-class",
      false && "excluded",
      { "conditional-class": true },
      undefined,
      null,
      "final-class"
    );
    expect(result).toBe("base-class conditional-class final-class");
  });

  it("returns empty string when no valid classes are provided", () => {
    const result = cn(false, null, undefined, "");
    expect(result).toBe("");
  });

  it("returns empty string with no arguments", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("handles conflicting margin classes", () => {
    const result = cn("mx-4", "mx-2");
    expect(result).toBe("mx-2");
  });

  it("does not merge different axis utilities", () => {
    // mx and my are different axes, should not conflict
    const result = cn("mx-4", "my-2");
    expect(result).toBe("mx-4 my-2");
  });

  it("handles responsive prefix conflicts", () => {
    const result = cn("md:p-4", "md:p-2");
    expect(result).toBe("md:p-2");
  });

  it("keeps different responsive prefixes", () => {
    const result = cn("md:p-4", "lg:p-2");
    expect(result).toBe("md:p-4 lg:p-2");
  });
});
