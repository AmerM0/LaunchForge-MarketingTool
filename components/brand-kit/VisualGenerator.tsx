"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ImageIcon,
  Loader2,
  Download,
  Wand2,
  RefreshCw,
  ZoomIn,
  X,
  Sparkles,
  Upload,
  Image as ImagePlus,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface GeneratedImage {
  url: string;
  width: number;
  height: number;
  content_type: string;
}

export interface VisualGeneratorProps {
  brandName?: string;
  brandColors?: string;
  brandArchetype?: string;
  productIdea?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const USE_CASES = [
  {
    id: "ad_creative",
    icon: "📢",
    label: "Ad Creative",
    desc: "Paid social & display",
    defaultAspect: "landscape_16_9",
  },
  {
    id: "instagram_post",
    icon: "📸",
    label: "Instagram Post",
    desc: "Feed & carousel",
    defaultAspect: "square_hd",
  },
  {
    id: "product_listing",
    icon: "🛍️",
    label: "Product Listing",
    desc: "E-commerce & marketplace",
    defaultAspect: "square_hd",
  },
  {
    id: "story_reel",
    icon: "🎬",
    label: "Story / Reel",
    desc: "Vertical mobile content",
    defaultAspect: "portrait_16_9",
  },
  {
    id: "email_banner",
    icon: "📧",
    label: "Email Banner",
    desc: "Newsletter header",
    defaultAspect: "landscape_16_9",
  },
  {
    id: "general",
    icon: "✨",
    label: "General",
    desc: "Multi-use brand visual",
    defaultAspect: "square_hd",
  },
] as const;

const PHOTOGRAPHY_STYLES = [
  { id: "product_white", icon: "⬜", label: "Product on White",  desc: "Clean e-commerce shots" },
  { id: "lifestyle",     icon: "🌿", label: "Lifestyle",         desc: "Natural real-world usage" },
  { id: "flat_lay",      icon: "📐", label: "Flat Lay",          desc: "Styled top-down view" },
  { id: "editorial",     icon: "✨", label: "Editorial",         desc: "High-end magazine look" },
  { id: "environmental", icon: "🏙️", label: "Environmental",    desc: "In context / location" },
  { id: "macro",         icon: "🔍", label: "Macro / Detail",    desc: "Close-up texture shot" },
  { id: "campaign",      icon: "🎬", label: "Campaign Hero",     desc: "Cinematic brand hero" },
];

const MOODS = [
  { id: "luxury",       label: "Luxury",       ring: "ring-amber-500/60",   bg: "bg-amber-500/10",   text: "text-amber-300" },
  { id: "minimal",      label: "Minimal",      ring: "ring-slate-400/60",   bg: "bg-slate-500/10",   text: "text-slate-300" },
  { id: "vibrant",      label: "Vibrant",      ring: "ring-pink-500/60",    bg: "bg-pink-500/10",    text: "text-pink-300" },
  { id: "natural",      label: "Natural",      ring: "ring-emerald-500/60", bg: "bg-emerald-500/10", text: "text-emerald-300" },
  { id: "dark",         label: "Dark & Moody", ring: "ring-slate-600/60",   bg: "bg-slate-900/40",   text: "text-slate-400" },
  { id: "playful",      label: "Playful",      ring: "ring-orange-500/60",  bg: "bg-orange-500/10",  text: "text-orange-300" },
  { id: "professional", label: "Professional", ring: "ring-blue-500/60",    bg: "bg-blue-500/10",    text: "text-blue-300" },
];

const ASPECT_RATIOS = [
  { id: "square_hd",      label: "Square",     sub: "1024×1024", icon: "⬛" },
  { id: "portrait_4_3",   label: "Portrait",   sub: "768×1024",  icon: "📱" },
  { id: "portrait_16_9",  label: "Story",      sub: "576×1024",  icon: "📲" },
  { id: "landscape_16_9", label: "Widescreen", sub: "1024×576",  icon: "🖥️" },
  { id: "landscape_4_3",  label: "Landscape",  sub: "1024×768",  icon: "🖼️" },
];

const STRENGTH_OPTIONS = [
  { value: 0.65, label: "Subtle",   desc: "Preserve most of original" },
  { value: 0.80, label: "Balanced", desc: "Blend style & structure" },
  { value: 0.92, label: "Creative", desc: "Strong style transformation" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Image compression utility (client-side, before sending to API)
// ─────────────────────────────────────────────────────────────────────────────

async function compressImage(file: File, maxPx = 1024, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new window.Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        const w = Math.round(img.width  * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width  = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function VisualGenerator({
  brandName,
  brandColors,
  brandArchetype,
  productIdea,
}: VisualGeneratorProps) {
  // Mode
  const [mode, setMode] = useState<"txt2img" | "img2img">("txt2img");

  // Use case
  const [useCase, setUseCase] = useState("instagram_post");

  // Style controls
  const [style,       setStyle]       = useState("product_white");
  const [mood,        setMood]        = useState("luxury");
  const [aspectRatio, setAspectRatio] = useState("square_hd");
  const [numImages,   setNumImages]   = useState(2);

  // Text inputs
  const [productDescription, setProductDescription] = useState(productIdea ?? "");
  const [scene,              setScene]              = useState("");
  const [additionalDetails,  setAdditionalDetails]  = useState("");
  const [useColorContext,    setUseColorContext]     = useState(true);

  // Image-to-image
  const [uploadedFile,    setUploadedFile]    = useState<File | null>(null);
  const [previewUrl,      setPreviewUrl]      = useState<string | null>(null);
  const [strength,        setStrength]        = useState(0.80);
  const [isDragging,      setIsDragging]      = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generation state
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [images,     setImages]     = useState<GeneratedImage[]>([]);
  const [lastPrompt, setLastPrompt] = useState("");

  // Lightbox
  const [lightbox, setLightbox] = useState<GeneratedImage | null>(null);

  // ── Use case select — auto-update aspect ratio ──────────────────────────────
  function selectUseCase(id: string) {
    setUseCase(id);
    const uc = USE_CASES.find((u) => u.id === id);
    if (uc) setAspectRatio(uc.defaultAspect);
  }

  // ── File upload handlers ────────────────────────────────────────────────────
  function handleFileSelect(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPEG, PNG, WebP).");
      return;
    }
    setUploadedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  function clearUpload() {
    setUploadedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── Generate ────────────────────────────────────────────────────────────────
  async function handleGenerate() {
    if (mode === "img2img" && !uploadedFile) {
      setError("Upload a reference product photo first.");
      return;
    }
    if (mode === "txt2img" && !productDescription.trim()) {
      setError("Please describe your product first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let imageData: string | undefined;

      if (mode === "img2img" && uploadedFile) {
        // Compress to ≤1024px JPEG before base64 encoding
        imageData = await compressImage(uploadedFile);
      }

      const res = await fetch("/api/brand/visuals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName,
          productDescription: productDescription.trim() || undefined,
          photographyStyle: style,
          mood,
          useCase,
          scene: scene.trim()             || undefined,
          colorContext: useColorContext && brandColors ? brandColors : undefined,
          additionalDetails: additionalDetails.trim() || undefined,
          aspectRatio,
          numImages,
          // img2img only
          imageData,
          strength,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403 && data.redirect) {
          window.location.href = data.redirect;
          return;
        }
        throw new Error(data.error ?? "Image generation failed");
      }

      setImages((prev) => [...data.images, ...prev]);
      setLastPrompt(data.prompt ?? "");
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(img: GeneratedImage, idx: number) {
    try {
      const res  = await fetch(img.url);
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `${brandName ?? "brand"}-visual-${idx + 1}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(img.url, "_blank");
    }
  }

  const canGenerate =
    !loading &&
    (mode === "txt2img" ? !!productDescription.trim() : !!uploadedFile);

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-violet-400" />
            Visual Studio
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            AI-powered brand photography · FLUX 1.1 Pro
          </p>
        </div>
        {brandArchetype && (
          <Badge variant="outline" className="text-violet-400 border-violet-500/30 shrink-0 hidden sm:flex">
            {brandArchetype}
          </Badge>
        )}
      </div>

      {/* ── Mode toggle ── */}
      <div className="glass-card p-1.5 flex gap-1.5 w-fit rounded-xl">
        <button
          onClick={() => setMode("txt2img")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200",
            mode === "txt2img"
              ? "bg-violet-600 text-white shadow-md shadow-violet-900/40"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Sparkles className="w-4 h-4" />
          Text to Image
        </button>
        <button
          onClick={() => setMode("img2img")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200",
            mode === "img2img"
              ? "bg-violet-600 text-white shadow-md shadow-violet-900/40"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Layers className="w-4 h-4" />
          Image to Image
        </button>
      </div>

      {mode === "img2img" && (
        <p className="text-xs text-muted-foreground -mt-3 ml-1">
          Upload your existing product photo — we&apos;ll apply professional studio styles while preserving your product.
        </p>
      )}

      {/* ── Use Case selector ── */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground">
          What is this for?
          <span className="text-muted-foreground font-normal ml-2 text-xs">
            Auto-selects the best format
          </span>
        </Label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {USE_CASES.map((uc) => (
            <button
              key={uc.id}
              onClick={() => selectUseCase(uc.id)}
              className={cn(
                "p-2.5 rounded-xl border text-center transition-all duration-200 group",
                useCase === uc.id
                  ? "border-violet-500 bg-violet-500/10 ring-1 ring-violet-500/30"
                  : "border-white/10 bg-background/30 hover:border-white/20"
              )}
            >
              <div className="text-xl mb-1">{uc.icon}</div>
              <p className={cn(
                "text-[11px] font-semibold leading-tight",
                useCase === uc.id ? "text-violet-300" : "text-foreground"
              )}>
                {uc.label}
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{uc.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main body: form + gallery ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Left: controls */}
        <div className="lg:col-span-2 space-y-5">

          {/* ── Image upload (img2img only) ── */}
          {mode === "img2img" && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">
                Reference Product Photo <span className="text-destructive">*</span>
              </Label>

              {previewUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-white/10 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Reference"
                    className="w-full h-auto max-h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={clearUpload}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/80 text-white text-xs font-medium"
                    >
                      <X className="w-3 h-3" />
                      Remove
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <Badge className="bg-black/60 text-white text-[10px] border-white/10">
                      {uploadedFile?.name}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
                    isDragging
                      ? "border-violet-400 bg-violet-500/10"
                      : "border-white/15 bg-background/20 hover:border-violet-500/40 hover:bg-violet-500/5"
                  )}
                >
                  <Upload className="w-8 h-8 text-muted-foreground/60 mx-auto mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Drop your product photo here
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    or click to browse · JPEG, PNG, WebP
                  </p>
                  <p className="text-[10px] text-muted-foreground/40 mt-2">
                    Compressed to 1024px before sending
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f);
                }}
              />

              {/* Transformation strength */}
              {previewUrl && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Transformation Strength
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {STRENGTH_OPTIONS.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setStrength(s.value)}
                        className={cn(
                          "p-2 rounded-lg border text-center transition-all",
                          strength === s.value
                            ? "border-violet-500 bg-violet-500/10 text-violet-300"
                            : "border-white/10 bg-background/30 text-muted-foreground hover:border-white/20"
                        )}
                      >
                        <p className="text-xs font-semibold">{s.label}</p>
                        <p className="text-[10px] leading-tight mt-0.5 opacity-70">{s.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Product description ── */}
          <div className="glass-card p-4 space-y-2">
            <Label className="text-sm font-semibold text-foreground">
              {mode === "img2img" ? "Product Description" : <>Product Description <span className="text-destructive">*</span></>}
              {mode === "img2img" && (
                <span className="text-muted-foreground font-normal ml-1 text-xs">(optional — enhances accuracy)</span>
              )}
            </Label>
            <Textarea
              placeholder={
                productIdea
                  ? productIdea.slice(0, 80)
                  : "e.g. Premium leather wallet with minimalist card slots, cognac brown"
              }
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              className="resize-none bg-background/40 border-white/10 focus:border-violet-500/50 text-sm"
              rows={3}
            />
          </div>

          {/* ── Photography style ── */}
          <div className="glass-card p-4 space-y-3">
            <Label className="text-sm font-semibold text-foreground">
              {mode === "img2img" ? "Transform Into Style" : "Photography Style"}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {PHOTOGRAPHY_STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={cn(
                    "p-2.5 rounded-lg border text-left transition-all duration-200",
                    style === s.id
                      ? "border-violet-500 bg-violet-500/10 text-violet-300"
                      : "border-white/10 bg-background/30 text-muted-foreground hover:border-white/20 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-base">{s.icon}</span>
                    <span className="text-xs font-semibold">{s.label}</span>
                  </div>
                  <p className="text-[10px] leading-tight opacity-70">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* ── Mood ── */}
          <div className="glass-card p-4 space-y-3">
            <Label className="text-sm font-semibold text-foreground">Mood &amp; Tone</Label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMood(m.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200",
                    mood === m.id
                      ? `${m.bg} ring-1 ${m.ring} border-transparent ${m.text} scale-105`
                      : "border-white/10 bg-background/30 text-muted-foreground hover:border-white/20"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Scene + extras ── */}
          <div className="glass-card p-4 space-y-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-foreground">Scene / Setting</Label>
              <input
                placeholder="e.g. marble countertop, golden hour beach, urban rooftop café"
                value={scene}
                onChange={(e) => setScene(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background/40 border border-white/10 focus:border-violet-500/50 focus:outline-none text-sm text-foreground placeholder:text-muted-foreground/60"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-foreground">Additional Details</Label>
              <input
                placeholder="e.g. bokeh background, dew drops, shallow depth of field"
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background/40 border border-white/10 focus:border-violet-500/50 focus:outline-none text-sm text-foreground placeholder:text-muted-foreground/60"
              />
            </div>
            {brandColors && (
              <button
                onClick={() => setUseColorContext(!useColorContext)}
                className="flex items-center gap-2 text-xs transition-colors text-left"
              >
                <div
                  className={cn(
                    "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                    useColorContext ? "bg-violet-500 border-violet-500" : "border-white/20"
                  )}
                >
                  {useColorContext && <span className="text-white text-[8px]">✓</span>}
                </div>
                <span className={useColorContext ? "text-violet-400" : "text-muted-foreground"}>
                  Incorporate brand color palette
                </span>
              </button>
            )}
          </div>

          {/* ── Aspect ratio ── */}
          <div className="glass-card p-4 space-y-3">
            <Label className="text-sm font-semibold text-foreground">
              Aspect Ratio
              <span className="text-muted-foreground font-normal text-xs ml-2">
                (auto-set by use case)
              </span>
            </Label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {ASPECT_RATIOS.map((ar) => (
                <button
                  key={ar.id}
                  onClick={() => setAspectRatio(ar.id)}
                  className={cn(
                    "p-2 rounded-lg border text-center transition-all",
                    aspectRatio === ar.id
                      ? "border-violet-500 bg-violet-500/10 text-violet-300"
                      : "border-white/10 bg-background/30 text-muted-foreground hover:border-white/20"
                  )}
                >
                  <span className="text-base">{ar.icon}</span>
                  <p className="text-[11px] font-medium">{ar.label}</p>
                  <p className="text-[10px] text-muted-foreground">{ar.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* ── Number of images ── */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-semibold text-foreground">Images</Label>
              <p className="text-[10px] text-muted-foreground">
                {mode === "txt2img" ? "~$0.04/image" : "~$0.02/image"} · ~3s each
              </p>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => setNumImages(n)}
                  className={cn(
                    "w-10 h-10 rounded-lg border text-sm font-semibold transition-all",
                    numImages === n
                      ? "border-violet-500 bg-violet-500/20 text-violet-300"
                      : "border-white/10 bg-background/30 text-muted-foreground hover:border-white/20"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* ── Generate button ── */}
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-violet-900/40 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating {numImages} image{numImages > 1 ? "s" : ""}…
              </>
            ) : (
              <>
                {mode === "img2img" ? <ImagePlus className="w-4 h-4 mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Generate Brand Visuals
              </>
            )}
          </Button>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        {/* Right: gallery */}
        <div className="lg:col-span-3">
          {images.length === 0 && !loading ? (
            <div className="glass-card h-full min-h-[420px] flex flex-col items-center justify-center text-center p-10 border-dashed">
              <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
                <ImageIcon className="w-8 h-8 text-violet-400/50" />
              </div>
              <p className="text-muted-foreground font-medium">Generated images appear here</p>
              <p className="text-muted-foreground/60 text-xs mt-1.5 max-w-[220px] leading-relaxed">
                {mode === "img2img"
                  ? "Upload a product photo and choose a style to transform it"
                  : "Choose your use case, describe your product, and click Generate"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Loading skeletons */}
              {loading && (
                <div className={cn("grid gap-3", numImages > 1 ? "grid-cols-2" : "grid-cols-1")}>
                  {Array.from({ length: numImages }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-white/5 border border-white/10 animate-pulse flex items-center justify-center"
                      style={{ aspectRatio: arValue(aspectRatio) }}
                    >
                      <Loader2 className="w-5 h-5 text-violet-400/40 animate-spin" />
                    </div>
                  ))}
                </div>
              )}

              {images.length > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {images.length} image{images.length > 1 ? "s" : ""} generated
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleGenerate}
                      disabled={loading}
                      className="text-xs text-muted-foreground hover:text-violet-400"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Regenerate
                    </Button>
                  </div>

                  <div className={cn("grid gap-3", images.length === 1 ? "grid-cols-1" : "grid-cols-2")}>
                    {images.map((img, i) => (
                      <div key={`${img.url}-${i}`} className="group relative rounded-xl overflow-hidden border border-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={`Brand visual ${i + 1}`}
                          className="w-full h-auto object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button
                            onClick={() => setLightbox(img)}
                            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
                          >
                            <ZoomIn className="w-4 h-4 text-white" />
                          </button>
                          <button
                            onClick={() => handleDownload(img, i)}
                            className="w-10 h-10 rounded-full bg-violet-500/60 backdrop-blur border border-violet-400/30 flex items-center justify-center hover:bg-violet-500/80 transition-colors"
                          >
                            <Download className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {lastPrompt && (
                    <details className="group">
                      <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors list-none flex items-center gap-1.5">
                        <span className="group-open:rotate-90 transition-transform inline-block text-[10px]">▶</span>
                        View prompt used
                      </summary>
                      <div className="mt-2 p-3 rounded-lg bg-white/5 border border-white/10 text-[11px] text-muted-foreground leading-relaxed font-mono">
                        {lastPrompt}
                      </div>
                    </details>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-10 right-0 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.url}
              alt="Brand visual"
              className="w-full h-auto rounded-xl shadow-2xl"
            />
            <div className="mt-3 flex justify-end">
              <Button
                size="sm"
                onClick={() => handleDownload(lightbox, 0)}
                className="bg-violet-600 hover:bg-violet-500"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function arValue(ar: string): string {
  const m: Record<string, string> = {
    square_hd:      "1 / 1",
    square:         "1 / 1",
    portrait_4_3:   "3 / 4",
    portrait_16_9:  "9 / 16",
    landscape_4_3:  "4 / 3",
    landscape_16_9: "16 / 9",
  };
  return m[ar] ?? "1 / 1";
}
