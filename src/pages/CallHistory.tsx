 

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  Phone,
  Clock,
  AlertTriangle,
  X,
  Volume2,
  Copy,
  Download,
  Play,
  Pause,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { motion } from "framer-motion";
import axios from "axios";


interface CallData {
  call_id: string;
  agent_id: string;
  call_status: string;
  start_timestamp: number;
  end_timestamp: number;
  duration_ms: number;
  transcript: string;
  transcript_object: Array<{
    role: string;
    content: string;
    words: any[];
    metadata: any;
  }>;
  recording_url: string;
  disconnection_reason: string;
  call_type: string;
  call_analysis: {
    call_summary: string;
    user_sentiment: string;
    call_successful: boolean;
    agent_task_completion_rating: string;
  };
}

interface CallDetailsProps {
  call: CallData;
  onClose: () => void;
}

const getBadgeStyles = (type: string, sentiment: boolean = false) => {
  const baseStyles =
    "px-2 py-1 text-xs rounded-full inline-flex items-center justify-center font-medium";

  if (sentiment) {
    switch (type) {
      case "Positive":
        return `${baseStyles} bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400`;
      case "Negative":
        return `${baseStyles} bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400`;
      case "Neutral":
        return `${baseStyles} bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400`;
      default:
        return `${baseStyles} bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400`;
    }
  }

  switch (type) {
    case "Successful":
    case "true":
      return `${baseStyles} bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400`;
    case "Unsuccessful":
    case "false":
      return `${baseStyles} bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400`;
    case "User_Hangup":
    case "Agent_Hangup":
      return `${baseStyles} bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400`;
    default:
      return `${baseStyles} bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400`;
  }
};

