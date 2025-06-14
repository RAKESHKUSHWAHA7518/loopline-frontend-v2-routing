import { useState } from "react";
import { Phone, Clock, Plus, Edit, Trash2 } from "lucide-react";
import { Dialog } from "../Dialog";
import { Switch } from "../ui/Switch";
import { useAuth } from "../../hooks/useAuth";
import CustomFunction from "./CustomFunction";
import { CustomFunctionSchema } from "../../pages/UpdateAgent";

interface FunctionTool {
  name: string;
  type: string;
  description: string;
  url?: string;
  parameters?: CustomFunctionSchema;
  timeout_ms?: number;
  number?: string;
  speak_during_execution: boolean;
  speak_after_execution: boolean;
}

interface FunctionsProps {
  tools: FunctionTool[];
  onUpdate: (tools: FunctionTool[]) => void;
}

export function Functions({ tools = [], onUpdate }: FunctionsProps) {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  const [editingTool, setEditingTool] = useState<FunctionTool | null>(null);
  const [newTool, setNewTool] = useState<FunctionTool>({
    name: "",
    type: "custom",
    description: "",
    url: "",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    timeout_ms: 120000,
    speak_during_execution: false,
    speak_after_execution: false,
  });
  const [error, setError] = useState("");

  const handleOpenDialog = (tool?: FunctionTool) => {
    if (tool) {
      setEditingTool(tool);
      setNewTool(tool);
    } else {
      setEditingTool(null);
      setNewTool({
        name: "",
        type: "custom",
        description: "",
        url: "",
        timeout_ms: 120000,
        speak_during_execution: false,
        speak_after_execution: false,
      });
    }
    setIsDialogOpen(true);
  };

  const validateName = (name: string) => {
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    if (name.length > 64) {
      return "Name must be 64 characters or less";
    }
    if (name && !validPattern.test(name)) {
      return "Name can only contain letters (a-z, A-Z), numbers (0-9), underscores (_), and dashes (-)";
    }
    return "";
  };

  const handleSave = (e) => {
    e.preventDefault();
    setError("");
    const nameError = validateName(newTool.name);
    if (nameError) {
      setError(nameError);
    } else {
      if (editingTool) {
        // Handle editing existing tool
        const updatedTools = tools.map((t) =>
          t.name === editingTool.name ? newTool : t,
        );
        onUpdate(updatedTools);
      } else {
        // Handle new tool creation
        let toolToAdd = newTool;

        // Special handling for routing function
        if (newTool.type === "enable_routing") {
          toolToAdd = {
            name: "book_appointment",
            type: "custom",
            description:
              "This function books an appointment for a given time and place and assigns an agent who is free and is available at the specified time.",
            url: `https://backend-dig-agents-wannes.replit.app/webhook/routing/${user?.uid}/1`,
            timeout_ms: 120000,
            speak_during_execution: newTool.speak_during_execution,
            speak_after_execution: newTool.speak_after_execution,
            parameters: {
              type: "object",
              properties: {
                time: {
                  type: "string",
                  description:
                    "The desired appointment time, in ISO 8601 format (e.g. '2025-03-10T14:00:00+04:30').",
                },
                zipcode: {
                  type: "string",
                  description:
                    "The ZIP code where the agent should be routed (e.g. '10001'). In other words, this is the zipcode of the customers location",
                },
              },
              required: ["time", "zipcode"],
            },
          };
        }
        onUpdate([...tools, toolToAdd]);
      }
      setIsDialogOpen(false);
    }
  };

  const handleDelete = (toolName: string) => {
    const updatedTools = tools.filter((t) => t.name !== toolName);
    onUpdate(updatedTools);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "end_call":
        return Phone;
      case "transfer_call":
        return Phone;
      default:
        return Clock;
    }
  };

  return (
    <div className=" text-black dark:text-white bg-white dark:bg-[#1a1a1a]">
      <div className="flex flex-col gap-2 items-start mb-2">
        <p className="text-xs">
          Enable your agent with capabilities such as calendar bookings, call
          termination, etc.
        </p>
        <button
          onClick={() => handleOpenDialog()}
          className="bg-[#155EEF] text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-xs disabled:opacity-50 font-medium"
        >
          <Plus size={16} />
          <span>Add</span>
        </button>
      </div>

      <div className="space-y-2">
        {tools.map((tool) => {
          const Icon = getIconForType(tool.type);
          return (
            <div
              key={tool.name}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <Icon size={18} className="text-gray-400" />
                <div>
                  <span className="text-xs font-medium">{tool.name}</span>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {tool.speak_during_execution && (
                      <span className="mr-2">Speaks during</span>
                    )}
                    {tool.speak_after_execution && <span>Speaks after</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleOpenDialog(tool)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => handleDelete(tool.name)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={`${editingTool ? "Edit" : "Add"} Function`}
      >
        <form className="space-y-4" onSubmit={handleSave}>
          <div>
            <label className="block text-xs font-medium mb-1">Name</label>
            <input
              type="text"
              required
              value={newTool.name}
              onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
              className="w-full px-2.5 py-1.5 border  bg-white dark:bg-[#141414] dark:border-white border-[#1012141A]  rounded-[6px] appearance-none outline-none text-xs font-medium text-[#646465] dark:text-white"
              placeholder="Enter function name"
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Type</label>
            <select
              value={newTool.type}
              onChange={(e) => setNewTool({ ...newTool, type: e.target.value })}
              className="w-full px-2.5 py-1.5 border bg-white dark:bg-[#141414] dark:border-white border-[#1012141A] rounded-[6px] appearance-none outline-none text-xs font-medium text-[#646465] dark:text-white"
            >
              <option value="custom">Custom Function</option>
              <option value="enable_routing">Enable Routing</option>
              <option value="end_call">End Call</option>
              <option value="transfer_call">Transfer Call</option>
            </select>
          </div>

          {newTool.type === "enable_routing" ? (
            <div>
              <input
                type="hidden"
                value="book_appointment"
                onChange={() => {}}
              />
              <div className="text-xs text-gray-600 bg-gray-50  dark:bg-[#141414] dark:border-white p-3 rounded-lg dark:text-white">
                This function enables appointment booking with automatic agent
                routing based on availability and location.
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium mb-1">
                Description
              </label>
              <textarea
                value={newTool.description}
                onChange={(e) =>
                  setNewTool({ ...newTool, description: e.target.value })
                }
                className="w-full px-2.5 py-1.5 border bg-white dark:bg-[#141414] dark:border-white dark:text-white border-[#1012141A] rounded-[6px] appearance-none outline-none text-xs font-medium text-[#646465] h-24"
                placeholder="Enter function description"
              />
            </div>
          )}

          {newTool.type === "custom" ? (
            <>
              <div>
                <label className="block text-xs font-medium mb-1">URL</label>
                <input
                  type="url"
                  required
                  value={newTool.url}
                  onChange={(e) =>
                    setNewTool({ ...newTool, url: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 border bg-white dark:bg-[#141414] dark:border-white dark:text-white border-[#1012141A] rounded-[6px] appearance-none outline-none text-xs font-medium text-[#646465]"
                  placeholder="Enter function URL"
                />
              </div>
              <CustomFunction
                parameters={newTool.parameters}
                setParameters={(parameters: CustomFunctionSchema) =>
                  setNewTool({ ...newTool, parameters })
                }
                setIsError={setIsError}
              />

              <div>
                <label className="block text-xs font-medium mb-1">
                  API Timeout (milliseconds)
                </label>
                <input
                  required
                  type="number"
                  value={newTool.timeout_ms}
                  onChange={(e) =>
                    setNewTool({
                      ...newTool,
                      timeout_ms: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-2.5 py-1.5 border bg-white dark:bg-[#141414] dark:border-white dark:text-white border-[#1012141A] rounded-[6px] appearance-none outline-none text-xs font-medium text-[#646465]"
                  placeholder="Enter timeout in milliseconds"
                />
              </div>
            </>
          ) : newTool.type === "enable_routing" ? (
            <input
              type="hidden"
              value={`https://backend-dig-agents-wannes.replit.app/webhook/routing/${user?.uid}/1`}
              onChange={() => {}}
            />
          ) : null}

          {newTool.type === "transfer_call" && (
            <div>
              <label className="block text-xs font-medium mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={newTool.number}
                onChange={(e) =>
                  setNewTool({ ...newTool, number: e.target.value })
                }
                className="w-full px-2.5 py-1.5 bg-white dark:bg-[#141414] dark:border-white dark:text-white border border-[#1012141A] rounded-[6px] appearance-none outline-none text-xs font-medium text-[#646465]"
                placeholder="Enter phone number"
              />
            </div>
          )}

          <div className="space-y-4 border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-white">
              Speech Settings
            </h4>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-white">
                  Speak During Execution
                </label>
                <p className="text-[10px] text-gray-500 dark:text-white">
                  Agent will speak while the function is being executed
                </p>
              </div>
              <Switch
                checked={newTool.speak_during_execution}
                onCheckedChange={(checked) =>
                  setNewTool({ ...newTool, speak_during_execution: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-white">
                  Speak After Execution
                </label>
                <p className="text-[10px] text-gray-500 dark:text-white">
                  Agent will speak after the function has completed
                </p>
              </div>
              <Switch
                checked={newTool.speak_after_execution}
                onCheckedChange={(checked) =>
                  setNewTool({ ...newTool, speak_after_execution: checked })
                }
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setIsDialogOpen(false)}
              className="bg-white text-[#155eef] border border-[#155eef] px-4 py-1.5 rounded-lg hover:text-blue-700 transition-colors flex items-center space-x-2 text-xs disabled:opacity-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isError}
              className="bg-[#155EEF] text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-xs disabled:opacity-50 font-medium"
            >
              {editingTool ? "Save Changes" : "Add Function"}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
