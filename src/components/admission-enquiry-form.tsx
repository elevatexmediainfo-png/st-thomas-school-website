"use client";

import { useState, type FormEvent } from "react";
import { submitAdmissionEnquiry } from "@/app/admin/phase-four-actions";

export function AdmissionEnquiryForm() {
	const [submitted, setSubmitted] = useState(false);
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");
		setIsSubmitting(true);
		const form = event.currentTarget;
		try {
			const result = await submitAdmissionEnquiry(new FormData(form));
			if (result?.error) {
				setError(result.error);
				return;
			}
			form.reset();
			setSubmitted(true);
		} catch {
			setError("We could not submit the enquiry. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	}

	if (submitted) return <div className="contact-success" role="status"><span>✓</span><h3>Enquiry received</h3><p>Your enquiry has been sent to the school.</p><button type="button" onClick={() => setSubmitted(false)}>Send another enquiry</button></div>;

	return <form className="enquiry-form" onSubmit={handleSubmit} noValidate>
		<label className="enquiry-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
		<label>Parent / Guardian Name<input name="guardianName" autoComplete="name" required maxLength={160} /></label>
		<label>Student Name<input name="studentName" autoComplete="off" required maxLength={160} /></label>
		<label>Phone<input name="phone" type="tel" autoComplete="tel" inputMode="tel" required /></label>
		<label>Email<input name="email" type="email" autoComplete="email" required /></label>
		<label>Class / Grade<input name="classGrade" maxLength={100} /></label>
		<label>Message<textarea name="message" rows={4} required maxLength={5000} /></label>
		{error && <p className="contact-form-error" role="alert">{error}</p>}
		<button className="button button-dark" type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit enquiry"} <span aria-hidden="true">↗</span></button>
	</form>;
}
