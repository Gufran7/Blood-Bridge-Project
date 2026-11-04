/**
 * AI Chatbot Engine for Blood Bridge
 * Connects to Google Gemini API when VITE_GEMINI_API_KEY is available,
 * and seamlessly falls back to an intelligent, context-aware clinical knowledge engine.
 */

import { BLOOD_GROUPS, CAN_DONATE_TO, CAN_RECEIVE_FROM, type BloodGroup } from '@/lib/bloodGroups';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  link?: { label: string; href: string };
  timestamp: string;
};

const SYSTEM_PROMPT = `
You are Blood Bridge AI, the intelligent virtual clinical assistant for the Blood Bridge Blood Donation Platform.
Your purpose is to assist users with:
1. Blood donation eligibility and preparation following Indian National Blood Transfusion Council (NBTC) and WHO guidelines.
2. Blood group compatibility (ABO and Rh systems, universal donor O-, universal recipient AB+).
3. Finding verified hospitals and blood banks in Solapur, Maharashtra (e.g. Civil Hospital, Damani Blood Centre, Hedgewar Blood Bank).
4. Navigating the Blood Bridge platform (Donor Registration, Blood Requests, Donor Passport, Digital Certificates, Document Uploads).
5. General educational questions about blood biology, plasma, platelets, and transfusion medicine.

SAFETY BOUNDARIES (CRITICAL):
- NEVER provide medical diagnoses or prescribe medications.
- If a user mentions chest pain, severe bleeding, breathing difficulty, or critical emergencies, instruct them to call Indian Emergency (112 or 108) or go immediately to the nearest hospital casualty (e.g. Solapur Civil Hospital 0217 2731900).
- Keep answers professional, concise, empathetic, and clear. Format with bullet points where appropriate.
`;

/**
 * Checks for configured Gemini API key
 */
export function isGeminiConfigured(): boolean {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  return typeof key === 'string' && key.trim().length > 10;
}

/**
 * Calls Gemini API if key is present
 */
async function callGeminiApi(
  message: string,
  history: ChatMessage[]
): Promise<{ text: string; link?: { label: string; href: string } } | null> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    // Add recent conversational history (up to last 6 turns)
    const recent = history.slice(-6);
    const contents = [
      {
        role: 'user',
        parts: [{ text: `${SYSTEM_PROMPT}\n\nUser Question: ${message}` }],
      },
      ...recent.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      })),
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 600,
          },
        }),
      }
    );

    if (!response.ok) {
      console.warn('Gemini API call failed with status:', response.status);
      return null;
    }

    const data = await response.json();
    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (replyText) {
      return { text: replyText.trim() };
    }
  } catch (err) {
    console.error('Error invoking Gemini API:', err);
  }

  return null;
}

/**
 * Context-aware intelligent clinical knowledge engine fallback
 */
