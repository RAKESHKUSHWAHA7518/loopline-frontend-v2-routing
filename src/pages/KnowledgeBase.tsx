import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  RefreshCw,
  Download,
  Trash2,
  Link,
  Upload,
  Type,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Dialog } from "../components/Dialog";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import RippleLoader from "../components/RippleLoader";

interface KnowledgeBase {
  knowledge_base_id: string;
  knowledge_base_name: string;
  status: string;
  knowledge_base_sources: Array<{
    type: string;
    source_id: string;
    filename: string;
    content_url?: string;
    file_url?: string,
    url?: string
  }>;
  enable_auto_refresh: boolean;
  last_refreshed_timestamp: number;
}

type AddContentType = "none" | "webpages" | "files" | "text";

export function KnowledgeBase() {
  const { user } = useAuth();
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<{[key: string]: boolean}>({});
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newKbName, setNewKbName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [webpageUrl, setWebpageUrl] = useState("");
  const [manualText, setManualText] = useState("");
  const [addContentType, setAddContentType] = useState<AddContentType>("none");
  const [createLoading, setCreateLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchKnowledgeBases();
    }
  }, [user]);

  const fetchKnowledgeBases = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/knowledge-bases?user_id=${user.uid}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch knowledge bases");
      }
      const data = await response.json();
      setKnowledgeBases(data.knowledge_bases_data || []);
    } catch (error) {
      console.error("Error fetching knowledge bases:", error);
      setError("Failed to load knowledge bases. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const handleCreateKnowledgeBase = async () => {
    if (!user || !newKbName.trim() || addContentType === "none") return;

    try {
      setCreateLoading(true);
      setError(null);
      let documentUrls: string[] = [];
      let type = addContentType;

      if (addContentType === "files" && selectedFiles.length > 0) {
        const storage = getStorage();
        for (const file of selectedFiles) {
          const storageRef = ref(
            storage,
            `knowledge-bases/${user.uid}/${file.name}`,
          );
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          documentUrls.push(url);
        }
      } else if (addContentType === "webpages" && webpageUrl) {
        documentUrls = [webpageUrl];
      } else if (addContentType === "text" && manualText) {
        const storage = getStorage();
        const blob = new Blob([manualText], { type: "text/plain" });
        const storageRef = ref(
          storage,
          `knowledge-bases/${user.uid}/manual-text-${Date.now()}.txt`,
        );
        await uploadBytes(storageRef, blob);
        const url = await getDownloadURL(storageRef);
        documentUrls = [url];
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/create-knowledge-base`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.uid,
            workspace_id: "1",
            knowledge_base_name: newKbName,
            document_urls: documentUrls,
            type,
            text_content: manualText,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to create knowledge base");
      }

      setNewKbName("");
      setSelectedFiles([]);
      setWebpageUrl("");
      setManualText("");
      setAddContentType("none");
      setIsCreateDialogOpen(false);
      await fetchKnowledgeBases();
    } catch (error) {
      console.error("Error creating knowledge base:", error);
      setError("Failed to create knowledge base. Please try again.");
    } finally {
      setCreateLoading(false);
    }
  };

  

  const handleDelete = async (kbId: string) => {
    try {
      setActionLoading(prev => ({ ...prev, [`delete-${kbId}`]: true }));
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/delete-knowledge-base/${kbId}?user_id=${user?.uid}&workspace_id=1`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete knowledge base");
      }
      await fetchKnowledgeBases();
    } catch (error) {
      console.error("Error deleting knowledge base:", error);
      setError("Failed to delete knowledge base. Please try again.");
    } finally {
      setActionLoading(prev => ({ ...prev, [`delete-${kbId}`]: false }));
    }
  };

  const renderAddContentOptions = () => {
    if (addContentType === "none") {
      return (
        <div className="space-y-2">
          <button
            onClick={() => setAddContentType("webpages")}
            className="w-full flex items-center space-x-2 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Link size={20} className="text-gray-400" />
            <div>
              <div className="text-xs font-medium">Add web pages</div>
              <div className="text-[10px] text-[#646465]">
                Crawl and sync your website
              </div>
            </div>
          </button>

          <button
            onClick={() => setAddContentType("files")}
            className="w-full flex items-center space-x-2 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Upload size={20} className="text-gray-400" />
            <div>
              <div className="text-xs font-medium">Upload files</div>
              <div className="text-[10px] text-[#646465]">
                File size should be less than 100MB
              </div>
            </div>
          </button>

          <button
            onClick={() => setAddContentType("text")}
            className="w-full flex items-center space-x-2 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Type size={20} className="text-gray-400" />
            <div>
              <div className="text-xs font-medium">Add text</div>
              <div className="text-[10px] text-[#646465]">
                Add articles manually
              </div>
            </div>
          </button>
        </div>
      );
    }

    switch (addContentType) {
      case "webpages":
        return (
          <div>
            <label className="block text-xs text-gray-700 mb-1">
              Website URL
            </label>
            <input
              type="url"
              value={webpageUrl}
              onChange={(e) => setWebpageUrl(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-[#1012141A] rounded-[6px] appearance-none outline-none text-xs font-medium text-[#646465]"
              placeholder="https://example.com"
            />
          </div>
        );

      case "files":
        return (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              multiple
            />
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span className="text-xs truncate">{file.name}</span>
                  <button
                    onClick={() =>
                      setSelectedFiles((files) =>
                        files.filter((_, i) => i !== index),
                      )
                    }
                    className="text-[#646465] hover:text-gray-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors"
              >
                <div className="text-center">
                  <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                  <div className="text-xs text-gray-600">
                    Click to upload or drag and drop
                  </div>
                  <div className="text-[10px] text-[#646465]">
                    Maximum file size: 100MB
                  </div>
                </div>
              </button>
            </div>
          </div>
        );

      case "text":
        return (
          <div>
            <label className="block text-xs text-gray-700 mb-1">
              Text Content
            </label>
            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-[#1012141A] rounded-[6px] appearance-none outline-none text-xs font-medium text-[#646465] h-32"
              placeholder="Enter your text content here..."
            />
          </div>
        );
    }
  };

  const isFormValid = () => {
    switch (addContentType) {
      case "webpages":
        return newKbName.trim() && webpageUrl.trim();
      case "files":
        return newKbName.trim() && selectedFiles.length > 0;
      case "text":
        return newKbName.trim() && manualText.trim();
      default:
        return false;
    }
  };

  return (
    // <div>
    //   <div className="flex justify-between bg-white dark:bg-[#141414] dark:border-white dark:text-white items-start mb-10">
    //     <div>
    //       <h1 className="text-4xl font-medium mb-4">Knowledge base</h1>
    //       <p className="text-xl font-medium">
    //         Centralize all your company's knowledge in{" "}
    //         <span className="bg-[#155EEF] text-white px-2 py-0.5 rounded">
    //           one powerful database
    //         </span>
    //         . This ensures our AI bots are perfectly trained{" "}
    //         <span className="bg-[#155EEF] text-white px-2 py-0.5 rounded">
    //           to provide seamless support
    //         </span>{" "}
    //         and help your customers like never before!
    //       </p>
    //     </div>
    //     <button
    //       onClick={() => setIsCreateDialogOpen(true)}
    //       className="bg-[#155EEF] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-xs disabled:opacity-50 font-medium"
    //     >
    //       <Plus size={16} />
    //       <span className="block w-max">Create database</span>
    //     </button>
    //   </div>

    //   {error && (
    //     <div className="bg-red-50 text-red-600 text-xs px-2 py-1.5 rounded-lg mb-6">
    //       {error}
    //     </div>
    //   )}

    //   {loading ? (
    //     <div className="text-center py-12 text-sm"> <RippleLoader/></div>
    //   ) : knowledgeBases.length === 0 ? (
    //     <div className="flex items-center justify-center h-[50vh]">
    //       <p className="text-gray-500 text-lg">No knowledge bases found</p>
    //     </div>
    //   ) : (
    //     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    //       {knowledgeBases.map((kb) => (
    //         <div
    //           key={kb.knowledge_base_id}
    //           className="bg-white rounded-[20px] p-6 pt-9 shadow-sm border border-[#1012141A] hover:shadow-md transition-shadow flex flex-col gap-y-6 relative overflow-hidden"
    //           style={{ pointerEvents: actionLoading[`delete-${kb.knowledge_base_id}`] ? 'none' : 'auto', opacity: actionLoading[`delete-${kb.knowledge_base_id}`] ? 0.5 : 1 }}
    //         >
    //           <div className="absolute top-0 right-0">
    //             <div className={`pl-2 pr-4 py-0.25 rounded-sm text-[10px] font-medium ${
    //               kb.status === "complete" 
    //                 ? "bg-green-100 text-green-700" 
    //                 : "bg-yellow-100 text-yellow-700"
    //             }`}>
    //               {kb.status === "complete" ? "Complete" : "In Progress"}
    //             </div>
    //           </div>
    //           <div className="flex items-start space-x-3">
    //             <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
    //               📄
    //             </div>
    //             <div className="flex-1 min-w-0">
    //               <h3 className="text-xs font-medium truncate mb-1">
    //                 {kb.knowledge_base_name}
    //               </h3>
    //               <p className="text-[10px] text-[#646465] truncate">
    //                 {kb.knowledge_base_sources?.[0]?.filename || "No files"}
    //               </p>
    //             </div>
    //           </div>

    //           <div className="flex items-center justify-between text-[10px] text-[#646465]">
    //             <div>Pages: {kb.knowledge_base_sources?.length || 0}</div>
    //             <div className="flex gap-2">
    //               {kb.knowledge_base_sources?.[0] && (
    //                 kb.knowledge_base_sources[0].type === "url" ? (
    //                   <a
    //                     href={kb.knowledge_base_sources[0].url}
    //                     target="_blank"
    //                     rel="noopener noreferrer"
    //                     className="p-1.5 text-[#646465] hover:text-gray-600 transition-colors"
    //                   >
    //                     <Link size={14} />
    //                   </a>
    //                 ) : (kb.knowledge_base_sources[0].type === "text" || kb.knowledge_base_sources[0].type === "document") && 
    //                    (kb.knowledge_base_sources[0].file_url || kb.knowledge_base_sources[0].content_url) ? (
    //                   <a
    //                     href={kb.knowledge_base_sources[0].file_url || kb.knowledge_base_sources[0].content_url}
    //                     target="_blank"
    //                     rel="noopener noreferrer"
    //                     className="p-1.5 text-[#646465] hover:text-gray-600 transition-colors"
    //                   >
    //                     <Download size={14} />
    //                   </a>
    //                 ) : null
    //               )}
    //               <button
    //                 onClick={(e) => {
    //                   e.stopPropagation();
    //                   handleDelete(kb.knowledge_base_id);
    //                 }}
    //                 className="p-1.5 text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
    //                 disabled={actionLoading[`delete-${kb.knowledge_base_id}`]}
    //               >
    //                 <Trash2 size={14} className={actionLoading[`delete-${kb.knowledge_base_id}`] ? "animate-pulse" : ""} />
    //               </button>
    //             </div>
    //           </div>

              
    //         </div>
    //       ))}
    //     </div>
    //   )}
     <div className="px-2 sm:px-4 py-4 max-w-screen-xl mx-auto">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-4 bg-white dark:bg-[#141414] dark:text-white">
        <div>
          <h1 className="text-2xl sm:text-4xl font-medium mb-2 sm:mb-4">Knowledge base</h1>
          <p className="text-base sm:text-xl font-medium">
            Centralize all your company's knowledge in{' '}
            <span className="bg-[#155EEF] text-white px-2 py-0.5 rounded">one powerful database</span>. This ensures our AI bots are perfectly trained{' '}
            <span className="bg-[#155EEF] text-white px-2 py-0.5 rounded">to provide seamless support</span> and help your customers like never before!
          </p>
        </div>
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-[#155EEF] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm disabled:opacity-50 font-medium"
        >
          <Plus size={16} />
          <span>Create database</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-2 py-1.5 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-sm">
          <RippleLoader />
        </div>
      ) : knowledgeBases.length === 0 ? (
        <div className="flex items-center justify-center h-[50vh]">
          <p className="text-gray-500 text-lg">No knowledge bases found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {knowledgeBases.map((kb) => (
            <div
              key={kb.knowledge_base_id}
              className="bg-white dark:bg-[#1a1a1a] rounded-[20px] p-6 pt-9 shadow-sm border border-[#1012141A] hover:shadow-md transition-shadow flex flex-col gap-y-6 relative overflow-hidden"
              style={{ pointerEvents: actionLoading[`delete-${kb.knowledge_base_id}`] ? 'none' : 'auto', opacity: actionLoading[`delete-${kb.knowledge_base_id}`] ? 0.5 : 1 }}
            >
              <div className="absolute top-0 right-0">
                <div className={`pl-2 pr-4 py-0.5 rounded-sm text-[10px] font-medium ${
                  kb.status === "complete" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}>
                  {kb.status === "complete" ? "Complete" : "In Progress"}
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">📄</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-medium truncate mb-1">{kb.knowledge_base_name}</h3>
                  <p className="text-[10px] text-[#646465] truncate">{kb.knowledge_base_sources?.[0]?.filename || "No files"}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#646465]">
                <div>Pages: {kb.knowledge_base_sources?.length || 0}</div>
                <div className="flex gap-2">
                  {kb.knowledge_base_sources?.[0] && (
                    kb.knowledge_base_sources[0].type === "url" ? (
                      <a href={kb.knowledge_base_sources[0].url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-[#646465] hover:text-gray-600">
                        <Link size={14} />
                      </a>
                    ) : (kb.knowledge_base_sources[0].type === "text" || kb.knowledge_base_sources[0].type === "document") && (kb.knowledge_base_sources[0].file_url || kb.knowledge_base_sources[0].content_url) ? (
                      <a href={kb.knowledge_base_sources[0].file_url || kb.knowledge_base_sources[0].content_url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-[#646465] hover:text-gray-600">
                        <Download size={14} />
                      </a>
                    ) : null
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(kb.knowledge_base_id);
                    }}
                    className="p-1.5 text-red-500 hover:text-red-600 disabled:opacity-50"
                    disabled={actionLoading[`delete-${kb.knowledge_base_id}`]}
                  >
                    <Trash2 size={14} className={actionLoading[`delete-${kb.knowledge_base_id}`] ? "animate-pulse" : ""} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        isOpen={isCreateDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setNewKbName("");
          setSelectedFiles([]);
          setWebpageUrl("");
          setManualText("");
          setAddContentType("none");
          setError(null);
        }}
        title="Add knowledge base"
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-2 rounded-md text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium mb-1">
              Knowledge base name
            </label>
            <input
              type="text"
              value={newKbName}
              onChange={(e) => setNewKbName(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-[#1012141A] rounded-[6px] appearance-none outline-none text-xs font-medium text-[#646465]"
              placeholder="Enter knowledge base name"
              required
              disabled={createLoading}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">
              Documents
            </label>
            {renderAddContentOptions()}
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => {
                setIsCreateDialogOpen(false);
                setNewKbName("");
                setSelectedFiles([]);
                setWebpageUrl("");
                setManualText("");
                setAddContentType("none");
                setError(null);
              }}
              className="bg-white text-[#155eef] border border-[#155eef] px-4 py-1.5 rounded-lg hover:text-blue-700 transition-colors flex items-center space-x-2 text-xs disabled:opacity-50 font-medium"
              disabled={createLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleCreateKnowledgeBase}
              disabled={!isFormValid() || createLoading}
              className="bg-[#155EEF] text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-xs disabled:opacity-50 font-medium"
            >
              {createLoading && <RefreshCw size={14} className="animate-spin" />}
              <span>{createLoading ? "Creating..." : "Save"}</span>
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}