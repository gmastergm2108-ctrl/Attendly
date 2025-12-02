import { createClient } from '@supabase/supabase-js';

// ⚠️ FIX: "import.meta.env" does not work in this live preview.
// We are using hardcoded strings so you can configure it directly here.

// 1. Your Specific Project URL
const SUPABASE_URL = 'https://zbkniupntxsveedrsbqt.supabase.co';

// 2. Your API Key (Anon Public)
// ACTION REQUIRED: Paste your Supabase Anon Key inside the quotes below!
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpia25pdXBudHhzdmVlZHJzYnF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MDY2OTIsImV4cCI6MjA3OTI4MjY5Mn0.IsFzdpacRXQDqHUGZWSbzatnKZrs5SjHKiqEvyb5uKk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
