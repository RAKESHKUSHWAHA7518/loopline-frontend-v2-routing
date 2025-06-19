import { useState } from "react";
import { ChevronDown, Settings } from "lucide-react";
import { languages } from "../../config/languages";
import { VoiceSelectionModal, Voice } from "./VoiceSelectionModal";

interface VoiceLanguageSelectorProps {
  voices: Voice[];
  selectedVoiceId: string;
  selectedLanguage: string;
  onVoiceChange: (voiceId: string) => void;
  onLanguageChange: (language: string) => void;
}

export function VoiceLanguageSelector({
  voices,
  selectedVoiceId,
  selectedLanguage,
  onVoiceChange,
  onLanguageChange,
}: VoiceLanguageSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedVoice = voices.find((v) => v.voice_id === selectedVoiceId);

  return (
    <>
      <div className="flex items-center space-x-4">
        {/* voice selector (opens modal) */}
        <div className="flex-1">
          <div className="relative">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex w-full items-center justify-between rounded-[6px] border  dark:border-gray-700 border-[#1012141A]  dark:border- px-2.5 pl-8 py-1.5 text-xs font-medium text-[#646465] dark:text-white hover:bg-black/5"
            >
              <span>
                {selectedVoice
                  ? `${selectedVoice.voice_name} (${selectedVoice.accent ?? ""})`
                  : "Select voice"}
              </span>
              <ChevronDown size={16} />
            </button>

            <img
              src={selectedVoice?.avatar_url || `https://ui-avatars.com/api/?name=${selectedVoice?.voice_name || "Agent"}&background=random`}
              className="absolute left-2 top-1/2 h-[18px] w-[18px] -translate-y-1/2 rounded-full"
              alt="Voice avatar"
            />

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-black/5 "
            >
              <Settings size={16} className="text-[#646465] dark:text-white" />
            </button>
          </div>
        </div>

        {/* language */}
        <div className="flex-1">
          <div className="relative">
            <select
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="w-full appearance-none rounded-[6px] border  bg-white dark:bg-[#141414] dark:border-gray-700 border-[#1012141A] px-2.5 pl-8 py-1.5 text-xs font-medium text-[#646465] dark:text-white outline-none"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                  {lang.region ? ` (${lang.region})` : ""}
                </option>
              ))}
            </select>

            <img
              src={selectedVoice?.avatar_url || `https://ui-avatars.com/api/?name=${selectedVoice?.voice_name || "Agent"}&background=random`}
              className="absolute left-2 top-1/2 h-[18px] w-[18px] -translate-y-1/2 rounded-full"
              alt="Language avatar"
            />
            <ChevronDown
              size={16}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#646465] dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* modal */}
      <VoiceSelectionModal
        voices={voices}
        selectedVoiceId={selectedVoiceId}
        isOpen={isModalOpen}
        onSelect={onVoiceChange}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
