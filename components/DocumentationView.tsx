
import React, { useState } from 'react';
import { ESP32_MAIN_CODE, ESP32_ENROLL_CODE, ESP32_DELETE_CODE, DB_SCHEMA_SQL, EDGE_FUNCTION_DISPLAY_CODE } from '../docsData';
import { Copy, Check, Database, Cpu, CloudLightning, Fingerprint, Trash2, Radio } from 'lucide-react';

const CodeBlock = ({ code, label }: { code: string; label: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 text-slate-300 shadow-lg">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <span className="font-mono text-sm font-medium text-white flex items-center gap-2">{label}</span>
        <button onClick={handleCopy} className="flex items-center gap-2 text-xs font-bold hover:text-white transition-colors bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded-lg">
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />} {copied ? 'COPIED' : 'COPY'}
        </button>
      </div>
      <div className="p-4 overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
        <pre className="text-sm font-mono leading-relaxed"><code>{code}</code></pre>
      </div>
    </div>
  );
};

const DocumentationView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'backend' | 'hardware'>('backend');
  const [hardwareSubTab, setHardwareSubTab] = useState<'main' | 'enroll' | 'delete'>('main');

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-12">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><CloudLightning size={28} className="text-primary-600" /> System Setup</h2>
        <p className="text-slate-500 mt-2">Reference guide for Supabase Cloud and ESP32 Firmware.</p>

        <div className="flex gap-4 mt-6 border-b border-slate-200 overflow-x-auto">
          <button onClick={() => setActiveTab('backend')} className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'backend' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <Database size={18} /> Supabase SQL & Functions
          </button>
          <button onClick={() => setActiveTab('hardware')} className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'hardware' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <Cpu size={18} /> ESP32 Firmware
          </button>
        </div>

        {activeTab === 'hardware' && (
          <div className="mt-6 animate-fadeIn space-y-6">
            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit">
               <button 
                  onClick={() => setHardwareSubTab('main')}
                  className={`px-4 py-2 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${hardwareSubTab === 'main' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 <Radio size={14} /> Main Firmware
               </button>
               <button 
                  onClick={() => setHardwareSubTab('enroll')}
                  className={`px-4 py-2 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${hardwareSubTab === 'enroll' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 <Fingerprint size={14} /> Enroll Sketch
               </button>
               <button 
                  onClick={() => setHardwareSubTab('delete')}
                  className={`px-4 py-2 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${hardwareSubTab === 'delete' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 <Trash2 size={14} /> Delete Sketch
               </button>
            </div>

            {hardwareSubTab === 'main' && (
              <div className="animate-fadeIn">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Main Attendance Firmware</h3>
                <p className="text-sm text-slate-500 mb-2">Primary code for daily attendance with LCD, WiFi & Supabase.</p>
                <CodeBlock code={ESP32_MAIN_CODE} label="firmware/main.ino" />
              </div>
            )}

            {hardwareSubTab === 'enroll' && (
              <div className="animate-fadeIn">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Enrollment Tool</h3>
                <p className="text-sm text-slate-500 mb-2">Flash this sketch to enroll new fingerprints via Serial Monitor.</p>
                <CodeBlock code={ESP32_ENROLL_CODE} label="firmware/enroll.ino" />
              </div>
            )}

            {hardwareSubTab === 'delete' && (
              <div className="animate-fadeIn">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Format Database Tool</h3>
                <p className="text-sm text-slate-500 mb-2">Flash this sketch to DELETE ALL fingerprint templates from the sensor.</p>
                <CodeBlock code={ESP32_DELETE_CODE} label="firmware/delete.ino" />
              </div>
            )}
          </div>
        )}

        {activeTab === 'backend' && (
          <div className="mt-6 animate-fadeIn space-y-10">
             <div>
               <h3 className="text-lg font-bold text-slate-900">1. Database Schema (SQL)</h3>
               <p className="text-sm text-slate-500 mb-2">Run this in Supabase SQL Editor to create tables.</p>
               <CodeBlock code={DB_SCHEMA_SQL} label="sql_editor" />
             </div>
             <div className="pt-8 border-t border-slate-100">
               <h3 className="text-lg font-bold text-slate-900">2. Edge Function (Deno)</h3>
               <p className="text-sm text-slate-500 mb-2">Deploy this to handle biometric scans securely.</p>
               <CodeBlock code={EDGE_FUNCTION_DISPLAY_CODE} label="functions/fingerprint-attendance/index.ts" />
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentationView;
