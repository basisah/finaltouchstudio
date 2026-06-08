import { post } from "./client";

/** Submit a booking/enquiry form */
export const submitBooking = (data) => post("/bookings", data);

/** Submit the contact-us form */
export const submitContact = (data) => post("/contact", data);
