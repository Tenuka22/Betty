import { Str, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../types";

export class urlReroute extends OpenAPIRoute {
  schema = {
    tags: ["Url"],
    summary: "Reroute URL",
    request: {
      params: z.object({
        minified: Str({
          description: "Minified Id",
          required: true,
        }),
      }),
    },
  };

  async handle(c: AppContext) {
    try {
      const data = await this.getValidatedData<typeof this.schema>();
      const { minified } = data.params;

      let results: Record<string, unknown>[];
      try {
        const q = await c.env.URLS_DB.prepare(
          `SELECT FullUrl FROM URLS_Table WHERE MinifiedId = ? LIMIT 1;`,
        )
          .bind(minified)
          .run();

        results = q.results;
      } catch (err) {
        console.error("Database error while fetching URL:", err);
        return c.json({ error: "Failed to lookup URL" }, 500);
      }

      const row = results[0];

      if (!row || typeof row.FullUrl !== "string" || row.FullUrl === "") {
        return c.json({ error: "URL not found" }, 404);
      }

      let finalUrl: URL;
      try {
        finalUrl = new URL(row.FullUrl);
      } catch {
        return c.json({ error: "Invalid stored URL" }, 500);
      }

      return c.redirect(finalUrl.toString(), 308);
    } catch (err) {
      console.error("Unexpected reroute error:", err);
      return c.json({ error: "Unexpected server error" }, 500);
    }
  }
}
