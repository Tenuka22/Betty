import { Str, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../types";

const toUnique = (str: string): string => {
  const bytes = new TextEncoder().encode(str);
  const binary = String.fromCharCode(...bytes);
  return btoa(binary);
};

export class urlCreate extends OpenAPIRoute {
  schema = {
    tags: ["Url"],
    summary: "Create URL",
    request: {
      query: z.object({
        fullUrl: z.string().url("Invalid URL format"),
      }),
    },
    responses: {
      "200": {
        description: "Created minified URL",
        content: {
          "application/json": {
            schema: z.object({
              minifiedURL: Str({ required: true }),
            }),
          },
        },
      },
    },
  };

  async handle(c: AppContext) {
    try {
      const data = await this.getValidatedData<typeof this.schema>();
      const { fullUrl } = data.query;

      let lastId = 0;
      try {
        const q = await c.env.URLS_DB.prepare(
          `SELECT Id FROM URLS_Table ORDER BY Id DESC LIMIT 1;`,
        ).run();

        if (q.results?.length && typeof q.results[0].Id === "number") {
          lastId = q.results[0].Id;
        }
      } catch (err) {
        console.error("Failed to read last ID:", err);
        return c.json({ error: "Failed to read database" }, 500);
      }

      const newId = lastId + 1;
      const minified = toUnique(String(newId));

      const serverUrl = new URL(c.req.url);
      const minifiedURL = `${serverUrl.origin}/api/url/${minified}`;

      try {
        const stmt = c.env.URLS_DB.prepare(
          `INSERT INTO URLS_Table (FullUrl, MinifiedId)
           VALUES (?1, ?2)
           RETURNING *;`,
        );

        const insert = await stmt.bind(fullUrl, minified).run();

        if (!insert.results?.length) {
          return c.json({ error: "Failed to create shortened URL" }, 500);
        }
      } catch (err) {
        console.error("Failed to insert shortened URL:", err);
        return c.json({ error: "Failed to create shortened URL" }, 500);
      }

      return { minifiedURL };
    } catch (err) {
      console.error("Unexpected URL creation error:", err);
      return c.json({ error: "Unexpected server error" }, 500);
    }
  }
}
