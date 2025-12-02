

export const ESP32_MAIN_CODE = `
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <Adafruit_Fingerprint.h>
#include <LiquidCrystal_I2C.h>

// ----------------------
// WiFi Credentials
// ----------------------
const char* ssid = "OPPO";
const char* password = "12345678";

// ----------------------
// Supabase API URL
// ----------------------
String apiURL = "https://zbkniupntxsveedrsbqt.supabase.co/functions/v1/fingerprint-attendance";

// ----------------------
// LCD Display (16x2 I2C)
// ----------------------
LiquidCrystal_I2C lcd(0x27, 16, 2);

// ----------------------
// Fingerprint Sensor
// ----------------------
HardwareSerial fp(2); 
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&fp);

// ----------------------
// BUZZER PIN
// ----------------------
#define BUZZER 4   // connect buzzer + to GPIO4, - to GND

// -----------------------------------

void beepSuccess() {
  tone(BUZZER, 2000, 150);
  delay(200);
}

void beepDouble() {
  tone(BUZZER, 2500, 120);
  delay(150);
  tone(BUZZER, 2500, 120);
  delay(150);
}

void beepError() {
  tone(BUZZER, 500, 500);
  delay(500);
}

// -----------------------------------

void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(BUZZER, OUTPUT);

  // LCD Init
  Wire.begin(22, 21);  
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Attendly System");
  delay(1500);

  // WiFi Connection
  lcd.clear();
  lcd.print("Connecting WiFi");
  Serial.println("Connecting to WiFi...");

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }

  lcd.clear();
  lcd.print("WiFi Connected");
  Serial.println("\\nWiFi Connected!");

  // Fingerprint Init
  fp.begin(57600, SERIAL_8N1, 16, 17);
  finger.begin(57600);

  delay(500);
  lcd.clear();
  lcd.print("Init Sensor...");

  if (!finger.verifyPassword()) {
    lcd.clear();
    lcd.print("FP ERROR!");
    Serial.println("ERROR: Fingerprint sensor NOT found!");
    beepError();
    while (1) delay(10);
  }

  lcd.clear();
  lcd.print("Sensor Ready");
  Serial.println("Fingerprint sensor initialized.");

  delay(1500);
  lcd.clear();
  lcd.print("Scan Finger...");
}

// -----------------------------------

void sendAttendance(int id) {
  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient https;
  https.begin(client, apiURL);
  https.addHeader("Content-Type", "application/json");

  String json = String("{\\"fingerprint_id\\":") + String(id) +
                ",\\"device_id\\":\\"ESP32-01\\"}";

  Serial.println("Sending:");
  Serial.println(json);

  int httpCode = https.POST(json);

  Serial.print("HTTP Code: ");
  Serial.println(httpCode);

  String response = https.getString();
  Serial.print("Response: ");
  Serial.println(response);

  lcd.clear();

  if (httpCode == 200) {
    // Parse JSON
    int nameStart = response.indexOf("student_name\\":\\"") + 15;
    int nameEnd = response.indexOf("\\"", nameStart);
    String name = response.substring(nameStart, nameEnd);

    int admStart = response.indexOf("admin_no\\":\\"") + 11;
    int admEnd = response.indexOf("\\"", admStart);
    String adm = response.substring(admStart, admEnd);

    lcd.setCursor(0, 0);
    lcd.print(name.substring(0,16));

    lcd.setCursor(0, 1);
    lcd.print("Adm: ");
    lcd.print(adm.substring(0,11));

    beepDouble(); // attendance success
    delay(3000);
  } 
  else {
    lcd.print("Send Failed!");
    beepError();
    delay(2000);
  }

  lcd.clear();
  lcd.print("Scan Finger...");
  https.end();
}

// -----------------------------------

void loop() {
  if (finger.getImage() != FINGERPRINT_OK) return;

  if (finger.image2Tz() != FINGERPRINT_OK) return;

  if (finger.fingerSearch() == FINGERPRINT_OK) {
    int id = finger.fingerID;

    lcd.clear();
    lcd.print("ID Found: ");
    lcd.print(id);
    beepSuccess();  // fingerprint match beep
    delay(1000);

    sendAttendance(id);
  } 
  else {
    lcd.clear();
    lcd.print("Unknown Finger");
    beepError();  // no match beep
    delay(1500);
    lcd.clear();
    lcd.print("Scan Finger...");
  }

  delay(200);
}
`;

