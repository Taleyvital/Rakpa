"use client";

import { useState } from "react";
import { creerItineraire } from "@/lib/itineraires";
import type {
  NouvelItineraireForm,
  NouvelleEtapeForm,
  TypeTransport,
  TypeEtape,
} from "@/types/itineraire";

const COMMUNES = [
  "Abobo", "Adjamé", "Attécoubé", "Cocody", "Koumassi",
  "Marcory", "Plateau", "Port-Bouët", "Treichville",
  "Yopougon", "Bingerville", "Anyama", "Songon",
];

const TRANSPORTS: { value: TypeTransport; label: string; emoji: string }[] = [
  { value: "gbaka",     label: "Gbaka",     emoji: "🚐" },
  { value: "woro-woro", label: "Wôrô-wôrô", emoji: "🚖" },
  { value: "sotra",     label: "Bus Sotra", emoji: "🚌" },
  { value: "zemidjan",  label: "Zémidjan",  emoji: "🛵" },
  { value: "mixte",     label: "Mixte",     emoji: "🔀" },
];

const SEGMENT_TYPES: { value: TypeEtape; label: string; emoji: string; color: string }[] = [
  { value: "gbaka",          label: "Gbaka",         emoji: "🚐", color: "bg-orange-100 text-orange-700" },
  { value: "woro-woro",      label: "Wôrô-wôrô",     emoji: "🚖", color: "bg-yellow-100 text-yellow-700" },
  { value: "sotra",          label: "Bus Sotra",     emoji: "🚌", color: "bg-blue-100 text-blue-700" },
  { value: "zemidjan",       label: "Zémidjan",      emoji: "🛵", color: "bg-green-100 text-green-700" },
  { value: "a_pied",         label: "À pied",        emoji: "🚶", color: "bg-gray-100 text-gray-600" },
  { value: "correspondance", label: "Correspondance", emoji: "🔄", color: "bg-purple-100 text-purple-700" },
];

const EMPTY_SEGMENT: NouvelleEtapeForm = {
  type: "gbaka",
  point_depart: "",
  point_arrivee: "",
  quoi_dire: "",
  arrets_intermediaires: [],
  prix: "",
  duree: "",
};

const EMPTY_FORM: NouvelItineraireForm = {
  depart: "",
  commune_depart: "",
  arrivee: "",
  commune_arrivee: "",
  type_transport: "",
  prix_min: "",
  prix_max: "",
  duree_min: "",
  duree_max: "",
  conseil_general: "",
  etapes: [],
};

interface Props {
  userId: string;
  onClose: () => void;
  onSuccess: (id: string) => void;
}

function inputCls(error?: boolean) {
  return `w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-medium placeholder:text-gray-400 outline-none focus:ring-2 ${
    error ? "ring-2 ring-red-400" : "focus:ring-black"
  }`;
}

function PillBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 whitespace-nowrap ${
        active ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex gap-1.5 px-5 py-3">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
            s <= step ? "bg-black" : "bg-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

/* ─── Segment card dans le builder de trajet ─── */
function SegmentCard({
  segment,
  index,
  total,
  onChange,
  onRemove,
}: {
  segment: NouvelleEtapeForm;
  index: number;
  total: number;
  onChange: (updated: NouvelleEtapeForm) => void;
  onRemove: () => void;
}) {
  const [newArret, setNewArret] = useState("");
  const showQuoiDire = segment.type !== "a_pied" && segment.type !== "correspondance";
  const segType = SEGMENT_TYPES.find((t) => t.value === segment.type);

  function set<K extends keyof NouvelleEtapeForm>(k: K, v: NouvelleEtapeForm[K]) {
    onChange({ ...segment, [k]: v });
  }

  function addArret() {
    if (!newArret.trim()) return;
    set("arrets_intermediaires", [...segment.arrets_intermediaires, newArret.trim()]);
    setNewArret("");
  }

  return (
    <div className="flex gap-3">
      {/* Timeline */}
      <div className="flex flex-col items-center shrink-0 w-8">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${segType?.color ?? "bg-gray-100"}`}>
          {segType?.emoji}
        </div>
        {index < total - 1 && (
          <div className="w-0.5 flex-1 bg-gray-200 my-1 min-h-[24px]" />
        )}
      </div>

      {/* Contenu */}
      <div className="flex-1 pb-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500">Segment {index + 1}</span>
          {total > 1 && (
            <button type="button" onClick={onRemove} className="text-gray-300 hover:text-red-400 transition-colors">
              <span className="material-symbols-outlined text-[16px]">delete</span>
            </button>
          )}
        </div>

        {/* Type de transport */}
        <div className="flex flex-wrap gap-1.5">
          {SEGMENT_TYPES.map((t) => (
            <PillBtn key={t.value} active={segment.type === t.value} onClick={() => set("type", t.value)}>
              {t.emoji} {t.label}
            </PillBtn>
          ))}
        </div>

        {/* Départ / Arrivée */}
        <div className="grid grid-cols-2 gap-2">
          <input
            className={inputCls(!segment.point_depart)}
            placeholder="Monter à…"
            value={segment.point_depart}
            onChange={(e) => set("point_depart", e.target.value)}
          />
          <input
            className={inputCls(!segment.point_arrivee)}
            placeholder="Descendre à…"
            value={segment.point_arrivee}
            onChange={(e) => set("point_arrivee", e.target.value)}
          />
        </div>

        {/* Quoi dire */}
        {showQuoiDire && (
          <input
            className={inputCls()}
            placeholder='Ce que tu dis au chauffeur — Ex: "Maroc direct"'
            value={segment.quoi_dire}
            onChange={(e) => set("quoi_dire", e.target.value)}
          />
        )}

        {/* Prix & durée */}
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number" min={0}
            className={inputCls()}
            placeholder="Prix (FCFA)"
            value={segment.prix}
            onChange={(e) => set("prix", e.target.value === "" ? "" : Number(e.target.value))}
          />
          <input
            type="number" min={0}
            className={inputCls()}
            placeholder="Durée (min)"
            value={segment.duree}
            onChange={(e) => set("duree", e.target.value === "" ? "" : Number(e.target.value))}
          />
        </div>

        {/* Arrêts intermédiaires */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
            Arrêts sur ce segment
          </p>
          {segment.arrets_intermediaires.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {segment.arrets_intermediaires.map((a, i) => (
                <span key={i} className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1 text-xs font-medium">
                  {a}
                  <button
                    type="button"
                    onClick={() => set("arrets_intermediaires", segment.arrets_intermediaires.filter((_, j) => j !== i))}
                    className="text-gray-400 hover:text-red-500 leading-none ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-xs font-medium placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-black"
              placeholder="Ex: Terminus Adjamé 220…"
              value={newArret}
              onChange={(e) => setNewArret(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addArret(); } }}
            />
            <button
              type="button"
              onClick={addArret}
              className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center shrink-0 active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Composant principal ─── */
export default function AjouterItineraire({ userId, onClose, onSuccess }: Props) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<NouvelItineraireForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function setField<K extends keyof NouvelItineraireForm>(k: K, v: NouvelItineraireForm[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
    setErrors((prev) => { const e = { ...prev }; delete e[k]; return e; });
  }

  function validateStep1(): boolean {
    const e: Record<string, string> = {};
    if (!form.depart.trim()) e.depart = "Requis";
    if (!form.commune_depart) e.commune_depart = "Requis";
    if (!form.arrivee.trim()) e.arrivee = "Requis";
    if (!form.commune_arrivee) e.commune_arrivee = "Requis";
    if (!form.type_transport) e.type_transport = "Requis";
    if (form.prix_min === "") e.prix_min = "Requis";
    if (form.prix_max === "") e.prix_max = "Requis";
    if (form.duree_min === "") e.duree_min = "Requis";
    if (form.duree_max === "") e.duree_max = "Requis";
    if (form.prix_min !== "" && form.prix_max !== "" && Number(form.prix_max) < Number(form.prix_min))
      e.prix_max = "Doit être ≥ min";
    if (form.duree_min !== "" && form.duree_max !== "" && Number(form.duree_max) < Number(form.duree_min))
      e.duree_max = "Doit être ≥ min";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function addSegment() {
    const last = form.etapes[form.etapes.length - 1];
    const newSeg: NouvelleEtapeForm = {
      ...EMPTY_SEGMENT,
      // pré-remplir le départ du nouveau segment avec l'arrivée du précédent
      point_depart: last?.point_arrivee ?? "",
    };
    setField("etapes", [...form.etapes, newSeg]);
  }

  function updateSegment(i: number, updated: NouvelleEtapeForm) {
    setField("etapes", form.etapes.map((s, idx) => (idx === i ? updated : s)));
  }

  function removeSegment(i: number) {
    setField("etapes", form.etapes.filter((_, idx) => idx !== i));
  }

  async function submit() {
    setLoading(true);
    setSubmitError(null);
    try {
      const id = await creerItineraire(form, userId);
      onSuccess(id);
    } catch (err) {
      setSubmitError((err as Error).message ?? "Erreur lors de la publication");
    } finally {
      setLoading(false);
    }
  }

  const STEP_TITLES = ["Infos générales", "Détail du trajet", "Confirmation"];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[92vh]">
        {/* Handle */}
        <div className="flex justify-center pt-3 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="px-5 pt-2 pb-1 flex items-center justify-between shrink-0">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Étape {step} / 3
            </p>
            <h2 className="font-black text-lg tracking-tight">{STEP_TITLES[step - 1]}</h2>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <ProgressBar step={step} />

        {/* Contenu scrollable */}
        <div
          className="overflow-y-auto overscroll-contain flex-1 px-5 pb-4 space-y-3"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >

          {/* ── ÉTAPE 1 — Infos générales ── */}
          {step === 1 && (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Départ *</label>
                <input
                  className={inputCls(!!errors.depart)}
                  placeholder="Ex: Carrefour La Vie, Cocody"
                  value={form.depart}
                  onChange={(e) => setField("depart", e.target.value)}
                />
                {errors.depart && <p className="text-xs text-red-500">{errors.depart}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Commune départ *</label>
                <select
                  className={inputCls(!!errors.commune_depart)}
                  value={form.commune_depart}
                  onChange={(e) => setField("commune_depart", e.target.value)}
                >
                  <option value="">Sélectionner…</option>
                  {COMMUNES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.commune_depart && <p className="text-xs text-red-500">{errors.commune_depart}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Arrivée *</label>
                <input
                  className={inputCls(!!errors.arrivee)}
                  placeholder="Ex: Yopougon Maroc"
                  value={form.arrivee}
                  onChange={(e) => setField("arrivee", e.target.value)}
                />
                {errors.arrivee && <p className="text-xs text-red-500">{errors.arrivee}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Commune arrivée *</label>
                <select
                  className={inputCls(!!errors.commune_arrivee)}
                  value={form.commune_arrivee}
                  onChange={(e) => setField("commune_arrivee", e.target.value)}
                >
                  <option value="">Sélectionner…</option>
                  {COMMUNES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.commune_arrivee && <p className="text-xs text-red-500">{errors.commune_arrivee}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Transport principal *</label>
                <div className="flex flex-wrap gap-2">
                  {TRANSPORTS.map((t) => (
                    <PillBtn
                      key={t.value}
                      active={form.type_transport === t.value}
                      onClick={() => setField("type_transport", t.value)}
                    >
                      {t.emoji} {t.label}
                    </PillBtn>
                  ))}
                </div>
                {errors.type_transport && <p className="text-xs text-red-500">{errors.type_transport}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Prix total (FCFA) *</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="number" min={0}
                      className={inputCls(!!errors.prix_min)}
                      placeholder="Min"
                      value={form.prix_min}
                      onChange={(e) => setField("prix_min", e.target.value === "" ? "" : Number(e.target.value))}
                    />
                    {errors.prix_min && <p className="text-xs text-red-500 mt-1">{errors.prix_min}</p>}
                  </div>
                  <div>
                    <input
                      type="number" min={0}
                      className={inputCls(!!errors.prix_max)}
                      placeholder="Max"
                      value={form.prix_max}
                      onChange={(e) => setField("prix_max", e.target.value === "" ? "" : Number(e.target.value))}
                    />
                    {errors.prix_max && <p className="text-xs text-red-500 mt-1">{errors.prix_max}</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Durée totale (minutes) *</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="number" min={0}
                      className={inputCls(!!errors.duree_min)}
                      placeholder="Min"
                      value={form.duree_min}
                      onChange={(e) => setField("duree_min", e.target.value === "" ? "" : Number(e.target.value))}
                    />
                    {errors.duree_min && <p className="text-xs text-red-500 mt-1">{errors.duree_min}</p>}
                  </div>
                  <div>
                    <input
                      type="number" min={0}
                      className={inputCls(!!errors.duree_max)}
                      placeholder="Max"
                      value={form.duree_max}
                      onChange={(e) => setField("duree_max", e.target.value === "" ? "" : Number(e.target.value))}
                    />
                    {errors.duree_max && <p className="text-xs text-red-500 mt-1">{errors.duree_max}</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Conseil général</label>
                <textarea
                  className={inputCls()}
                  rows={2}
                  placeholder="Astuce pratique pour ce trajet…"
                  value={form.conseil_general}
                  onChange={(e) => setField("conseil_general", e.target.value)}
                />
              </div>
            </>
          )}

          {/* ── ÉTAPE 2 — Builder de trajet ── */}
          {step === 2 && (
            <>
              {/* Explication */}
              <div className="bg-gray-50 rounded-2xl px-4 py-3 flex gap-3 items-start">
                <span className="text-xl shrink-0">🗺️</span>
                <p className="text-sm text-gray-600 font-medium leading-snug">
                  Décompose le trajet segment par segment. Si tu prends un <strong>gbaka</strong> puis un <strong>wôrô-wôrô</strong>, ajoute un segment pour chacun.
                </p>
              </div>

              {/* Terminus de départ */}
              {form.etapes.length > 0 && (
                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-white text-[14px]">trip_origin</span>
                  </div>
                  <span className="text-sm font-bold">{form.depart || "Point de départ"}</span>
                </div>
              )}

              {/* Segments */}
              {form.etapes.map((seg, i) => (
                <SegmentCard
                  key={i}
                  segment={seg}
                  index={i}
                  total={form.etapes.length}
                  onChange={(updated) => updateSegment(i, updated)}
                  onRemove={() => removeSegment(i)}
                />
              ))}

              {/* Terminus d'arrivée */}
              {form.etapes.length > 0 && (
                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-white text-[14px]">location_on</span>
                  </div>
                  <span className="text-sm font-bold">{form.arrivee || "Point d'arrivée"}</span>
                </div>
              )}

              {/* Bouton ajouter segment */}
              <button
                type="button"
                onClick={addSegment}
                className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 text-sm font-semibold hover:border-black hover:text-black transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">add_road</span>
                {form.etapes.length === 0 ? "Ajouter le premier segment" : "Ajouter un autre véhicule"}
              </button>

              {form.etapes.length === 0 && (
                <p className="text-center text-xs text-gray-400 -mt-1">
                  Optionnel — tu peux passer cette étape
                </p>
              )}
            </>
          )}

          {/* ── ÉTAPE 3 — Confirmation ── */}
          {step === 3 && (
            <>
              <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {TRANSPORTS.find((t) => t.value === form.type_transport)?.emoji ?? "🚌"}
                  </span>
                  <div>
                    <p className="font-black text-base tracking-tight">
                      {form.depart} → {form.arrivee}
                    </p>
                    <p className="text-xs text-gray-500">
                      {form.commune_depart} → {form.commune_arrivee}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white rounded-xl py-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Durée</p>
                    <p className="font-bold text-sm">{form.duree_min}–{form.duree_max} min</p>
                  </div>
                  <div className="bg-white rounded-xl py-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Prix</p>
                    <p className="font-bold text-sm">{form.prix_min}–{form.prix_max} F</p>
                  </div>
                  <div className="bg-white rounded-xl py-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Segments</p>
                    <p className="font-bold text-sm">{form.etapes.length}</p>
                  </div>
                </div>

                {/* Mini timeline de confirmation */}
                {form.etapes.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Détail du trajet</p>
                    {form.etapes.map((seg, i) => {
                      const t = SEGMENT_TYPES.find((s) => s.value === seg.type);
                      return (
                        <div key={i} className="flex items-center gap-2 text-xs font-medium">
                          <span className={`px-2 py-0.5 rounded-lg ${t?.color ?? "bg-gray-100"}`}>
                            {t?.emoji} {t?.label}
                          </span>
                          <span className="text-gray-500">{seg.point_depart || "—"}</span>
                          <span className="material-symbols-outlined text-[12px] text-gray-300">arrow_forward</span>
                          <span className="text-gray-500">{seg.point_arrivee || "—"}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {form.conseil_general && (
                  <p className="text-xs text-gray-500 italic border-t border-gray-100 pt-3">
                    "{form.conseil_general}"
                  </p>
                )}
              </div>

              <div className="flex items-start gap-3 bg-orange-50 rounded-2xl px-4 py-3">
                <span className="text-xl shrink-0">🗳️</span>
                <p className="text-sm text-orange-800 font-medium leading-snug">
                  Ton itinéraire sera visible après <strong>5 votes positifs</strong> de la communauté.
                </p>
              </div>

              {submitError && (
                <div className="bg-red-50 text-red-700 text-sm font-medium rounded-xl px-4 py-3">
                  {submitError}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-8 pt-3 border-t border-gray-100 shrink-0 flex flex-col gap-2">
          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !validateStep1()) return;
                setStep((s) => s + 1);
              }}
              className="w-full bg-black text-white rounded-2xl py-4 font-bold text-sm tracking-[0.1em] uppercase active:scale-95 transition-all"
            >
              Continuer
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={loading}
              className="w-full bg-black text-white rounded-2xl py-4 font-bold text-sm tracking-[0.1em] uppercase active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loading
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Envoi…</>
                : "Publier l'itinéraire 🚀"}
            </button>
          )}
          <button
            type="button"
            onClick={() => step === 1 ? onClose() : setStep((s) => s - 1)}
            className="w-full bg-gray-100 text-gray-700 rounded-2xl py-4 font-bold text-sm tracking-[0.1em] uppercase active:scale-95 transition-all hover:bg-gray-200 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            {step === 1 ? "Annuler" : "Précédent"}
          </button>
        </div>
      </div>
    </div>
  );
}
