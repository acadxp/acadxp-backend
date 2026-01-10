import { generateApiKey } from "./apiKey";
const result = generateApiKey();
test("generate API Key", () => {
  expect(result).toContain("acxp_");
  expect(result.length).toBe(69);
  expect(typeof result).toBe("string");
});