export const ESP32_ENROLL_CODE = `
#include <Adafruit_Fingerprint.h>
#include <HardwareSerial.h>
#include <LiquidCrystal_I2C.h>
#include <Wire.h>

// ---------------- LCD ----------------
LiquidCrystal_I2C lcd(0x27, 16, 2);

// ---------------- Fingerprint Sensor ----------------
HardwareSerial fpSerial(2);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&fpSerial);

void setup() {
  Serial.begin(115200);
  delay(1000);

  // LCD Setup
  Wire.begin(22, 21);
  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.print("Enroll Mode");
  delay(1500);

  lcd.clear();
  lcd.print("Init Sensor...");

  // Fingerprint Sensor
  fpSerial.begin(57600, SERIAL_8N1, 16, 17);
  finger.begin(57600);

  if (finger.verifyPassword()) {
    lcd.clear();
    lcd.print("Sensor Ready");
    Serial.println("Sensor Ready");
  } else {
    lcd.clear();
    lcd.print("Sensor ERROR!");
    Serial.println("Sensor NOT FOUND!");
    while (1);
  }

  delay(1500);
  lcd.clear();
  lcd.print("Enter ID in");
  lcd.setCursor(0, 1);
  lcd.print("Serial Monitor");

  Serial.println("\\nEnter ID (1–999) to enroll:");
}

void loop() {
  if (Serial.available()) {
    int id = Serial.parseInt();
    if (id == 0) return;

    Serial.print("Enrolling ID: ");
    Serial.println(id);

    lcd.clear();
    lcd.print("Enroll ID:");
    lcd.print(id);

    enrollFingerprint(id);

    lcd.clear();
    lcd.print("Enter Next ID");
    lcd.setCursor(0, 1);
    lcd.print("in Serial");

    Serial.println("\\nEnter next ID:");
  }
}

uint8_t enrollFingerprint(int id) {
  int p = -1;

  // -------- STEP 1: Place Finger --------
  lcd.clear();
  lcd.print("Place Finger");
  Serial.println("Place finger on sensor...");

  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
  }

  lcd.clear();
  lcd.print("Image 1 OK");
  Serial.println("Image 1 Taken");

  p = finger.image2Tz(1);
  if (p != FINGERPRINT_OK) {
    lcd.clear();
    lcd.print("Try Again!");
    Serial.println("Failed Image2Tz(1)");
    return p;
  }

  // -------- STEP 2: AUTO CAPTURE AGAIN WITHOUT REMOVING --------
  lcd.clear();
  lcd.print("Hold Still...");
  Serial.println("Hold still... capturing second image");

  delay(1500);  // allow slight finger movement

  p = -1;
  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
  }

  lcd.clear();
  lcd.print("Image 2 OK");
  Serial.println("Image 2 Taken");

  p = finger.image2Tz(2);
  if (p != FINGERPRINT_OK) {
    lcd.clear();
    lcd.print("2nd Failed");
    Serial.println("Failed Image2Tz(2)");
    return p;
  }

  // -------- STEP 3: Create Model --------
  lcd.clear();
  lcd.print("Creating...");
  Serial.println("Creating model...");
  p = finger.createModel();

  if (p != FINGERPRINT_OK) {
    lcd.clear();
    lcd.print("Model Failed");
    Serial.println("Model Creation Failed");
    return p;
  }

  // -------- STEP 4: Save Model --------
  lcd.clear();
  lcd.print("Saving...");
  Serial.println("Saving template...");
  p = finger.storeModel(id);

  if (p == FINGERPRINT_OK) {
    lcd.clear();
    lcd.print("Saved ID:");
    lcd.print(id);
    Serial.println("Fingerprint Saved!");
  } else {
    lcd.clear();
    lcd.print("Save Failed!");
    Serial.println("Save Error");
  }

  delay(1500);
  return p;
}
`;

