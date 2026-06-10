const request = require("supertest");
const db = require("./db");
const app = require("./index");

describe("API", () => {
  let authToken;
  let createdItemId;

  beforeAll(async () => {
    await db.waitForConnection();
  });

  afterAll(async () => {
    await db.closePool();
  });

  describe("GET /api/health", () => {
    it("returns ok status", async () => {
      const res = await request(app).get("/api/health");

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe("POST /api/auth/login", () => {
    it("returns 401 for invalid credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "wrong", password: "wrong" });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Invalid credentials");
    });

    it("returns a token for valid credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          username: process.env.ADMIN_USERNAME || "admin",
          password: process.env.ADMIN_PASSWORD || "testpassword",
        });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      authToken = res.body.token;
    });
  });

  describe("GET /api/auth/verify", () => {
    it("returns 401 without a token", async () => {
      const res = await request(app).get("/api/auth/verify");

      expect(res.status).toBe(401);
    });

    it("returns valid for a good token", async () => {
      const res = await request(app)
        .get("/api/auth/verify")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.valid).toBe(true);
      expect(res.body.user.username).toBe(process.env.ADMIN_USERNAME || "admin");
    });
  });

  describe("GET /api/items", () => {
    it("returns a list of items", async () => {
      const res = await request(app).get("/api/items");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe("POST /api/items", () => {
    it("returns 401 without auth", async () => {
      const res = await request(app)
        .post("/api/items")
        .send({ name: "Unauthorized Item" });

      expect(res.status).toBe(401);
    });

    it("creates an item with auth", async () => {
      const res = await request(app)
        .post("/api/items")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "CI Test Item", description: "Created in tests" });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe("CI Test Item");
      expect(res.body.description).toBe("Created in tests");
      createdItemId = res.body.id;
    });

    it("returns 400 when name is missing", async () => {
      const res = await request(app)
        .post("/api/items")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ description: "No name" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Name is required");
    });
  });

  describe("PUT /api/items/:id", () => {
    it("returns 401 without auth", async () => {
      const res = await request(app)
        .put(`/api/items/${createdItemId}`)
        .send({ name: "Updated" });

      expect(res.status).toBe(401);
    });

    it("updates an item with auth", async () => {
      const res = await request(app)
        .put(`/api/items/${createdItemId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "Updated CI Item", description: "Updated in tests" });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Updated CI Item");
      expect(res.body.description).toBe("Updated in tests");
    });

    it("returns 404 for a missing item", async () => {
      const res = await request(app)
        .put("/api/items/999999")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "Missing" });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/items/:id", () => {
    it("returns 401 without auth", async () => {
      const res = await request(app).delete(`/api/items/${createdItemId}`);

      expect(res.status).toBe(401);
    });

    it("deletes an item with auth", async () => {
      const res = await request(app)
        .delete(`/api/items/${createdItemId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Item deleted successfully");
    });

    it("returns 404 for a missing item", async () => {
      const res = await request(app)
        .delete(`/api/items/${createdItemId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });
});
