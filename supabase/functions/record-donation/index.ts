import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const DAY_MS = 24 * 60 * 60 * 1000;
const DONATION_INTERVAL_DAYS = 56;

const PLAUSIBLE_RANGES = {
  volumeMl: [300, 500],
  weightKg: [30, 250],
  haemoglobinGdl: [5, 25],
  systolic: [60, 250],
  diastolic: [30, 150],
  pulseBpm: [30, 220],
  temperatureC: [30, 43],
} as const;

const ELIGIBILITY = {
  minWeightKg: 50,
  minHaemoglobinGdl: 12.5,
  systolic: [90, 180],
  diastolic: [50, 110],
  pulseBpm: [50, 100],
  maxTemperatureC: 37.5,
} as const;

type Screening = {
  staffCode: string;
  donorId: string;
  centreName: string;
  volumeMl: number;
  weightKg: number;
  haemoglobinGdl: number;
  systolic: number;
  diastolic: number;
  pulseBpm: number;
  temperatureC: number;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isNumberInRange(value: unknown, [min, max]: readonly [number, number]): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

function parseScreening(body: Record<string, unknown>): Screening | string {
  const { staffCode, donorId, centreName } = body;
  if (typeof staffCode !== "string" || staffCode.length === 0 || staffCode.length > 200) {
    return "Enter the staff access code.";
  }
  if (typeof donorId !== "string" || !/^[0-9a-f-]{36}$/i.test(donorId)) return "Choose a donor first.";
  if (typeof centreName !== "string" || centreName.trim().length < 2 || centreName.trim().length > 120) {
    return "Enter the donation centre name.";
  }
  const numbers = {
    volumeMl: body.volumeMl,
    weightKg: body.weightKg,
    haemoglobinGdl: body.haemoglobinGdl,
    systolic: body.systolic,
    diastolic: body.diastolic,
    pulseBpm: body.pulseBpm,
    temperatureC: body.temperatureC,
  };
  for (const [key, value] of Object.entries(numbers)) {
    if (!isNumberInRange(value, PLAUSIBLE_RANGES[key as keyof typeof PLAUSIBLE_RANGES])) {
      return `The value for ${key} is missing or outside the accepted range.`;
    }
  }
  return {
    staffCode,
    donorId,
    centreName: centreName.trim(),
    volumeMl: numbers.volumeMl as number,
    weightKg: numbers.weightKg as number,
    haemoglobinGdl: numbers.haemoglobinGdl as number,
    systolic: numbers.systolic as number,
    diastolic: numbers.diastolic as number,
    pulseBpm: numbers.pulseBpm as number,
    temperatureC: numbers.temperatureC as number,
  };
}

function constantTimeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  let difference = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index++) {
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }
  return difference === 0;
}

function isoDate(time: number): string {
  return new Date(time).toISOString().slice(0, 10);
}

