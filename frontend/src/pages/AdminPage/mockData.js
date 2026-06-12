export const initialCategories = [
  { id: "birthday", label: "Birthday Collection", emoji: "🎂", color: "#B8729A" },
  { id: "marriage", label: "Marriage Collection", emoji: "💒", color: "#9F507C" },
  { id: "holud", label: "Gaye Holud / Mehndi", emoji: "🌼", color: "#D97706" },
  { id: "baby", label: "Baby Shower Props", emoji: "🍼", color: "#8B5CF6" },
  { id: "global", label: "Global Essentials", emoji: "⚙️", color: "#542141" },
];

export const initialItems = [
  { id: 1, serialNumber: "SN-BTH-001", name: "Luxury Arch & Floral Backdrop", description: "Vibrant pink and mauve floral arch for birthday photos and events.", categoryId: "backdrops", isAvailable: true, image: "🎂" },
  { id: 2, serialNumber: "SN-BTH-002", name: "Neon LED 'Happy Birthday' Sign", description: "Bright white LED sign on premium acrylic board.", categoryId: "light", isAvailable: true, image: "💡" },
  { id: 3, serialNumber: "SN-PRP-001", name: "Marry Me Light-up Letters", description: "Large 4ft marquee letters for marriage proposals.", categoryId: "light", isAvailable: true, image: "💍" },
  { id: 4, serialNumber: "SN-PRP-002", name: "Red Rose Pathway & LED Candles", description: "Stunning rose petals and glass candles setup.", categoryId: "carpets", isAvailable: false, image: "🌹" },
  { id: 5, serialNumber: "SN-MRG-001", name: "Stage Floral Decoration", description: "Premium natural floral stage decoration for weddings.", categoryId: "backdrops", isAvailable: true, image: "💒" },
  { id: 6, serialNumber: "SN-MRG-002", name: "Welcome Signboard Gold Easel", description: "Golden metal easel with customizable floral arrangements.", categoryId: "tableware", isAvailable: true, image: "🖼️" },
  { id: 7, serialNumber: "SN-BDS-001", name: "Pink Balloon Garland & Gold Ring", description: "Modern circular ring backdrop with organic balloon garland.", categoryId: "balloons", isAvailable: true, image: "🎈" },
  { id: 8, serialNumber: "SN-BDS-002", name: "Bride-to-be Glitter Sash & Props", description: "Set of props and high-quality photo booth accessories.", categoryId: "props", isAvailable: true, image: "👑" },
  { id: 9, serialNumber: "SN-BBS-001", name: "Baby Blocks Table Decor", description: "B-A-B-Y table blocks filled with light pastel balloons.", categoryId: "blocks", isAvailable: true, image: "🍼" },
  { id: 10, serialNumber: "SN-BBS-002", name: "Teddy Bear Backdrop & Fluffy Clouds", description: "Soft clouds and large teddy bear prop for baby shower setups.", categoryId: "displays", isAvailable: false, image: "🧸" },
];

export const initialEnquiries = [
  { id: 1, name: "Fatima Akter", email: "fatima@example.com", occasion: "Wedding Reception", message: "Hi, I wanted to ask if you are available on September 12th for a stage decoration in Saskatoon? Budget is $500 CAD.", date: "2026-06-08 14:32", read: false },
  { id: 2, name: "Rashed Khan", email: "rashed@yahoo.com", occasion: "Proposal", message: "Looking for a candlelit pathway and rose backdrop setup for a backyard proposal on June 20th.", date: "2026-06-08 11:15", read: false },
  { id: 3, name: "Farhana Karim", email: "farhana@gmail.com", occasion: "Baby Shower", message: "I'd like to book the Teddy Bear Backdrop for June 28th. Do you handle delivery to Stonebridge?", date: "2026-06-07 18:40", read: true },
  { id: 4, name: "Tariqul Islam", email: "tariq@habib.co", occasion: "Birthday Party", message: "Need a simple black and gold balloon backdrop for my son's 10th birthday this Friday.", date: "2026-06-07 09:22", read: true },
];

export const initialMembers = [
  { id: "M-1001", name: "Ayesha Siddiqua", email: "ayesha@gmail.com", phone: "+1 (306) 555-0101", joinDate: "2026-01-15", status: "Active" },
  { id: "M-1002", name: "Sajid Ahmed", email: "sajid@yahoo.com", phone: "+1 (306) 555-0102", joinDate: "2026-03-10", status: "Active" },
  { id: "M-1003", name: "Naila Kabir", email: "naila.kabir@hotmail.com", phone: "+1 (306) 555-0103", joinDate: "2026-04-22", status: "Inactive" },
];

export const initialPayments = [
  { id: "TXN-9021", memberName: "Ayesha Siddiqua", date: "2026-06-05", amount: "$150 CAD", method: "Interac e-Transfer", status: "Completed" },
  { id: "TXN-9022", memberName: "Sajid Ahmed", date: "2026-06-03", amount: "$350 CAD", method: "PayPal", status: "Completed" },
  { id: "TXN-9023", memberName: "Naila Kabir", date: "2026-05-28", amount: "$100 CAD", method: "Credit Card", status: "Pending" },
];
