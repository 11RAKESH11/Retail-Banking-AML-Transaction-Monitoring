const request = require("supertest");
const app = require("../app");
describe("Health API", () => {
  test("GET /api/health returns healthy status", async () => {
    const response = await request(app).get("/api/health");
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
