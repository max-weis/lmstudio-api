import { Hono } from "hono";
import { LMStudioClient } from "@lmstudio/sdk";
import { encodeBase64 } from "https://deno.land/std/encoding/base64.ts";

const client = new LMStudioClient();
const model = await client.llm.model("gemma-3-4b-it");
const app = new Hono();

app.post("/upload/:name", async (c) => {
  const name = c.req.param("name");

  const form = await c.req.formData();
  const image = form.get("image");

  if (!(image instanceof File)) {
    return c.json({ error: "No image file provided" }, 400);
  }

  const arrayBuffer = await image.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const base64Image = encodeBase64(uint8Array);

  const lmImage = await client.files.prepareImageBase64(name, base64Image);

  const response = await model.respond([
    {
      role: "user",
      content: "convert the items from the provided image into json",
      images: [lmImage],
    },
  ]);

  return c.json({
    message: response.content,
  });
});

export default app;
