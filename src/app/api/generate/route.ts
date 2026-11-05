import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // 60s timeout for heavy AI generation

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      modelImageUrl,
      garmentImageUrl,
      category = "upper",
      steps = 30,
      guidance = 2.5,
      customEngineUrl,
    } = body;

    if (!modelImageUrl || !garmentImageUrl) {
      return NextResponse.json(
        { error: "Both model image and garment image are required." },
        { status: 400 }
      );
    }

    // Determine target GPU engine
    const engineUrl = (customEngineUrl || process.env.AI_ENGINE_URL || "").trim().replace(/\/$/, "");

    // 1. If user provided a self-hosted Colab Gradio tunnel:
    if (engineUrl) {
      try {
        console.log(`Forwarding try-on request to GPU engine: ${engineUrl}`);
        
        // Gradio 4.x / 5.x API endpoint
        const gradioResponse = await fetch(`${engineUrl}/api/predict`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: [
              modelImageUrl,
              garmentImageUrl,
              category,
              Number(steps) || 30,
              Number(guidance) || 2.5,
            ],
          }),
        });

        if (gradioResponse.ok) {
          const data = await gradioResponse.json();
          // Gradio returns array of outputs
          const resultImage = Array.isArray(data?.data) ? data.data[0] : null;
          if (resultImage) {
            return NextResponse.json({
              success: true,
              resultUrl: resultImage,
              source: "self-hosted-colab",
            });
          }
        }
      } catch (err: any) {
        console.error("Colab engine error:", err?.message);
        // Continue to fallback
      }
    }

    // 2. If user configured Replicate API (Pay-as-you-go optional fallback)
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

    // 3. Fallback preview response if engine not connected
    return NextResponse.json({
      success: true,
      resultUrl: modelImageUrl,
      warning: "Running in preview mode. Connect your free Google Colab GPU URL in settings for real neural drape generation.",
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
