import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

interface WelcomeMessageProps {
  message: string;
  onChange: (message: string) => void;
}

interface WelcomeOption {
  id: string;
  message: string;
}

export function WelcomeMessage({ message, onChange }: WelcomeMessageProps) {
  const [options, setOptions] = useState<WelcomeOption[]>([]);

  useEffect(() => {
    // Fetch welcome messages from the backend
    (async () => {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/welcome-messages`,
      );
      if (res.ok) {
        const {welcomeMessages} = await res.json();
        setOptions(welcomeMessages);
      } else console.error("Failed to fetch welcome messages");
        setOptions([
          {
            id: "1",
            message: "Welcome to our service! How can I assist you today?",
          },
          { id: "2", message: "Hello! How can I help you with your inquiry?" },
          { id: "3", message: "Hi there! What can I do for you today?" },
        ]);
    })();
  }, []);

  return (
    <div>
      <label className="block text-md font-medium mb-2">Welcome message</label>
      <div className="mb-2 relative">
        <select
          className="w-full px-2.5 py-1.5 border border-[#1012141A]  bg-white dark:bg-[#141414] rounded-[6px] appearance-none outline-none text-xs font-medium text-[#646465] dark:text-white"
          onChange={(e) => onChange(e.target.value)}
          value={message}
        >
          {options.map((option) => (
            <option key={option.id} value={option.message}>
              {option.message}
            </option>
          ))}
        </select>
        <ChevronDown
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#646465] dark:text-white  bg-white dark:bg-[#141414]"
          size={16}
        />
      </div>
      <textarea
        value={message}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2.5 py-4 h-15 text-xs text-[#646465]  bg-white dark:bg-[#141414] dark:text-white focus:ring-2 focus:ring-blue-500 outline-none border border-[#1012141A] dark:border-white rounded-[6px]"
        placeholder="Enter welcome message"
      />
    </div>
  );
}
