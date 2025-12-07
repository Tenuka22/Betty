import { fromHono } from "chanfana";
import { Hono } from "hono";
import { urlCreate } from "./endpoints/urlCreate";
import { urlReroute } from "./endpoints/urlReroute";

const app = new Hono<{ Bindings: Env }>();

const openapi = fromHono(app, {
  docs_url: "/",
});

openapi.post("/api/url", urlCreate);
openapi.get("/api/url/:minified", urlReroute);

export default app;
