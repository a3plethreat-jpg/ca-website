export const site = {
  name: "CA Triple Threat Basketball Camp",
  short: "Triple Threat",
  tagline: "Built to compete.",
  description:
    "Developing basketball skills, discipline, confidence, and a championship mindset through purposeful training.",
  url: "https://coachatriplethreat.com",
};

export const nav = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Coaches & Achievements", href: "#coaches" },
  { label: "Coach A Mindset", href: "#mindset" },
  { label: "Album", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

// Camp merch (/merch). No online checkout: the visitor sends an order request ("Merch Order"),
// the team confirms it and asks for payment, then sends an online receipt and the delivery day.
export type MerchView = { src: string; label: string; alt: string };
export type MerchColor = { name: string; swatch: string; views: MerchView[] };
export type MerchProduct = {
  id: string;
  name: string;
  line: "Signature" | "Faith" | "Camp";
  /** Price per shirt in Philippine pesos. */
  price: number;
  blurb: string;
  verse?: string;
  colors: MerchColor[];
};

export const peso = (n: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(n);

export const merch = {
  label: "Merch",
  quote: {
    text: "Every shirt is a dream come true — for every dreamer who laces up, shows up, and refuses to quit.",
    invite: "Wear the dream, then come chase the next one with us on the court.",
  },
  path: "/merch",
  lines: ["Signature", "Faith", "Camp"] as const,
  sizes: ["S", "M", "L", "XL", "XXL", "XXXL"],
  fulfillment: ["Pick up at practice", "J&T Express delivery", "Lalamove delivery"] as const,
  steps: [
    { title: "Pick your shirt", text: "Choose a design, color and size, and add it to your order." },
    { title: "Send your details", text: "Fill in your name, phone, address and email, then submit the order." },
    { title: "We confirm", text: "Our team checks stock, confirms your order and sends payment details." },
    { title: "Pay, get your receipt", text: "Once payment is received, you get an online receipt and your delivery day." },
    { title: "Receive it", text: "Pick it up at practice, or get it delivered via J&T Express or Lalamove." },
  ],
  products: [
    {
      id: "coach-a-3d",
      name: "Coach A 3D Shirt",
      line: "Signature",
      price: 500,
      blurb: "The full-color Coach-A wordmark, set big across the chest.",
      colors: [
        {
          name: "Red",
          swatch: "#d71920",
          views: [{ src: "/merch/logo-red.webp", label: "Front", alt: "Red tee with the multicolor Coach-A basketball wordmark across the chest" }],
        },
        {
          name: "White",
          swatch: "#f1f1ee",
          views: [{ src: "/merch/logo-white.webp", label: "Front", alt: "White tee with the multicolor Coach-A basketball wordmark across the chest" }],
        },
        {
          name: "Black",
          swatch: "#111214",
          views: [
            { src: "/merch/logo-black.webp", label: "Dark", alt: "Black tee with the multicolor Coach-A basketball wordmark across the chest, on a dark backdrop" },
            { src: "/merch/logo-black-light.webp", label: "Light", alt: "Black tee with the multicolor Coach-A basketball wordmark across the chest, on a light backdrop" },
          ],
        },
      ],
    },
    {
      id: "built-by-faith",
      name: "Built by Faith",
      line: "Faith",
      price: 700,
      blurb: "Coach A chest crest up front; Built by Faith, Trained with Purpose on the back.",
      verse: "Colossians 3:23",
      colors: [
        {
          name: "Washed pink",
          swatch: "#d9657d",
          views: [
            {
              src: "/merch/built-by-faith.webp",
              label: "Front + back",
              alt: "Washed-pink tee: Coach A chest crest on the front, Built by Faith back graphic citing Colossians 3:23",
            },
          ],
        },
      ],
    },
    {
      id: "walk-by-faith",
      name: "Walk by Faith",
      line: "Faith",
      price: 700,
      blurb: "Walk by Faith, Not by Sight across the back with a CA chest logo.",
      verse: "2 Corinthians 5:7",
      colors: [
        {
          name: "Washed pink",
          swatch: "#d9657d",
          views: [
            {
              src: "/merch/walk-back.webp",
              label: "Back",
              alt: "Washed-pink tee with the Walk by Faith, Not by Sight back graphic citing 2 Corinthians 5:7",
            },
            {
              src: "/merch/walk-front.webp",
              label: "Front",
              alt: "Washed-pink tee with a red-and-green CA Coach A chest logo",
            },
          ],
        },
      ],
    },
    {
      id: "play-hard-stay-true",
      name: "Play Hard Stay True",
      line: "Camp",
      price: 500,
      blurb: "Camp chest logo up front, the Play Hard Stay True motto across the back.",
      colors: (["Black", "White"] as const).map((c) => ({
        name: `Court ${c.toLowerCase()}`,
        swatch: c === "Black" ? "#111214" : "#f1f1ee",
        views: [
          {
            src: `/merch/${c.toLowerCase()}.webp`,
            label: "Front + back",
            alt: `${c} tee with the camp chest logo and the Play Hard Stay True back print`,
          },
          {
            src: `/merch/${c.toLowerCase()}-back.webp`,
            label: "Back print",
            alt: `Close-up of the Play Hard Stay True back print on a ${c.toLowerCase()} tee`,
          },
        ],
      })),
    },
  ] as MerchProduct[],
  lookbook: [
    { src: "/merch/logo-lineup.webp", alt: "Coach-A wordmark on black, red and white tees", caption: "Coach A 3D — three colorways", wide: true },
    { src: "/merch/campaign.webp", alt: "Play Hard Stay True campaign poster", caption: "Play Hard Stay True campaign" },
    { src: "/merch/lineup.webp", alt: "Coach-A merch design board", caption: "The design board" },
  ],
};

export const sectionIds = ["home", "about", "coaches", "mindset", "gallery", "contact"];

export const hero = {
  eyebrow: "CA Triple Threat Basketball Camp",
  headline: "BUILT TO COMPETE.",
  subhead: "TRAIN WITH PURPOSE. PLAY WITH CONFIDENCE.",
  description: site.description,
  primary: { label: "JOIN THE CAMP", href: "#contact" },
  secondary: { label: "EXPLORE OUR STORY", href: "#about" },
};

export const pillars = [
  { title: "Fundamentals", text: "Develop strong basketball foundations through structured practice." },
  { title: "Discipline", text: "Build consistent training habits, accountability, and responsibility." },
  { title: "Teamwork", text: "Encourage communication, respect, and leadership." },
  { title: "Confidence", text: "Help athletes learn to compete with preparation, courage, and composure." },
];

export const aboutFacts: { label: string; value: string; muted?: boolean }[] = [
  {
    label: "Our history",
    value: "Founded in Porac, Pampanga by Coach Allen Cano, after seeing talented kids priced out of good coaching.",
  },
  {
    label: "Mission",
    value: "Developing kids and young athletes through discipline, teamwork, confidence, and basketball fundamentals.",
  },
  {
    label: "Training venues",
    value: "Pio, Porac · Fiesta Community, Porac · Sta. Trinidad, Angeles City — all in Pampanga",
  },
  { label: "Competition divisions", value: "11U, 12U, 13U, 14U, 17U" },
  { label: "Training schedule", value: "To be announced", muted: true },
  {
    label: "Programs",
    value:
      "Group camps, plus 1-on-1 and group clinics with Coach Allen Cano (On Stage, 3rd Floor, Robinsons Balibago). Built on fundamentals, film, and reps. No pay-to-play.",
  },
];

export type Award = { title: string; event: string };
export type Coach = {
  id: string;
  name: string;
  role: string;
  location: string;
  photo: string;
  featured?: boolean;
  bio?: string;
  background?: string;
  certifications?: string[];
  teams?: string[];
  philosophy?: string;
  awardPhoto?: string;
  awards?: Award[];
};

const NYBL = "NYBL Central Luzon Championship – Bulacan, Season 4 Invitational Cup";

export const coaches: Coach[] = [
  {
    id: "allen-cano",
    name: "Allen Cano",
    role: "Head Coach & Founder",
    featured: true,
    location: "Porac, Pampanga",
    bio: "Founder of Coach-A Triple Threat. Builds complete players through fundamentals, film, and relentless reps — developing MVPs, not chasing them.",
    background:
      "Started Triple Threat in Porac, Pampanga after seeing talented kids priced out of good coaching. Sessions focus on fundamentals, footwork, and basketball IQ.",
    certifications: [],
    teams: [],
    philosophy: "Full commitment, respect, hard work, and the willingness to improve every day.",
    photo: "/coaches/allen-cano.webp",
    awardPhoto: "/coaches/allen-cano-best-coach.webp",
    awards: [
      { title: "Best Coach", event: `${NYBL} · 17U Division` },
      { title: "Champion", event: `${NYBL} · 17U Division` },
    ],
  },
  { id: "dae-sanggalang", name: "Dae Sanggalang", role: "Assistant Coach", location: "Lubao, Pampanga", photo: "/coaches/dae-sanggalang.webp" },
  { id: "coach-gee", name: "Coach Gee", role: "Assistant Coach", location: "Angeles City, Pampanga", photo: "/coaches/coach-gee.webp" },
  { id: "coach-j", name: "Coach J", role: "Assistant Coach", location: "San Francisco, Lubao, Pampanga", photo: "/coaches/coach-j.webp" },
  { id: "adrian-p", name: "Adrian P.", role: "Camp Statistician", location: "Angeles City, Pampanga", photo: "/coaches/adrian-p.webp" },
];

export type Achievement = {
  event: string;
  result: string;
  division: string;
  year?: string;
  category: string;
  trophy?: string;
};

export const achievements: Achievement[] = [
  { event: "KBA D-League 2026", result: "Champion", division: "17U", year: "2026", category: "Championship" },
  { event: "KBA D-League 2026", result: "Runner-Up", division: "13U", year: "2026", category: "Tournament" },
  { event: "NBL Phils. Pampanga – Central North Qualifiers", result: "Silver Champion", division: "12U", category: "Championship", trophy: "/trophies/nbl-silver-12u.webp" },
  { event: "CMB · Coach-A Triple Threat Basketball Camp", result: "Champion", division: "17U", category: "Championship", trophy: "/trophies/net-17u.webp" },
  { event: "CMB · Coach-A Triple Threat Basketball Camp", result: "Champion · MVP", division: "15U", category: "Championship", trophy: "/trophies/mvp-15u-a.webp" },
  { event: "CMB · Coach-A Triple Threat Basketball Camp", result: "Champion · MVP", division: "15U", category: "Championship", trophy: "/trophies/mvp-15u-b.webp" },
  { event: NYBL, result: "Champion", division: "17U", category: "Championship", trophy: "/trophies/nybl-champion-17u.webp" },
  { event: NYBL, result: "1st Runner-Up", division: "12U", category: "Tournament", trophy: "/trophies/nybl-runnerup-12u.webp" },
  { event: "NBL Phils. Central–North Luzon Qualifiers", result: "Champion", division: "17U", category: "Championship", trophy: "/trophies/nbl-gold-17u.webp" },
  { event: "Nonokicks Camp League", result: "Champion", division: "12U & 14U", category: "Championship" },
  { event: "3x3 Concentrix BPO", result: "Champion", division: "11U", category: "Championship" },
  { event: "CBA Pampanga", result: "Champion", division: "14U", category: "Championship" },
  { event: "Barangay Pio x Coach A Inter-Barangay", result: "Semifinalist", division: "Inter-Barangay", category: "Tournament" },
  { event: "Porac Developmental League", result: "Champion", division: "13U", category: "Championship" },
  { event: "NYBL — Pilipinas", result: "Back-to-Back Champion", division: "14U", category: "Championship" },
  { event: "NBL Pampanga", result: "Champions", division: "12U & 14U", category: "Championship" },
];

/** Dudoy chat endpoint (optional). Falls back to built-in canned answers. */
export const DUDOY_CHAT_URL =
  process.env.NEXT_PUBLIC_DUDOY_CHAT_URL ?? "https://dudoy.coachatriplethreat.com/chat";

/**
 * Corner "live screen" in the hero.
 * - Set NEXT_PUBLIC_LIVE_STREAM_URL (YouTube / Facebook https URL) to embed a REAL live stream.
 * - Otherwise it plays the recorded game clips, styled as a broadcast, with the badge text below.
 */
export const liveScreen = {
  // A real live stream (YouTube/Facebook) set in NEXT_PUBLIC_LIVE_STREAM_URL takes over the screen with a LIVE badge.
  // Otherwise the screen embeds this recorded Facebook video (NYBL Bulacan Season 5) with the LIVE REPLAY badge.
  streamUrl: process.env.NEXT_PUBLIC_LIVE_STREAM_URL || "https://www.facebook.com/watch/?v=1684922109712721",
  streamIsLive: Boolean(process.env.NEXT_PUBLIC_LIVE_STREAM_URL),
  channel: "TRIPLE THREAT TV",
  badgeLive: "LIVE",
  badgeReplay: "LIVE REPLAY",
  // played in order, then repeats from the start
  clips: [
    { src: "/clips/highlight-17u.mp4", poster: "/clips/highlight-17u.webp" },
  ],
  ticker: "17U CHAMPIONS · NYBL SEASON 4 INVITATIONAL CUP · NYBL BULACAN SEASON 5 INVITATIONAL CUP · KBA D-LEAGUE 2026 CHAMPIONS · PLAY HARD. STAY TRUE.",
};

/**
 * Game day shown on the corner screen (ticker + "UP NEXT"), only on `date` in Philippine time.
 * Source: NYBL Bulacan Season 5 schedule poster (Central Luzon Championship).
 */
export const gameDay = {
  date: "2026-11-21",
  event: "NYBL BULACAN SEASON 5 · CENTRAL LUZON CHAMPIONSHIP",
  venue: "BALIUAG STAR ARENA",
  // When games run late: set delayed, and mark each game done once it has finished.
  // While delayed, "UP NEXT" is the first game not done (instead of going by the clock).
  // Set playing on the game in progress: the chip then reads "NOW PLAYING" and the ticker leads with it.
  delayed: true,
  games: [
    { time: "10:30", label: "10:30 AM", division: "17U", opponent: "LAGUNDI", done: false, playing: true },
    { time: "11:45", label: "11:45 AM", division: "15U", opponent: "CMB SPORTS B", done: false, playing: false },
  ],
};

export const trainingClips = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
  src: `/clips/training-${n}.mp4`,
  poster: `/clips/training-${n}.webp`,
}));

