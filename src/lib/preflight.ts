import { createClient } from "@supabase/supabase-js";
import { disableRemoteDatabase } from "./supabaseService";

/**
 * Preflight health check to verify environment variables, database connectivity,
 * and required configuration before the AAN Platform starts up.
 * 
 * Instead of hard-crashing with process.exit(1), configuration or table issues
 * gracefully demote the session to Sandbox (In-Memory) mode so that the web app
 * boots successfully and the developer can read the onboarding instructions.
 */
export async function runPreflightCheck(): Promise<void> {
  console.log("\n==============================================================");
  console.log("[AAN PREFLIGHT] RUNNING DEPLOYMENT & INTEGRITY HEALTH CHECKS...");
  console.log("==============================================================\n");

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // 1. Environment Variable Consistency Check
  if (supabaseUrl && !supabaseServiceKey) {
    console.error("⚠️ [AAN CONFIG WARNING] Missing Required Environment Variable!");
    console.error("--------------------------------------------------------------");
    console.error("SUPABASE_URL is defined, but SUPABASE_SERVICE_ROLE_KEY is missing.");
    console.error("Switching to: DEVELOPMENT SANDBOX MODE (In-Memory State)");
    console.error("Please configure SUPABASE_SERVICE_ROLE_KEY inside your .env file to enable persistence.");
    console.error("--------------------------------------------------------------\n");
    disableRemoteDatabase();
    return;
  }

  if (!supabaseUrl && supabaseServiceKey) {
    console.error("⚠️ [AAN CONFIG WARNING] Missing Required Environment Variable!");
    console.error("--------------------------------------------------------------");
    console.error("SUPABASE_SERVICE_ROLE_KEY is defined, but SUPABASE_URL is missing.");
    console.error("Switching to: DEVELOPMENT SANDBOX MODE (In-Memory State)");
    console.error("Please configure SUPABASE_URL inside your .env file to enable persistence.");
    console.error("--------------------------------------------------------------\n");
    disableRemoteDatabase();
    return;
  }

  // 2. Local Fallback vs Live Supabase Database Branching
  if (!supabaseUrl && !supabaseServiceKey) {
    console.log("ℹ️ [AAN PREFLIGHT] REMOTE DATABASE NOT CONFIGURED");
    console.log("--------------------------------------------------------------");
    console.log("No Supabase configuration detected in process.env.");
    console.log("AAN Platform is starting in: DEVELOPMENT SANDBOX MODE (In-Memory State)");
    console.log("To connect a live cloud database, set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
    console.log("--------------------------------------------------------------\n");
    disableRemoteDatabase();
    return;
  }

  // 3. Database URL Format Validation
  try {
    new URL(supabaseUrl!);
  } catch (err) {
    console.error("⚠️ [AAN CONFIG WARNING] Invalid SUPABASE_URL format!");
    console.error("--------------------------------------------------------------");
    console.error(`The provided URL is invalid: "${supabaseUrl}"`);
    console.error("Switching to: DEVELOPMENT SANDBOX MODE (In-Memory State)");
    console.error("Please ensure SUPABASE_URL is a valid HTTP/HTTPS URL from your Supabase dashboard.");
    console.error("--------------------------------------------------------------\n");
    disableRemoteDatabase();
    return;
  }

  // 4. Remote Database Connectivity & Table Migration Verification
  console.log("📡 Connecting to Remote Supabase Database...");
  const tempClient = createClient(supabaseUrl!, supabaseServiceKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  try {
    // Attempt a lightweight query to verify connection and table schema
    const { data, error } = await tempClient
      .from("users")
      .select("id")
      .limit(1);

    if (error) {
      // Check if the failure is due to missing tables/relations (unmigrated database)
      const isTableMissing = 
        error.message?.includes("relation") ||
        error.message?.includes("does not exist") ||
        error.message?.includes("table") ||
        error.message?.includes("not found");

      if (isTableMissing) {
        console.error("⚠️ [AAN MIGRATION NOTICE] Database Tables Are Missing!");
        console.error("--------------------------------------------------------------");
        console.error("Successfully connected to Supabase, but the required tables");
        console.error("do not exist in your Postgres database yet.");
        console.error("\nSwitching to: DEVELOPMENT SANDBOX MODE (In-Memory State)");
        console.error("\nHOW TO MIGRATE TO CLOUD:");
        console.error("1. Open your Supabase Dashboard: https://supabase.com/dashboard");
        console.error("2. Navigate to your project -> SQL Editor.");
        console.error("3. Copy the entire contents of the 'supabase_schema.sql' file from this project's root.");
        console.error("4. Paste and Run the SQL query in the Supabase SQL Editor.");
        console.error("5. The tables will instantly populate, and on database query/restart, remote syncing will engage.");
        console.error("--------------------------------------------------------------\n");
        disableRemoteDatabase();
        return;
      }

      // Check if it is an authentication / credential invalid error
      const isAuthError = 
        error.message?.includes("JWT") || 
        error.message?.includes("API key") || 
        error.message?.includes("invalid") || 
        error.message?.includes("unauthorized") ||
        error.code === "401" ||
        (error as any).status === 401 ||
        (error as any).status === 403;

      if (isAuthError) {
        console.error("⚠️ [AAN DATABASE AUTH WARNING] Invalid Supabase Credentials!");
        console.error("--------------------------------------------------------------");
        console.error("Failed to authenticate with Supabase using the provided keys.");
        console.error("Switching to: DEVELOPMENT SANDBOX MODE (In-Memory State)");
        console.error("Please verify that SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL are correct.");
        console.error(`Error message from database: ${error.message}`);
        console.error("--------------------------------------------------------------\n");
        disableRemoteDatabase();
        return;
      }

      // Any other database error
      console.error("⚠️ [AAN DATABASE WARNING] Failed preflight database query!");
      console.error("--------------------------------------------------------------");
      console.error(`Error Code: ${error.code || "unknown"}`);
      console.error(`Details: ${error.message}`);
      console.error("Switching to: DEVELOPMENT SANDBOX MODE (In-Memory State)");
      console.error("Please verify database settings and connection.");
      console.error("--------------------------------------------------------------\n");
      disableRemoteDatabase();
      return;
    }

    console.log("✅ [AAN PREFLIGHT] DATABASE CONNECTION SECURED");
    console.log("✅ [AAN PREFLIGHT] REQUIRED TABLES VERIFIED (MIGRATIONS OK)");
    console.log("==============================================================\n");

  } catch (err: any) {
    console.error("⚠️ [AAN PREFLIGHT WARNING] Unexpected error during preflight checks!");
    console.error("--------------------------------------------------------------");
    console.error(err?.message || err);
    console.error("Switching to: DEVELOPMENT SANDBOX MODE (In-Memory State)");
    console.error("Please verify your internet connection and environment settings.");
    console.error("--------------------------------------------------------------\n");
    disableRemoteDatabase();
    return;
  }
}
