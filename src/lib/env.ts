export interface EnvConfig {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_TMDB_API_KEY?: string;
  VITE_OMDB_API_KEY?: string;
}

function getEnvVal(key: string): string {
  try {
    if (typeof import.meta !== "undefined" && import.meta?.env && import.meta.env[key]) {
      return String(import.meta.env[key]).trim();
    }
  } catch (e) {
    // Ignore error in Node context
  }
  if (typeof process !== "undefined" && process?.env && process.env[key]) {
    return String(process.env[key]).trim();
  }
  return "";
}

function validateAndGetEnv(): EnvConfig {
  const supabaseUrl = getEnvVal("VITE_SUPABASE_URL");
  const supabaseAnonKey = getEnvVal("VITE_SUPABASE_ANON_KEY");
  const tmdbApiKey = getEnvVal("VITE_TMDB_API_KEY") || undefined;
  const omdbApiKey = getEnvVal("VITE_OMDB_API_KEY") || undefined;

  if (!supabaseUrl || !supabaseAnonKey) {
    const missing: string[] = [];
    if (!supabaseUrl) missing.push("VITE_SUPABASE_URL");
    if (!supabaseAnonKey) missing.push("VITE_SUPABASE_ANON_KEY");
    throw new Error(
      `Hitilafu ya Mipangilio: Mabadiliko ya mazingira (${missing.join(
        ", "
      )}) hayakupatikana. Tafadhali yaweke kwenye faili la .env`
    );
  }

  return {
    VITE_SUPABASE_URL: supabaseUrl,
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey,
    VITE_TMDB_API_KEY: tmdbApiKey,
    VITE_OMDB_API_KEY: omdbApiKey,
  };
}

// Single validated environment variable reader
export const env = validateAndGetEnv();
