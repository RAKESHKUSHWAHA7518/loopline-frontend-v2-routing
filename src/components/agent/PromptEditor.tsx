interface PromptEditorProps {
  prompt: string;
  onChange: (prompt: string) => void;
}

export function PromptEditor({ prompt, onChange }: PromptEditorProps) {
  return (
    <div>
      <label className="block text-md font-medium mb-2">
        Prompt
      </label>
        <p className="text-xs mb-2">Use {'{{variable}}'} to add variables.</p>
      <textarea
        value={prompt}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2.5 py-4 h-60 text-xs text-[#646465]  bg-white dark:bg-[#141414] dark:text-white focus:ring-2 focus:ring-blue-500 outline-none border border-[#1012141A]  dark:border-white rounded-[6px]"
        placeholder="Enter agent prompt"
      />
    </div>
  );
}