function eligibilityProblems(screening: Screening): string[] {
  const problems: string[] = [];
  if (screening.weightKg < ELIGIBILITY.minWeightKg) problems.push("Donor weight is below 50 kg.");
  if (screening.haemoglobinGdl < ELIGIBILITY.minHaemoglobinGdl) problems.push("Haemoglobin is below 12.5 g/dL.");
  if (screening.systolic < ELIGIBILITY.systolic[0] || screening.systolic > ELIGIBILITY.systolic[1]) {
    problems.push("Systolic blood pressure is outside 90 to 180 mmHg.");
  }
  if (screening.diastolic < ELIGIBILITY.diastolic[0] || screening.diastolic > ELIGIBILITY.diastolic[1]) {
    problems.push("Diastolic blood pressure is outside 50 to 110 mmHg.");
  }
  if (screening.pulseBpm < ELIGIBILITY.pulseBpm[0] || screening.pulseBpm > ELIGIBILITY.pulseBpm[1]) {
    problems.push("Pulse is outside 50 to 100 beats per minute.");
  }
  if (screening.temperatureC > ELIGIBILITY.maxTemperatureC) problems.push("Temperature is above 37.5 C.");
  return problems;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

    const expectedCode = Deno.env.get("STAFF_ACCESS_CODE");
    if (!expectedCode) {
      return json({ error: "Donation recording is not switched on yet. Ask the Blood Bridge team to set it up." }, 503);
    }

    const rawBody = await req.json().catch(() => null);
    if (!rawBody || typeof rawBody !== "object") return json({ error: "The request could not be read." }, 400);

    const parsed = parseScreening(rawBody as Record<string, unknown>);
    if (typeof parsed === "string") return json({ error: parsed }, 400);

    if (!constantTimeEqual(parsed.staffCode, expectedCode)) {
      return json({ error: "The staff access code is incorrect." }, 403);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: donor, error: donorError } = await supabase
      .from("donors")
      .select("id, blood_group, last_donated_on")
      .eq("id", parsed.donorId)
      .maybeSingle();
    if (donorError) {
      console.error("donor lookup failed", donorError);
      return json({ error: "The donor could not be loaded. Please try again." }, 500);
    }
    if (!donor) return json({ error: "This donor could not be found." }, 404);

    const { data: lastDonation, error: lastError } = await supabase
      .from("donations")
      .select("donated_on")
      .eq("donor_id", donor.id)
      .order("donated_on", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (lastError) {
      console.error("last donation lookup failed", lastError);
      return json({ error: "The donation history could not be checked. Please try again." }, 500);
    }

    const today = isoDate(Date.now());
    const latestKnown = [lastDonation?.donated_on, donor.last_donated_on]
      .filter((value): value is string => typeof value === "string")
      .sort()
      .pop();
    const problems = eligibilityProblems(parsed);

    if (latestKnown) {
      const daysSince = Math.floor((Date.parse(today) - Date.parse(latestKnown)) / DAY_MS);
      if (daysSince < DONATION_INTERVAL_DAYS) {
        problems.push(`The donor last donated ${daysSince} days ago. At least ${DONATION_INTERVAL_DAYS} days are required.`);
      }
    }

    if (problems.length > 0) {
      return json({ error: "This donor is not eligible to donate today.", reasons: problems }, 422);
    }

    const { data: existingPassport, error: passportLookupError } = await supabase
      .from("donor_passports")
      .select("id, passport_code")
      .eq("donor_id", donor.id)
      .maybeSingle();
    if (passportLookupError) {
      console.error("passport lookup failed", passportLookupError);
      return json({ error: "The donor passport could not be loaded. Please try again." }, 500);
    }

    let passport = existingPassport;
    if (!passport) {
      const { data: created, error: createError } = await supabase
        .from("donor_passports")
        .insert({ donor_id: donor.id })
        .select("id, passport_code")
        .single();
      if (createError) {
        console.error("passport creation failed", createError);
        return json({ error: "The donor passport could not be created. Please try again." }, 500);
      }
      passport = created;
    }

    const { data: donation, error: donationError } = await supabase
      .from("donations")
      .insert({
        donor_id: donor.id,
        passport_id: passport.id,
        donated_on: today,
        blood_group: donor.blood_group,
        centre_name: parsed.centreName,
        volume_ml: parsed.volumeMl,
        weight_kg: parsed.weightKg,
        haemoglobin_g_dl: parsed.haemoglobinGdl,
        blood_pressure: `${parsed.systolic}/${parsed.diastolic} mmHg`,
        pulse_bpm: parsed.pulseBpm,
        temperature_c: parsed.temperatureC,
      })
      .select("certificate_code, certificate_number")
      .single();
    if (donationError) {
      console.error("donation insert failed", donationError);
      return json({ error: "The donation could not be saved. Please try again." }, 500);
    }

    return json({
      passportCode: passport.passport_code,
      certificateCode: donation.certificate_code,
      certificateNumber: donation.certificate_number,
      donatedOn: today,
      nextEligibleOn: isoDate(Date.parse(today) + DONATION_INTERVAL_DAYS * DAY_MS),
    });
  } catch (error) {
    console.error("record-donation failed", error);
    return json({ error: "Something went wrong while recording the donation." }, 500);
  }
});
