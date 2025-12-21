/**
 * Script to help diagnose production environment variable issues
 * Run with: npx tsx scripts/check-production-env.ts
 */

console.log("🔍 Checking Production Environment Configuration\n");

const requiredVars = [
  "AUTH_URL",
  "NEXTAUTH_URL", 
  "AUTH_SECRET",
  "NEXTAUTH_SECRET",
  "DATABASE_URL",
  "AUTH_GOOGLE_ID",
  "AUTH_GOOGLE_SECRET",
];

const warnings: string[] = [];
const errors: string[] = [];

console.log("📋 Environment Variable Status:");
console.log("─".repeat(50));

requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? "✅" : "❌";
  const display = value 
    ? (value.length > 50 ? `${value.substring(0, 47)}...` : value)
    : "NOT SET";
  
  console.log(`${status} ${varName.padEnd(20)} ${display}`);
  
  if (!value) {
    errors.push(`Missing: ${varName}`);
  }
});

console.log("\n🌐 Auth URL Configuration:");
console.log("─".repeat(50));

const authUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL;
if (authUrl) {
  console.log(`✅ Auth URL: ${authUrl}`);
  
  if (authUrl.includes("localhost")) {
    warnings.push("AUTH_URL contains 'localhost' - this will NOT work in production!");
    console.log("⚠️  WARNING: Contains 'localhost' - update for production!");
  }
  
  if (!authUrl.startsWith("https://") && process.env.NODE_ENV === "production") {
    warnings.push("AUTH_URL should use HTTPS in production");
    console.log("⚠️  WARNING: Should use HTTPS in production");
  }
} else {
  errors.push("No AUTH_URL or NEXTAUTH_URL set");
  console.log("❌ No AUTH_URL or NEXTAUTH_URL set");
}

console.log("\n🔐 Auth Secret:");
console.log("─".repeat(50));

const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
if (secret) {
  console.log(`✅ Secret set (${secret.length} characters)`);
  if (secret.length < 32) {
    warnings.push("AUTH_SECRET should be at least 32 characters");
    console.log("⚠️  WARNING: Secret is short, recommend at least 32 characters");
  }
} else {
  errors.push("No AUTH_SECRET or NEXTAUTH_SECRET set");
  console.log("❌ No AUTH_SECRET or NEXTAUTH_SECRET set");
}

console.log("\n🗄️  Database Configuration:");
console.log("─".repeat(50));

const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  // Parse database URL to check if it's localhost
  try {
    const url = new URL(dbUrl.replace("postgresql://", "http://").replace("postgres://", "http://"));
    const isLocalhost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    
    console.log(`✅ Database URL: ${url.hostname}:${url.port || '(default)'}`);
    
    if (isLocalhost && process.env.NODE_ENV === "production") {
      warnings.push("Database is localhost - this will NOT work in production!");
      console.log("❌ CRITICAL: Database is localhost - production cannot access this!");
      console.log("   You need a cloud database (Railway, Supabase, PlanetScale, etc.)");
    }
  } catch (e) {
    console.log(`⚠️  Could not parse DATABASE_URL`);
  }
} else {
  errors.push("DATABASE_URL not set");
  console.log("❌ DATABASE_URL not set");
}

console.log("\n🔑 Google OAuth:");
console.log("─".repeat(50));

const googleId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID;
const googleSecret = process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET;

if (googleId) {
  console.log(`✅ Google Client ID: ${googleId.substring(0, 20)}...`);
} else {
  errors.push("Google Client ID not set");
  console.log("❌ Google Client ID not set");
}

if (googleSecret) {
  console.log(`✅ Google Client Secret: ${googleSecret.substring(0, 10)}...`);
  
  if (!googleSecret.startsWith("GOCSPX-")) {
    warnings.push("Google Client Secret should start with 'GOCSPX-'");
    console.log("⚠️  WARNING: Google secrets usually start with 'GOCSPX-'");
  }
} else {
  errors.push("Google Client Secret not set");
  console.log("❌ Google Client Secret not set");
}

// Summary
console.log("\n" + "=".repeat(50));
console.log("📊 Summary:");
console.log("=".repeat(50));

if (errors.length === 0 && warnings.length === 0) {
  console.log("✅ All checks passed!");
} else {
  if (errors.length > 0) {
    console.log(`\n❌ ${errors.length} Error(s):`);
    errors.forEach(err => console.log(`   - ${err}`));
  }
  
  if (warnings.length > 0) {
    console.log(`\n⚠️  ${warnings.length} Warning(s):`);
    warnings.forEach(warn => console.log(`   - ${warn}`));
  }
}

console.log("\n💡 Next Steps:");
console.log("─".repeat(50));

if (authUrl?.includes("localhost")) {
  console.log("1. Set AUTH_URL to your production domain in Vercel");
  console.log("   Example: AUTH_URL=https://your-app.vercel.app");
}

if (dbUrl?.includes("localhost")) {
  console.log("2. Migrate to a cloud database:");
  console.log("   - Railway: https://railway.app");
  console.log("   - Supabase: https://supabase.com");
  console.log("   - PlanetScale: https://planetscale.com");
}

if (errors.length > 0) {
  console.log("3. Add missing environment variables to Vercel");
  console.log("4. Redeploy your application");
}

console.log("\n🔗 Helpful Links:");
console.log("─".repeat(50));
console.log("• Vercel Env Vars: https://vercel.com/docs/environment-variables");
console.log("• NextAuth.js Config: https://next-auth.js.org/configuration/options");
console.log("• Your Debug Page: /auth-debug");

process.exit(errors.length > 0 ? 1 : 0);





