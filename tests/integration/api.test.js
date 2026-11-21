/**
 * Integration tests for the PHP API endpoints in api/.
 *
 * These send real HTTP requests to the PHP code backed by a real MySQL database.
 * In CI, GitHub Actions starts MySQL and PHP's built-in server (`php -S`) and sets
 * API_BASE_URL. Node is only the test runner; PHP serves the API.
 *
 * Run locally:  API_BASE_URL=http://127.0.0.1:8000 npm run test:integration
 */

const BASE_URL = process.env.API_BASE_URL;
const describeIfApi = BASE_URL ? describe : describe.skip;

async function post(endpoint, payload) {
  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`${endpoint} did not return valid JSON:\n${text}`);
  }
  return { res, json };
}

describeIfApi("Login.php", () => {
  test("returns the user's id and name for valid credentials", async () => {
    const { res, json } = await post("Login.php", { login: "testuser", password: "testpass" });

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/application\/json/);
    expect(json).toEqual({ id: expect.any(Number), firstName: "Test", lastName: "User", error: "" });
    expect(json.id).toBeGreaterThan(0);
  });

  test("returns id 0 and an error for invalid credentials", async () => {
    const { res, json } = await post("Login.php", { login: "testuser", password: "wrong" });

    expect(res.status).toBe(200);
    expect(json).toEqual({ id: 0, firstName: "", lastName: "", error: "No Records Found" });
  });
});

describeIfApi("SearchColors.php", () => {
  test("returns matching colors as a JSON array", async () => {
    const { json } = await post("SearchColors.php", { search: "blue", userId: 1 });

    expect(json.error).toBe("");
    expect(Array.isArray(json.results)).toBe(true);
    expect(json.results).toEqual(expect.arrayContaining(["Blue", "Sky Blue"]));
    expect(json.results).not.toContain("Red");
  });

  test("only returns colors belonging to the given user", async () => {
    const { json } = await post("SearchColors.php", { search: "blue", userId: 999 });

    expect(json.error).toBe("No Records Found");
    expect(json.results).toBeUndefined();
  });
});

describeIfApi("AddColor.php", () => {
  test("adds a color that can then be found by SearchColors.php", async () => {
    const newColor = `Test Color ${Date.now()}`;

    const add = await post("AddColor.php", { color: newColor, userId: 1 });
    expect(add.res.status).toBe(200);
    expect(add.json).toEqual({ error: "" });

    const search = await post("SearchColors.php", { search: newColor, userId: 1 });
    expect(search.json.results).toEqual([newColor]);
  });
});
