import { useMemo, useState } from "react";
import MultiSelect, { type Option } from "./components/MultiSelect";
import {
  isSupabaseConfigured,
  REGISTRATIONS_TABLE,
  supabase,
} from "./lib/supabase";

const INTEREST_OPTIONS: Option[] = [
  { value: "web", label: "Web Development" },
  { value: "app", label: "App Development" },
  { value: "aiml", label: "AI / Machine Learning" },
  { value: "data", label: "Data Science / Data Analytics" },
  { value: "uiux", label: "UI/UX & Design" },
  { value: "cyber", label: "Cybersecurity" },
  { value: "iot", label: "IoT / Embedded Systems" },
  { value: "blockchain", label: "Blockchain / Web3" },
  { value: "research", label: "Research / Experimental Projects" },
  { value: "startup", label: "Startup / Innovation Projects" },
  { value: "marketing", label: "Marketing / Social Media" },
  { value: "other", label: "Other" },
];

const OTHER_VALUE = "other";

interface FormState {
  name: string;
  sapId: string;
  year: string;
  contact: string;
  email: string;
  interests: string[];
  otherInterest: string;
}

type Errors = Partial<Record<keyof FormState, string>>;

const EMPTY: FormState = {
  name: "",
  sapId: "",
  year: "",
  contact: "",
  email: "",
  interests: [],
  otherInterest: "",
};

