import { useState } from 'react';
import { Plus, Settings, ChevronDown } from 'lucide-react';
import { Switch } from '../ui/Switch';
import { Slider } from '../ui/Slider';

interface PronunciationEntry {
  word: string;
  alphabet: string;
  phoneme: string;
}

interface SpeechSettingsProps {
  ambientSound?: string;
  responsiveness?: number;
  interruptionSensitivity?: number;
  enableBackchannel?: boolean;
  voiceSpeed?: number;
  backchannelWords?: string[];
  pronunciationDictionary?: PronunciationEntry[];
  onUpdate: (key: string, value: any) => void;
}

const backgroundSoundOptions = [
  { value: 'none', label: 'None' },
  { value: 'coffee-shop', label: 'Coffee Shop' },
  { value: 'office', label: 'Office' },
  { value: 'restaurant', label: 'Restaurant' }
];

export function SpeechSettings({
  ambientSound = 'none',
  responsiveness = 0.7,
  interruptionSensitivity = 1,
  enableBackchannel = true,
  backchannelWords = ['yeah', 'uh-huh'],
  pronunciationDictionary = [],
  voiceSpeed = 1,
  onUpdate
}: SpeechSettingsProps) {
  const [showAddPronunciation, setShowAddPronunciation] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newPhoneme, setNewPhoneme] = useState('');

  const handleAddPronunciation = () => {
    if (newWord && newPhoneme) {
      const newEntry = {
        word: newWord,
        alphabet: 'ipa',
        phoneme: newPhoneme
      };
      onUpdate('pronunciation_dictionary', [...(pronunciationDictionary || []), newEntry]);
      setNewWord('');
      setNewPhoneme('');
      setShowAddPronunciation(false);
    }
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Background Sound */}
      <div className="space-y-2">
        <label className="block text-xs font-medium">Background sound</label>
        <div className="flex items-center space-x-2">
          <div className='relative w-full'>
            <select
              value={ambientSound}
              onChange={(e) => onUpdate('ambient_sound', e.target.value)}
              className="w-full px-2.5 py-1.5 border bg-white dark:bg-[#141414] dark:border-white dark:text-white border-[#1012141A] rounded-[6px] appearance-none outline-none text-xs font-medium text-[#646465]"  
            >
              {backgroundSoundOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#646465]" size={16} />
          </div>
          <button className="p-2 text-[#646465]  dark:text-white hover:text-[#646465]">
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Voice Speed */}
      <div className="space-y-2">
          <h4 className="text-xs font-medium">Voice Speed</h4>
          <div className="flex items-center justify-between">
            <Slider
              value={[voiceSpeed]}
              onValueChange={(value) => onUpdate('voice_speed', value[0])}
              min={0.5}
              max={2}
              step={0.1}
              className="w-[200px]"
            />
            <span className="text-xs font-medium ml-4">
              {voiceSpeed.toFixed(1)}
            </span>
          </div>
      </div>
      
      {/* Responsiveness */}
      <div className="space-y-2">
          <h4 className="text-xs font-medium">Responsiveness</h4>
          <div className="flex items-center justify-between">
            <Slider
              value={[responsiveness]}
              onValueChange={(value) => onUpdate('responsiveness', value[0])}
              min={0}
              max={1}
              step={0.1}
              className="w-[200px]"
            />
            <span className="text-xs font-medium ml-4">
              {responsiveness.toFixed(1)}
            </span>
          </div>
      </div>

      {/* Interruption Sensitivity */}
      <div className="space-y-2 text-gray-500 dark:text-white">
        <div>
          <h4 className="text-xs font-medium mb-0.5">Interruption sensitivity</h4>
          <p className="text-[10px] text-gray-500 dark:text-white">Control how sensitive AI can be interrupted by human speech</p>
          <div className="flex items-center justify-between">
            <Slider
              value={[interruptionSensitivity]}
              onValueChange={(value) => onUpdate('interruption_sensitivity', value[0])}
              min={0}
              max={1}
              step={0.1}
              className="w-[200px]"
            />
            <span className="text-xs ml-4 font-medium">
              {interruptionSensitivity.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Enable Backchanneling */}
      <div className="space-y-1">
        <div className="flex flex-col justify-between gap-1">
          <div>
            <h4 className="text-xs font-medium mb-0.5">Enable backchanneling</h4>
            <p className="text-[10px] text-gray-500 dark:text-white">
              Enables the agent to use affirmations like 'yeah' or 'uh-huh' during conversations, indicating active listening and engagement.
            </p>
          </div>
          <Switch
            checked={enableBackchannel}
            onCheckedChange={(checked) => onUpdate('enable_backchannel', checked)}
          />
        </div>
        {enableBackchannel && (
          <div className="mt-2 p-3 rounded-[10px] border border-[#6464651A] dark:border-white flex flex-col px-2 py-2.5 ">
              {backchannelWords.map((word, index) => (
                <div key={index} className="text-[10px] text-[#646465] dark:text-white">
                  '{word}'
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Pronunciation */}
      <div className="space-y-2">
        <div className="flex flex-col justify-between gap-1 items-start">
          <div>
            <h4 className="text-xs font-medium mb-0.5">Pronounciation</h4>
            <p className="text-[10px] text-gray-500 dark:text-white ">
              Guide the model to pronounce a word, name, or phrase in a specific way.{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700">Learn more</a>
            </p>
          </div>
          <button
            onClick={() => setShowAddPronunciation(true)}
            className="bg-[#155EEF] text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-xs disabled:opacity-50 font-medium"
          >
            <Plus size={16} />
            <span>Add</span>
          </button>
        </div>

        {/* Pronunciation Dictionary */}
        {pronunciationDictionary.length > 0 && (
          <div className="mt-2 space-y-2">
            {pronunciationDictionary.map((entry, index) => (
              <div key={index} className="p-2 bg-gray-50 dark:bg-[#141414] rounded-lg text-sm">
                <div className="font-medium text-[10px]">{entry.word}</div>
                <div className="text-gray-500 text-[10px]">{entry.phoneme}</div>
              </div>
            ))}
          </div>
        )}

        {/* Add Pronunciation Form */}
        {showAddPronunciation && (
          <div className="mt-2 p-3 border rounded-lg space-y-3">
            <div>
              <label className="block text-[10px] font-medium mb-1">Word</label>
              <input
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                className="w-full px-2.5 py-1.5 border bg-white dark:bg-[#141414] dark:border-white dark:text-white border-[#1012141A] rounded-[6px] appearance-none outline-none text-xs font-medium text-[#646465]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium mb-1">IPA Phoneme</label>
              <input
                type="text"
                value={newPhoneme}
                onChange={(e) => setNewPhoneme(e.target.value)}
                className="w-full px-2.5 py-1.5 border bg-white dark:bg-[#141414] dark:border-white dark:text-white border-[#1012141A] rounded-[6px] appearance-none outline-none text-xs font-medium text-[#646465]"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAddPronunciation(false)}
                className="bg-white text-[#155eef] border  border-[#155eef] px-4 py-1.5 rounded-lg hover:text-blue-700 transition-colors flex items-center space-x-2 text-xs disabled:opacity-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPronunciation}
                className="bg-[#155EEF] text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-xs disabled:opacity-50 font-medium"
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}