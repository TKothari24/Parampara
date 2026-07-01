// supabaseClient.js (shim)
// The actual Supabase client is created in script.js using the global UMD build.
// This file intentionally does not export anything to remain compatible with classic <script> tags.
// If needed, you can place shared helpers here without using ESM syntax.

var SUPABASE_URL = "https://dtelpnugwnknweyirsmt.supabase.co";
var SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0ZWxwbnVnd25rbndleWlyc210Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDE2NjUsImV4cCI6MjA3Mzc3NzY2NX0.yTGm_dEpuWRCCJwn_LKuQoY2hf3iOelbte_GnuPP0go";

var supabase = window.supabase && window.supabase.createClient
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;
