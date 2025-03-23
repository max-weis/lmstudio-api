import { Hono } from "hono";
import { LMStudioClient } from "@lmstudio/sdk";
import { encodeBase64 } from "https://deno.land/std/encoding/base64.ts";
import { z } from "zod";

const client = new LMStudioClient();
const model = await client.llm.model("gemma-3-4b-it");

const app = new Hono();

const DiscreteSchema = z.object({
  type: z.literal("discrete"),
  name: z.string(),
  quantity: z.string(),
  price: z.number().int(),
  price_per_quantity: z.number().int(),
});

const ContinuousSchema = z.object({
  type: z.literal("continuous"),
  name: z.string(),
  quantity: z.object({
    amount: z.number().int(),
    unit: z.string(),
  }),
  total_price: z.number().int(),
  unit_price: z.number().int(),
});

const ReceiptSchema = z.array(
  z.union([DiscreteSchema, ContinuousSchema]),
);

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
      content: "extract the items from the given receipt. if the item has a quantity like kg or l use the continuous schema, otherwise use the discrete schema",
      images: [lmImage],
    },
  ], { structured: ReceiptSchema });

  return c.json(
    response.parsed,
  );
});

export default app;
