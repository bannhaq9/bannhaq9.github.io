import { Redis } from "@upstash/redis";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const KEY = "tt:stats";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const defaultStats = { views: 0, fbShares: 0, zaloShares: 0, linkCopies: 0, totalLeads: 0 };

  if (req.method === "GET") {
    try {
      const raw = await kv.hgetall(KEY) as Record<string, string> | null;
      if (!raw) return res.json(defaultStats);
      const stats = Object.fromEntries(
        Object.entries(raw).map(([k, v]) => [k, parseInt(String(v)) || 0])
      );
      return res.json({ ...defaultStats, ...stats });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === "POST") {
    const { field } = req.body;
    if (!field) return res.status(400).json({ error: "Missing field" });
    try {
      await kv.hincrby(KEY, field, 1);
      return res.json({ ok: true });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
