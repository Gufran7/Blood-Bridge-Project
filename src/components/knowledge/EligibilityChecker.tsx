import { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  HeartPulse,
  Info,
  RotateCcw,
  Scale,
  ShieldCheck,
  Stethoscope,
  XCircle,
} from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { BLOOD_GROUPS, type BloodGroup } from '@/lib/bloodGroups';

type DeferralType = 'none' | 'temporary' | 'permanent';

type DeferralReason = {
  category: string;
  rule: string;
  explanation: string;
  deferralPeriod?: string;
};

type EligibilityState = {
  // Step 1: Basics
  age: number | '';
  weight: number | '';
  bloodGroup: BloodGroup | 'unknown' | '';
  // Step 2: Vitals
  bpStatus: 'normal' | 'controlled' | 'high_uncontrolled' | 'unknown';
  haemoglobinStatus: 'adequate' | 'low' | 'unknown'; // >= 12.5 g/dL
  // Step 3: Medical Conditions
  diabetesStatus: 'none' | 'diet_tablet_controlled' | 'insulin_dependent';
  takingAntibiotics: boolean | null;
  chronicConditions: boolean | null; // Heart, kidney, liver, epilepsy, cancer, HIV, Hep B/C
  // Step 4: Recent History & Lifestyle
  hasFeverOrIllness: boolean | null; // Last 14 days
  recentSurgeryOrDental: boolean | null; // Last 6-12 months
  recentTattooOrPiercing: boolean | null; // Last 6 months
  alcoholInLast24h: boolean | null;
  donatedInLast90Days: boolean | null;
  // Step 5: Women's Health
  isFemale: boolean | null;
  pregnancyOrLactation: boolean | null;
};

const INITIAL_STATE: EligibilityState = {
  age: '',
  weight: '',
  bloodGroup: '',
  bpStatus: 'unknown',
  haemoglobinStatus: 'adequate',
  diabetesStatus: 'none',
  takingAntibiotics: false,
  chronicConditions: false,
  hasFeverOrIllness: false,
  recentSurgeryOrDental: false,
  recentTattooOrPiercing: false,
  alcoholInLast24h: false,
  donatedInLast90Days: false,
  isFemale: null,
  pregnancyOrLactation: false,
};