// ── Validation ──────────────────────────────────────────────────────────────
const EMAIL_RE = /^[a-zA-Z]+\.[a-zA-Z0-9]+@stu\.upes\.ac\.in$/;
const NAME_RE = /^[A-Za-z][A-Za-z .'-]{1,}$/;

function validate(f: FormState): Errors {
  const e: Errors = {};

  if (!f.name.trim()) e.name = "Please enter your full name.";
  else if (!NAME_RE.test(f.name.trim()))
    e.name = "Use letters only (min 2 characters).";

  if (!f.sapId) e.sapId = "Please enter your SAP ID.";
  else if (!/^\d{9}$/.test(f.sapId)) e.sapId = "SAP ID must be 9 digits.";

  if (!f.year) e.year = "Please select your year.";

  if (!f.contact) e.contact = "Please enter your contact number.";
  else if (!/^[6-9]\d{9}$/.test(f.contact))
    e.contact = "Enter a valid 10-digit mobile number.";

  if (!f.email.trim()) e.email = "Please enter your college email.";
  else if (!EMAIL_RE.test(f.email.trim()))
    e.email = "Use your UPES email: name.xxxxx@stu.upes.ac.in";

  if (f.interests.length === 0)
    e.interests = "Select at least one project interest.";

  if (f.interests.includes(OTHER_VALUE) && !f.otherInterest.trim())
    e.otherInterest = "Please describe your 'Other' interest.";

  // Cross-check: the roll number in the email (name.xxxxx@…) must match the
  // last 5 digits of the SAP ID. Only runs once both pass their own format.
  if (!e.sapId && !e.email) {
    const emailRoll = f.email.trim().split("@")[0].split(".")[1] ?? "";
    const sapLast5 = f.sapId.slice(-5);
    if (emailRoll.replace(/\D/g, "") !== sapLast5) {
      e.email = `The number in your email (${emailRoll}) must match the last 5 digits of your SAP ID (${sapLast5}).`;
    }
  }

  return e;
}

export default function App() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false); // has a submit been attempted?
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [formError, setFormError] = useState<string | null>(null);

  const showOther = form.interests.includes(OTHER_VALUE);

  // Live-revalidate only after the first submit attempt, so users aren't nagged
  // while they're still typing the first time through.
  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    const next = { ...form, [key]: value };
    setForm(next);
    if (submitted) setErrors(validate(next));
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSubmitted(true);
    setFormError(null);

    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    if (!supabase) {
      setFormError(
        "Registration is temporarily unavailable — the database connection isn't configured. Please contact the Hypervision team.",
      );
      return;
    }

    setStatus("sending");

    // Human-readable labels for whoever reads the table.
    const interestLabels = form.interests
      .filter((v) => v !== OTHER_VALUE)
      .map((v) => INTEREST_OPTIONS.find((o) => o.value === v)?.label ?? v);
    if (form.interests.includes(OTHER_VALUE)) interestLabels.push("Other");

    const payload = {
      name: form.name.trim(),
      sap_id: form.sapId,
      year: Number(form.year),
      contact: form.contact,
      email: form.email.trim().toLowerCase(),
      interests: interestLabels,
      other_interest: showOther ? form.otherInterest.trim() : null,
    };

    const { error } = await supabase
      .from(REGISTRATIONS_TABLE)
      .insert(payload);

    if (error) {
      // 23505 = unique_violation (duplicate SAP ID / email).
      if (error.code === "23505") {
        setFormError(
          "It looks like you've already registered with this SAP ID or email.",
        );
      } else {
        setFormError(
          "Something went wrong while submitting. Please try again in a moment.",
        );
        console.error("Supabase insert failed:", error);
      }
      setStatus("idle");
      return;
    }

    setStatus("done");
  };

  const resetForm = () => {
    setForm(EMPTY);
    setErrors({});
    setSubmitted(false);
    setStatus("idle");
    setFormError(null);
  };

  const year = new Date().getFullYear();
  const headerBlock = useMemo(
    () => (
      <header className="masthead">
        <div className="brand-row">
          <a
            className="logo-btn"
            href="https://recruitment.upeshypervision.in"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit the UPES Hypervision main site"
          >
            <img src="/logo.png" alt="Hypervision" />
          </a>
          <h1 className="brand-name">HYPERVISION</h1>
        </div>
        <p className="brand-title">Code Connect</p>
      </header>
    ),
    [],
  );

  if (status === "done") {
    return (
      <div className="page">
        {headerBlock}
        <div className="card">
          <div className="success">
            <div className="badge" aria-hidden="true">
              <svg
                width="38"
                height="38"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h2>Registration Successful! 🎉</h2>
            <p>
              Your registration for Code Connect is complete
              {form.name.trim() ? `, ${form.name.trim().split(" ")[0]}` : ""}.
              We've saved your details and will reach out with next steps soon.
            </p>
            <button type="button" className="ghost-btn" onClick={resetForm}>
              Register another response
            </button>
          </div>
        </div>
        <p className="footer">© {year} Hypervision · UPES</p>
      </div>
    );
  }

  return (
    <div className="page">
      {headerBlock}

      <form className="card" onSubmit={handleSubmit} noValidate>
        {!isSupabaseConfigured && (
          <div className="form-alert" role="alert">
            ⚠️ Supabase isn’t configured yet (missing <code>.env.local</code>), so
            submissions won’t be saved. Add the env vars and restart the dev
            server.
          </div>
        )}
        {formError && (
          <div className="form-alert" role="alert">
            {formError}
          </div>
        )}

        {/* Name */}
        <div className="field">
          <label className="label" htmlFor="name">
            Full Name<span className="req">*</span>
          </label>
          <input
            id="name"
            className={`input${errors.name ? " invalid" : ""}`}
            type="text"
            autoComplete="name"
            placeholder="e.g. Aarav Sharma"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
          {errors.name && <FieldError msg={errors.name} />}
        </div>

        {/* SAP ID */}
        <div className="field">
          <label className="label" htmlFor="sapId">
            SAP ID<span className="req">*</span>
          </label>
          <input
            id="sapId"
            className={`input${errors.sapId ? " invalid" : ""}`}
            type="text"
            inputMode="numeric"
            placeholder="5900XXXXX"
            maxLength={9}
            value={form.sapId}
            onChange={(e) =>
              update("sapId", e.target.value.replace(/\D/g, "").slice(0, 9))
            }
          />
          {errors.sapId ? (
            <FieldError msg={errors.sapId} />
          ) : (
            <span className="hint">9-digit university SAP ID.</span>
          )}
        </div>

        {/* Year */}
        <div className="field">
          <label className="label" htmlFor="year">
            Year<span className="req">*</span>
          </label>
          <select
            id="year"
            className={`select${errors.year ? " invalid" : ""}`}
            value={form.year}
            onChange={(e) => update("year", e.target.value)}
          >
            <option value="" disabled>
              Select your year
            </option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
          {errors.year && <FieldError msg={errors.year} />}
        </div>

        {/* Contact */}
        <div className="field">
          <label className="label" htmlFor="contact">
            Contact Number<span className="req">*</span>
          </label>
          <input
            id="contact"
            className={`input${errors.contact ? " invalid" : ""}`}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="10-digit mobile number"
            maxLength={10}
            value={form.contact}
            onChange={(e) =>
              update("contact", e.target.value.replace(/\D/g, "").slice(0, 10))
            }
          />
          {errors.contact && <FieldError msg={errors.contact} />}
        </div>

        {/* Email */}
        <div className="field">
          <label className="label" htmlFor="email">
            College Email ID<span className="req">*</span>
          </label>
          <input
            id="email"
            className={`input${errors.email ? " invalid" : ""}`}
            type="email"
            autoComplete="email"
            placeholder="name.xxxxx@stu.upes.ac.in"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
          {errors.email ? (
            <FieldError msg={errors.email} />
          ) : (
            <span className="hint">Must be your @stu.upes.ac.in address.</span>
          )}
        </div>

        {/* Interests */}
        <div className="field">
          <label className="label" htmlFor="interests">
            Which type of project are you interested in?
            <span className="req">*</span>
          </label>
          <MultiSelect
            id="interests"
            options={INTEREST_OPTIONS}
            selected={form.interests}
            onChange={(next) => update("interests", next)}
            invalid={!!errors.interests}
            placeholder="Select all that apply"
          />
          {errors.interests && <FieldError msg={errors.interests} />}

          {showOther && (
            <div style={{ marginTop: 12 }}>
              <input
                className={`input${errors.otherInterest ? " invalid" : ""}`}
                type="text"
                placeholder="Tell us about your 'Other' interest"
                value={form.otherInterest}
                onChange={(e) => update("otherInterest", e.target.value)}
              />
              {errors.otherInterest && (
                <FieldError msg={errors.otherInterest} />
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="submit"
          disabled={status === "sending"}
        >
          {status === "sending" ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Submitting…
            </>
          ) : (
            "Submit Registration"
          )}
        </button>
      </form>

      <p className="footer">
        © {year} Hypervision · UPES ·{" "}
        <a
          href="https://recruitment.upeshypervision.in"
          target="_blank"
          rel="noopener noreferrer"
        >
          Main site
        </a>
      </p>
    </div>
  );
}

function FieldError({ msg }: { msg: string }) {
  return (
    <span className="error" role="alert">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      {msg}
    </span>
  );
}
