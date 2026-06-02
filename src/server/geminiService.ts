import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ GEMINI_API_KEY not found in environment. AI bio suggestions will fall back to local template builder.");
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

interface SuggestBioParams {
  fullName: string;
  categoryLabel: string;
  specialties: string[];
  experienceYears: number;
  locationLabel: string;
  gender?: string;
  isBN: boolean;
  notes?: string;
}

export async function suggestBio(params: SuggestBioParams): Promise<string> {
  const {
    fullName,
    categoryLabel,
    specialties,
    experienceYears,
    locationLabel,
    gender,
    isBN,
    notes
  } = params;

  const client = getGeminiClient();

  if (!client) {
    // Elegant fallback bio builder
    if (isBN) {
      const specText = specialties.length > 0 ? `আমার বিশেষ সুবিশাল দক্ষতার ক্ষেত্র হল ${specialties.join(', ')}।` : '';
      return `নমস্কার, আমি ${fullName}। আমি একজন পেশাদার ${categoryLabel} হিসেবে দীর্ঘ ${experienceYears || 0} বছর যাবত ${locationLabel || 'কুষ্টিয়া/খুলনা'} অঞ্চলে অত্যন্ত সুনামের সাথে সেবা প্রদান করে আসছি। ${specText} কাজের মান এবং গ্রাহকের সন্তুষ্টিই আমার সর্বোচ্চ অগ্রাধিকার। যেকোনো প্রয়োজনে আমার সাথে যোগাযোগ করতে পারেন। ${notes ? `\n\nবিশেষ দ্রষ্টব্য: ${notes}` : ''}`;
    } else {
      const specText = specialties.length > 0 ? ` My specialized areas include ${specialties.join(', ')}.` : '';
      return `Hello, I am ${fullName}. I am a professional ${categoryLabel} with over ${experienceYears || 0} years of extensive experience delivering premium service in the ${locationLabel || 'Kushtia/Khulna'} region.${specText} I am dedicated to executing the scope with clean layout, pristine execution, and excellent customer satisfaction. Please feel free to get in touch for any service requirements. ${notes ? `\n\nNote: ${notes}` : ''}`;
    }
  }

  try {
    const prompt = `Generate a professional, highly appealing, and polished bio details for a service professional registry.
Here are the user details:
- Full Name: ${fullName}
- Primary Category / Job Role: ${categoryLabel}
- Secondary Skills / Specialties: ${specialties.join(', ')}
- Years of Experience: ${experienceYears}
- Location: ${locationLabel}
- Selected Gender: ${gender || 'not specified'}
- Additional user notes / input: "${notes || 'None'}"
- Output Language: ${isBN ? 'Bengali (Bangla)' : 'English'}

Instructions:
- Write in a friendly, extremely polished, trustworthy, and skilled professional tone.
- Highlight their expertise, geographical area of service, and commitment to customer satisfaction.
- Keep the length between 3 to 5 sentences (approx. 80-120 words).
- Write in the first person ("আমি" for Bangla, "I" for English).
- Do not include system characters, quotes, markdown formatting (like asterisks), or placeholders. Return ONLY the polished plain text bio output.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
        systemInstruction: "You are an expert resume writer and recruiter specialized in vocational careers, craftsmanship, and local trade matchmakers."
      }
    });

    const output = response.text?.trim();
    if (output) return output;
    throw new Error("Empty response from model");
  } catch (error) {
    console.error("Failed to generate bio with Gemini API, falling back:", error);
    // Return template fallback in case of API failure
    if (isBN) {
      return `নমস্কার, আমি ${fullName}। আমি একজন পেশাদার ${categoryLabel} হিসেবে দীর্ঘ ${experienceYears || 0} বছর যাবত ${locationLabel || 'কুষ্টিয়া/খুলনা'} অঞ্চলে গ্রাহকদের সেবা প্রদান করে আসছি। কাজের নিখুঁত মান এবং গ্রাহক সন্তুষ্টি আমার মূল লক্ষ্য।`;
    } else {
      return `Hello, I'm ${fullName}. I have been practicing as a professional ${categoryLabel} for over ${experienceYears || 0} years in the ${locationLabel || 'Kushtia/Khulna'} region, focusing on delivering reliable and high-quality results.`;
    }
  }
}
