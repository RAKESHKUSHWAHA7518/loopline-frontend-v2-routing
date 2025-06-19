import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { RetellWebClient } from "retell-client-js-sdk";
import { VoiceLanguageSelector } from "../components/agent/VoiceLanguageSelector";
import { WelcomeMessage } from "../components/agent/WelcomeMessage";
import { PromptEditor } from "../components/agent/PromptEditor";
import { KnowledgeBaseSidebar } from "../components/agent/KnowledgeBaseSidebar";
import { TestCallSidebar } from "../components/agent/TestCallSidebar";
import { Pencil } from "lucide-react";
import RippleLoader from "../components/RippleLoader";

interface Voice {
  voice_id: string;
  voice_name: string;
  provider: string;
  accent: string;
  avatar_url: string;
  gender: string;
  age: string;
  preview_audio_url: string;
}

export interface CustomFunctionSchema {
  type: string; // e.g., "object", "string", "number"
  description?: string;
  properties?: Record<string, CustomFunctionSchema>; // Recursion allows nesting
  required?: string[];
  enum?: string[]; // For enum options
  format?: string; // For formats like "date", "email"
}

interface AgentData {
  agent_id: string;
  agent_name?: string;
  voice_id: string;
  language: string;
  llm_data: {
    llm_id: string;
    general_prompt: string;
    begin_message: string;
    general_tools: Array<{
      name: string;
      type: string;
      description: string;
      url?: string;
      parameters?: CustomFunctionSchema;
      timeout_ms?: number;
      number?: string;
      speak_during_execution: boolean;
      speak_after_execution: boolean;
    }>;
  };
  enable_voicemail_detection?: boolean;
  voice_speed: number;
  webhook_url: string;
  end_call_after_silence_ms?: number;
  max_call_duration_ms?: number;
  begin_message_delay_ms?: number;
  ambient_sound?: string;
  responsiveness?: number;
  interruption_sensitivity?: number;
  enable_backchannel?: boolean;
  backchannel_words?: string[];
  pronunciation_dictionary?: Array<{
    word: string;
    alphabet: string;
    phoneme: string;
  }>;
}

export interface TranscriptEntry {
  id: number;
  role: string;
  content: string;
  timestamp: string;
}