export const ESP32_DELETE_CODE = `
#include <Wire.h>
#include <HardwareSerial.h>
#include <Adafruit_Fingerprint.h>
#include <LiquidCrystal_I2C.h>

// ---------- LCD SETUP ----------
// Change 0x27 to 0x3F if your LCD has a different I2C address
LiquidCrystal_I2C lcd(0x27, 16, 2);

// ---------- FINGERPRINT SETUP ----------
HardwareSerial FingerSerial(2);           // Use UART2
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&FingerSerial);

void showLCD(const char* line1, const char* line2 = "") {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(line1);
  lcd.setCursor(0, 1);
  lcd.print(line2);
}

void setup() {
  // Serial for debugging
  Serial.begin(115200);
  delay(1000);

  // ---------- I2C + LCD INIT ----------
  // Use SDA = 22, SCL = 21 (your wiring)
  Wire.begin(22, 21);
  lcd.init();
  lcd.backlight();
  showLCD("R307 + LCD", "Starting...");

  // ---------- FINGERPRINT UART INIT ----------
  // RX = GPIO16, TX = GPIO17
  FingerSerial.begin(57600, SERIAL_8N1, 16, 17);
  finger.begin(57600);

  Serial.println("R307 Delete All Templates");
  showLCD("Checking", "sensor...");

  if (finger.verifyPassword()) {
    Serial.println("R307 Connected OK");
    showLCD("FP Sensor", "Connected OK");
  } else {
    Serial.println("R307 NOT found!");
    showLCD("FP Sensor", "NOT found!");
    while (1) {
      delay(1000); // Halt here if sensor not detected
    }
  }

  delay(1500);

  // ---------- DELETE ALL TEMPLATES ----------
  Serial.println("Deleting ALL templates...");
  showLCD("Deleting", "all prints...");

  uint8_t result = finger.emptyDatabase();

  if (result == FINGERPRINT_OK) {
    Serial.println("All templates deleted successfully!");
    showLCD("All prints", "deleted OK");
  } else {
    Serial.print("Failed to delete. Error: ");
    Serial.println(result);

    char buf[16];
    snprintf(buf, sizeof(buf), "Err: %d", result);
    showLCD("Delete failed", buf);
  }
}

void loop() {
  // Nothing in loop - runs once
}
`;

export const DB_SCHEMA_SQL = `
-- RUN THIS IN SUPABASE SQL EDITOR
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.students (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_no text NOT NULL UNIQUE,
  name text NOT NULL,
  std text NOT NULL,
  sec text NOT NULL,
  fingerprint_id integer UNIQUE,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES public.students(id),
  date date NOT NULL,
  status text NOT NULL DEFAULT 'present',
  device_id text,
  recorded_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.school_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  target_class text NOT NULL DEFAULT 'All',
  date date NOT NULL,
  type text CHECK (type = ANY (ARRAY['Vacation Break'::text, 'Event'::text, 'Holiday'::text])),
  created_at timestamp without time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.device_status (
  device_id text PRIMARY KEY,
  last_seen timestamp with time zone DEFAULT now(),
  wifi_ok boolean,
  api_ok boolean,
  queue_size integer
);

CREATE TABLE IF NOT EXISTS public.device_logs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  device_id text NOT NULL,
  message text,
  type text DEFAULT 'info',
  timestamp timestamp with time zone DEFAULT now()
);

-- Enable Realtime
BEGIN; 
  DROP PUBLICATION IF EXISTS supabase_realtime; 
  CREATE PUBLICATION supabase_realtime FOR TABLE attendance, device_status, device_logs, school_events; 
COMMIT;
`;

export const EDGE_FUNCTION_DISPLAY_CODE = `
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
`;
