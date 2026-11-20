import { achievements, coaches, contact } from "./content";

export type Reply = { from: "dudoy"; text: string; link?: { label: string; href: string } };

export const sectionPoses: Record<string, { pose: string; say: string }> = {
  home: { pose: "ball", say: "Hi! I'm Dudoy 🏀 Tap me if you have questions!" },
  about: { pose: "cool", say: "Fundamentals, discipline, teamwork, confidence." },
  coaches: { pose: "point", say: "Meet Coach A and the staff! 🏆" },
  mindset: { pose: "shh", say: "Shh… the game begins in the mind." },
  gallery: { pose: "spin", say: "Check out our training clips!" },
  contact: { pose: "jump", say: "Ready? Join the camp! 🙌" },
};

export const idlePoses = ["dribble", "sit", "jump"];
export const greeting = {
  src: "/dudoy/voice-hello.mp3",
  text: "Hey Future Champion, practice muna bago yabang! 🏀",
};
export const suggestions = [
  "How do I join?",
  "Where do you train?",
  "Who are the coaches?",
  "What ages?",
  "Achievements",
  "Contact",
];

const form = { label: "Open the inquiry form", href: "#contact" };

/** Built-in answers, used when the remote assistant is unavailable. */
export function localReply(q: string): Reply {
  const a = q.toLowerCase();
  const head = coaches.find((c) => c.featured);
  const assistants = coaches.filter((c) => !c.featured && /coach/i.test(c.role)).map((c) => c.name).join(", ");
  if (/join|enrol|enroll|sign ?up|register|apply|tryout/.test(a))
    return { from: "dudoy", text: "Send us an inquiry with the form — a coach will reply by email. If the player is under 18, please have a parent or guardian send it.", link: form };
  if (/where|venue|location|address|train(ing)? (at|where)|court/.test(a))
    return { from: "dudoy", text: "We train at Pio, Porac · Fiesta Community, Porac · Sta. Trinidad, Angeles City (Pampanga). 1-on-1 and group clinics with Coach Allen are at On Stage, 3rd Floor, Robinsons Balibago." };
  if (/coach|staff|who/.test(a))
    return { from: "dudoy", text: `Our Head Coach & Founder is ${head?.name ?? "Coach Allen Cano"}. Assistant coaches: ${assistants}.`, link: { label: "See the coaches", href: "#coaches" } };
  if (/age|old|year|division|kid|u\b|under/.test(a))
    return { from: "dudoy", text: "Our teams compete in 11U, 12U, 13U, 14U, 15U and 17U divisions. Ask about your player's age group in the form!", link: form };
  if (/achiev|champ|trophy|win|won|title|mvp/.test(a))
    return { from: "dudoy", text: `We've earned ${achievements.length} titles and placements — like Champion KBA D-League 2026 (17U) and NYBL Season 4 Champions (17U).`, link: { label: "See achievements", href: "#coaches" } };
  if (/sched|time|when|day|hour/.test(a))
    return { from: "dudoy", text: "The training schedule hasn't been posted yet — ask the coaches through the form and they'll send it.", link: form };
  if (/price|cost|fee|pay|how much|free/.test(a))
    return { from: "dudoy", text: "For fees and programs, please ask the coaches directly — they'll give you the right details for your player.", link: form };
  if (/contact|email|phone|whatsapp|message|call/.test(a))
    return { from: "dudoy", text: `Email ${contact.email}${contact.whatsapp ? ` or WhatsApp ${contact.whatsapp}` : ""}. Or use the inquiry form!`, link: form };
  if (/hi|hello|hey|kumusta|musta/.test(a))
    return { from: "dudoy", text: "Hey! 👋 What do you want to know about the camp?" };
  return { from: "dudoy", text: "Good question! I'm not sure about that one — the coaches can answer it.", link: form };
}
