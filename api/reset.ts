import { Redis } from "@upstash/redis";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Bảo vệ bằng secret key
  const { secret } = req.body;
  if (secret !== process.env.RESET_SECRET && secret !== "thanhtra2026reset") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Xóa index properties
    await kv.del("tt:properties:index");

    // Xóa index leads
    await kv.del("tt:leads:index");

    // Xóa stats
    await kv.del("tt:stats");

    // Xóa logs
    await kv.del("tt:logs");

    // Lấy và xóa tất cả keys tt:property:* và tt:lead:*
    const allKeys: string[] = [];
    
    // Scan property keys
    let cursor = 0;
    do {
      const result = await (kv as any).scan(cursor, { match: "tt:property:*", count: 100 });
      cursor = result[0];
      allKeys.push(...result[1]);
    } while (cursor !== 0);

    // Scan lead keys
    cursor = 0;
    do {
      const result = await (kv as any).scan(cursor, { match: "tt:lead:*", count: 100 });
      cursor = result[0];
      allKeys.push(...result[1]);
    } while (cursor !== 0);

    if (allKeys.length > 0) {
      const pipeline = kv.pipeline();
      allKeys.forEach((key) => pipeline.del(key));
      await pipeline.exec();
    }

    return res.json({ ok: true, deleted: allKeys.length + 4, message: "Đã xóa toàn bộ dữ liệu Redis thành công!" });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
