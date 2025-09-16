export const ID_MAP = {
  donate:   ["CAT01_A1", "CAT01_A2"],
  volunteer:["CAT02_A1", "CAT02_A2"],
  advocate: ["CAT03_A1", "CAT03_A2"],
  wellness: ["CAT04_A1", "CAT04_A2"],
  recycle:  ["CAT05_A1", "CAT05_A2"],
  wildlife: ["CAT06_A1", "CAT06_A2"],
};

export const ACTIVITY_MAP = {
  "CAT01_A1": "donate",
  "CAT01_A2": "donate",
  "CAT02_A1": "volunteer",
  "CAT02_A2": "volunteer",
  "CAT03_A1": "advocate",
  "CAT03_A2": "advocate",
  "CAT04_A1": "wellness",
  "CAT04_A2": "wellness",
  "CAT05_A1": "recycle",
  "CAT05_A2": "recycle",
  "CAT06_A1": "wildlife",
  "CAT06_A2": "wildlife",
};

export const ACTIVITY_META = {
  CAT01_A1: { 
    title: "Note Sharing Day", 
    desc: "Submit course notes to shared repo. QR confirms participation.", 
    rewardText: "Stationery pack", 
    points: 15, 
    sdgs: [4, 12] 
  },
  CAT01_A2: { 
    title: "Buy eco product", 
    desc: "Purchase eco-friendly product. Upload receipt in app after scan.", 
    rewardText: "5% shop coupon", 
    points: 10, 
    sdgs: [12] 
  },
  CAT02_A1: { 
    title: "One-Tap Survey", 
    desc: "Complete one-question sustainability poll.", 
    rewardText: "Snack coupon", 
    points: 5, 
    sdgs: [12, 13] 
  },
  CAT02_A2: { 
    title: "Lead a drive", 
    desc: "Organize a donation or cleanliness drive.", 
    rewardText: "Organizer badge", 
    points: 15, 
    sdgs: [11, 15] 
  },
  CAT03_A1: { 
    title: "Smoke-Free Selfie Spot", 
    desc: "Take a selfie at ‘I Didn’t Smoke’ booth.", 
    rewardText: "Prize draw entry", 
    points: 10, 
    sdgs: [3] 
  },
  CAT03_A2: { 
    title: "Sustainable Startup Pitch", 
    desc: "Pitch an idea for a sustainability-focused service.", 
    rewardText: "Innovation badge", 
    points: 25, 
    sdgs: [9, 12] 
  },
  CAT04_A1: { 
    title: "Stairs for Sustainability", 
    desc: "Take stairs instead of elevator. QR on each landing.", 
    rewardText: "Free smoothie voucher", 
    points: 10, 
    sdgs: [3, 11] 
  },
  CAT04_A2: { 
    title: "Power-Up Gym Challenge", 
    desc: "Use energy-generating gym equipment.", 
    rewardText: "Cafeteria meal", 
    points: 10, 
    sdgs: [7, 13] 
  },
  CAT05_A1: { 
    title: "Refill & Reuse Challenge", 
    desc: "Refill bottle at campus station instead of buying plastic.", 
    rewardText: "Sticker set", 
    points: 8, 
    sdgs: [12, 14] 
  },
  CAT05_A2: { 
    title: "Reusable Mug Campaign", 
    desc: "Bring reusable mug to café.", 
    rewardText: "Discount token", 
    points: 10, 
    sdgs: [12] 
  },
  CAT06_A1: { 
    title: "Meatless Monday Meals", 
    desc: "Choose vegetarian/vegan meal on Mondays.", 
    rewardText: "Free dessert", 
    points: 12, 
    sdgs: [2, 3, 13] 
  },
  CAT06_A2: { 
    title: "Report a sighting", 
    desc: "Report wildlife responsibly in the app.", 
    rewardText: "Explorer badge", 
    points: 10, 
    sdgs: [15] 
  },
};
