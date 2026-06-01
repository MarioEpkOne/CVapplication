"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

interface FieldError {
  name?: string;
  email?: string;
  message?: string;
  company?: string;
}

export function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
    company: "",
    honeypot: "", // visually-hidden — bots fill it, humans don't
  });
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const submitMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setServerError(null);
    },
    onError: (err) => {
      if (err.data?.code === "TOO_MANY_REQUESTS") {
        setServerError("You've sent a few messages recently. Please try again shortly.");
      } else {
        setServerError("Couldn't send right now — please try again later.");
      }
    },
  });

  function validate(): FieldError {
    const errors: FieldError = {};
    if (!form.name.trim()) errors.name = "Name is required.";
    else if (form.name.trim().length > 120) errors.name = "Name is too long (max 120 chars).";
    if (!form.email.trim()) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      errors.email = "Enter a valid email address.";
    if (!form.message.trim()) errors.message = "Message is required.";
    else if (form.message.trim().length > 5000)
      errors.message = "Message is too long (max 5000 chars).";
    if (form.company.trim().length > 200) errors.company = "Company name is too long (max 200 chars).";
    return errors;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear field error on change
    if (e.target.name in fieldErrors) {
      setFieldErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    submitMutation.mutate({
      name: form.name,
      email: form.email,
      message: form.message,
      company: form.company || undefined,
      honeypot: form.honeypot || undefined,
    });
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-brand-200 bg-brand-50 p-6 text-center dark:border-brand-700 dark:bg-brand-900">
        <p className="font-semibold text-brand-700 dark:text-brand-300">Message sent!</p>
        <p className="mt-1 text-sm text-brand-600 dark:text-brand-400">
          Thanks for reaching out. I'll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="no-print space-y-4 rounded-lg border border-brand-200 bg-white/60 p-6 backdrop-blur-sm dark:border-brand-700 dark:bg-brand-900/60"
    >
      <h2 className="text-xl font-bold text-brand-800 dark:text-brand-200">Get in touch</h2>

      {/* Honeypot — visually hidden, off-screen, aria-hidden; bots fill it */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="honeypot"
          type="text"
          value={form.honeypot}
          onChange={handleChange}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Name */}
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-brand-700 dark:text-brand-300">
          Name <span aria-hidden>*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          value={form.name}
          onChange={handleChange}
          aria-describedby={fieldErrors.name ? "name-error" : undefined}
          className={cn(
            "w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-brand-500 dark:bg-brand-900 dark:text-brand-100",
            fieldErrors.name
              ? "border-red-500 focus:ring-red-400"
              : "border-brand-300 dark:border-brand-600"
          )}
        />
        {fieldErrors.name && (
          <p id="name-error" className="mt-1 text-xs text-red-600" role="alert">
            {fieldErrors.name}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-brand-700 dark:text-brand-300">
          Email <span aria-hidden>*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
          className={cn(
            "w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-brand-500 dark:bg-brand-900 dark:text-brand-100",
            fieldErrors.email
              ? "border-red-500 focus:ring-red-400"
              : "border-brand-300 dark:border-brand-600"
          )}
        />
        {fieldErrors.email && (
          <p id="email-error" className="mt-1 text-xs text-red-600" role="alert">
            {fieldErrors.email}
          </p>
        )}
      </div>

      {/* Company (optional) */}
      <div>
        <label htmlFor="company" className="mb-1 block text-sm font-medium text-brand-700 dark:text-brand-300">
          Company <span className="text-brand-400 dark:text-brand-500">(optional)</span>
        </label>
        <input
          id="company"
          name="company"
          type="text"
          autoComplete="organization"
          value={form.company}
          onChange={handleChange}
          aria-describedby={fieldErrors.company ? "company-error" : undefined}
          className={cn(
            "w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-brand-500 dark:bg-brand-900 dark:text-brand-100",
            fieldErrors.company
              ? "border-red-500 focus:ring-red-400"
              : "border-brand-300 dark:border-brand-600"
          )}
        />
        {fieldErrors.company && (
          <p id="company-error" className="mt-1 text-xs text-red-600" role="alert">
            {fieldErrors.company}
          </p>
        )}
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-brand-700 dark:text-brand-300">
          Message <span aria-hidden>*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          value={form.message}
          onChange={handleChange}
          aria-describedby={fieldErrors.message ? "message-error" : undefined}
          className={cn(
            "w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-brand-500 dark:bg-brand-900 dark:text-brand-100",
            fieldErrors.message
              ? "border-red-500 focus:ring-red-400"
              : "border-brand-300 dark:border-brand-600"
          )}
        />
        {fieldErrors.message && (
          <p id="message-error" className="mt-1 text-xs text-red-600" role="alert">
            {fieldErrors.message}
          </p>
        )}
      </div>

      {/* Server error */}
      {serverError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400" role="alert">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitMutation.isPending}
        className="rounded-md bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        {submitMutation.isPending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