function CallDetails({ call, onClose }: CallDetailsProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volumeTimeoutRef = useRef<NodeJS.Timeout>();
  const [audioProgress, setAudioProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isVolumeHovered, setIsVolumeHovered] = useState(false);
  const [isVolumeSliderHovered, setIsVolumeSliderHovered] = useState(false);

  const formatTimestamp = (timestamp: number) => {
    if (!timestamp) return "N/A";
    try {
      return format(new Date(timestamp), "MM/dd/yyyy HH:mm");
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "Invalid date";
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = typeof ms === "number" ? ms : 0;
    const minutes = Math.floor(ms / 60000);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopyCallId = () => {
    navigator.clipboard.writeText(call.call_id);
  };

  const handleCopyTranscript = () => {
    navigator.clipboard.writeText(call.transcript || "");
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progress =
        (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setAudioProgress(progress);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleVolumeMouseEnter = () => {
    setIsVolumeHovered(true);
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
    }
  };

  const handleVolumeMouseLeave = () => {
    if (!isVolumeSliderHovered) {
      volumeTimeoutRef.current = setTimeout(() => {
        setIsVolumeHovered(false);
      }, 500);
    }
  };

  const handleSliderMouseEnter = () => {
    setIsVolumeSliderHovered(true);
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
    }
  };

  const handleSliderMouseLeave = () => {
    setIsVolumeSliderHovered(false);
    volumeTimeoutRef.current = setTimeout(() => {
      if (!isVolumeHovered) {
        setIsVolumeHovered(false);
      }
    }, 500);
  };

  const handleDownloadAudio = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (call.recording_url) {
      const link = document.createElement("a");
      link.href = call.recording_url;
      link.download = `call-${call.call_id}.wav`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight"
      ) {
        console.log("Navigate with:", e.key);
      }
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (volumeTimeoutRef.current) {
        clearTimeout(volumeTimeoutRef.current);
      }
    };
  }, [onClose]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, []);

  return (
    <div className="fixed inset-0 lg:inset-y-0 lg:right-0 lg:w-[440px] w-full bg-white dark:bg-[#141414] shadow-lg overflow-y-auto z-50">
      <div className="p-3 sm:p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <span className="hidden sm:inline">
            Use <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">↑</kbd>{" "}
            <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">↓</kbd> to navigate
          </span>
          <span className="sm:hidden">Call Details</span>
        </div>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1"
        >
          <X size={20} className="sm:w-4 sm:h-4" />
        </button>
      </div>

      <div className="p-4 sm:p-6">
        {/* Call Header */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-base font-medium mb-2 sm:mb-1 dark:text-white">
            {formatTimestamp(call.start_timestamp)}{" "}
            {call.call_type || "Unknown"}
          </h2>
          <div className="text-sm sm:text-xs text-gray-500 dark:text-gray-400 space-y-2 sm:space-y-1">
            <div className="flex items-center space-x-2">
              <span>Agent</span>
              <span className="text-gray-400 dark:text-gray-500 truncate">{call.agent_id}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Call ID</span>
              <span className="text-gray-400 dark:text-gray-500 truncate flex-1">{call.call_id}</span>
              <button
                onClick={handleCopyCallId}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1"
              >
                <Copy size={14} className="sm:w-3 sm:h-3" />
              </button>
            </div>
            <div className="text-sm sm:text-xs">
              Duration: {formatTimestamp(call.start_timestamp)} -{" "}
              {formatTimestamp(call.end_timestamp)}
            </div>
          </div>
        </div>

        {/* Audio Player */}
        {call.recording_url && (
          <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-2 rounded mb-4 sm:mb-6">
            <audio
              ref={audioRef}
              src={call.recording_url}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
            />
            <div className="flex items-center space-x-3 sm:space-x-2">
              <button
                onClick={handlePlayPause}
                className="p-2 sm:p-1 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
              >
                {isPlaying ? <Pause size={20} className="sm:w-4 sm:h-4" /> : <Play size={20} className="sm:w-4 sm:h-4" />}
              </button>
              <div className="flex-1 h-2 sm:h-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${audioProgress}%` }}
                />
              </div>
              <div
                className="relative"
                onMouseEnter={handleVolumeMouseEnter}
                onMouseLeave={handleVolumeMouseLeave}
              >
                <button className="p-2 sm:p-1 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white">
                  <Volume2 size={20} className="sm:w-4 sm:h-4" />
                </button>
                {isVolumeHovered && (
                  <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white dark:bg-gray-800 p-2 rounded shadow-lg border dark:border-gray-700"
                    onMouseEnter={handleSliderMouseEnter}
                    onMouseLeave={handleSliderMouseLeave}
                  >
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-24 h-1 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>
              <button
                onClick={handleDownloadAudio}
                className="p-2 sm:p-1 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
              >
                <Download size={20} className="sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Conversation Analysis */}
        <div className="mb-4 sm:mb-6">
          <h3 className="text-sm sm:text-xs font-medium mb-3 sm:mb-2 dark:text-white">Conversation Analysis</h3>
          <div className="space-y-3 sm:space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-xs text-gray-600 dark:text-gray-400">Call Successful</span>
              <span className="px-2 py-1 sm:py-0.5 text-sm sm:text-xs rounded-full bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                {call.call_analysis.call_successful ? "Complete" : "Incomplete"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-xs text-gray-600 dark:text-gray-400">User Sentiment</span>
              <span
                className={`px-2 py-1 sm:py-0.5 text-sm sm:text-xs rounded-full ${
                  call.call_analysis.user_sentiment === "Positive"
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : call.call_analysis.user_sentiment === "Negative"
                      ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                      : "bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400"
                }`}
              >
                {call.call_analysis.user_sentiment}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-xs text-gray-600 dark:text-gray-400">
                Disconnection Reason
              </span>
              <span className="px-2 py-1 sm:py-0.5 text-sm sm:text-xs rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                {call.disconnection_reason?.replace(/_/g, " ") || "Unknown"}
              </span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-4 sm:mb-6">
          <h3 className="text-sm sm:text-xs font-medium mb-3 sm:mb-2 dark:text-white">Summary</h3>
          <p className="text-sm sm:text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            {call.call_analysis.call_summary}
          </p>
        </div>

        {/* Transcript */}
        <div>
          <h3 className="text-sm sm:text-xs font-medium mb-3 sm:mb-2 flex items-center justify-between dark:text-white">
            Transcription
            <button
              onClick={handleCopyTranscript}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1"
            >
              <Copy size={16} className="sm:w-3.5 sm:h-3.5" />
            </button>
          </h3>
          <div className="space-y-4 sm:space-y-3">
            {call?.transcript_object?.map((entry, index) => (
              <div key={index} className="flex items-start space-x-3 sm:space-x-0">
                <div className="w-16 sm:w-12 flex-shrink-0">
                  <div className="text-sm sm:text-xs font-medium text-gray-500 dark:text-gray-400 capitalize">
                    {entry.role}:
                  </div>
                </div>
                <div className="flex-1 min-w-0 sm:ml-3">
                  <p className="text-sm sm:text-xs text-gray-800 dark:text-gray-200 leading-relaxed">{entry.content}</p>
                  {entry.metadata?.tool_calls && (
                    <div className="mt-1 text-sm sm:text-xs text-blue-600 dark:text-blue-400">
                       Tool Invocation: {entry.metadata.tool_calls[0]?.name}
                    </div>
                  )}
                </div>
                <div className="w-12 sm:w-8 flex-shrink-0 text-right">
                  <span className="text-sm sm:text-xs text-gray-400 dark:text-gray-500">
                    {formatDuration(entry.words?.[0]?.start * 1000 || 0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CallHistory() {
  const { user } = useAuth();
  const [calls, setCalls] = useState<CallData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState<CallData | null>(null);
  const [stats, setStats] = useState({
    totalCalls: 0,
    avgDuration: 0,
    negativeSentimentRatio: 0,
  });
  const [agentIds, setAgentIds] = useState<string[]>([]);
const agentId = JSON.parse(localStorage?.getItem("agent_ids") || "[]");
console.log("agentIds from localStorage:", agentId);

 

console.log(agentId);

const fetchcallhistory = async () => {
  try {
    // const callsResponse = await axios.get( `${import.meta.env.VITE_BACKEND_URL}/api/list`)
    // const callsData = callsResponse.data;
    // console.log(callsData);
     const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/list`, {
          agent_ids: agentId, // replace as needed
        });
        setCalls(res.data)
        console.log(res);
        
  } catch (error) {
    
  }
}

useEffect(() => {
    
      fetchcallhistory();
    
  },[]);

  // Uncomment this section if you want to fetch calls from an external API


 


const calculateCustomerSatisfaction = (calls: any[]) => {
  const totalCalls = calls.length;
  if (totalCalls === 0) return "0%";

  const satisfiedCount = calls.filter(
    (call) => call.call_analysis?.user_sentiment === "Positive"
  ).length;

  const csatPercentage = (satisfiedCount / totalCalls) * 100;
  return `${csatPercentage.toFixed(1)}%`;
};

// Usage
const csatScore = calculateCustomerSatisfaction(calls);
console.log("🎯 Customer Satisfaction:", csatScore);


const calculateCallStats = (calls: any[]) => {
  const totalCalls = calls.length;

  const totalDuration = calls.reduce((acc, call) => acc + (call.duration_ms || 0), 0);

  const negativeSentimentCount = calls.filter(
    (call) =>
      call.call_analysis?.user_sentiment === "Negative" ||
      call.call_analysis?.user_sentiment === "Unknown"
  ).length;

  const avgDurationSeconds = totalCalls ? totalDuration / totalCalls / 1000 : 0;
  const negativeSentimentRatio = totalCalls ? negativeSentimentCount / totalCalls : 0;

  // Conditional formatting
  let avgDurationDisplay = "";
  if (avgDurationSeconds < 60) {
    avgDurationDisplay = `${avgDurationSeconds.toFixed(1)} sec`;
  } else {
    const avgMinutes = avgDurationSeconds / 60;
    avgDurationDisplay = `${avgMinutes.toFixed(1)} min`;
  }

  return {
    totalCalls,
    avgDurationDisplay,
    negativeSentimentRatio: (negativeSentimentRatio * 100).toFixed(1) + "%",
    csatScore
  };
};
// // Usage:
const statss = calculateCallStats(calls);
localStorage.setItem("call_stats", JSON.stringify(statss));
 

 // ← your response array
// // console.log("📞 Total calls:", stats.totalCalls);
// // console.log("⏱️ Avg duration (sec):", stats.avgDurationSeconds);
// // console.log("😠 Negative Sentiment Ratio:", stats.negativeSentimentRatio);
console.log(statss);




  useEffect(() => {
    const fetchCalls = async () => {
      if (!user) return;

      try {
        const callsRef = collection(
          db,
          "users",
          user.uid,
          "workspaces",
          "1",
          "call_history",
        );
        const q = query(callsRef, orderBy("start_timestamp", "desc"));
        const querySnapshot = await getDocs(q);

        const callsData = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          call_id: doc.id,
        })) as CallData[];
console.log(callsData);

        setCalls(callsData);

        const total = callsData.length;
        const avgDuration =
          total > 0
            ? callsData.reduce(
                (acc, call) => acc + (call.duration_ms || 0),
                0,
              ) / total
            : 0;
        const negativeCalls = callsData.filter(
          (call) => call.call_analysis?.user_sentiment === "Negative",
        ).length;
        const negativeRatio = total > 0 ? (negativeCalls / total) * 100 : 0;

        setStats({
          totalCalls: total,
          avgDuration: avgDuration,
          negativeSentimentRatio: negativeRatio,
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching calls:", error);
        setLoading(false);
      }
    };

    fetchCalls();
  }, [user]);

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m${seconds}s`;
  };

  const ShimmerCard = () => (
    <div className="animate-pulse bg-white dark:bg-gray-800 rounded-[20px] p-4 sm:p-6 shadow-sm border border-[#1012141A] dark:border-gray-700">
      <div className="flex items-center gap-x-2 sm:gap-x-3 mb-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="h-8 sm:h-10 w-3/4 ml-10 sm:ml-12 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  );

  const ShimmerRow = () => (
    <tr className="animate-pulse">
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-3 sm:px-6 py-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </td>
      ))}
    </tr>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <ShimmerCard />
            <ShimmerCard />
            <ShimmerCard />
          </div>
          <div className="bg-white dark:bg-[#141414] rounded-lg shadow-sm overflow-hidden border dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-[#252525]">
                  <tr>
                    {["Time", "Call Duration", "User Sentiment", "Call Successful", "Disconnection Reason"].map((head) => (
                      <th key={head} className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-[#141414] divide-y divide-gray-200 dark:divide-gray-700">
                  {[...Array(6)].map((_, idx) => (
                    <ShimmerRow key={idx} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log(calls);
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0a0a0a] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-[#141414] dark:border-gray-700 dark:text-white mb-6 sm:mb-8 lg:mb-10 gap-4 p-4 sm:p-6 rounded-lg shadow-sm border">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium">Call History</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white dark:bg-[#141414] dark:border-gray-700 dark:text-white rounded-[20px] p-4 sm:p-6 shadow-sm border border-[#1012141A]"
          >
            <div className="flex items-center gap-x-2 sm:gap-x-3">
              <div className="flex items-center gap-x-2 sm:gap-x-3 flex-1">
                <div className="flex w-8 h-8 sm:w-10 sm:h-10 items-center justify-center p-2 sm:p-3 bg-[#F6F6F6] dark:bg-gray-800 rounded-full">
                  <Phone className="text-gray-400 dark:text-gray-500" size={16} />
                </div>
                <span className="text-sm sm:text-base font-medium">Total Calls</span>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded text-[#36A60F] bg-[#36A60F1A]">
                5.6%
              </span>
            </div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-medium ml-10 sm:ml-12 mt-2">
              {/* {stats.totalCalls} */}
              {statss.totalCalls}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white dark:bg-[#141414] dark:border-gray-700 dark:text-white rounded-[20px] p-4 sm:p-6 shadow-sm border border-[#1012141A]"
          >
            <div className="flex items-center gap-x-2 sm:gap-x-3">
              <div className="flex items-center gap-x-2 sm:gap-x-3 flex-1">
                <div className="flex w-8 h-8 sm:w-10 sm:h-10 items-center justify-center p-2 sm:p-3 bg-[#F6F6F6] dark:bg-gray-800 rounded-full">
                  <Clock className="text-gray-400 dark:text-gray-500" size={16} />
                </div>
                <span className="text-sm sm:text-base font-medium">Avg Call Duration</span>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded text-[#36A60F] bg-[#36A60F1A]">
                5.6%
              </span>
            </div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-medium ml-10 sm:ml-12 mt-2">
              {/* {formatDuration(stats.avgDuration)} */}
              {statss?.avgDurationDisplay}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white dark:bg-[#141414] dark:border-gray-700 dark:text-white rounded-[20px] p-4 sm:p-6 shadow-sm border border-[#1012141A] sm:col-span-2 lg:col-span-1"
          >
            <div className="flex items-center gap-x-2 sm:gap-x-3">
              <div className="flex items-center gap-x-2 sm:gap-x-3 flex-1">
                <div className="flex w-8 h-8 sm:w-10 sm:h-10 items-center justify-center p-2 sm:p-3 bg-[#F6F6F6] dark:bg-gray-800 rounded-full">
                  <AlertTriangle className="text-gray-400 dark:text-gray-500" size={16} />
                </div>
                <span className="text-sm sm:text-base font-medium">Negative Sentiment Ratio</span>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded text-[#36A60F] bg-[#36A60F1A]">
                5.6%
              </span>
            </div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-medium ml-10 sm:ml-12 mt-2">
              {/* {stats.negativeSentimentRatio.toFixed(2)}% */}
              {statss.negativeSentimentRatio}%
            </div>
          </motion.div>
        </div>

        {/* Mobile Call Cards */}
        <div className="block sm:hidden space-y-4 mb-6">
          {calls.map((call) => (
            <motion.div
              key={call.call_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCall(call)}
              className="bg-white dark:bg-[#141414] rounded-lg p-4 shadow-sm border dark:border-gray-700 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <p className="text-sm font-medium dark:text-white">
                    {call.start_timestamp
                      ? formatDistanceToNow(new Date(call.start_timestamp), {
                          addSuffix: true,
                        })
                      : "N/A"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Duration: {formatDuration(call.duration_ms)}
                  </p>
                </div>
                <span
                  className={getBadgeStyles(
                    call.call_analysis?.user_sentiment,
                    true,
                  )}
                >
                  {call.call_analysis?.user_sentiment || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span
                  className={getBadgeStyles(
                    call.call_analysis?.call_successful
                      ? "Successful"
                      : "Unsuccessful",
                  )}
                >
                  {call.call_analysis?.call_successful
                    ? "Successful"
                    : "Unsuccessful"}
                </span>
                <span className={getBadgeStyles(call.disconnection_reason)}>
                  {call.disconnection_reason?.replace(/_/g, " ") || "Unknown"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Desktop/Tablet Table */}
        <div className="hidden sm:block bg-white dark:bg-[#141414] rounded-lg shadow-sm overflow-hidden border dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-white dark:bg-[#252525]">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Call Duration
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User Sentiment
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Call Successful
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Disconnection Reason
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[#141414] divide-y divide-gray-200 dark:divide-gray-700">
                {calls.map((call) => (
                  <tr
                    key={call.call_id}
                    onClick={() => setSelectedCall(call)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                  >
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm dark:text-white text-gray-900">
                      {call.start_timestamp
                        ? formatDistanceToNow(new Date(call.start_timestamp), {
                            addSuffix: true,
                          })
                        : "N/A"}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm dark:text-white text-gray-900">
                      {formatDuration(call.duration_ms)}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span
                        className={getBadgeStyles(
                          call.call_analysis?.user_sentiment,
                          true,
                        )}
                      >
                        {call.call_analysis?.user_sentiment || "Unknown"}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span
                        className={getBadgeStyles(
                          call.call_analysis?.call_successful
                            ? "Successful"
                            : "Unsuccessful",
                        )}
                      >
                        {call.call_analysis?.call_successful
                          ? "Successful"
                          : "Unsuccessful"}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={getBadgeStyles(call.disconnection_reason)}>
                        {call.disconnection_reason?.replace(/_/g, " ") ||
                          "Unknown"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Call Details Sidebar */}
        {selectedCall && (
          <CallDetails
            call={selectedCall}
            onClose={() => setSelectedCall(null)}
          />
        )}
      </div>
    </div>
  );
}