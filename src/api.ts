/**
 * api.ts — Gọi Vercel Serverless API thay vì localStorage
 */
import type { Property, CustomerLead, ActivityLog, SystemStats } from "./types";

async function req<T>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${url} → ${res.status}`);
  return res.json();
}

// ── Properties ────────────────────────────────────────────────────────────────

export async function fetchProperties(): Promise<Property[]> {
  const raw = await req<Record<string, string>[]>("GET", "/api/properties");
  return raw.map(deserializeProperty);
}

export async function saveProperty(prop: Property): Promise<void> {
  await req("POST", "/api/properties", serializeProperty(prop));
}

export async function deleteProperty(id: string): Promise<void> {
  await req("DELETE", `/api/properties?id=${id}`);
}

export async function incrementPropertyViews(id: string): Promise<void> {
  await req("PATCH", `/api/properties?id=${id}`);
}

// ── Leads ─────────────────────────────────────────────────────────────────────

export async function fetchLeads(): Promise<CustomerLead[]> {
  const raw = await req<Record<string, string>[]>("GET", "/api/leads");
  return raw.map((r) => ({
    id:         r.id,
    name:       r.name,
    phone:      r.phone,
    source:     r.source as CustomerLead["source"],
    status:     (r.status || "new") as CustomerLead["status"],
    note:       r.note,
    createdAt:  r.createdAt,
    propertyId: r.propertyId,
  }));
}

export async function saveLead(lead: CustomerLead): Promise<void> {
  await req("POST", "/api/leads", lead);
}

export async function updateLeadStatus(id: string, status: CustomerLead["status"]): Promise<void> {
  await req("PATCH", `/api/leads?id=${id}`, { status });
}

export async function deleteLead(id: string): Promise<void> {
  await req("DELETE", `/api/leads?id=${id}`);
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export async function fetchStats(): Promise<SystemStats> {
  return req<SystemStats>("GET", "/api/stats");
}

export async function incrementStat(field: keyof SystemStats): Promise<void> {
  await req("POST", "/api/stats", { field });
}

// ── Logs ──────────────────────────────────────────────────────────────────────

export async function fetchLogs(): Promise<ActivityLog[]> {
  return req<ActivityLog[]>("GET", "/api/logs");
}

export async function pushLog(log: ActivityLog): Promise<void> {
  await req("POST", "/api/logs", log);
}

// ── Serialization ─────────────────────────────────────────────────────────────

function serializeProperty(p: Property): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(p)) {
    out[k] = Array.isArray(v) ? JSON.stringify(v) : String(v ?? "");
  }
  return out;
}

function deserializeProperty(r: Record<string, string>): Property {
  return {
    id:             r.id,
    sonha:          r.sonha || "",
    duongpho:       r.duongpho || "",
    phuongxa:       r.phuongxa || "",
    area:           parseFloat(r.area) || 0,
    price:          parseFloat(r.price) || 0,
    oldPrice:       r.oldPrice ? parseFloat(r.oldPrice) : undefined,
    priceChangedAt: r.priceChangedAt || undefined,
    sotang:         r.sotang || "",
    bedroom:        r.bedroom || "",
    nhavesinh:      r.nhavesinh || "",
    direction:      r.direction || "",
    phaply:         r.phaply || "",
    tieu_de:        r.tieu_de || "",
    mo_ta:          r.mo_ta || "",
    facebookPost:   r.facebookPost || "",
    images:         r.images ? (() => { try { return JSON.parse(r.images); } catch { return []; } })() : [],
    views:          parseInt(r.views) || 0,
    created_at:     r.created_at || "",
  } as Property;
}
