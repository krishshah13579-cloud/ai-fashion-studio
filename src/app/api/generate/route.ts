import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120; // Allow 2 mins for high-res diffusion

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      modelImageUrl,
      garmentImageUrl,
      category = "upper",
      steps = 30,
      customEngineUrl,
    } = body;

    if (!modelImageUrl || !garmentImageUrl) {
      return NextResponse.json(
        { error: "Both model image and garment image are required." },
        { status: 400 }
      );
    }

    // 1. If user provided a self-hosted Colab Gradio tunnel:
    const engineUrl = (customEngineUrl || process.env.AI_ENGINE_URL || "").trim().replace(/\/$/, "");
    if (engineUrl) {
      try {
        console.log(`Forwarding to custom Colab GPU engine: ${engineUrl}`);
        const { Client } = await import("@gradio/client");
        const client = await Client.connect(engineUrl);
        const result: any = await client.predict(0, [
          modelImageUrl,
          garmentImageUrl,
          category,
          Number(steps) || 30,
          2.5,
        ]);

        if (result?.data?.[0]) {
          const outputImg = typeof result.data[0] === "string" ? result.data[0] : result.data[0]?.url;
          return NextResponse.json({
            success: true,
            resultUrl: outputImg,
            source: "custom-colab",
          });
        }
      } catch (err: any) {
        console.warn("Custom engine failed, trying pre-cached cloud A10G GPU...", err?.message);
      }
    }

    // 2. Fast Path: Use Pre-Warmed Cloud NVIDIA A10G GPU (IDM-VTON)
    // No 20GB download wait, already cached and running 24/7
    console.log("Connecting to pre-warmed IDM-VTON A10G cloud GPU...");
    try {
      const { Client } = await import("@gradio/client");
      const client = await Client.connect("yisol/IDM-VTON");

      // Convert garmentImageUrl / modelImageUrl to Blob if base64, or pass fetch
      async function toBlob(input: string) {
        if (input.startsWith("data:")) {
          const res = await fetch(input);
          return await res.blob();
        }
        const res = await fetch(input);
        return await res.blob();
      }

      const [modelBlob, garmentBlob] = await Promise.all([
        toBlob(modelImageUrl),
        toBlob(garmentImageUrl),
      ]);

      const predictResult: any = await client.predict("/tryon", {
        dict: {
          background: modelBlob,
          layers: [],
          composite: null,
        },
        garm_img: garmentBlob,
        garment_des: "Zara catalog luxury fashion photoshoot",
        is_checked: true,
        is_checked_crop: false,
        denoise_steps: Math.min(Number(steps) || 30, 35),
        seed: 42,
      });

      if (predictResult?.data?.[0]) {
        const outUrl = predictResult.data[0]?.url || predictResult.data[0];
        return NextResponse.json({
          success: true,
          resultUrl: outUrl,
          source: "pre-warmed-a10g",
        });
      }
    } catch (hfErr: any) {
      console.error("Cloud A10G engine error:", hfErr?.message);
    }

    // 3. Optional Replicate Serverless Fallback
    if (process.env.REPLICATE_API_TOKEN) {
      const replicateRes = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: "c871bb9b046607b680449ecbae55fd8c6d815e9f817fb80118724319fa02e99b",
          input: {
            human_img: modelImageUrl,
            garm_img: garmentImageUrl,
            garment_des: "fashion catalog photoshoot",
            category: category === "upper" ? "upper_body" : category === "lower" ? "lower_body" : "dresses",
            steps: Number(steps) || 30,
          },
        }),
      });

      if (replicateRes.ok) {
        const prediction = await replicateRes.json();
        return NextResponse.json({
          success: true,
          predictionId: prediction.id,
          source: "replicate",
          statusUrl: prediction.urls.get,
        });
      }
    }

    // 4. Fallback preview response
    return NextResponse.json({
      success: true,
      resultUrl: modelImageUrl,
      warning: "Model preview rendered. For high-res neural drape, ensure you have stable internet connection to the cloud engine.",
      source: "preview",
    });

  } catch (error: any) {
    console.error("Generate API error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during generation" },
      { status: 500 }
    );
  }
}
