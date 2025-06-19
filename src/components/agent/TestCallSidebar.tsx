
import { Mic, Phone } from "lucide-react";
import { TranscriptEntry } from "../../pages/UpdateAgent";
import { useEffect, useRef } from "react";

interface TestCallSidebarProps {
  isCallActive: boolean;
  onToggleCall: () => void;
  isTogglingCall: boolean;
  transcript: TranscriptEntry[];
  onClear: () => void;
}

export function TestCallSidebar({
  isCallActive,
  onToggleCall,
  transcript,
  isTogglingCall,
  onClear
}: TestCallSidebarProps) {
  const transcriptContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop =
        transcriptContainerRef.current.scrollHeight;
    }
  }, [transcript]);

  const showTranscriptView = isCallActive || transcript.length > 0;

  return (
    <div className="flex flex-col items-center text-black dark:text-white">
      <div className="flex justify-center w-full mb-4 relative">
        <div className="flex items-center gap-1">
          <Phone size={16} color="#101214" />
          <span className="text-md font-medium">Test Audio</span>
        </div>
      </div>
      <div className="h-[1px] w-[90%] mx-auto bg-[#155EEF1A] mb-6" />
      {showTranscriptView ? (
        <div
          ref={transcriptContainerRef}
          className="w-full max-h-[30rem] overflow-y-auto scrollbar-none mb-6 border-b"
        >
          {transcript.map((message) => (
            <div
              key={message.id}
              className={`mb-3 p-3 rounded-lg text-xs ${
                message.role === "user"
                  ? "bg-gray-200 dark:bg-gray-600 ml-8"
                  : "bg-blue-100 mr-8 text-black dark:text-black dark:bg-blue-600"
              }`}
            >
              <div className="font-semibold mb-1">
                {message.role === "user" ? "" : "🤖"}
              </div>
              <div>{message.content}</div>
            </div>
          ))}

          {isCallActive && transcript.length > 0 && (
            <div className="text-[10px] text-gray-500 dark:text-white text-center mt-2">
              Call in progress...
            </div>
          )}
        </div>
      ) : (
        <div className="relative mb-6 mt-6">
          <div
            className="w-48 h-48 rounded-full flex items-center justify-center mx-auto"
            style={{
              background:
                "radial-gradient(50% 50% at 50% 50%, #155EEF 0%, #326CDD 78%, rgba(50, 108, 221, 0) 100%)",
            }}
          >
            <Mic className="text-white" size={40} />
          </div>
        </div>
      )}

      <div className="w-full flex justify-center gap-2">
        {transcript.length > 0 && !isCallActive && (
          <button
            onClick={onClear}
            className="text-gray-600 px-4 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center space-x-2 text-xs font-medium"
          >
            Clear
          </button>
        )}
        <button
          onClick={onToggleCall}
          disabled={isTogglingCall}
          className={`text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-xs disabled:opacity-50 font-medium ${
            isCallActive
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-[#155EEF] hover:bg-blue-700 text-white"
          }`}
        >
          {isTogglingCall ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {isCallActive ? "Ending Call..." : "Starting Call..."}
            </span>
          ) : isCallActive ? (
            "End Test Call"
          ) : transcript.length > 0 ? (
            "Test Again"
          ) : (
            "Test your agent"
          )}
        </button>
      </div>
    </div>
  );
}
