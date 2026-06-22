const {
  getCommittedOnDay,
  getMaxRentableInRange,
  canRentQuantity,
  eachDayInRange,
} = require("../src/utils/rentalAvailability");

describe("rentalAvailability", () => {
  const totalStock = 10;

  it("allows overlapping rentals when combined qty stays within stock", () => {
    const bookings = [{ pickupDate: "2026-06-01", returnDate: "2026-06-05", quantity: 5 }];
    expect(canRentQuantity(bookings, "2026-06-01", "2026-06-05", 2, totalStock)).toBe(true);
    expect(canRentQuantity(bookings, "2026-06-01", "2026-06-05", 5, totalStock)).toBe(true);
    expect(canRentQuantity(bookings, "2026-06-01", "2026-06-05", 6, totalStock)).toBe(false);
  });

  it("computes max rentable as minimum remaining across range days", () => {
    const bookings = [
      { pickupDate: "2026-06-01", returnDate: "2026-06-03", quantity: 8 },
      { pickupDate: "2026-06-04", returnDate: "2026-06-06", quantity: 3 },
    ];
    expect(getMaxRentableInRange(bookings, "2026-06-01", "2026-06-03", totalStock)).toBe(2);
    expect(getMaxRentableInRange(bookings, "2026-06-04", "2026-06-06", totalStock)).toBe(7);
    expect(getMaxRentableInRange(bookings, "2026-06-01", "2026-06-06", totalStock)).toBe(2);
  });

  it("counts each day in inclusive rental range", () => {
    const days = eachDayInRange("2026-06-01", "2026-06-05");
    expect(days).toEqual([
      "2026-06-01",
      "2026-06-02",
      "2026-06-03",
      "2026-06-04",
      "2026-06-05",
    ]);
    expect(getCommittedOnDay([], "2026-06-01")).toBe(0);
  });
});
