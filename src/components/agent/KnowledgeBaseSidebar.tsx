import { useState, useEffect } from "react";
import { Plus, ChevronDown, ChevronUp, X } from "lucide-react";
import { CallSettings } from "./CallSettings";
import { SpeechSettings } from "./SpeechSettings";
import { Functions } from "./Functions";
import { Dialog } from "../Dialog";
import { useAuth } from "../../hooks/useAuth";

interface KnowledgeBase {
  knowledge_base_id: string;
  knowledge_base_name: string;
  status: string;
  created_at: Date;
}

interface KnowledgeBaseSidebarProps {
  agentData: any;
  onUpdateAgent: (key: string, value: any) => void;
}

export function KnowledgeBaseSidebar({
  agentData,
  onUpdateAgent,
}: KnowledgeBaseSidebarProps) {
  const { user } = useAuth();
  const [isCallSettingsOpen, setIsCallSettingsOpen] = useState(false);
  const [isSpeechSettingsOpen, setIsSpeechSettingsOpen] = useState(false);
  const [isFunctionsOpen, setIsFunctionsOpen] = useState(false);
  const [isWebhookOpen, setIsWebhookOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [isKnowledgeBaseOpen, setIsKnowledgeBaseOpen] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [allKnowledgeBases, setAllKnowledgeBases] = useState<KnowledgeBase[]>(
    [],
  );
  const [connectedKnowledgeBases, setConnectedKnowledgeBases] = useState<
    KnowledgeBase[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchKnowledgeBases = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/knowledge-bases?user_id=${user.uid}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch knowledge bases");
        }
        const data = await response.json();
        setAllKnowledgeBases(data.knowledge_bases_data || []);
        const connectedIds = agentData.llm_data.knowledge_base_ids || [];
        const connected = data?.knowledge_bases_data?.filter(
          (kb: KnowledgeBase) => connectedIds.includes(kb.knowledge_base_id),
        );
        setConnectedKnowledgeBases(connected);
      } catch (error) {
        console.error("Error fetching knowledge bases:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKnowledgeBases();
  }, [user, agentData.llm_data.knowledge_base_ids]);

  const handleAddKnowledgeBase = async (knowledgeBaseId: string) => {
    const currentIds = agentData.llm_data.knowledge_base_ids || [];
    if (currentIds.includes(knowledgeBaseId)) return;

    const newIds = [...currentIds, knowledgeBaseId];

    try {
      await onUpdateAgent("knowledge_base_ids", newIds);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding knowledge base:", error);
    }
  };

  const handleRemoveKnowledgeBase = async (knowledgeBaseId: string) => {
    const currentIds = agentData.llm_data.knowledge_base_ids || [];
    const newIds = currentIds.filter((id: string) => id !== knowledgeBaseId);

    try {
      await onUpdateAgent("knowledge_base_ids", newIds);
    } catch (error) {
      console.error("Error removing knowledge base:", error);
    }
  };

  const getUnconnectedKnowledgeBases = () => {
    const connectedIds = agentData.llm_data.knowledge_base_ids || [];
    return allKnowledgeBases.filter(
      (kb) => !connectedIds.includes(kb.knowledge_base_id),
    );
  };

  useEffect(() => {
    if(agentData){
      setWebhookUrl(agentData?.webhook_url || '');
    }
  },[agentData])

  return (
    <div>
      <div className="border-b border-gray-200 dark:border-gray-700 text-black dark:text-white">
        <button
          className="w-full pb-4 text-left"
          onClick={() => setIsKnowledgeBaseOpen(!isKnowledgeBaseOpen)}
        >
          <div className="flex items-center justify-between">
            <span className="text-md font-medium">Knowledge base</span>
            {isKnowledgeBaseOpen ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </div>
        </button>
        {isKnowledgeBaseOpen && (
          <div className="pb-4 text-black dark:text-white bg-white dark:bg-[#141414]">
            <div className="flex flex-col gap-2 items-start mb-2">
              <p className="text-xs">
                Add knowledge base to provide context to the agent.
              </p>
              <button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-[#155EEF] text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-xs disabled:opacity-50 font-medium"
              >
                <Plus size={16} />
                <span>Add</span>
              </button>
            </div>

            <div className="space-y-2">
              {loading ? (
                <div className="text-sm text-gray-500 dark:text-white">Loading...</div>
              ) : connectedKnowledgeBases.length === 0 ? (
                <div className="text-xs text-gray-500 dark:text-white">
                  No knowledge bases connected
                </div>
              ) : (
                connectedKnowledgeBases.map((kb) => (
                  <div
                    key={kb.knowledge_base_id}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-[#1a1a1a] text-black dark:text-white rounded-lg text-sm"
                  >
                    <span className="truncate flex-1">
                      {kb.knowledge_base_name}
                    </span>
                    <button
                      onClick={() =>
                        handleRemoveKnowledgeBase(kb.knowledge_base_id)
                      }
                      className="text-gray-400 hover:text-gray-600 dark:text-white ml-2"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 text-black dark:border-gray-700 dark:text-white">
        <button
          className="w-full py-4 text-left"
          onClick={() => setIsFunctionsOpen(!isFunctionsOpen)}
        >
          <div className="flex items-center justify-between">
            <span className="text-md font-medium">Functions</span>
            {isFunctionsOpen ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </div>
        </button>
        {isFunctionsOpen && (
          <Functions
            tools={agentData.llm_data?.general_tools || []}
            onUpdate={(tools) => onUpdateAgent("general_tools", tools)}
          />
        )}
      </div>

      <div className="border-t text-black dark:text-white dark:border-gray-700 border-gray-200">
        <button
          className="w-full py-4 text-left"
          onClick={() => setIsWebhookOpen(!isWebhookOpen)}
        >
          <div className="flex items-center justify-between">
            <span className="text-md font-medium">Webhook</span>
            {isWebhookOpen ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </div>
        </button>
        {isWebhookOpen && (
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1">
              Webhook Url
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full px-2.5 py-1.5 border bg-white dark:bg-[#141414] dark:border-gray-700 dark:text-white border-[#1012141A] rounded-[6px] appearance-none outline-none text-xs font-medium text-[#646465]"
              placeholder="Enter webhook url"
            />
            <button onClick={() => onUpdateAgent("webhook_url", webhookUrl)} disabled={webhookUrl === agentData?.webhook_url}
              className="bg-[#155EEF] mt-4 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-xs disabled:opacity-50 font-medium"
            >
              Save
            </button>
          </div>
        )}
      </div>

      <div className="border-t text-black dark:text-white dark:border-gray-700 border-gray-200">
        <button
          className="w-full py-4 text-left"
          onClick={() => setIsSpeechSettingsOpen(!isSpeechSettingsOpen)}
        >
          <div className="flex items-center justify-between">
            <span className="text-md font-medium">Speech settings</span>
            {isSpeechSettingsOpen ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </div>
        </button>
        {isSpeechSettingsOpen && (
          <SpeechSettings
            ambientSound={agentData.ambient_sound}
            responsiveness={agentData.responsiveness}
            interruptionSensitivity={agentData.interruption_sensitivity}
            enableBackchannel={agentData.enable_backchannel}
            backchannelWords={agentData.backchannel_words}
            voiceSpeed={agentData.voice_speed}
            pronunciationDictionary={agentData.pronunciation_dictionary}
            onUpdate={onUpdateAgent}
          />
        )}
      </div>

      <div className="border-t  dark:text-white dark:border-gray-700 border-gray-200">
        <button
          className="w-full py-4 text-left"
          onClick={() => setIsCallSettingsOpen(!isCallSettingsOpen)}
        >
          <div className="flex items-center justify-between">
            <span className="text-md font-medium">Call settings</span>
            {isCallSettingsOpen ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </div>
        </button>
        {isCallSettingsOpen && (
          <CallSettings
            voicemailDetection={agentData.enable_voicemail_detection}
            endCallAfterSilence={agentData.end_call_after_silence_ms}
            maxCallDuration={agentData.max_call_duration_ms}
            beginMessageDelay={agentData.begin_message_delay_ms}
            onUpdate={onUpdateAgent}
          />
        )}
      </div>

      <Dialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        title="Add Knowledge Base"
        
      >
        <div className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-white mb-4">
            Select a knowledge base to connect to this agent
          </div>

          {loading ? (
            <div className="text-center py-4 text-gray-500">Loading...</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {getUnconnectedKnowledgeBases().map((kb) => (
                <button
                  key={kb.knowledge_base_id}
                  onClick={() => handleAddKnowledgeBase(kb.knowledge_base_id)}
                  className="w-full p-3 text-left bg-gray-50 dark:bg-[#141414] hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="font-medium text-sm text-gray-500 dark:text-white">
                    {kb.knowledge_base_name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-white">
                    Status: {kb.status}
                  </div>
                </button>
              ))}
              {getUnconnectedKnowledgeBases().length === 0 && (
                <div className="text-center py-4 text-gray-500 dark:text-white text-sm">
                  No available knowledge bases to connect
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setIsAddDialogOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 dark:text-white hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
