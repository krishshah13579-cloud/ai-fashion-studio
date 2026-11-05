"use client";

import React, { useState, useEffect } from "react";
import {
  Upload,
  Sparkles,
  Download,
  Settings2,
  RefreshCw,
  CheckCircle2,
  Layers,
  ArrowRight,
  ExternalLink,
  Sliders,
  Image as ImageIcon,
  Server
} from "lucide-react";

interface ModelPreset {
  id: string;
  name: string;
  gender: "female" | "male";
  backdrop: string;
  imageUrl: string;
}

const PRESET_MODELS: ModelPreset[] = [
  {
    id: "zara-fem-1",
    name: "Elena • Studio Neutral Grey",
    gender: "female",
    backdrop: "Zara Cyclorama",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "zara-fem-2",
    name: "Clara • Soft Beige Atelier",
    gender: "female",
    backdrop: "Warm Minimalist",
    imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "zara-fem-3",
    name: "Maya • Editorial Concrete",
    gender: "female",
    backdrop: "Raw Studio",
    imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "zara-male-1",
    name: "Julian • Clean Monolith",
    gender: "male",
    backdrop: "Architectural Grey",
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "zara-male-2",
    name: "Marcus • High-Key White",
    gender: "male",
    backdrop: "H&M Catalog White",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "zara-fem-4",
    name: "Sasha • Subtle Daylight",
    gender: "female",
    backdrop: "Minimal Shadow",
    imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=900&q=80",
  },
];

