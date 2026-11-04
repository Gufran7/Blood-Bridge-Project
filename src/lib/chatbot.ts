import { BLOOD_GROUPS, CAN_DONATE_TO, CAN_RECEIVE_FROM, type BloodGroup } from '@/lib/bloodGroups';

export type ChatLink = { label: string; href: string };

export type ChatReply = { text: string; link?: ChatLink };

const EMERGENCY_NOTE =
  'This chat cannot give medical advice. For urgent medical questions, speak with a doctor or the nearest hospital.';

function findBloodGroup(message: string): BloodGroup | null {
  const match = message.match(/\b(AB|A|B|O)\s?([+-])/i);
  if (!match) return null;
  const group = `${match[1].toUpperCase()}${match[2]}` as BloodGroup;
  return BLOOD_GROUPS.includes(group) ? group : null;
}

function has(message: string, pattern: RegExp): boolean {
  return pattern.test(message);
}

type Rule = {
  test: (message: string) => boolean;
  reply: (message: string) => ChatReply;
};

const RULES: Rule[] = [
  {
    test: (m) => has(m, /\b(hi|hello|hey|good (morning|afternoon|evening))\b/),
    reply: () => ({
      text: 'Hello! I can help with eligibility, blood groups, donating, requesting blood, and donor passports and certificates. What would you like to know?',
    }),
  },
  {
    test: (m) => has(m, /\b(emergency|urgent|urgently|accident|dying|surgery)\b/),
    reply: () => ({
      text: `If someone needs blood right now, contact the nearest hospital or blood bank directly, or call your local emergency number. You can also post a blood request so nearby donors can respond. ${EMERGENCY_NOTE}`,
      link: { label: 'Post a blood request', href: '#request-blood' },
    }),
  },
  {
    test: (m) => findBloodGroup(m) !== null,
    reply: (m) => {
      const group = findBloodGroup(m) as BloodGroup;
      return {
        text: `${group} can donate to ${CAN_DONATE_TO[group].join(', ')}. ${group} can receive from ${CAN_RECEIVE_FROM[group].join(', ')}.`,
        link: { label: 'See the full chart', href: '#compatibility' },
      };
    },
  },
  {
    test: (m) => has(m, /\b(blood group|blood type|blood types|blood groups)\b/),
    reply: () => ({
      text: `There are eight blood groups: ${BLOOD_GROUPS.join(', ')}. Ask me about a specific group, such as "Can O- donate to A+?", to see who it works with.`,
      link: { label: 'See the full chart', href: '#compatibility' },
    }),
  },
  {
    test: (m) => has(m, /\b(eligible|eligibility|who can donate|can i donate|am i able|criteria|requirements)\b/),
    reply: () => ({
      text: `To donate whole blood you should be 18 to 65 years old, weigh at least 50 kg, feel well with no fever, and have not donated in the last 56 days. Tattoos and piercings usually need a 6-month wait, and active infections or antibiotic courses usually rule out donating for now. The donation centre makes the final decision after screening. ${EMERGENCY_NOTE}`,
      link: { label: 'Check your eligibility', href: '#eligibility' },
    }),
  },
  {
    test: (m) => has(m, /\b(how often|how long|wait|waiting|56|next donation|next eligible|last donat)\b/),
    reply: () => ({
      text: 'Whole blood donations need at least 56 days (8 weeks) between them. Your donor passport shows your donation history and the date you can next donate.',
      link: { label: 'Open my passport', href: '#/passport' },
    }),
  },
  {
    test: (m) => has(m, /\bcertificate/),
    reply: () => ({
      text: 'After each donation at a Blood Bridge centre you receive a digital donation certificate with a QR code. It lists your screening results and eligibility. It is a record of your donation, not a medical certificate.',
    }),
  },
  {
    test: (m) => has(m, /\b(passport|qr|scan|history)\b/),
    reply: () => ({
      text: 'Your first donation creates a donor passport with a QR code. Scanning it shows your donation history and your next eligible date. You can open your passport with the code given to you at the centre.',
      link: { label: 'Open my passport', href: '#/passport' },
    }),
  },
  {
    test: (m) => has(m, /\b(centre|center|staff|record donation|record a donation)\b/),
    reply: () => ({
      text: 'Donation centres record donations with a staff access code. Donors are looked up at the centre, and the screening results are checked before each donation.',
      link: { label: 'Open the donation centre', href: '#/centre' },
    }),
  },
  {
    test: (m) => has(m, /\b(register|become a donor|join|sign up|sign me up)\b/),
    reply: () => ({
      text: 'To join the donor list, use the "Become a Donor" button at the top of the page. Add your blood group and city, and patients nearby can reach you.',
    }),
  },
  {
    test: (m) => has(m, /\b(request|need blood|need a donor|need donors|looking for blood)\b/),
    reply: () => ({
      text: 'To ask for blood, post a blood request with the blood group, number of units and hospital. Compatible donors and blood banks can see it straight away.',
      link: { label: 'Post a blood request', href: '#request-blood' },
    }),
  },
  {
    test: (m) => has(m, /\b(find|search|donors? near|donor list|donors in)\b/),
    reply: () => ({
      text: 'You can search the donor list by blood group and city to find people who are available to donate.',
      link: { label: 'Search donors', href: '#find-donors' },
    }),
  },
  {
    test: (m) => has(m, /\b(bank|banks|hospital|hospitals|clinic)\b/),
    reply: () => ({
      text: 'The Blood Banks section lists partner blood banks and hospitals so you can check where to go.',
      link: { label: 'View blood banks', href: '#blood-banks' },
    }),
  },
  {
    test: (m) => has(m, /\b(faq|question|questions|help)\b/),
    reply: () => ({
      text: 'The FAQ answers the most common questions about donating and receiving blood.',
      link: { label: 'Read the FAQ', href: '#faq' },
    }),
  },
];

const FALLBACK_REPLY: ChatReply = {
  text: 'I am not sure about that one. Try asking about eligibility, blood group compatibility, donating, requesting blood, or donor passports and certificates. For medical questions, please speak with a doctor or the donation centre.',
};

export const SUGGESTED_QUESTIONS = [
  'Am I eligible to donate?',
  'Which blood groups are compatible?',
  'How does my donor passport work?',
  'How do I request blood?',
];

export function getChatReply(message: string): ChatReply {
  const normalized = message.trim().toLowerCase();
  const rule = RULES.find((candidate) => candidate.test(normalized));
  return rule ? rule.reply(normalized) : FALLBACK_REPLY;
}