export const mindsetMvps = [
  { photo: "/mvps/kalasag-17.webp", alt: "MVP in a black Junior Kalasag jersey, number 17, holding a basketball" },
  { photo: "/mvps/sanbeda-14.webp", alt: "MVP in a red San Beda jersey, number 14, holding a basketball" },
  { photo: "/mvps/ue-97.webp", alt: "MVP in a white UE jersey, number 97" },
  { photo: "/mvps/eac-19.webp", alt: "MVP in a red EAC jersey, number 19, holding a basketball" },
  { photo: "/mvps/sfn-49.webp", alt: "MVP in a blue San Felipe Neri Catholic School jersey, number 49" },
  { photo: "/mvps/fd-ca.webp", alt: "MVP in a black FD Sportswear jersey with the CA Triple Threat crest, holding a basketball" },
];

export const mindset = {
  heading: "THE COACH A MINDSET",
  support: "THE GAME BEGINS IN THE MIND.",
  note: "Proposed website messaging, editable by the site owner — not verified quotations from Coach A.",
  principles: [
    "Discipline before recognition.",
    "Consistency over shortcuts.",
    "Respect for the game.",
    "Team before ego.",
    "Progress through effort.",
  ],
  finale: "WORK HARD. STAY HUMBLE. TRUST THE PROCESS.",
};

