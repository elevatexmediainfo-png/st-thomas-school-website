"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";

export function LoginForm() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (!email || !password) {
      setError("Enter your email and password to continue.");
      setIsLoading(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", { email, password, redirect: false, callbackUrl: "/admin" });
      if (!result || result.error) {
        setError("Unable to sign in with those details.");
        setIsLoading(false);
        return;
      }

      window.location.assign(result.url ?? "/admin");
    } catch {
      setError("Unable to sign in with those details.");
      setIsLoading(false);
    }
  }

  return <form className="admin-login-form" onSubmit={handleSubmit} noValidate><label>Email<input name="email" type="email" autoComplete="username" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label>{error && <p className="admin-auth-error" role="alert">{error}</p>}<button className="button button-dark" type="submit" disabled={isLoading}>{isLoading ? "Signing in..." : "Sign in"}<span aria-hidden="true">↗</span></button></form>;
}