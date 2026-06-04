import { Redis } from "@upstash/redis";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const kv = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const IDX = "tt:leads:index";
const KEY = (id: string) => `tt:lead:${id}`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  // GET — all leads
  if (req.method === "GET") {
    try {
      const ids = await kv.lrange(IDX, 0, -1) as string[];
      if (!ids.length) return res.json([]);
      const pipeline = kv.pipeline();
      ids.forEach((id) => pipeline.hgetall(KEY(id)));
      const results = await pipeline.exec();
      return res.json((results as any[]).filter(Boolean));
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  // POST — save new lead
  if (req.method === "POST") {
    const lead = req.body;
    if (!lead?.id) return res.status(400).json({ error: "Missing id" });
    try {
      const flat: Record<string, string> = {};
      for (const [k, v] of Object.entries(lead)) flat[k] = String(v ?? "");
      await kv.hset(KEY(lead.id), flat);
      await kv.lpush(IDX, lead.id);
      return res.json({ ok: true });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  // PATCH — update status
  if (req.method === "PATCH") {
    const { id } = req.query;
    const { status } = req.body;
    if (!id) return res.status(400).json({ error: "Missing id" });
    try {
      await kv.hset(KEY(id as string), { status });
      return res.json({ ok: true });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  // DELETE
  if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Missing id" });
    try {
      await kv.del(KEY(id as string));
      await kv.lrem(IDX, 0, id as string);
      return res.json({ ok: true });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