export function EligibilityChecker() {
  const [step, setStep] = useState<number>(1);
  const [data, setData] = useState<EligibilityState>(INITIAL_STATE);

  const reset = () => {
    setData(INITIAL_STATE);
    setStep(1);
  };

  // Evaluate eligibility according to Indian NBTC (National Blood Transfusion Council) guidelines
  const evaluateEligibility = (): {
    status: DeferralType;
    reasons: DeferralReason[];
  } => {
    const reasons: DeferralReason[] = [];
    let permanent = false;

    // Age Check (18 to 65 years)
    const ageNum = Number(data.age);
    if (ageNum && (ageNum < 18 || ageNum > 65)) {
      reasons.push({
        category: 'Age Criterion',
        rule: 'Must be between 18 and 65 years of age.',
        explanation:
          ageNum < 18
            ? 'Individuals under 18 cannot legally donate whole blood in India.'
            : 'Donors over 65 are deferred for cardiovascular and general health safety.',
        deferralPeriod: ageNum < 18 ? 'Eligible once you turn 18' : 'Permanent deferral for first-time donors over 65',
      });
      if (ageNum > 65) permanent = true;
    }

    // Weight Check (At least 50 kg)
    const weightNum = Number(data.weight);
    if (weightNum && weightNum < 50) {
      reasons.push({
        category: 'Weight Criterion',
        rule: 'Donor weight must be at least 50 kg (110 lb).',
        explanation:
          'Indian regulations require donors to weigh at least 50 kg for a standard 350ml or 450ml donation to prevent dizziness and hypovolemia.',
        deferralPeriod: 'Deferred until weight reaches 50 kg',
      });
    }

    // Chronic Conditions
    if (data.chronicConditions === true) {
      permanent = true;
      reasons.push({
        category: 'Medical History',
        rule: 'No chronic cardiovascular, renal, hepatic, or blood-borne conditions.',
        explanation:
          'History of Hepatitis B/C, HIV, cardiac disease, kidney failure, epilepsy, or cancer requires permanent deferral under national safety guidelines.',
        deferralPeriod: 'Permanent deferral',
      });
    }

    // Diabetes Insulin
    if (data.diabetesStatus === 'insulin_dependent') {
      reasons.push({
        category: 'Diabetes Mellitus',
        rule: 'Donors taking insulin injections are deferred.',
        explanation:
          'Oral medication or diet-controlled diabetes with normal blood sugar is acceptable, but insulin dependence requires deferral for donor metabolic balance.',
        deferralPeriod: 'Deferred while taking insulin',
      });
    }

    // Blood Pressure
    if (data.bpStatus === 'high_uncontrolled') {
      reasons.push({
        category: 'Blood Pressure',
        rule: 'Blood pressure must be within normal ranges (Systolic 100–140, Diastolic 60–90 mmHg).',
        explanation:
          'Uncontrolled hypertension or severe hypotension puts donor safety at risk during and after donation.',
        deferralPeriod: 'Deferred until blood pressure is stable under medical guidance',
      });
    }

    // Haemoglobin
    if (data.haemoglobinStatus === 'low') {
      reasons.push({
        category: 'Haemoglobin Level',
        rule: 'Haemoglobin level must be at least 12.5 g/dL.',
        explanation:
          'A simple finger-prick test is conducted at the centre. Levels below 12.5 g/dL lead to deferral to prevent anemia.',
        deferralPeriod: 'Deferred until Hb levels recover to ≥ 12.5 g/dL (rich iron diet / iron supplements)',
      });
    }

    // Antibiotics
    if (data.takingAntibiotics === true) {
      reasons.push({
        category: 'Active Medication',
        rule: 'No active course of antibiotics or recent acute infection.',
        explanation:
          'Antibiotics indicate an active bacterial infection. Blood can only be donated after completing the course and full recovery.',
        deferralPeriod: 'Wait 14 days after completing your antibiotic course',
      });
    }

    // Recent Illness / Fever
    if (data.hasFeverOrIllness === true) {
      reasons.push({
        category: 'Recent Infection / Fever',
        rule: 'Donor must be symptom-free with no fever for at least 14 days.',
        explanation:
          'Viral infections, seasonal flu, typhoid, or dengue require an observation recovery period.',
        deferralPeriod: 'Wait 14 days after complete recovery and no fever symptoms',
      });
    }

    // Tattoos / Piercings
    if (data.recentTattooOrPiercing === true) {
      reasons.push({
        category: 'Tattoo or Body Piercing',
        rule: '6-month wait required after obtaining a tattoo, piercing, or acupuncture.',
        explanation:
          'Official Indian guidelines mandate a 6-month deferral following any needle-based skin penetration to ensure the window period for viral hepatitis has cleared.',
        deferralPeriod: 'Wait 6 months from the date of the procedure',
      });
    }

    // Recent Surgery or Dental
    if (data.recentSurgeryOrDental === true) {
      reasons.push({
        category: 'Surgical or Dental Procedures',
        rule: 'Major surgeries require a 6 to 12 month waiting period; dental extractions require 3 to 7 days.',
        explanation:
          'Post-surgical healing and invasive dental work involve transient bacteremia and tissue healing.',
        deferralPeriod: '3–7 days for dental work; 6–12 months for major surgery',
      });
    }

    // Alcohol
    if (data.alcoholInLast24h === true) {
      reasons.push({
        category: 'Alcohol Consumption',
        rule: 'No alcohol within 24 hours prior to blood donation.',
        explanation:
          'Alcohol promotes dehydration, lowers blood pressure, and may cause vasovagal fainting reactions during donation.',
        deferralPeriod: 'Wait 24 hours from your last alcoholic drink',
      });
    }

    // Donation Interval (90 days for men, 120 days for women)
    if (data.donatedInLast90Days === true) {
      reasons.push({
        category: 'Donation Interval',
        rule: 'Minimum 90 days (males) / 120 days (females) between whole blood donations.',
        explanation:
          'Your bone marrow requires time to replenish red blood cell volume and iron reserves completely.',
        deferralPeriod: 'Wait until 90 days (male) or 120 days (female) have elapsed from your last donation',
      });
    }

    // Pregnancy / Lactation
    if (data.pregnancyOrLactation === true) {
      reasons.push({
        category: 'Pregnancy & Lactation',
        rule: 'Women cannot donate during pregnancy, lactation, or within 12 months after delivery.',
        explanation:
          'To protect the nutritional status, iron stores, and health of both mother and infant.',
        deferralPeriod: 'Wait 12 months post-childbirth or after concluding breastfeeding',
      });
    }

    if (permanent) return { status: 'permanent', reasons };
    if (reasons.length > 0) return { status: 'temporary', reasons };
    return { status: 'none', reasons: [] };
  };

  const evaluation = evaluateEligibility();

  return (
    <section id="eligibility" className="relative scroll-mt-24 border-y border-white/10 bg-ink-950/70 py-24 sm:py-28">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Clinical Self-Assessment"
            title="Blood Donation Eligibility Checker"
            description="Evaluate your readiness to donate blood based on official Indian guidelines (National Blood Transfusion Council & MoHFW)."
          />
          <button
            type="button"
            onClick={reset}
            className="btn-ghost flex items-center gap-1.5 self-start px-3.5 py-2 text-xs font-semibold text-ink-300 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Checker
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-4">
            {[
              { num: 1, title: 'Basics & Vitals' },
              { num: 2, title: 'Medical Health' },
              { num: 3, title: 'Recent History' },
              { num: 4, title: 'Lifestyle' },
              { num: 5, title: 'Results' },
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${
                    step === s.num
                      ? 'bg-ruby-500 text-white shadow-[0_0_12px_rgba(224,49,63,0.5)]'
                      : step > s.num
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-white/5 text-ink-400'
                  }`}
                >
                  {step > s.num ? '✓' : s.num}
                </div>
                <span
                  className={`text-xs font-semibold hidden md:inline ${
                    step === s.num ? 'text-ink-100' : 'text-ink-500'
                  }`}
                >
                  {s.title}
                </span>
                {s.num < 5 && <ChevronRight className="h-3.5 w-3.5 text-ink-600 hidden sm:inline" />}
              </div>
            ))}
          </div>

          {/* Step 1: Basics & Vitals */}
          {step === 1 && (
            <div className="mt-6 space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-ink-100 flex items-center gap-2">
                  <Scale className="h-5 w-5 text-ruby-400" />
                  Step 1: Age, Weight & Blood Group
                </h3>
                <p className="text-xs text-ink-400">
                  National regulations require donors to meet physiological criteria for safe volume extraction.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-ink-300">
                    Your Age (in years) <span className="text-ruby-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    placeholder="e.g. 24 (Must be 18–65)"
                    value={data.age}
                    onChange={(e) => setData({ ...data, age: e.target.value ? parseInt(e.target.value) : '' })}
                    className="input text-sm"
                  />
                  <p className="text-[11px] text-ink-500">Legal donation age in India: 18 to 65 years.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-ink-300">
                    Your Weight (in kg) <span className="text-ruby-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="200"
                    placeholder="e.g. 62 (Min 50 kg)"
                    value={data.weight}
                    onChange={(e) => setData({ ...data, weight: e.target.value ? parseInt(e.target.value) : '' })}
                    className="input text-sm"
                  />
                  <p className="text-[11px] text-ink-500">Standard Indian safety cutoff: Minimum 50 kg.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-ink-300">Blood Group (if known)</label>
                  <select
                    value={data.bloodGroup}
                    onChange={(e) => setData({ ...data, bloodGroup: e.target.value as BloodGroup | 'unknown' | '' })}
                    className="input text-sm"
                  >
                    <option value="">Select Blood Group</option>
                    {BLOOD_GROUPS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                    <option value="unknown">I don&apos;t know my group (tested at centre)</option>
                  </select>
                  <p className="text-[11px] text-ink-500">Blood group is confirmed free at every donation centre.</p>
                </div>
              </div>

              {/* Gender selector for conditional questions */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <label className="text-xs font-semibold text-ink-300">Biological Sex (for physiological criteria)</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-ink-200 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      checked={data.isFemale === false}
                      onChange={() => setData({ ...data, isFemale: false })}
                      className="accent-ruby-500"
                    />
                    <span>Male</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-ink-200 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      checked={data.isFemale === true}
                      onChange={() => setData({ ...data, isFemale: true })}
                      className="accent-ruby-500"
                    />
                    <span>Female</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  disabled={!data.age || !data.weight}
                  onClick={() => setStep(2)}
                  className="btn-primary flex items-center gap-2 px-5 py-2.5 text-xs font-bold disabled:opacity-50"
                >
                  Next: Medical Health
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Medical Health & Medications */}
          {step === 2 && (
            <div className="mt-6 space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-ink-100 flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-ruby-400" />
                  Step 2: Medical Conditions & Medications
                </h3>
                <p className="text-xs text-ink-400">
                  Assess chronic conditions, diabetes status, and ongoing antibiotic medications.
                </p>
              </div>

              <div className="space-y-4">
                {/* Diabetes */}
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-ink-200">Diabetes Status</label>
                    <span className="text-[11px] text-ink-400">Oral medicines vs Insulin</span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {[
                      { value: 'none', label: 'No Diabetes' },
                      { value: 'diet_tablet_controlled', label: 'Controlled on diet / tablet' },
                      { value: 'insulin_dependent', label: 'Taking Insulin injections' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setData({ ...data, diabetesStatus: opt.value as 'none' | 'diet_tablet_controlled' | 'insulin_dependent' })}
                        className={`rounded-xl border p-3 text-left text-xs transition ${
                          data.diabetesStatus === opt.value
                            ? 'border-ruby-500 bg-ruby-500/15 text-white font-semibold'
                            : 'border-white/10 bg-white/[0.02] text-ink-300 hover:border-white/20'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chronic Conditions */}
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-ink-200">
                      History of chronic conditions (Heart, Kidney, Epilepsy, Cancer, Hepatitis B/C, HIV)?
                    </p>
                    <p className="text-[11px] text-ink-400">
                      National guidelines require permanent deferral for active cardiovascular or blood-borne illnesses.
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setData({ ...data, chronicConditions: false })}
                      className={`px-4 py-2 rounded-lg text-xs font-bold border transition ${
                        data.chronicConditions === false
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                          : 'border-white/10 text-ink-300'
                      }`}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => setData({ ...data, chronicConditions: true })}
                      className={`px-4 py-2 rounded-lg text-xs font-bold border transition ${
                        data.chronicConditions === true
                          ? 'border-ruby-500 bg-ruby-500/20 text-ruby-300'
                          : 'border-white/10 text-ink-300'
                      }`}
                    >
                      Yes
                    </button>
                  </div>
                </div>

                {/* Antibiotics */}
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-ink-200">
                      Are you currently taking antibiotics or completed a course in the past 14 days?
                    </p>
                    <p className="text-[11px] text-ink-400">
                      Antibiotics treat active bacterial infections. Donors must be 14 days post-course.
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setData({ ...data, takingAntibiotics: false })}
                      className={`px-4 py-2 rounded-lg text-xs font-bold border transition ${
                        data.takingAntibiotics === false
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                          : 'border-white/10 text-ink-300'
                      }`}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => setData({ ...data, takingAntibiotics: true })}
                      className={`px-4 py-2 rounded-lg text-xs font-bold border transition ${
                        data.takingAntibiotics === true
                          ? 'border-ruby-500 bg-ruby-500/20 text-ruby-300'
                          : 'border-white/10 text-ink-300'
                      }`}
                    >
                      Yes
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-ghost flex items-center gap-1.5 px-4 py-2 text-xs"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn-primary flex items-center gap-2 px-5 py-2.5 text-xs font-bold"
                >
                  Next: Recent History
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Recent History & Illness */}
          {step === 3 && (
            <div className="mt-6 space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-ink-100 flex items-center gap-2">
                  <HeartPulse className="h-5 w-5 text-ruby-400" />
                  Step 3: Recent Illness & Procedures
                </h3>
                <p className="text-xs text-ink-400">
                  Assess temporary deferral triggers like fever, recent tattoos, or surgeries.
                </p>
              </div>

              <div className="space-y-4">
                {/* Fever / Cold */}
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-ink-200">
                      Have you had fever, cough, flu, or active viral symptoms in the last 14 days?
                    </p>
                    <p className="text-[11px] text-ink-400">
                      Donors must be symptom-free for a full 14 days before donation.
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setData({ ...data, hasFeverOrIllness: false })}
                      className={`px-4 py-2 rounded-lg text-xs font-bold border transition ${
                        data.hasFeverOrIllness === false
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                          : 'border-white/10 text-ink-300'
                      }`}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => setData({ ...data, hasFeverOrIllness: true })}
                      className={`px-4 py-2 rounded-lg text-xs font-bold border transition ${
                        data.hasFeverOrIllness === true
                          ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                          : 'border-white/10 text-ink-300'
                      }`}
                    >
                      Yes
                    </button>
                  </div>
                </div>

                {/* Tattoos / Piercings */}
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-ink-200">
                      Have you had a tattoo, body piercing, or acupuncture in the past 6 months?
                    </p>
                    <p className="text-[11px] text-ink-400">
                      National guidelines mandate a 6-month deferral following needle procedures.
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setData({ ...data, recentTattooOrPiercing: false })}
                      className={`px-4 py-2 rounded-lg text-xs font-bold border transition ${
                        data.recentTattooOrPiercing === false
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                          : 'border-white/10 text-ink-300'
                      }`}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => setData({ ...data, recentTattooOrPiercing: true })}
                      className={`px-4 py-2 rounded-lg text-xs font-bold border transition ${
                        data.recentTattooOrPiercing === true
                          ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                          : 'border-white/10 text-ink-300'
                      }`}
                    >
                      Yes
                    </button>
                  </div>
                </div>

                {/* Surgery / Dental */}
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-ink-200">
                      Have you undergone major surgery in the last 6 months, or tooth extraction in the last 7 days?
                    </p>
                    <p className="text-[11px] text-ink-400">
                      Requires healing and absence of bacteremia before donation.
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setData({ ...data, recentSurgeryOrDental: false })}
                      className={`px-4 py-2 rounded-lg text-xs font-bold border transition ${
                        data.recentSurgeryOrDental === false
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                          : 'border-white/10 text-ink-300'
                      }`}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => setData({ ...data, recentSurgeryOrDental: true })}
                      className={`px-4 py-2 rounded-lg text-xs font-bold border transition ${
                        data.recentSurgeryOrDental === true
                          ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                          : 'border-white/10 text-ink-300'
                      }`}
                    >
                      Yes
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-ghost flex items-center gap-1.5 px-4 py-2 text-xs"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="btn-primary flex items-center gap-2 px-5 py-2.5 text-xs font-bold"
                >
                  Next: Lifestyle & Timing
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Lifestyle & Interval */}
          {step === 4 && (
            <div className="mt-6 space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-ink-100 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-ruby-400" />
                  Step 4: Lifestyle, Alcohol & Donation Interval
                </h3>
                <p className="text-xs text-ink-400">
                  Ensure proper physiological interval between consecutive blood donations.
                </p>
              </div>

              <div className="space-y-4">
                {/* Last Donation */}
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-ink-200">
                      Have you donated whole blood in the last 90 days (3 months)?
                    </p>
                    <p className="text-[11px] text-ink-400">
                      Indian guidelines recommend at least 90 days for men and 120 days for women between whole blood donations.
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setData({ ...data, donatedInLast90Days: false })}
                      className={`px-4 py-2 rounded-lg text-xs font-bold border transition ${
                        data.donatedInLast90Days === false
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                          : 'border-white/10 text-ink-300'
                      }`}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => setData({ ...data, donatedInLast90Days: true })}
                      className={`px-4 py-2 rounded-lg text-xs font-bold border transition ${
                        data.donatedInLast90Days === true
                          ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                          : 'border-white/10 text-ink-300'
                      }`}
                    >
                      Yes
                    </button>
                  </div>
                </div>

                {/* Alcohol */}
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-ink-200">
                      Have you consumed alcohol in the last 24 hours?
                    </p>
                    <p className="text-[11px] text-ink-400">
                      Alcohol dehydrates the donor and impacts vascular stability during donation.
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setData({ ...data, alcoholInLast24h: false })}
                      className={`px-4 py-2 rounded-lg text-xs font-bold border transition ${
                        data.alcoholInLast24h === false
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                          : 'border-white/10 text-ink-300'
                      }`}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => setData({ ...data, alcoholInLast24h: true })}
                      className={`px-4 py-2 rounded-lg text-xs font-bold border transition ${
                        data.alcoholInLast24h === true
                          ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                          : 'border-white/10 text-ink-300'
                      }`}
                    >
                      Yes
                    </button>
                  </div>
                </div>

                {/* Women's Health (Conditional) */}
                {data.isFemale && (
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-ink-200">
                        Are you currently pregnant, breastfeeding, or delivered within the last 12 months?
                      </p>
                      <p className="text-[11px] text-ink-400">
                        Essential to protect maternal hemoglobin and newborn nutrition.
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setData({ ...data, pregnancyOrLactation: false })}
                        className={`px-4 py-2 rounded-lg text-xs font-bold border transition ${
                          data.pregnancyOrLactation === false
                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                            : 'border-white/10 text-ink-300'
                        }`}
                      >
                        No
                      </button>
                      <button
                        type="button"
                        onClick={() => setData({ ...data, pregnancyOrLactation: true })}
                        className={`px-4 py-2 rounded-lg text-xs font-bold border transition ${
                          data.pregnancyOrLactation === true
                            ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                            : 'border-white/10 text-ink-300'
                        }`}
                      >
                        Yes
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn-ghost flex items-center gap-1.5 px-4 py-2 text-xs"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="btn-primary flex items-center gap-2 px-6 py-2.5 text-xs font-bold"
                >
                  View Final Evaluation Report
                  <ShieldCheck className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Comprehensive Results & Clinical Guidance */}
          {step === 5 && (
            <div className="mt-6 space-y-6">
              {/* Primary Status Banner */}
              {evaluation.status === 'none' ? (
                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30">
                      <CheckCircle2 className="h-7 w-7" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
                        Pre-Screening Result
                      </span>
                      <h3 className="text-xl font-bold text-ink-100">You Are Likely Eligible to Donate!</h3>
                    </div>
                  </div>
                  <p className="text-xs text-ink-300 leading-relaxed">
                    Based on your responses, you meet the primary criteria defined under Indian national blood donation
                    standards (NBTC / MoHFW). A brief medical checkup and hemoglobin screening will be done at the centre.
                  </p>

                  {/* Pre-donation advice */}
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-900/10 p-4 space-y-2">
                    <h4 className="text-xs font-bold text-emerald-300">Tips Before You Arrive at the Blood Centre:</h4>
                    <ul className="text-xs text-ink-300 space-y-1.5 list-disc list-inside">
                      <li>Drink 500 ml of water or non-caffeinated fluids 30 minutes before donating.</li>
                      <li>Eat a healthy, light meal 2 to 3 hours prior (avoid fasting or high-fat foods).</li>
                      <li>Avoid smoking for at least 2 hours before and after blood donation.</li>
                      <li>Carry a valid government photo ID card (Aadhaar, Voter ID, Driving License).</li>
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <a href="#blood-banks" className="btn-primary px-5 py-2.5 text-xs font-bold">
                      Find Nearest Solapur Blood Bank
                    </a>
                    <button
                      type="button"
                      onClick={reset}
                      className="btn-ghost px-4 py-2.5 text-xs font-semibold"
                    >
                      Check Another Donor
                    </button>
                  </div>
                </div>
              ) : evaluation.status === 'temporary' ? (
                <div className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30">
                      <AlertTriangle className="h-7 w-7" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
                        Pre-Screening Result
                      </span>
                      <h3 className="text-xl font-bold text-ink-100">Temporarily Deferred from Donating</h3>
                    </div>
                  </div>
                  <p className="text-xs text-ink-300 leading-relaxed">
                    You currently have one or more temporary conditions that require waiting for donor and recipient safety.
                    Once the deferral period expires, you can donate safely.
                  </p>

                  {/* Deferral Breakdown */}
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold text-ink-200">Specific Deferral Reasons:</h4>
                    {evaluation.reasons.map((r, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-amber-500/20 bg-amber-900/10 p-3.5 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-300">{r.category}</span>
                          <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-200">
                            ⏱ {r.deferralPeriod}
                          </span>
                        </div>
                        <p className="text-ink-300">{r.explanation}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="button"
                      onClick={reset}
                      className="btn-primary px-5 py-2.5 text-xs font-bold"
                    >
                      Re-Check Responses
                    </button>
                    <a href="#faq" className="btn-ghost px-4 py-2.5 text-xs font-semibold">
                      Read Frequently Asked Questions
                    </a>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-ruby-500/40 bg-ruby-950/20 p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ruby-500/20 text-ruby-400 ring-1 ring-ruby-500/30">
                      <XCircle className="h-7 w-7" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-ruby-400">
                        Pre-Screening Result
                      </span>
                      <h3 className="text-xl font-bold text-ink-100">Permanent Deferral Notice</h3>
                    </div>
                  </div>
                  <p className="text-xs text-ink-300 leading-relaxed">
                    Under Indian and WHO blood transfusion safety guidelines, individuals with certain ongoing medical
                    conditions cannot donate blood to prevent adverse complications.
                  </p>

                  <div className="space-y-2 pt-2">
                    {evaluation.reasons.map((r, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-ruby-500/20 bg-ruby-900/10 p-3.5 space-y-1 text-xs"
                      >
                        <span className="font-bold text-ruby-300">{r.category}</span>
                        <p className="text-ink-300">{r.explanation}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs text-ink-300">
                    <h4 className="font-bold text-ink-100 mb-1">You Can Still Save Lives!</h4>
                    <p>
                      Even if you cannot donate blood personally, you can make a huge impact by helping patients post blood
                      requests, organizing local donation camps, or encouraging eligible family and friends in Solapur to donate.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={reset}
                      className="btn-ghost px-4 py-2 text-xs font-semibold"
                    >
                      Start Over
                    </button>
                  </div>
                </div>
              )}

              {/* Statutory Clinical Disclaimer */}
              <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-[11px] text-ink-400 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-ink-300 uppercase tracking-wider text-[10px]">
                  <Info className="h-3.5 w-3.5 text-ruby-400" />
                  Statutory Medical Disclaimer & Indian Regulatory Guidelines
                </div>
                <p>
                  This self-assessment tool provides general screening guidance aligned with the <em>Drugs and Cosmetics Rules</em> and the{' '}
                  <em>National Blood Transfusion Council (NBTC)</em>, Ministry of Health and Family Welfare, Government of India.
                </p>
                <p className="text-amber-300/80 font-medium">
                  Important: This assessment does not provide a medical diagnosis. The final qualification and approval for blood donation
                  is conducted exclusively in person by registered medical officers at licensed blood centres following standard hemoglobin,
                  blood pressure, and pulse examinations.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
