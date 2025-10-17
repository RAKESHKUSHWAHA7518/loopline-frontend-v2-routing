
import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  Phone,
  Trash2,
  Edit,
  PhoneCall,
} from "lucide-react";
import { Dialog } from "../components/Dialog";
import { useAuth } from "../hooks/useAuth";

interface Batch {
  id: string;
  name: string;
  agent: string;
  phoneNumber: string;
  phoneNumbers: string[];
  status: "Created" | "Running" | "Completed" | "Paused";
  createdAt: Date;
  scheduledAt?: Date;
  totalCalls: number;
  completedCalls: number;
  batchId?: string; // Retell batch ID for progress tracking
}

interface BatchCall {
  id: string;
  to_number: string;
  status: string;
  created_at: {
    _seconds: number;
    _nanoseconds: number;
  };
}

export function BatchCalling() {
  const { user } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [batchCalls, setBatchCalls] = useState<BatchCall[]>([]);
  const [callsLoading, setCallsLoading] = useState(false);

  // Create batch form state
  const [batchName, setBatchName] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState("");
  const [phoneNumbers, setPhoneNumbers] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [uploadMethod, setUploadMethod] = useState<"paste" | "csv">("paste");

  // Actual agents data
  const [agents, setAgents] = useState<Array<{ id: string; name: string }>>([]);

  const [availablePhoneNumbers, setAvailablePhoneNumbers] = useState<
    Array<{ id: string; number: string; nickname?: string }>
  >([]);

  useEffect(() => {
    fetchBatches();
    fetchAgents();
    fetchPhoneNumbers();
  }, [user]);

  const fetchAgents = async () => {
    if (!user) return;

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
      const params = new URLSearchParams({
        user_id: user.uid,
        workspace_id: "1",
      });

      const res = await fetch(`${backendUrl}/api/list-agents?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        const agentsList =
          data.agents?.map((agent: any) => ({
            id: agent.agent_id,
            name: agent.agent_name || "Single Prompt Agent",
          })) || [];
        setAgents(agentsList);
      } else {
        // Fallback to Firestore if backend doesn't have agents endpoint
        const { collection, getDocs } = await import("firebase/firestore");
        const { db } = await import("../lib/firebase");

        const agentsRef = collection(
          db,
          "users",
          user.uid,
          "workspaces",
          "1",
          "agents",
        );
        const agentsSnapshot = await getDocs(agentsRef);

        const agentsList = agentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().agent_name || "Single Prompt Agent",
        }));

        setAgents(agentsList);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
      // Keep agents empty on error
      setAgents([]);
    }
  };

  const fetchPhoneNumbers = async () => {
    if (!user) return;

    // Default phone number
    const defaultPhoneNumber = {
      id: "+14159852054",
      number: "(415) 985-2054",
      nickname: "Default Number",
    };

    try {
      // Try backend first (if you have a phone numbers endpoint)
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
      const params = new URLSearchParams({
        user_id: user.uid,
        workspace_id: "1",
      });

      const res = await fetch(
        `${backendUrl}/api/list-phone-numbers?${params}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (res.ok) {
        const data = await res.json();
        const phoneNumbersList =
          data.phone_numbers?.map((phone: any) => ({
            id: phone.phone_number,
            number: phone.phone_number_pretty || phone.phone_number,
            nickname: phone.nickname,
          })) || [];

        // Add default number if not already present
        const hasDefaultNumber = phoneNumbersList.some(
          (phone) => phone.id === defaultPhoneNumber.id,
        );
        if (!hasDefaultNumber) {
          phoneNumbersList.unshift(defaultPhoneNumber);
        }

        setAvailablePhoneNumbers(phoneNumbersList);
      } else {
        // Fallback to Firestore
        const { collection, getDocs } = await import("firebase/firestore");
        const { db } = await import("../lib/firebase");

        const phoneNumbersRef = collection(
          db,
          "users",
          user.uid,
          "workspaces",
          "1",
          "phone_numbers",
        );
        const phoneNumbersSnapshot = await getDocs(phoneNumbersRef);

        const phoneNumbersList = phoneNumbersSnapshot.docs.map((doc) => ({
          id: doc.id,
          number: doc.data().phone_number_pretty || doc.id,
          nickname: doc.data().nickname,
        }));

        // Add default number if not already present
        const hasDefaultNumber = phoneNumbersList.some(
          (phone) => phone.id === defaultPhoneNumber.id,
        );
        if (!hasDefaultNumber) {
          phoneNumbersList.unshift(defaultPhoneNumber);
        }

        setAvailablePhoneNumbers(phoneNumbersList);
      }
    } catch (error) {
      console.error("Error fetching phone numbers:", error);
      // Set only the default phone number on error
      setAvailablePhoneNumbers([defaultPhoneNumber]);
    }
  };

  

  const fetchBatches = async () => {
    setLoading(true);
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Use the new batches endpoint
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
      const params = new URLSearchParams({
        user_id: user.uid,
        workspace_id: "1",
      });
      const res = await fetch(`${backendUrl}/api/batches?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        // If endpoint doesn't exist, start with empty batches
        if (res.status === 404) {
          setBatches([]);
          return;
        }
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();

      const formatted = data.batches.map((b: any) => ({
        id: b.id || b.batchId,
        name: b.batch_name || "Untitled Batch",
        agent: b.agent || "Unknown Agent",
        phoneNumber: b.from_number || "Unknown",
        phoneNumbers: b.phoneNumbers || [],
        status: b.status === "pending" ? "Created" : (b.status || "Created"),
        createdAt: b.createdAt 
          ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt._seconds * 1000))
          : new Date(),
        scheduledAt: b.scheduledAt
          ? (b.scheduledAt.toDate ? b.scheduledAt.toDate() : new Date(b.scheduledAt._seconds * 1000))
          : undefined,
        totalCalls: b.taskCount || b.phoneNumbers?.length || 0,
        completedCalls: b.completed_calls || 0,
        batchId: b.batchId || b.id,
      }));

      setBatches(formatted);
    } catch (error) {
      console.error("Error fetching batches:", error);
      // Start with empty batches instead of showing error for missing endpoint
      setBatches([]);
      if (error instanceof Error && !error.message.includes("404")) {
        setError("Failed to load batches");
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to convert local datetime string to UTC timestamp
  const convertToUTCTimestamp = (localDateTimeStr: string): number => {
    if (!localDateTimeStr.includes('T')) throw new Error('Invalid datetime string');

    const [datePart, timePart] = localDateTimeStr.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);

    return new Date(year, month - 1, day, hour, minute).getTime();
  };

  // Handle create batch
  const handleCreateBatch = async () => {
    if (
      !batchName ||
      !selectedAgent ||
      !selectedPhoneNumber ||
      !phoneNumbers
    ) {
      setError("Please fill in all required fields");
      return;
    }

    setCreateLoading(true);
    setError(null);

    try {
      const phoneNumberList = phoneNumbers
        .split(/[,\n]/)
        .map((num) => num.trim())
        .filter((num) => num.length > 0);

      if (phoneNumberList.length === 0) {
        setError("Please provide at least one phone number");
        setCreateLoading(false);
        return;
      }

      const tasks = phoneNumberList.map((num) => ({
        to_number: num,
        retell_llm_dynamic_variables: {
          created_by: user?.uid || "anonymous",
          batchName,
        },
      }));

      const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
      console.log(`user_ID`, user?.uid)
      const response = await fetch(`${backendUrl}/api/batch-calls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user?.uid,
          workspace_id: "1",
          from_number: availablePhoneNumbers.find(
            (p) => p.id === selectedPhoneNumber,
          )?.id,
          phoneNumbers: phoneNumberList,
          agent:
            agents.find((a) => a.id === selectedAgent)?.name || "Unknown Agent",
          campaignName: batchName, // Backend still expects campaignName
          tasks,
          scheduledAt: scheduledAt ? convertToUTCTimestamp(scheduledAt) : null,
        }),
      });

      if (!response.ok) {
        const errorRes = await response.json();
        throw new Error(errorRes.error || "Failed to create batch");
      }

      await fetchBatches(); // Refresh list
      setIsCreateModalOpen(false);
      setBatchName("");
      setSelectedAgent("");
      setSelectedPhoneNumber("");
      setPhoneNumbers("");
      setScheduledAt("");
      setUploadMethod("paste");
    } catch (error: any) {
      console.error("Error creating batch:", error);
      setError(error.message || "Failed to create batch");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setPhoneNumbers(text);
      };
      reader.readAsText(file);
    }
  };

  const handleBatchClick = async (batch: Batch) => {
    if (!batch.batchId) return;
    
    setSelectedBatch(batch);
    setCallsLoading(true);
    setBatchCalls([]);
    
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
      const res = await fetch(
        `${backendUrl}/api/users/${user?.uid}/workspaces/1/batches/${batch.batchId}/calls`,
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.calls) {
          setBatchCalls(data.calls);
        }
      }
    } catch (error) {
      console.error("Error fetching batch calls:", error);
      setError("Error fetching batch calls");
    } finally {
      setCallsLoading(false);
    }
  };

  const filteredBatches = batches.filter((batch) => {
    const name = batch.name || "";
    const agent = batch.agent || "";

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || batch.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Created":
        return "bg-blue-100 text-blue-800";
      case "Running":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Paused":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTimestamp = (timestamp: { _seconds: number; _nanoseconds: number }) => {
    const date = new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000);
    return date.toLocaleString();
  };

  const getCallStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
      case "ringing":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
      case "ended":
        return "bg-green-100 text-green-800";
      case "failed":
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-10">
        <h1 className="text-4xl font-medium mb-4">Batch Calling</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#155EEF] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-xs disabled:opacity-50 font-medium"
        >
          <Plus size={16} />
          <span>Create Batch</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-2 rounded-md text-xs mb-6">
          {error}
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search batches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        <div className="relative">
          <Filter
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={16}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none"
          >
            <option value="all">All Status</option>
            <option value="Created">Created</option>
            <option value="Running">Running</option>
            <option value="Completed">Completed</option>
            <option value="Paused">Paused</option>
          </select>
        </div>
      </div>

      {/* Batches List */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredBatches.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <PhoneCall className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No batch calls
          </h3>
          <p className="text-gray-500 mb-4">
            Get started by creating your first batch calling session.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#155EEF] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-xs font-medium mx-auto"
          >
            <Plus size={16} />
            <span>Create Batch</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBatches.map((batch) => (
                <tr 
                  key={batch.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleBatchClick(batch)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {batch.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {batch.phoneNumber}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Users size={16} className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {batch.agent}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {batch.completedCalls}/{batch.totalCalls} calls
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${batch.totalCalls > 0 ? (batch.completedCalls / batch.totalCalls) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(batch.status)}`}
                    >
                      {batch.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {batch.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        className="text-gray-400 hover:text-gray-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        className="text-gray-400 hover:text-gray-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Batch Modal */}
      <Dialog
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setError(null);
          setBatchName("");
          setSelectedAgent("");
          setSelectedPhoneNumber("");
          setPhoneNumbers("");
          setScheduledAt("");
          setUploadMethod("paste");
        }}
        title="Create Batch"
        maxWidth="max-w-lg"
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateBatch();
          }}
        >
          {error && (
            <div className="bg-red-50 text-red-600 p-2 rounded-md text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium mb-1">
              Batch Name *
            </label>
            <input
              type="text"
              required
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-[#1012141A] rounded-[6px] appearance-none outline-none text-xs font-medium text-[#646465]"
              placeholder="Enter batch name"
              disabled={createLoading}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Agent *</label>
            <select
              required
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-[#1012141A] rounded-[6px] appearance-none outline-none text-xs font-medium text-[#646465]"
              disabled={createLoading}
            >
              <option value="">Select an agent</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">
              Phone Number *
            </label>
            <select
              required
              value={selectedPhoneNumber}
              onChange={(e) => setSelectedPhoneNumber(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-[#1012141A] rounded-[6px] appearance-none outline-none text-xs font-medium text-[#646465]"
              disabled={createLoading}
            >
              <option value="">Select a phone number</option>
              {availablePhoneNumbers.map((phone) => (
                <option key={phone.id} value={phone.id}>
                  {phone.nickname
                    ? `${phone.nickname} (${phone.number})`
                    : phone.number}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">
              Phone Numbers *
            </label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setUploadMethod("paste")}
                  className={`px-3 py-1 text-xs rounded ${
                    uploadMethod === "paste"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                  disabled={createLoading}
                >
                  Paste Numbers
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod("csv")}
                  className={`px-3 py-1 text-xs rounded ${
                    uploadMethod === "csv"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                  disabled={createLoading}
                >
                  Upload CSV
                </button>
              </div>

              {uploadMethod === "paste" ? (
                <textarea
                  required
                  value={phoneNumbers}
                  onChange={(e) => setPhoneNumbers(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#1012141A] rounded-[6px] appearance-none outline-none text-xs font-medium text-[#646465] h-24"
                  placeholder="Enter phone numbers separated by commas or new lines&#10;e.g., +1234567890, +1234567891"
                  disabled={createLoading}
                />
              ) : (
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="w-full px-2.5 py-1.5 border border-[#1012141A] rounded-[6px] appearance-none outline-none text-xs font-medium text-[#646465]"
                  disabled={createLoading}
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">
              Schedule (Optional)
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-[#1012141A] rounded-[6px] appearance-none outline-none text-xs font-medium text-[#646465]"
              disabled={createLoading}
            />
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="bg-white text-[#155eef] border border-[#155eef] px-4 py-1.5 rounded-lg hover:text-blue-700 transition-colors flex items-center space-x-2 text-xs disabled:opacity-50 font-medium"
              disabled={createLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createLoading}
              className="bg-[#155EEF] text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-xs disabled:opacity-50 font-medium"
            >
              {createLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Plus size={14} />
              )}
              <span>{createLoading ? "Creating..." : "Create"}</span>
            </button>
          </div>
        </form>
      </Dialog>

      {/* Batch Calls Modal */}
      <Dialog
        isOpen={selectedBatch !== null}
        onClose={() => {
          setSelectedBatch(null);
          setBatchCalls([]);
          setCallsLoading(false);
        }}
        title={`Calls in ${selectedBatch?.name || 'Batch'}`}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4">
          {selectedBatch && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Batch Name:</span> {selectedBatch.name}
                </div>
                <div>
                  <span className="font-medium">Agent:</span> {selectedBatch.agent}
                </div>
                <div>
                  <span className="font-medium">Phone Number:</span> {selectedBatch.phoneNumber}
                </div>
                <div>
                  <span className="font-medium">Status:</span>{" "}
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedBatch.status)}`}>
                    {selectedBatch.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {callsLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : batchCalls.length === 0 ? (
            <div className="text-center py-8">
              <Phone className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No calls found</h3>
              <p className="text-gray-500">This batch doesn't have any calls yet.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Call ID
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {batchCalls.map((call) => (
                    <tr key={call.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Phone size={16} className="text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {call.to_number}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getCallStatusColor(call.status)}`}>
                          {call.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTimestamp(call.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {call.id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button
              onClick={() => {
                setSelectedBatch(null);
                setBatchCalls([]);
                setCallsLoading(false);
              }}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
