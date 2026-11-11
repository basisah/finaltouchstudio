const request = require("supertest");
const db = require("./db");
const initializeDatabase = require("./database/initDb");
const app = require("./index");
const { seedDemoData, removeDemoData } = require("./seed/demoData");
const { DEMO_ITEMS, DEMO_PACKAGES } = require("./seed/demoCatalog");

const GUEST_EMAIL = "ci-catalog-guest@example.com";
const STOCKED_ITEM = DEMO_ITEMS.find((item) => item.id === "demo-wed-rose-wall"); // 2 units

function isoDate(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

function orderPayload(quantity, pickup, dropoff) {
  return {
    customer_name: "CI Catalog Guest",
    customer_email: GUEST_EMAIL,
    customer_phone: "306-555-0100",
    rental_date: pickup,
    event_date: dropoff,
    total_amount: STOCKED_ITEM.price * quantity,
    items: [{ item_id: STOCKED_ITEM.id, quantity, price: STOCKED_ITEM.price }],
  };
}

describe("Catalog", () => {
  let hadDemoData = false;

  beforeAll(async () => {
    await db.waitForConnection();
    await initializeDatabase();
    const [[{ total }]] = await db.query("SELECT COUNT(*) AS total FROM items WHERE is_demo = 1");
    hadDemoData = Number(total) > 0;
    await seedDemoData(db);
  });

  afterAll(async () => {
    await db.query("DELETE FROM orders WHERE customer_email = ?", [GUEST_EMAIL]);
    await db.query("DELETE FROM users WHERE email = ?", [GUEST_EMAIL]);
    // Leave a developer's seeded catalogue in place; only clean up what this run created.
    if (!hadDemoData) await removeDemoData(db);
    await db.closePool();
  });

  describe("demo seed", () => {
    it("is idempotent", async () => {
      await seedDemoData(db);
      const [[{ total }]] = await db.query("SELECT COUNT(*) AS total FROM items WHERE is_demo = 1");
      expect(Number(total)).toBe(DEMO_ITEMS.length);
    });

    it("gives every demo item an absolute image URL, a price and stock", async () => {
      const [rows] = await db.query("SELECT image, price, unit_count, description FROM items WHERE is_demo = 1");
      for (const row of rows) {
        expect(row.image).toMatch(/^https:\/\/images\.unsplash\.com\/photo-/);
        expect(Number(row.price)).toBeGreaterThan(0);
        expect(row.unit_count).toBeGreaterThan(0);
        expect(row.description.length).toBeGreaterThan(60);
      }
    });
  });

  describe("GET /api/items", () => {
    it("omits heavy columns from the public list", async () => {
      const res = await request(app).get("/api/items");
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(DEMO_ITEMS.length);
      expect(res.body[0]).toHaveProperty("price");
      expect(res.body[0]).not.toHaveProperty("tutorial_steps");
      expect(res.body[0]).not.toHaveProperty("gallery_images");
    });

    it("filters by category and sub-category", async () => {
      const res = await request(app).get("/api/items?categoryId=marriage&subCategoryId=arches");
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(3);
      for (const item of res.body) {
        expect(item.categoryId).toBe("marriage");
        expect(item.subCategoryId).toBe("arches");
      }
    });

    it("paginates and reports the total", async () => {
      const res = await request(app).get("/api/items?limit=5&offset=5");
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(5);
      expect(Number(res.headers["x-total-count"])).toBeGreaterThanOrEqual(DEMO_ITEMS.length);
    });

    it("searches titles", async () => {
      const res = await request(app).get("/api/items?q=marquee");
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("GET /api/packages", () => {
    it("returns every package with its items", async () => {
      const res = await request(app).get("/api/packages");
      expect(res.status).toBe(200);
      for (const demo of DEMO_PACKAGES) {
        const pkg = res.body.find((p) => p.category_id === demo.category_id);
        expect(pkg).toBeDefined();
        expect(Array.isArray(pkg.items)).toBe(true);
        if (pkg.is_demo) expect(pkg.items).toHaveLength(demo.itemIds.length);
      }
    });

    it("finds a package by its occasion", async () => {
      const res = await request(app).get("/api/packages/birthday");
      expect(res.status).toBe(200);
      expect(res.body.category_id).toBe("birthday");
      expect(res.body.items.length).toBeGreaterThan(0);
    });

    it("returns 404 for an unknown package", async () => {
      const res = await request(app).get("/api/packages/no-such-occasion");
      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/orders", () => {
    const pickup = isoDate(400);
    const dropoff = isoDate(402);

    it("rejects more units than are in stock and stores nothing", async () => {
      const res = await request(app).post("/api/orders").send(orderPayload(STOCKED_ITEM.units + 1, pickup, dropoff));
      expect(res.status).toBe(409);

      const [[{ total }]] = await db.query("SELECT COUNT(*) AS total FROM orders WHERE customer_email = ?", [GUEST_EMAIL]);
      expect(Number(total)).toBe(0);
    });

    it("places an order and books the stock for those dates", async () => {
      const res = await request(app).post("/api/orders").send(orderPayload(STOCKED_ITEM.units, pickup, dropoff));
      expect(res.status).toBe(201);
      expect(res.body.orderId).toBeDefined();

      const availability = await request(app).get(`/api/items/${STOCKED_ITEM.id}/availability`);
      expect(availability.status).toBe(200);
      expect(availability.body.totalStock).toBe(STOCKED_ITEM.units);
      expect(availability.body.bookings).toEqual(
        expect.arrayContaining([{ pickupDate: pickup, returnDate: dropoff, quantity: STOCKED_ITEM.units }])
      );

      const booked = await request(app).get(`/api/items/${STOCKED_ITEM.id}/booked-dates`);
      expect(booked.body.unitCount).toBe(STOCKED_ITEM.units);
      expect(booked.body.bookedRanges).toEqual(
        expect.arrayContaining([{ rentalDate: pickup, eventDate: dropoff, quantityBooked: STOCKED_ITEM.units }])
      );
    });

    it("refuses an overlapping order once the item is fully booked", async () => {
      const res = await request(app).post("/api/orders").send(orderPayload(1, isoDate(401), isoDate(403)));
      expect(res.status).toBe(409);
    });

    it("still allows the item on dates that do not overlap", async () => {
      const res = await request(app).post("/api/orders").send(orderPayload(1, isoDate(410), isoDate(411)));
      expect(res.status).toBe(201);
    });
  });
});