function getIntelligentFallback(message: string): {
  text: string;
  link?: { label: string; href: string };
} {
  const m = message.toLowerCase().trim();

  // 1. Emergency Detection
  if (/\b(dying|critical|accident|urgent|emergency|severe bleeding|heart attack|chest pain|icu|immediate)\b/.test(m)) {
    return {
      text: '⚠️ MEDICAL EMERGENCY ALERT: If someone requires immediate blood or emergency treatment, contact the nearest hospital immediately or dial 112 / 108. In Solapur, you can call Civil Hospital at 0217 2731900 or Smt. Gopabai Damani Blood Centre at 0217 2726858 (24/7). You can also post an urgent request on Blood Bridge.',
      link: { label: 'Post Urgent Blood Request', href: '#request-blood' },
    };
  }

  // 2. Solapur Hospital or Blood Bank query
  if (/\b(solapur|hospital|hospitals|blood bank|bank|banks|damani|hedgewar|civil|ashwini|markandeya|mule|athar|akshay|bolli)\b/.test(m)) {
    // Specific hospital search
    if (m.includes('damani')) {
      return {
        text: '🏥 Smt. Gopabai Damani Blood Centre is located at Damani Blood Bank Building, Near Civil Hospital, Civil Lines, Solapur. Verified 24/7 contact: 0217 2726858 / 0217 2722106. They provide whole blood, PRBC, platelets, and FFP.',
        link: { label: 'View on Interactive Map', href: '#blood-banks' },
      };
    }
    if (m.includes('hedgewar')) {
      return {
        text: '🏥 Dr. Hedgewar Blood Bank is located at 44, Gold Finch Peth, Solapur. Verified contact: 0217 2311281 / 0217 2311215. Open 24 hours for emergency blood supply.',
        link: { label: 'View on Interactive Map', href: '#blood-banks' },
      };
    }
    if (m.includes('civil')) {
      return {
        text: '🏥 Civil Hospital Solapur (Chhatrapati Shivaji Maharaj Sarvopchar Rugnalaya) is located at Civil Chowk, Solapur. Verified emergency contact: 0217 2731900. Blood Bank contact: 0217 2310766. Operates 24/7 trauma and transfusion facilities.',
        link: { label: 'View on Interactive Map', href: '#blood-banks' },
      };
    }
    return {
      text: 'Blood Bridge has 20 verified hospitals and blood banks in Solapur with real telephone numbers, GPS coordinates, operating hours, and turn-by-turn directions. You can view them on the interactive map with live distance calculation.',
      link: { label: 'Explore Solapur Directory & Map', href: '#blood-banks' },
    };
  }

  // 3. Blood Group Compatibility
  const bgMatch = m.match(/\b(ab\+|ab-|a\+|a-|b\+|b-|o\+|o-)\b/i);
  if (bgMatch) {
    const bg = bgMatch[1].toUpperCase() as BloodGroup;
    if (BLOOD_GROUPS.includes(bg)) {
      const gives = CAN_DONATE_TO[bg].join(', ');
      const gets = CAN_RECEIVE_FROM[bg].join(', ');
      return {
        text: `🩸 Blood Group ${bg} Compatibility:\n• Can donate to: ${gives}\n• Can receive from: ${gets}\n\nDid you know? O- is the universal red cell donor, while AB+ is the universal recipient.`,
        link: { label: 'View Full Compatibility Matrix', href: '#compatibility' },
      };
    }
  }

  // 4. Eligibility & Guidelines
  if (/\b(eligible|eligibility|can i donate|weight|age|criteria|qualify|requirements|who can donate)\b/.test(m)) {
    return {
      text: 'Under Indian NBTC guidelines, basic criteria to donate whole blood are:\n• Age: 18 to 65 years\n• Weight: At least 50 kg\n• Haemoglobin: Minimum 12.5 g/dL (tested free at centre)\n• Blood Pressure: Systolic 100-140, Diastolic 60-90 mmHg\n• Waiting period: 90 days (males) / 120 days (females) between donations.\n\nUse our step-by-step Eligibility Checker for an immediate assessment.',
      link: { label: 'Launch Eligibility Checker', href: '#eligibility' },
    };
  }

  // 5. Tattoos, Piercings, Surgery, Fever
  if (/\b(tattoo|piercing|needle|acupuncture)\b/.test(m)) {
    return {
      text: '💉 Tattoo and Piercing Guidelines: Under Indian national guidelines, you must wait 6 months following any tattoo, body piercing, or acupuncture procedure before donating blood. This window ensures all viral hepatitis markers can be safely confirmed.',
      link: { label: 'Check Your Eligibility', href: '#eligibility' },
    };
  }

  if (/\b(fever|cold|cough|infection|sick|ill|flu|antibiotic|medicine)\b/.test(m)) {
    return {
      text: '🩺 Illness & Medication Guidelines: You must be completely symptom-free with no fever for at least 14 days before donating. If you completed a course of antibiotics, you must also wait 14 days following your last dose before donating blood.',
      link: { label: 'Take Eligibility Assessment', href: '#eligibility' },
    };
  }

  if (/\b(alcohol|drinking|beer|wine|liquor)\b/.test(m)) {
    return {
      text: '🍷 Alcohol Policy: Donors must not consume alcohol for at least 24 hours prior to blood donation. Alcohol induces dehydration, lowers blood pressure, and significantly increases the risk of fainting or dizziness.',
      link: { label: 'Read Pre-Donation Tips', href: '#eligibility' },
    };
  }

  // 6. Passport & Certificate
  if (/\b(passport|certificate|qr|verification|document|upload|id card)\b/.test(m)) {
    return {
      text: '📄 Donor Passport & Health Verification:\n• Your digital Donor Passport tracks your verified donation history and next eligible donation date.\n• You can upload government photo ID (Aadhaar, Voter ID, License) and blood group certificates for official verification.\n• Each completed donation generates an authenticated digital certificate with a verifiable QR code.',
      link: { label: 'Open Donor Passport Hub', href: '#/passport' },
    };
  }

  // 7. How to Register / Request
  if (/\b(register|sign up|join|become donor|donor list)\b/.test(m)) {
    return {
      text: 'Joining Blood Bridge is free and takes less than 1 minute. Enter your name, blood group, city, and verified 10-digit Indian mobile number so local patients and hospitals can reach you when in need.',
      link: { label: 'Join Donor Registry', href: '#find-donors' },
    };
  }

  if (/\b(request|need blood|patient|units|hospital blood)\b/.test(m)) {
    return {
      text: 'To request blood, click "Request Blood" to enter patient details, required blood group, units, hospital, and city. Matching registered donors and local blood banks will immediately see your request.',
      link: { label: 'Post a Blood Request', href: '#request-blood' },
    };
  }

  // 8. Greetings & General
  if (/\b(hi|hello|hey|good morning|good evening|namaste|help)\b/.test(m)) {
    return {
      text: 'Namaste! I am Blood Bridge Assistant, your dedicated healthcare AI companion. I can answer questions regarding blood donation criteria, compatibility, Solapur blood banks, donor passports, or how to request blood. How may I help you today?',
    };
  }

  // Default Knowledge Response
  return {
    text: 'I can answer questions regarding blood group compatibility, donation eligibility under Indian standards, Solapur blood centres, donor passports, or requesting blood. For medical emergencies, please visit the nearest hospital or dial 112 / 108.',
    link: { label: 'Browse Blood Banks Directory', href: '#blood-banks' },
  };
}

/**
 * Main export to get bot response
 */
export async function getAiChatReply(
  message: string,
  history: ChatMessage[]
): Promise<{ text: string; link?: { label: string; href: string } }> {
  // If Gemini is configured, attempt API call first
  if (isGeminiConfigured()) {
    const apiReply = await callGeminiApi(message, history);
    if (apiReply) return apiReply;
  }

  // Instant clinical fallback engine
  return getIntelligentFallback(message);
}
