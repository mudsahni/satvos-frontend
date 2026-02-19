import { cn } from "../cn";

describe("cn", () => {
  it("merges multiple classes", () => {
    expect(cn("text-red-500", "bg-blue-200")).toBe("text-red-500 bg-blue-200");
  });

  it("excludes falsy values (false, undefined, null, empty string)", () => {
    expect(cn("base", false && "hidden", undefined, null, "")).toBe("base");
  });

  it("handles conditional ternary classes", () => {
    expect(cn("base", true ? "active" : "inactive")).toBe("base active");
    expect(cn("base", false ? "active" : "inactive")).toBe("base inactive");
  });

  it.each([
    [["p-4", "p-2"], "p-2"],
    [["text-red-500", "text-blue-500"], "text-blue-500"],
    [["mx-4", "mx-2"], "mx-2"],
    [["md:p-4", "md:p-2"], "md:p-2"],
  ])("resolves conflicting Tailwind classes: %j → %s", (inputs, expected) => {
    expect(cn(...inputs)).toBe(expected);
  });

  it("does not merge non-conflicting classes", () => {
    expect(cn("p-4", "m-2", "text-red-500")).toBe("p-4 m-2 text-red-500");
    expect(cn("mx-4", "my-2")).toBe("mx-4 my-2");
    expect(cn("md:p-4", "lg:p-2")).toBe("md:p-4 lg:p-2");
  });

  it("handles object and array syntax from clsx", () => {
    expect(cn({ "text-red-500": true, hidden: false, flex: true })).toBe(
      "text-red-500 flex"
    );
    expect(cn(["text-red-500", "bg-blue-200"])).toBe("text-red-500 bg-blue-200");
  });

  it("handles mixed inputs", () => {
    expect(
      cn("base-class", false && "excluded", { "conditional-class": true }, undefined, null, "final-class")
    ).toBe("base-class conditional-class final-class");
  });

  it("returns empty string when no valid classes", () => {
    expect(cn(false, null, undefined, "")).toBe("");
    expect(cn()).toBe("");
  });
});
