import { Redis } from "@upstash/redis";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const IDX = "tt:properties:index";
const KEY = (id: string) => `tt:property:${id}`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,PATCH,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

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

  if (req.method === "POST") {
    const prop = req.body;
    if (!prop?.id) return res.status(400).json({ error: "Missing id" });
    try {
      const existing = await kv.hgetall(KEY(prop.id)) as Record<string, string> | null;
      if (existing?.price !== undefined) {
        const oldPrice = parseFloat(existing.price);
        const newPrice = parseFloat(String(prop.price));
        if (oldPrice !== newPrice) {
          prop.oldPrice = oldPrice;
          prop.priceChangedAt = new Date().toISOString();
        } else {
          prop.oldPrice = existing.oldPrice;
          prop.priceChangedAt = existing.priceChangedAt;
        }
      }
      const flat: Record<string, string> = {};
      for (const [k, v] of Object.entries(prop)) {
        flat[k] = Array.isArray(v) ? JSON.stringify(v) : String(v ?? "");
      }
      await kv.hset(KEY(prop.id), flat);
      if (!existing) await kv.lpush(IDX, prop.id);
      return res.json({ ok: true });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

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

  if (req.method === "PATCH") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Missing id" });
    try {
      await kv.hincrby(KEY(id as string), "views", 1);
      return res.json({ ok: true });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
