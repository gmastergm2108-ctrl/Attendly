
/*
// ---------------------------------------------------------
// Paste this into Supabase Edge Function: fingerprint-attendance
// ---------------------------------------------------------
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // 1. Parse Body
  const body = await req.json().catch(() => null);
  if (!body) {
    return new Response(JSON.stringify({ success: false, error: "Invalid JSON" }), { status: 400 });
  }

  const { action, device_id, fingerprint_id, wifi_status, queue_size } = body;

  // ------------------------------
  // ACTION: HEARTBEAT
  // ------------------------------
  if (action === "heartbeat") {
    const { error } = await supabase.from("device_status").upsert({
      device_id: device_id || "unknown",
      last_seen: new Date().toISOString(),
      wifi_ok: wifi_status ?? true,
      api_ok: true,
      queue_size: queue_size ?? 0
    });
    
    return new Response(JSON.stringify({ success: true, type: "heartbeat" }), { 
      status: 200, 
      headers: { "Content-Type": "application/json" } 
    });
  }

  // ------------------------------
  // ACTION: ATTENDANCE
  // ------------------------------
  // Fallback: If no action specified but fingerprint_id exists, treat as attendance
  if (!fingerprint_id) {
     return new Response(JSON.stringify({ success: false, error: "Missing fingerprint_id" }), { status: 400 });
  }

  // A. Find Student
  const { data: student, error: studentErr } = await supabase
    .from("students")
    .select("*")
    .eq("fingerprint_id", fingerprint_id)
    .maybeSingle();

  if (studentErr || !student) {
    return new Response(JSON.stringify({ success: false, error: "Student not found" }), { status: 404 });
  }

  // B. Check Duplicate (Today)
  const today = new Date().toISOString().split("T")[0];
  const { data: existing } = await supabase
    .from("attendance")
    .select("id")
    .eq("student_id", student.id)
    .eq("date", today)
    .maybeSingle();

  if (existing) {
    return new Response(JSON.stringify({
        success: true,
        duplicate: true,
        student_name: student.name,
        admin_no: student.admin_no,
      }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  // C. Insert Attendance
  await supabase.from("attendance").insert({
    student_id: student.id,
    device_id: device_id || "unknown",
    status: "present",
    date: today,
  });

  // Update device status as a side effect
  await supabase.from("device_status").upsert({
      device_id: device_id || "unknown",
      last_seen: new Date().toISOString(),
      api_ok: true
  });

  return new Response(JSON.stringify({
    success: true,
    duplicate: false,
    student_name: student.name,
    admin_no: student.admin_no,
  }), { status: 200, headers: { "Content-Type": "application/json" } });
});
*/
