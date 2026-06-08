// All static category/occasion data lives here.
// Update this file to change what appears in the UI — no component code changes needed.

export const CATEGORIES = [
  { id: "birthday",       label: "Birthday",       emoji: "🎂", color: "#B8729A" }, // Light Mauve
  { id: "proposal",       label: "Proposal",       emoji: "💍", color: "#8B5CF6" }, // Violet
  {
    id: "marriage",
    label: "Marriage",
    emoji: "💒",
    color: "#9F507C", // Mauve
    sub: [
      { id: "white",     label: "White Wedding"  },
      { id: "holud",     label: "Holud"          },
      { id: "mayoun",    label: "Mayoun"         },
      { id: "wedding",   label: "Wedding"        },
      { id: "reception", label: "Reception"      },
    ],
  },
  { id: "bridal-shower",  label: "Bridal Shower",  emoji: "👰", color: "#D946EF" }, // Fuchsia
  { id: "baby-shower",    label: "Baby Shower",    emoji: "🍼", color: "#A78BFA" }, // Lavender
];

export const OCCASIONS = [
  { id: 1, label: "Birthday Party",    emoji: "🎂", tag: "birthday"      },
  { id: 2, label: "Engagement",        emoji: "💍", tag: "proposal"      },
  { id: 3, label: "White Wedding",     emoji: "👰", tag: "white"         },
  { id: 4, label: "Holud Night",       emoji: "🌼", tag: "holud"         },
  { id: 5, label: "Mayoun",            emoji: "🪷", tag: "mayoun"        },
  { id: 6, label: "Reception",         emoji: "🥂", tag: "reception"     },
  { id: 7, label: "Bridal Shower",     emoji: "🌸", tag: "bridal-shower" },
  { id: 8, label: "Baby Shower",       emoji: "🍼", tag: "baby-shower"   },
  { id: 9, label: "Anniversary",       emoji: "❤️", tag: "anniversary"   },
  { id: 10, label: "Corporate Event", emoji: "🏢", tag: "corporate"     },
];

export const SOCIAL_POSTS = [
  { id: 1, platform: "instagram", handle: "@finaltouchstudio", likes: "1.2k", tag: "Holud Setup 🌼" },
  { id: 2, platform: "instagram", handle: "@finaltouchstudio", likes: "987",  tag: "Bridal Shower 🌸" },
  { id: 3, platform: "instagram", handle: "@finaltouchstudio", likes: "2.4k", tag: "White Wedding 💍" },
  { id: 4, platform: "instagram", handle: "@finaltouchstudio", likes: "756",  tag: "Birthday Setup 🎂" },
  { id: 5, platform: "instagram", handle: "@finaltouchstudio", likes: "1.8k", tag: "Reception Night 🥂" },
  { id: 6, platform: "instagram", handle: "@finaltouchstudio", likes: "635",  tag: "Baby Shower 🍼" },
];

export const GALLERY_ITEMS = [
  { id: 1, title: "Holud Night",      category: "holud",         img: "/src/assets/images/gallery_holud.png"   },
  { id: 2, title: "White Wedding",    category: "white",         img: "/src/assets/images/gallery_wedding.png" },
  { id: 3, title: "Birthday Party",   category: "birthday",      img: "/src/assets/images/gallery_birthday.png"},
  { id: 4, title: "Reception Gala",   category: "reception",     img: null },
  { id: 5, title: "Bridal Shower",    category: "bridal-shower", img: null },
  { id: 6, title: "Mayoun Ceremony",  category: "mayoun",        img: null },
];