export const galleryCategories = [
  "Basketball Training",
  "Skills Development",
  "Tournaments",
  "Team Activities",
  "Camp Highlights",
];

const concept = "AI-rendered concept visualization — not a photograph of an existing facility.";
const g = (id: string, category: string, alt: string, caption: string) => ({
  src: `/gallery/${id}.webp`,
  small: `/gallery/${id}-sm.webp`,
  tiny: `/gallery/${id}-tiny.webp`,
  alt,
  caption,
  category,
});

export const gallery = [
  g("nybl-17u-champions-celebration", "Tournaments", "Coach-A team and coaches celebrating with the champion trophy on the Baliwag court", `17U Champions — ${NYBL}.`),
  g("nybl-17u-champions-team", "Tournaments", "Coach-A players and coaches posing with medals and the champion trophy", "17U Champions with their medals."),
  g("nybl-12u-runnerup-team", "Tournaments", "Coach-A 12U team and coaches with the 1st Runner-Up trophy", `12U 1st Runner-Up — ${NYBL}.`),
  g("nybl-17u-season-mvp-medals", "Tournaments", "Coach-A player holding the Season MVP trophy, wearing Champion and Mythical 5 medals", "17U Season MVP, Champion and Mythical 5."),
  g("nybl-17u-season-mvp", "Tournaments", "Coach-A player holding the NYBL Season MVP trophy", "17U Season MVP."),
  g("nybl-finals-mvp", "Tournaments", "Coach-A player holding the NYBL Finals MVP trophy", "Finals MVP."),
  g("nybl-mythical5-91", "Tournaments", "Coach-A player number 91 receiving a Mythical 5 medal from league officials", "Mythical 5 medal."),
  g("nybl-coaching-staff-trophy", "Team Activities", "Coach-A coaching staff celebrating with the trophy courtside", "The coaching staff with the trophy."),
  g("arena-front", "Camp Highlights", "Front view of the branded CA Triple Threat arena court", `Center-court view. ${concept}`),
  g("arena-overhead", "Camp Highlights", "Overhead view of the branded court with the CA logo at center", `Overhead court layout. ${concept}`),
  g("arena-hoop", "Basketball Training", "Low-angle view approaching the hoop", `The approach to the hoop. ${concept}`),
  g("arena-angle", "Skills Development", "Three-quarter view of the court and arena seating", `Three-quarter court. ${concept}`),
  g("arena-high", "Tournaments", "Elevated view of the arena and court", `Elevated arena view. ${concept}`),
];

export const contact = {
  heading: "YOUR JOURNEY STARTS HERE.",
  text: "Ready to take the next step? Connect with our coaching team.",
  inquiryTypes: ["Basketball Camp", "Training Schedule", "Coaching Inquiry", "Merch Order", "Partnership", "Other"] as const,
  ageGroups: ["Under 10", "10–12", "13–15", "16–18", "Adult / not applicable"] as const,
  guardianNote:
    "Inquiring for a child? Please have a parent or guardian submit this form and provide their own contact details. We don't ask for any unnecessary information about minors.",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "info@coachatriplethreat.com",
  whatsapp: process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || "+63 991 308 9629",
  location:
    process.env.NEXT_PUBLIC_CONTACT_LOCATION ||
    "Pio & Fiesta Community, Porac · Sta. Trinidad, Angeles City — Pampanga, Philippines",
  social: [
    { label: "Facebook", href: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || "https://www.facebook.com/share/19aipvG6gE/" },
    { label: "Instagram", href: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || "" },
    { label: "YouTube", href: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE || "" },
  ].filter((s) => s.href),
};

export const NO_AGE = "Adult / not applicable";
