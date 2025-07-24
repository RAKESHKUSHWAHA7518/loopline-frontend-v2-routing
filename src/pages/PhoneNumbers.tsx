import { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Phone, Trash2, ChevronDown } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Dialog } from "../components/Dialog";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import RippleLoader from "../components/RippleLoader";

interface PhoneNumber {
  phone_number: string;
  phone_number_pretty: string;
  inbound_agent_id: string;
  outbound_agent_id: string;
  area_code: number;
  nickname: string;
  last_modification_timestamp: number;
}

interface Agent {
  agent_id: string;
  agent_name?: string;
}

export function PhoneNumbers() {
  const { user } = useAuth();
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditingNickname, setIsEditingNickname] = useState<string | null>(
    null,
  );
  const [tempNickname, setTempNickname] = useState("");
  const [areaCode, setAreaCode] = useState<number | "">("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isOutboundCallDialogOpen, setIsOutboundCallDialogOpen] =
    useState(false);
  const [selectedFromNumber, setSelectedFromNumber] = useState<string>("");
  const [toPhoneNumber, setToPhoneNumber] = useState("");
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const [isSipTrunkDialogOpen, setIsSipTrunkDialogOpen] = useState(false);
  const [sipTrunkData, setSipTrunkData] = useState({
    phone_number: "",
    termination_uri: "",
    sip_trunk_auth_username: "",
    sip_trunk_auth_password: "",
    inbound_agent_id: "",
    outbound_agent_id: "",
    nickname: "",
    inbound_webhook_url: "",
  });
  const [sipTrunkLoading, setSipTrunkLoading] = useState(false);
  const [sipTrunkError, setSipTrunkError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAddDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    // Set up real-time listeners for both collections
    const phoneNumbersRef = collection(
      db,
      "users",
      user.uid,
      "workspaces",
      "1",
      "phone_numbers",
    );
    const agentsRef = collection(
      db,
      "users",
      user.uid,
      "workspaces",
      "1",
      "agents",
    );

    // Listen to phone numbers
    const unsubscribePhoneNumbers = onSnapshot(phoneNumbersRef, (snapshot) => {
      const numbers = snapshot.docs.map((doc) => ({
        ...doc.data(),
        phone_number: doc.id,
      })) as PhoneNumber[];
      setPhoneNumbers(numbers);
      setLoading(false);
    });

    // Listen to agents
    const unsubscribeAgents = onSnapshot(agentsRef, (snapshot) => {
      const agentsList = snapshot.docs.map((doc) => ({
        agent_id: doc.id,
        ...doc.data(),
      })) as Agent[];
      setAgents(agentsList);
    });

    // Cleanup listeners
    return () => {
      unsubscribePhoneNumbers();
      unsubscribeAgents();
    };
  }, [user]);

  const handleUpdatePhoneNumber = async (
    phoneNumber: PhoneNumber,
    updates: Partial<PhoneNumber>,
  ) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/update-phone-number`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user?.uid,
            workspace_id: "1",
            ...phoneNumber,
            ...updates,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update phone number");
      }
    } catch (error) {
      console.error("Error updating phone number:", error);
    }
  };

  const handleCreatePhoneNumber = async () => {
    if (!user || !areaCode) return;

    setCreateLoading(true);
    setCreateError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/create-phone-number`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.uid,
            workspace_id: "1",
            area_code: Number(areaCode),
          }),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create phone number");
      }

      setIsAddDialogOpen(false);
      setAreaCode("");
    } catch (error) {
      setCreateError(
        error instanceof Error
          ? error.message
          : "Failed to create phone number",
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeletePhoneNumber = async (phoneNumber: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/delete-phone-number/${phoneNumber}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete phone number");
      }
    } catch (error) {
      console.error("Error deleting phone number:", error);
    }
  };

  const handleMakeOutboundCall = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/make-outbound-call`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from_phone_number: selectedFromNumber,
            to_phone_number: toPhoneNumber,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to initiate outbound call");
      }
console.log(response);

      // Reset and close dialog on success
      setToPhoneNumber("");
      setSelectedFromNumber("");
      setIsOutboundCallDialogOpen(false);
    } catch (error) {
      console.error("Error making outbound call:", error);
    }
  };

  const handleImportSipTrunk = async () => {
    if (!user) return;

    setSipTrunkLoading(true);
    setSipTrunkError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/import-sip-phone-number`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.uid,
            workspace_id: "1",
            ...sipTrunkData,
            inbound_agent_version: 1,
            outbound_agent_version: 1,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to import SIP trunk number");
      }

      setIsSipTrunkDialogOpen(false);
      setSipTrunkData({
        phone_number: "",
        termination_uri: "",
        sip_trunk_auth_username: "",
        sip_trunk_auth_password: "",
        inbound_agent_id: "",
        outbound_agent_id: "",
        nickname: "",
        inbound_webhook_url: "",
      });
    } catch (error) {
      setSipTrunkError(
        error instanceof Error
          ? error.message
          : "Failed to import SIP trunk number",
      );
    } finally {
      setSipTrunkLoading(false);
    }
  };

  return (
    // <div>
    //   <div className="flex justify-between bg-white dark:bg-[#141414] dark:border-white dark:text-white items-start mb-10">
    //     <h1 className="text-4xl font-medium">Phone numbers</h1>
    //     <div className="relative" ref={dropdownRef}>
    //       <button
    //         onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)}
    //         className="bg-[#155EEF] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-xs disabled:opacity-50 font-medium"
    //       >
    //         <Plus size={16} />
    //         <span>Add phone number</span>
    //         <ChevronDown size={16} />
    //       </button>
          
    //       {isAddDropdownOpen && (
    //         <div className="absolute right-0 mt-1 w-56 bg-white  dark:bg-[#141414] dark:border-white dark:text-white rounded-lg shadow-lg border border-gray-200 z-10">
    //           <div className="py-1">
    //             <button
    //               onClick={() => {
    //                 setIsAddDialogOpen(true);
    //                 setIsAddDropdownOpen(false);
    //               }}
    //               className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#232222] flex items-center space-x-2"
    //             >
    //               <Plus size={14} />
    //               <span>Import Number</span>
    //             </button>
    //             <button
    //               onClick={() => {
    //                 setIsSipTrunkDialogOpen(true);
    //                 setIsAddDropdownOpen(false);
    //               }}
    //               className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#232222] flex items-center space-x-2"
    //             >
    //               <Phone size={14} />
    //               <span>Import SIP Trunk Number</span>
    //             </button>
    //           </div>
    //         </div>
    //       )}
    //     </div>
    //   </div>
    <div className="px-2 sm:px-4 py-4 max-w-screen-xl mx-auto">
    <div className="flex flex-col lg:flex-row justify-between items-start  gap-4 mb-10 bg-gray-100 dark:bg-[#141414] dark:border-gray-700 dark:text-white">
      <h1 className="text-2xl sm:text-4xl font-medium">Phone numbers</h1>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)}
          className="bg-[#155EEF] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm disabled:opacity-50 font-medium"
        >
          <Plus size={16} />
          <span>Add phone number</span>
          <ChevronDown size={16} />
        </button>

        {isAddDropdownOpen && (
          <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-[#141414] dark:border-gray-700 dark:text-white rounded-lg shadow-lg border border-gray-200 z-10">
            <div className="py-1">
              <button
                onClick={() => {
                  setIsAddDialogOpen(true);
                  setIsAddDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#232222] flex items-center space-x-2"
              >
                <Plus size={14} />
                <span>Import Number</span>
              </button>
              <button
                onClick={() => {
                  setIsSipTrunkDialogOpen(true);
                  setIsAddDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#232222] flex items-center space-x-2"
              >
                <Phone size={14} />
                <span>Import SIP Trunk Number</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">
           <RippleLoader/>

        </div>
      ) : phoneNumbers.length === 0 ? (
        <div className="flex items-center justify-center h-[50vh]">
          <p className="text-gray-500 text-lg">No phone numbers found</p>
        </div>
      ) : (
        <div className=" dark:bg-gray-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {phoneNumbers.map((phoneNumber) => (
            <div
              key={phoneNumber.phone_number}
              className="bg-white  dark:text-white dark:bg-gray-800 rounded-[20px] p-4 shadow-sm border border-[#1012141A] hover:shadow-md transition-shadow flex flex-col gap-y-4 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className="w-full">
                  {isEditingNickname === phoneNumber.phone_number ? (
                    <div className="flex items-center space-x-2 max-w-full mb-1">
                      <input
                        type="text"
                        value={tempNickname}
                        onChange={(e) => setTempNickname(e.target.value)}
                        className="px-2 py-1 border rounded text-sm w-full border-black outline-none bg-white dark:bg-[#141414] dark:border-white dark:text-white"  
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          handleUpdatePhoneNumber(phoneNumber, {
                            nickname: tempNickname,
                          });
                          setIsEditingNickname(null);
                        }}
                        className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditingNickname(null)}
                        className="text-gray-500 hover:text-gray-700 text-xs font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between space-x-2 w-full">
                      <h3 className="font-medium text-md">
                        {phoneNumber.nickname}
                      </h3>
                      <button
                        onClick={() => {
                          setTempNickname(phoneNumber.nickname);
                          setIsEditingNickname(phoneNumber.phone_number);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  )}
                  <p className="text-xs font-medium text-gray-500">
                    {phoneNumber.phone_number_pretty}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Inbound call agent
                  </label>
                  <div className="relative">
                    <select
                      value={phoneNumber.inbound_agent_id}
                      onChange={(e) =>
                        handleUpdatePhoneNumber(phoneNumber, {
                          inbound_agent_id: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 border border-[#1012141A] rounded-[6px] appearance-none outline-none text-xs font-medium text-[#646465]"
                    >
                      <option value="">Select agent</option>
                      {agents.map((agent) => (
                        <option key={agent.agent_id} value={agent.agent_id}>
                          {agent.agent_name || "Single Prompt Agent"}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#646465]"
                      size={16}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Outbound call agent
                  </label>
                  <div className="relative">
                    <select
                      value={phoneNumber.outbound_agent_id}
                      onChange={(e) =>
                        handleUpdatePhoneNumber(phoneNumber, {
                          outbound_agent_id: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 border border-[#1012141A] rounded-[6px] appearance-none outline-none text-xs font-medium text-[#646465]"
                    >
                      <option value="">Select agent</option>
                      {agents.map((agent) => (
                        <option key={agent.agent_id} value={agent.agent_id}>
                          {agent.agent_name || "Single Prompt Agent"}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#646465]"
                      size={16}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 justify-between">
                  <button
                    onClick={() => {
                      setSelectedFromNumber(phoneNumber.phone_number);
                      setIsOutboundCallDialogOpen(true);
                    }}
                    className="flex items-center space-x-2 px-2.5 py-1.5 text-[#155EEF] bg-white border border-[#155EEF] rounded-[7px] text-[10px] hover:bg-blue-50 transition-colors font-medium"
                  >
                    <Phone size={14} />
                    <span>Make an outbound call</span>
                  </button>
                  <button
                    onClick={() =>
                      handleDeletePhoneNumber(phoneNumber.phone_number)
                    }
                    className="px-2 py-1.5 text-[#646465] hover:text-gray-700 border border-[#646465] rounded-[7px] transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Phone Number Dialog */}
      <Dialog
        isOpen={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
          setAreaCode("");
        }}
        title="Add phone number"
      >
        <div className="space-y-4">
          {createError && (
            <p className="bg-red-50 text-red-600 p-2 rounded-md text-xs">
              {createError}
            </p>
          )}
          <div>
            <label className="block text-xs text-gray-700 dark:text-white mb-1">
              Area code
            </label>
            <input
              type="number"
              value={areaCode}
              onChange={(e) =>
                setAreaCode(e.target.value ? Number(e.target.value) : "")
              }
              className="w-full px-2.5 py-1.5 border bg-white dark:bg-[#141414] dark:border-gray-700 dark:text-white border-[#1012141A] rounded-[6px] appearance-none outline-none text-xs font-medium text-[#646465]"
              placeholder="415"
            />
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => {
                setIsAddDialogOpen(false);
                setAreaCode("");
                setCreateError(null);
              }}
              className="bg-white text-[#155eef] border border-[#155eef] px-4 py-1.5 rounded-lg hover:text-blue-700 transition-colors flex items-center space-x-2 text-xs disabled:opacity-50 font-medium"
              disabled={createLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleCreatePhoneNumber}
              disabled={!areaCode || createLoading}
              className="bg-[#155EEF] text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-xs disabled:opacity-50 font-medium"
            >
              {createLoading ? "Creating..." : "Add phone number"}
            </button>
          </div>
        </div>
      </Dialog>

      {/* Make Outbound Call Dialog */}
      <Dialog
        isOpen={isOutboundCallDialogOpen}
        onClose={() => {
          setIsOutboundCallDialogOpen(false);
          setToPhoneNumber("");
        }}
        title="Make Outbound Call"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-700 dark:text-white mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={toPhoneNumber}
              onChange={(e) => setToPhoneNumber(e.target.value)}
              className="w-full px-2.5 py-1.5 border bg-white dark:bg-[#141414] dark:border-gray-700 dark:text-white border-[#1012141A] rounded-[6px] appearance-none outline-none text-xs font-medium text-[#646465]"
              placeholder="e.g. +11234567890"
            />
            <p className="text-gray-500 dark:text-white text-xs mt-2">
              International calls are currently not supported.
            </p>
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => {
                setIsOutboundCallDialogOpen(false);
                setToPhoneNumber("");
              }}
              className="bg-white text-[#155eef] border border-[#155eef] px-4 py-1.5 rounded-lg hover:text-blue-700 transition-colors flex items-center space-x-2 text-xs disabled:opacity-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleMakeOutboundCall}
              disabled={!toPhoneNumber}
              className="bg-[#155EEF] text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-xs disabled:opacity-50 font-medium"
            >
              Call
            </button>
          </div>
        </div>
      </Dialog>

      {/* Import SIP Trunk Dialog */}
      <Dialog
        isOpen={isSipTrunkDialogOpen}
        onClose={() => {
          setIsSipTrunkDialogOpen(false);
          setSipTrunkData({
            phone_number: "",
            termination_uri: "",
            sip_trunk_auth_username: "",
            sip_trunk_auth_password: "",
            inbound_agent_id: "",
            outbound_agent_id: "",
            nickname: "",
            inbound_webhook_url: "",
          });
          setSipTrunkError(null);
        }}
        title="Import SIP Trunk Number"
      >
        <div className="space-y-4 max-h-96 scrollbar-none overflow-y-auto">
          {sipTrunkError && (
            <p className="bg-red-50 text-red-600 p-2 rounded-md text-xs">
              {sipTrunkError}
            </p>
          )}
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs text-gray-700 dark:text-white mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={sipTrunkData.phone_number}
                onChange={(e) =>
                  setSipTrunkData({ ...sipTrunkData, phone_number: e.target.value })
                }
                className="w-full px-2.5 py-1.5 border bg-white dark:bg-[#141414] dark:border-gray-700 dark:text-white border-[#1012141A] rounded-[6px] appearance-none outline-none text-xs font-medium text-[#646465]"
                placeholder="e.g. +14157774444"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-700 dark:text-white mb-1">
                Nickname *
              </label>
              <input
                type="text"
                value={sipTrunkData.nickname}
                onChange={(e) =>
                  setSipTrunkData({ ...sipTrunkData, nickname: e.target.value })
                }
                className="w-full px-2.5 py-1.5 border bg-white dark:bg-[#141414] dark:border-gray-700 dark:text-white border-[#1012141A] rounded-[6px] appearance-none outline-none text-xs font-medium text-[#646465]"
                placeholder="e.g. Frontdesk Number"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-700 dark:text-white mb-1">
                Termination URI *
              </label>
              <input
                type="text"
                value={sipTrunkData.termination_uri}
                onChange={(e) =>
                  setSipTrunkData({ ...sipTrunkData, termination_uri: e.target.value })
                }
                className="w-full px-2.5 py-1.5 border bg-white dark:bg-[#141414] dark:border-gray-700 dark:text-white border-[#1012141A] rounded-[6px] appearance-none outline-none text-xs font-medium text-[#646465]"
                placeholder="e.g. someuri.pstn.twilio.com"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-700 dark:text-white mb-1">
                SIP Trunk Auth Username *
              </label>
              <input
                type="text"
                value={sipTrunkData.sip_trunk_auth_username}
                onChange={(e) =>
                  setSipTrunkData({ ...sipTrunkData, sip_trunk_auth_username: e.target.value })
                }
                className="w-full px-2.5 py-1.5 border bg-white dark:bg-[#141414] dark:border-gray-700 dark:text-white border-[#1012141A] rounded-[6px] appearance-none outline-none text-xs font-medium text-[#646465]"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-700 dark:text-white mb-1">
                SIP Trunk Auth Password *
              </label>
              <input
                type="password"
                value={sipTrunkData.sip_trunk_auth_password}
                onChange={(e) =>
                  setSipTrunkData({ ...sipTrunkData, sip_trunk_auth_password: e.target.value })
                }
                className="w-full px-2.5 py-1.5 border bg-white dark:bg-[#141414] dark:border-gray-700 dark:text-white border-[#1012141A] rounded-[6px] appearance-none outline-none text-xs font-medium text-[#646465]"
                placeholder="Enter password"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-700 dark:text-white mb-1">
                Inbound Agent
              </label>
              <div className="relative">
                <select
                  value={sipTrunkData.inbound_agent_id}
                  onChange={(e) =>
                    setSipTrunkData({ ...sipTrunkData, inbound_agent_id: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 border bg-white dark:bg-[#141414] dark:border-gray-700 dark:text-white border-[#1012141A] rounded-[6px] appearance-none outline-none text-xs font-medium text-[#646465]"
                >
                  <option value="">Select agent</option>
                  {agents.map((agent) => (
                    <option key={agent.agent_id} value={agent.agent_id}>
                      {agent.agent_name || "Single Prompt Agent"}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#646465]"
                  size={16}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-700 dark:text-white mb-1">
                Outbound Agent
              </label>
              <div className="relative">
                <select
                  value={sipTrunkData.outbound_agent_id}
                  onChange={(e) =>
                    setSipTrunkData({ ...sipTrunkData, outbound_agent_id: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 border bg-white dark:bg-[#141414] dark:border-gray-700 dark:text-white border-[#1012141A] rounded-[6px] appearance-none outline-none text-xs font-medium text-[#646465]"
                >
                  <option value="">Select agent</option>
                  {agents.map((agent) => (
                    <option key={agent.agent_id} value={agent.agent_id}>
                      {agent.agent_name || "Single Prompt Agent"}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#646465]"
                  size={16}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-700 dark:text-white mb-1">
                Inbound Webhook URL
              </label>
              <input
                type="url"
                value={sipTrunkData.inbound_webhook_url}
                onChange={(e) =>
                  setSipTrunkData({ ...sipTrunkData, inbound_webhook_url: e.target.value })
                }
                className="w-full px-2.5 py-1.5 border bg-white dark:bg-[#141414] dark:border-gray-700 dark:text-white border-[#1012141A] rounded-[6px] appearance-none outline-none text-xs font-medium text-[#646465]"
                placeholder="e.g. https://example.com/inbound-webhook"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => {
                setIsSipTrunkDialogOpen(false);
                setSipTrunkData({
                  phone_number: "",
                  termination_uri: "",
                  sip_trunk_auth_username: "",
                  sip_trunk_auth_password: "",
                  inbound_agent_id: "",
                  outbound_agent_id: "",
                  nickname: "",
                  inbound_webhook_url: "",
                });
                setSipTrunkError(null);
              }}
              className="bg-white text-[#155eef] border border-[#155eef] px-4 py-1.5 rounded-lg hover:text-blue-700 transition-colors flex items-center space-x-2 text-xs disabled:opacity-50 font-medium"
              disabled={sipTrunkLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleImportSipTrunk}
              disabled={!sipTrunkData.phone_number || !sipTrunkData.nickname || !sipTrunkData.termination_uri || !sipTrunkData.sip_trunk_auth_username || !sipTrunkData.sip_trunk_auth_password || sipTrunkLoading}
              className="bg-[#155EEF] text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-xs disabled:opacity-50 font-medium"
            >
              {sipTrunkLoading ? "Importing..." : "Import SIP Trunk"}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
