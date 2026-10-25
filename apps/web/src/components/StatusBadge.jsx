import React from "react";
export default function StatusBadge({ok, label}){ return <span className={`badge ${ok?"badge-ok":"badge-bad"}`}>{label}: {ok?"Available":"Unavailable"}</span>; }
export function Capability({ok, label, note}){ return <div className="card"><div className="flex justify-between"><strong>{label}</strong><StatusBadge ok={ok} label="Status"/></div>{note && <p className="text-sm text-slate-400 mt-2">{note}</p>}</div>; }