export default function FashionStudioPage() {
  const [selectedGender, setSelectedGender] = useState<"all" | "female" | "male">("female");
  const [selectedModel, setSelectedModel] = useState<ModelPreset>(PRESET_MODELS[0]);
  const [garmentImage, setGarmentImage] = useState<string | null>(null);
  const [garmentCategory, setGarmentCategory] = useState<"upper" | "lower" | "overall">("upper");
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);
  const [recentLookbook, setRecentLookbook] = useState<string[]>([]);
  
  // Engine settings
  const [showSettings, setShowSettings] = useState(false);
  const [engineUrl, setEngineUrl] = useState("");
  const [steps, setSteps] = useState(30);
  const [guidance, setGuidance] = useState(2.5);

  useEffect(() => {
    const saved = localStorage.getItem("fashion_studio_engine_url");
    if (saved) setEngineUrl(saved);
  }, []);

  const saveEngine = (url: string) => {
    setEngineUrl(url);
    localStorage.setItem("fashion_studio_engine_url", url);
  };

  const filteredModels = PRESET_MODELS.filter((m) =>
    selectedGender === "all" ? true : m.gender === selectedGender
  );

  const handleGarmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setGarmentImage(event.target?.result as string);
      setResultImage(null);
      setWarningMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!garmentImage) {
      alert("Please upload your product garment photo first!");
      return;
    }

    setIsGenerating(true);
    setWarningMsg(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelImageUrl: selectedModel.imageUrl,
          garmentImageUrl: garmentImage,
          category: garmentCategory,
          customEngineUrl: engineUrl,
          steps,
          guidance,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      if (data.warning) setWarningMsg(data.warning);

      const generated = data.resultUrl || selectedModel.imageUrl;
      setResultImage(generated);
      setRecentLookbook((prev) => [generated, ...prev.slice(0, 5)]);
    } catch (err: any) {
      alert(err.message || "Failed to generate image.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const a = document.createElement("a");
    a.href = resultImage;
    a.download = `zara-lookbook-${Date.now()}.jpg`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-editorial text-lg tracking-[0.2em] uppercase font-bold text-white">
            ATELIER STUDIO
          </span>
          <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300">
            Self-Hosted Next.js
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Coolify Cloud Ready</span>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-zinc-300 transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>GPU Engine</span>
          </button>
        </div>
      </header>

      {/* Settings Modal / Banner */}
      {showSettings && (
        <div className="bg-zinc-900/90 border-b border-zinc-800 px-6 py-4 transition-all">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                <span>Free Colab GPU Engine URL</span>
              </div>
              <p className="text-xs text-zinc-400 mb-2">
                Paste the free public URL from your running Google Colab notebook (e.g. <code>https://xxxx.gradio.live</code>) to execute unlimited free neural try-on.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={engineUrl}
                  onChange={(e) => saveEngine(e.target.value)}
                  placeholder="https://xxxx.gradio.live"
                  className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                />
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-3 py-1.5 bg-white text-black font-semibold rounded-lg text-xs hover:bg-zinc-200"
                >
                  Save
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-zinc-400">
              <div>
                <label className="block text-[11px] mb-1">Fidelity: {guidance}</label>
                <input
                  type="range"
                  min="1.5"
                  max="4.0"
                  step="0.1"
                  value={guidance}
                  onChange={(e) => setGuidance(parseFloat(e.target.value))}
                  className="accent-white h-1.5 w-24 bg-zinc-700 rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-[11px] mb-1">Steps: {steps}</label>
                <input
                  type="range"
                  min="20"
                  max="45"
                  step="1"
                  value={steps}
                  onChange={(e) => setSteps(parseInt(e.target.value))}
                  className="accent-white h-1.5 w-24 bg-zinc-700 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Studio Workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Model Selection & Garment Upload */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* 1. Base Model Picker */}
          <section className="editorial-glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-editorial text-lg tracking-wider font-semibold text-white">
                  1. Base Model & Studio Aesthetic
                </h2>
                <p className="text-xs text-zinc-400">
                  Select clean Zara / H&M catalog lighting and editorial poses
                </p>
              </div>

              {/* Gender Filter */}
              <div className="flex rounded-lg border border-zinc-800 bg-zinc-950/60 p-0.5">
                {(["female", "male", "all"] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGender(g)}
                    className={`px-3 py-1 text-xs font-medium capitalize rounded-md transition-all ${
                      selectedGender === g
                        ? "bg-zinc-800 text-white shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {g === "all" ? "All" : g}
                  </button>
                ))}
              </div>
            </div>

            {/* Models Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
              {filteredModels.map((model) => {
                const isActive = selectedModel.id === model.id;
                return (
                  <div
                    key={model.id}
                    onClick={() => setSelectedModel(model)}
                    className={`group relative rounded-xl overflow-hidden cursor-pointer border transition-all duration-200 ${
                      isActive
                        ? "border-white ring-2 ring-white/20 shadow-xl"
                        : "border-zinc-800 hover:border-zinc-600 bg-zinc-900/50"
                    }`}
                  >
                    <div className="aspect-[3/4] w-full overflow-hidden bg-zinc-900">
                      <img
                        src={model.imageUrl}
                        alt={model.name}
                        className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-2.5 bg-zinc-950/90 border-t border-zinc-900">
                      <p className="text-xs font-medium text-zinc-200 truncate">{model.name}</p>
                      <p className="text-[10px] text-zinc-400 truncate">{model.backdrop}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 2. Garment Upload Section */}
          <section className="editorial-glass rounded-2xl p-6">
            <h2 className="font-editorial text-lg tracking-wider font-semibold text-white mb-1">
              2. Your Product Garment
            </h2>
            <p className="text-xs text-zinc-400 mb-4">
              Phone photo of flat-lay, hanger, or ghost mannequin
            </p>

            {/* Category Selector */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              {[
                { id: "upper", label: "Tops / Outerwear" },
                { id: "lower", label: "Pants / Skirts" },
                { id: "overall", label: "Dresses / Full" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setGarmentCategory(cat.id as any)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                    garmentCategory === cat.id
                      ? "bg-zinc-800 border-white text-white"
                      : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Dropzone */}
            <label className="block border-2 border-dashed border-zinc-700 hover:border-zinc-400 rounded-xl p-8 text-center cursor-pointer transition-all bg-zinc-950/40 relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleGarmentUpload}
                className="hidden"
              />

              {garmentImage ? (
                <div className="flex flex-col items-center">
                  <img
                    src={garmentImage}
                    alt="Uploaded Garment"
                    className="max-h-48 rounded-lg shadow-lg object-contain mb-3"
                  />
                  <p className="text-xs text-zinc-400 underline hover:text-white">
                    Click to replace photo
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center py-4">
                  <Upload className="w-8 h-8 text-zinc-500 mb-3" />
                  <p className="text-sm font-medium text-zinc-200">
                    Upload your garment photo
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Drag and drop or browse from your device
                  </p>
                </div>
              )}
            </label>

            {/* Generate Trigger */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !garmentImage}
              className={`w-full mt-6 py-4 rounded-xl font-semibold text-sm transition-all shadow-xl flex items-center justify-center gap-2 ${
                isGenerating || !garmentImage
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : "bg-white hover:bg-zinc-200 text-black cursor-pointer hover:shadow-white/10"
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Draping Fabric & Rendering Lighting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Zara Catalog Photo</span>
                </>
              )}
            </button>
          </section>
        </div>

        {/* Right Column: High-Res Catalog Studio Canvas */}
        <div className="lg:col-span-5 flex flex-col">
          <section className="editorial-glass rounded-2xl p-6 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-editorial text-lg tracking-wider font-semibold text-white">
                  3. Studio Viewport
                </h2>
                <span className="text-xs text-zinc-400">
                  {resultImage ? "Ready to export" : "Awaiting generation"}
                </span>
              </div>

              {warningMsg && (
                <div className="mb-4 p-3 rounded-lg bg-zinc-900 border border-amber-500/30 text-amber-300 text-xs">
                  {warningMsg}
                </div>
              )}

              {/* Viewport Frame */}
              <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                {isGenerating ? (
                  <div className="flex flex-col items-center gap-3 p-6 text-center">
                    <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs tracking-wider uppercase text-zinc-300 font-medium">
                      Synthesizing Zara Lookbook
                    </p>
                    <p className="text-[11px] text-zinc-500 max-w-xs">
                      Matching fabric texture, shadows, and natural fold drape on model
                    </p>
                  </div>
                ) : resultImage ? (
                  <img
                    src={resultImage}
                    alt="Generated Look"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6">
                    <div className="w-14 h-14 mx-auto rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-3 font-editorial text-lg">
                      ZARA
                    </div>
                    <p className="text-sm font-medium text-zinc-400">No generation active</p>
                    <p className="text-xs text-zinc-600 mt-1 max-w-xs mx-auto">
                      Upload your garment on the left to see the editorial photo rendered here.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Export Toolbar */}
            {resultImage && (
              <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-col gap-3">
                <button
                  onClick={handleDownload}
                  className="w-full py-3 bg-white text-black font-semibold rounded-lg text-xs hover:bg-zinc-200 flex items-center justify-center gap-2 shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  <span>Download High-Resolution (JPG)</span>
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Bottom Lookbook History */}
      {recentLookbook.length > 0 && (
        <footer className="border-t border-zinc-800/80 bg-zinc-950/90 p-6">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-zinc-400 mb-3">
              Session Lookbook ({recentLookbook.length})
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {recentLookbook.map((img, i) => (
                <div
                  key={i}
                  className="w-20 h-28 rounded-lg overflow-hidden border border-zinc-800 flex-shrink-0 cursor-pointer hover:border-white transition-all"
                  onClick={() => setResultImage(img)}
                >
                  <img src={img} alt="Past generation" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