export function UpdateAgent() {
  const { agentId } = useParams();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const nameFromUrl = searchParams.get("name");
  const [loading, setLoading] = useState(false);
  const [agentData, setAgentData] = useState<AgentData | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempAgentName, setTempAgentName] = useState("");
  const webClientRef = useRef<RetellWebClient | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const [isTogglingCall, setIsTogglingCall] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);

  // Function to determine if a field belongs to LLM data
  const isLLMField = (key: string) => {
    return ["general_prompt", "general_tools", "begin_message"].includes(key);
  };

  // Function to update LLM data
  const updateLLM = async (llmData: any) => {
    if (!user || !agentData?.llm_data?.llm_id) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/update-llm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.uid,
            workspace_id: "1",
            llm_data: {
              llm_id: agentData.llm_data.llm_id,
              ...llmData,
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update LLM");
      }
    } catch (error) {
      console.error("Error updating LLM:", error);
      throw error;
    }
  };

  // Function to update Agent data
  const updateAgent = async (agentDataToUpdate: any) => {
    if (!user || !agentId) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/update-agent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.uid,
            workspace_id: "1",
            agent_data: {
              agent_id: agentId,
              ...agentDataToUpdate,
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update agent");
      }
    } catch (error) {
      console.error("Error updating agent:", error);
      throw error;
    }
  };

  const handleUpdateAgent = async (key: string, value: any) => {
    if (!agentData) return;

    // Clear any existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Update local state immediately
    let newAgentData: AgentData;
    if (key === "general_tools" || key === "knowledge_base_ids") {
      newAgentData = {
        ...agentData,
        llm_data: {
          ...agentData.llm_data,
          [key]: value,
        },
      };
    } else if (isLLMField(key) || key === "begin_message") {
      newAgentData = {
        ...agentData,
        llm_data: {
          ...agentData.llm_data,
          [key]: value,
        },
      };
    } else if (isLLMField(key) || key === "webhook_url") {
      newAgentData = {
        ...agentData,
        [key]: value
      };
    } else {
      newAgentData = {
        ...agentData,
        [key]: value,
      };
    }
    setAgentData(newAgentData);

    // Debounce the API call
    updateTimeoutRef.current = setTimeout(async () => {
      try {
        if (
          isLLMField(key) ||
          key === "begin_message" ||
          key === "knowledge_base_ids"
        ) {
          // Update LLM data
          await updateLLM({
            ...agentData.llm_data,
            [key]: value,
          });
        } else {
          // Update Agent data
          const agentUpdateData =
            key === "general_tools"
              ? { llm_data: { general_tools: value } }
              : { ...agentData, [key]: value };
          await updateAgent(agentUpdateData);
        }
      } catch (error) {
        // Revert local state on error
        setAgentData(agentData);
        console.error("Failed to update:", error);
      }
    }, 500);
  };

  const handleNameEdit = () => {
    setIsEditingName(true);
    setTempAgentName(agentData?.agent_name || "");
  };

  const handleNameSave = async () => {
    if (!agentData) return;

    try {
      await handleUpdateAgent("agent_name", tempAgentName);
      setIsEditingName(false);
    } catch (error) {
      console.error("Error updating agent name:", error);
    }
  };

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/list-voices`,
        );
        const data = await response.json();
        if (data.success) {
          setVoices(data.voices);
        }
      } catch (error) {
        console.error("Error fetching voices:", error);
      }
    };

    fetchVoices();

    // Cleanup function to clear any pending timeouts
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const fetchAgentData = async () => {
      if (!user || !agentId) return;

      setLoading(true);
      try {
        // Fetch agent data from API
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/get-agent?agent_id=${agentId}`,
        );
        const data = await response.json();

        if (data.success) {
          setAgentData(data.agent);
          setTempAgentName(data.agent?.agent_name || nameFromUrl || "");
        } else {
          throw new Error(data.error || "Failed to fetch agent data");
        }
      } catch (error) {
        console.error("Error fetching agent:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentData();
  }, [agentId, user]);

  const handleToggleCall = async () => {
    setIsTogglingCall(true);
    if (isCallActive && webClientRef.current) {
      await webClientRef.current.stopCall();
      webClientRef.current = null;
      setIsTogglingCall(false);
      setIsCallActive(false);
      return;
    }
    if (!agentId) return;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/start-web-call`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ agent_id: agentId }),
        },
      );
      const { accessToken } = await response.json();
      webClientRef.current = new RetellWebClient();
      webClientRef.current.on("update", (update) => {
        if (update.transcript) {
          const transcriptArray = update.transcript;
          setTranscript(transcriptArray.map((item: TranscriptEntry, index: number) => ({
            id: index,
            role: item.role,
            content: item.content,
            timestamp: new Date().toLocaleTimeString()
          })))
        }
      });
      await webClientRef.current.startCall({
        accessToken,
        captureDeviceId: "default",
        playbackDeviceId: "default",
        sampleRate: 16000,
      });
      setIsCallActive(true);
    } catch (error) {
      console.error("Error with test call:", error);
      setIsCallActive(false);
    } finally {
      setIsTogglingCall(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full"><RippleLoader/></div>
    );
  }

  if (!agentData) {
    return (
      <div className="flex items-center justify-center h-full">
        Agent not found
      </div>
    );
  }

  return (
    <div>
      <div className="flex text-black dark:text-white justify-between items-start mb-10">
        <div>
          <h1 className="text-4xl font-medium mb-4">Agents</h1>
          <div className="relative">
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <input
                  type="text"
                  value={tempAgentName}
                  onChange={(e) => setTempAgentName(e.target.value)}
                  onBlur={handleNameSave}
                  onKeyPress={(e) => e.key === "Enter" && handleNameSave()}
                  className="w-full px-2.5  py-1.5 border bg-white dark:bg-[#1a1a1a] border-[#1012141A]  dark:border-white rounded-[6px] dark:text-white outline-none text-xs font-medium text-[#646465]"
                  autoFocus
                />
              ) : (
                <div className="text-xs font-medium text-[#646465] dark:text-[#e4e4e4]">
                  {tempAgentName || "Unnamed Agent"}
                </div>
              )}
              <button
                onClick={handleNameEdit}
                className="text-[#646465] hover:text-gray-600 transition-colors  dark:text-[#e4e4e4]"
              >
                <Pencil size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/2 lg:w-6/12 p-6 overflow-auto dark:bg-[#141414]  dark:text-white bg-white rounded-[20px]   border border-[#1012141A]  dark:border-gray-700 shadow-sm flex flex-col gap-y-6">
          <VoiceLanguageSelector
            voices={voices}
            selectedVoiceId={agentData.voice_id}
            selectedLanguage={agentData.language}
            onVoiceChange={(voiceId) => handleUpdateAgent("voice_id", voiceId)}
            onLanguageChange={(language) =>
              handleUpdateAgent("language", language)
            }
          />

          <div className="h-[1px] w-full bg-[#155EEF1A] " />

          <WelcomeMessage
            message={agentData.llm_data.begin_message}
            onChange={(message) => handleUpdateAgent("begin_message", message)}
          />

          <div className="h-[1px] w-full bg-[#155EEF1A]" />

          <PromptEditor
            prompt={agentData.llm_data.general_prompt}
            onChange={(prompt) => handleUpdateAgent("general_prompt", prompt)}
          />
        </div>

        <div className="w-full md:w-1/4 lg:w-3/12 mt-6 md:mt-0 p-6 overflow-auto bg-white dark:bg-[#141414] rounded-[20px] shadow-sm border border-[#1012141A]  dark:border-gray-700">
          <KnowledgeBaseSidebar
            agentData={agentData}
            onUpdateAgent={handleUpdateAgent}
          />
        </div>

        <div className="w-full md:w-1/4 lg:w-3/12 mt-6 md:mt-0 p-6 overflow-auto bg-white  dark:bg-[#141414] dark:border-gray-700 dark:text-white rounded-[20px]  border border-[#1012141A] shadow-sm">
          <TestCallSidebar
            isCallActive={isCallActive}
            onToggleCall={handleToggleCall}
            isTogglingCall={isTogglingCall}
            transcript={transcript}
            onClear={() => setTranscript([])}
          />
        </div>
      </div>
    </div>
  );
}