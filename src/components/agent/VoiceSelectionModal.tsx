import React, { useMemo, useState, useEffect } from "react";
import { X, Play, Pause } from "lucide-react";

export interface Voice {
  voice_id: string;
  voice_name: string;
  provider: "elevenlabs" | "openai" | string;
  accent?: string;
  gender?: "male" | "female" | string;
  age?: string;
  avatar_url?: string;
  preview_audio_url?: string;
}

interface VoiceSelectionModalProps {
  voices: Voice[];
  selectedVoiceId: string;
  isOpen: boolean;
  onSelect: (voiceId: string) => void;
  onClose: () => void;
}

export const VoiceSelectionModal: React.FC<VoiceSelectionModalProps> = ({
  voices,
  selectedVoiceId,
  isOpen,
  onSelect,
  onClose,
}) => {
  /* ------------------------------------------------------------------ */
  /* providers (PlayHT removed)                                          */
  /* ------------------------------------------------------------------ */
  const providers = ["elevenlabs", "openai"] as const;

  /* ------------------------------------------------------------------ */
  /* local state                                                         */
  /* ------------------------------------------------------------------ */
  const [activeProvider, setActiveProvider] =
    useState<(typeof providers)[number]>("openai");
  const [genderFilter, setGenderFilter] = useState("");
  const [accentFilter, setAccentFilter] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [playingId, setPlayingId] = useState("");

  /* ------------------------------------------------------------------ */
  /* derived data                                                        */
  /* ------------------------------------------------------------------ */
  const providerVoices = useMemo(
    () => voices.filter((v) => v.provider === activeProvider),
    [voices, activeProvider],
  );

  const filteredVoices = useMemo(
    () =>
      providerVoices.filter((v) => {
        const g = (v.gender || "").toLowerCase();
        const a = (v.accent || "").toLowerCase();
        const age = (v.age || "").toLowerCase();

        if (genderFilter && g !== genderFilter) return false;
        if (accentFilter && a !== accentFilter.toLowerCase()) return false;
        if (ageFilter && age !== ageFilter.toLowerCase()) return false;

        if (search) {
          const haystack = `${v.voice_name ?? ""} ${v.accent ?? ""} ${
            v.voice_id
          }`
            .toLowerCase()
            .trim();
          if (!haystack.includes(search.toLowerCase())) return false;
        }
        return true;
      }),
    [
      providerVoices,
      genderFilter,
      accentFilter,
      ageFilter,
      search,
    ],
  );

  /* ------------------------------------------------------------------ */
  /* helpers                                                             */
  /* ------------------------------------------------------------------ */
  const uniqueFrom = (field: keyof Voice) =>
    Array.from(
      new Set(
        providerVoices
          .map((v) => v[field])
          .filter(Boolean)
          .map((s) => String(s)),
      ),
    );

  const togglePlay = (id: string, url?: string) => {
    if (!url) return; // no preview
    // pause currently playing
    if (playingId) {
      const current = document.getElementById(
        `audio-${playingId}`,
      ) as HTMLAudioElement | null;
      current?.pause();
      current?.removeAttribute("src");
    }

    if (playingId === id) {
      // just paused
      setPlayingId("");
      return;
    }

    // play new one
    const audio = document.getElementById(`audio-${id}`) as HTMLAudioElement;
    audio.play();
    setPlayingId(id);
  };

  /* stop icon when preview ends */
  useEffect(() => {
    if (!playingId) return;
    const audio = document.getElementById(
      `audio-${playingId}`,
    ) as HTMLAudioElement;
    const handler = () => setPlayingId("");
    audio.addEventListener("ended", handler);
    return () => audio.removeEventListener("ended", handler);
  }, [playingId]);

  /* ------------------------------------------------------------------ */
  /* render                                                              */
  /* ------------------------------------------------------------------ */
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center  bg-black/30">
      <div className="flex w-full max-w-4xl max-h-[80vh] flex-col rounded-xl bg-white  shadow-xl dark:bg-[#1E1E1E]">
        {/* header */}
        <div className="flex items-center justify-between border-b border-[#1012141A] dark:border-white px-6 py-4">
          <h2 className="text-lg font-semibold">Select Voice</h2>
          <button
            aria-label="Close voice picker"
            onClick={onClose}
            className="rounded p-1 hover:bg-black/5"
          >
            <X size={20} />
          </button>
        </div>

        {/* provider tabs */}
        <div className="flex space-x-6 px-6 pt-4">
          {providers.map((p) => (
            <button
              key={p}
              onClick={() => {
                setActiveProvider(p);
                /* reset filters when switching provider  */
                setGenderFilter("");
                setAccentFilter("");
                setAgeFilter("");
                setSearch("");
              }}
              className={`pb-2 text-sm font-medium capitalize transition-colors ${
                activeProvider === p
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-[#646465] dark:text-white hover:text-indigo-600"
              }`}
            >
              {p === "elevenlabs" ? "ElevenLabs" : "OpenAI"}
            </button>
          ))}
        </div>

        {/* filters */}
        <div className="flex flex-wrap gap-3 px-6 py-4">
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="min-w-[120px] rounded-[6px] border bg-white dark:bg-[#141414] border-[#1012141A] dark:border-white px-3 py-2 text-sm outline-none"
          >
            <option value="">Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <select
            value={accentFilter}
            onChange={(e) => setAccentFilter(e.target.value)}
            className="min-w-[120px] rounded-[6px] border border-[#1012141A]  bg-white dark:bg-[#141414] dark:border-white px-3 py-2 text-sm outline-none"
          >
            <option value="">Accent</option>
            {uniqueFrom("accent").map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>

          <select
            value={ageFilter}
            onChange={(e) => setAgeFilter(e.target.value)}
            className="min-w-[120px] rounded-[6px] border border-[#1012141A]  bg-white dark:bg-[#141414] dark:border-white px-3 py-2 text-sm outline-none"
          >
            <option value="">Types</option>
            {uniqueFrom("age").map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="flex-1 rounded-[6px] border border-[#1012141A]  bg-white dark:bg-[#141414] dark:border-white px-3 py-2 text-sm outline-none"
          />
        </div>

        {/* table header */}
        <div className="grid grid-cols-[40px_1fr_2fr_1fr] items-center gap-4 border-b border-[#1012141A] bg-[#F7F7F7] dark:border-white dark:bg-[#141414] px-6 py-2 text-xs font-semibold">
          <span />
          <span>Voice</span>
          <span>Trait</span>
          <span>Voice&nbsp;ID</span>
        </div>

        {/* table body */}
        <div className="flex-1 overflow-y-auto">
          {filteredVoices.length === 0 && (
            <div className="py-10 text-center text-sm text-[#646465] dark:text-white">
              No voices match your filters.
            </div>
          )}

          {filteredVoices.map((v) => (
            <div
              key={v.voice_id}
              onClick={() => {
                onSelect(v.voice_id);
                onClose();
              }}
              className={`grid cursor-pointer grid-cols-[40px_1fr_2fr_1fr] items-center gap-4 px-6 py-3 hover:bg-[#F5F5F5]  dark:hover:bg-[#a09c9c] ${
                selectedVoiceId === v.voice_id ? "bg-indigo-50 dark:bg-black" : ""
              }`}
            >
              {/* play / pause */}
              <div className="flex">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay(v.voice_id, v.preview_audio_url);
                  }}
                  className={`rounded p-1 ${
                    v.preview_audio_url
                      ? "text-indigo-600 hover:bg-black/5"
                      : "cursor-not-allowed text-gray-400 dark:text-white"
                  }`}
                  disabled={!v.preview_audio_url}
                >
                  {playingId === v.voice_id ? (
                    <Pause size={18} />
                  ) : (
                    <Play size={18} />
                  )}
                </button>
                {v.preview_audio_url && (
                  <audio
                    id={`audio-${v.voice_id}`}
                    src={v.preview_audio_url}
                    hidden
                  />
                )}
              </div>

              {/* name + avatar */}
              <div className="flex items-center space-x-2">
                <img
                  src={v?.avatar_url || `https://ui-avatars.com/api/?name=${v?.voice_name || "Agent"}&background=random`}
                  className="h-6 w-6 rounded-full"
                  alt={v.voice_name}
                />
                <span className="text-sm font-medium">{v.voice_name}</span>
              </div>

              {/* tags */}
              <div className="flex flex-wrap items-center gap-1">
                {v.accent && (
                  <span className="rounded-full bg-[#E8E8E8] dark:bg-[#141414] px-2 py-[2px] text-[11px] font-medium text-[#4B4B4B] dark:text-white">
                    {v.accent}
                  </span>
                )}
                {v.age && (
                  <span className="rounded-full bg-[#E8E8E8] dark:bg-[#141414] px-2 py-[2px] text-[11px] font-medium text-[#4B4B4B] dark:text-white">
                    {v.age}
                  </span>
                )}
                <span className="rounded-full bg-[#E8E8E8] dark:bg-[#141414] px-2 py-[2px] text-[11px] font-medium text-[#4B4B4B] dark:text-white capitalize">
                  {v.provider}
                </span>
              </div>

              {/* id */}
              <span className="truncate text-xs text-[#646465] dark:text-white">
                {v.voice_id}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
