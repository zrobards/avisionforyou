/**
 * Server-side reCAPTCHA verification
 */
export async function verifyRecaptcha(token: string): Promise<{ success: boolean; score?: number; error?: string }> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    console.error("❌ RECAPTCHA_SECRET_KEY is not set");
    return { success: false, error: "reCAPTCHA not configured" };
  }

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();

    if (!data.success) {
      console.error("❌ reCAPTCHA verification failed:", data["error-codes"]);
      return { success: false, error: "reCAPTCHA verification failed" };
    }

    // reCAPTCHA v3 returns a score (0.0 - 1.0)
    // 0.0 is very likely a bot, 1.0 is very likely a human
    const score = data.score || 0;
    console.log("✅ reCAPTCHA verification successful. Score:", score);

    // You can adjust this threshold based on your needs
    // 0.5 is a common middle ground
    if (score < 0.5) {
      return { success: false, score, error: "Suspicious activity detected" };
    }

    return { success: true, score };
  } catch (error) {
    console.error("❌ reCAPTCHA verification error:", error);
    return { success: false, error: "reCAPTCHA verification failed" };
  }
}











