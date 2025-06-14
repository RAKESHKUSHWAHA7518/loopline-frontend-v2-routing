// import { useAuth } from "../hooks/useAuth";
// import { Phone, Clock, Plus, Link, Download, Smile } from "lucide-react";
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import Details from '../assets/icons/details.svg';
// import { motion } from "framer-motion";


// interface Agent {
//   id: string;
//   agent_name?: string;
//   name: string;
//   phone: string;
//   voice: string;
//   edited_at: Date;
//   avatar?: string;
// }

// interface KnowledgeBase {
//   knowledge_base_id: string;
//   knowledge_base_name: string;
//   status: string;
//   knowledge_base_sources: Array<{
//     type: string;
//     source_id: string;
//     filename: string;
//     content_url?: string;
//     file_url?: string;
//     url?: string;
//   }>;
// }

// function StatCard({
//   icon: Icon,
//   label,
//   value,
//   change,
// }: {
//   icon: any;
//   label: string;
//   value: string;
//   change?: { value: string; positive: boolean };
// }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 12 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.3 }}
//       className="bg-white rounded-[20px] p-4 shadow-sm border border-[#1012141A]"
//     >
//       <div className="flex items-center gap-x-2">
//         <div className="flex items-center gap-x-2">
//           <div className="flex w-10 h-10 items-center justify-center p-3 bg-[#F6F6F6] rounded-full">
//             <Icon className="text-gray-400" size={18} />
//           </div>
//           <span className="text-md font-medium">{label}</span>
//         </div>
//         {change && (
//           <span
//             className={`ml-auto text-xs font-medium px-2 py-1 rounded ${change.positive ? "text-[#36A60F] bg-[#36A60F1A]" : "text-[#E04B4B] bg-[#E04B4B1A]"}`}
//           >
//             {change.value}
//           </span>
//         )}
//       </div>
//       <div className="text-5xl font-medium ml-12">{value}</div>
//     </motion.div>
//   );
// }

// // function StatCard({
// //   icon: Icon,
// //   label,
// //   value,
// //   change,
// // }: {
// //   icon: any;
// //   label: string;
// //   value: string;
// //   change?: { value: string; positive: boolean };
// // }) {
// //   return (
// //     <div className="bg-white rounded-[20px] p-4 shadow-sm border border-[#1012141A]">
// //       <div className="flex items-center gap-x-2">
// //         <div className="flex items-center gap-x-2">
// //           <div className="flex w-10 h-10 items-center justify-center p-3 bg-[#F6F6F6] rounded rounded-full">
// //             <Icon className="text-gray-400" size={18} />
// //           </div>
// //           <span className="text-md font-medium">{label}</span>
// //         </div>
// //         {change && (
// //           <span
// //             className={`ml-auto text-xs font-medium px-2 py-1 rounded ${change.positive ? "text-[#36A60F] bg-[#36A60F1A]" : "text-[#E04B4B] bg-[#E04B4B1A]"}`}
// //           >
// //             {change.value}
// //           </span>
// //         )}
// //       </div>
// //       <div className="text-5xl font-medium ml-12">{value}</div>
// //     </div>
// //   );
// // }


// const ShimmerLine = ({ width }: { width: string }) => (
//   <div className={`bg-gray-200 rounded h-4 animate-pulse`} style={{ width }} />
// );

// const ShimmerCard = () => (
//   <div className="flex flex-col">
//     <div className="flex items-center">
//       <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse mr-3" />
//       <div className="space-y-1">
//         <ShimmerLine width="80px" />
//         <ShimmerLine width="60px" />
//         <ShimmerLine width="50px" />
//       </div>
//     </div>
//   </div>
// );


// export function Dashboard() {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [agents, setAgents] = useState<Agent[]>([]);
//   const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
//   const [loading, setLoading] = useState(true);
//   const firstName = user?.email?.split("@")[0] || "User";

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!user) return;
//       setLoading(true);
//       try {
//         // Fetch agents
//         const agentsResponse = await fetch(
//           `${import.meta.env.VITE_BACKEND_URL}/api/list-agents?user_id=${user.uid}&workspace_id=1`
//         );
//         const agentsData = await agentsResponse.json();

//         // Fetch knowledge bases
//         const kbResponse = await fetch(
//           `${import.meta.env.VITE_BACKEND_URL}/api/knowledge-bases?user_id=${user.uid}`
//         );
//         const kbData = await kbResponse.json();

//         setAgents(agentsData.agents || []);
//         setKnowledgeBases(kbData.knowledge_bases_data || []);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [user]);
//   const capFirst = (s: string) =>
//     s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
//   return (
//     <div>
//       <h1 style={{ lineHeight: "100%" }}>Welcome {capFirst(firstName)}!</h1>
//       <div className="page-subtitle mb-10">
//         Let's save you{" "}
//         <span className="bg-[#155EEF] text-white px-2 py-0.25 rounded">68%</span>{" "}
//         on payroll and schedule more appointments.
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
//         <div className="bg-white rounded-[20px] p-6 shadow-sm border border-[#1012141A]">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-md font-medium">Agents</h2>
//             <button 
//               onClick={() => navigate('/agents')}
//               className="w-6 h-6 bg-[#155EEF] rounded-full flex items-center justify-center hover:opacity-90"
//             >
//               <Plus size={14} className="text-white" />
//             </button>
//           </div>

//           {/* {loading ? (
//             <div className="flex items-center justify-center py-8">
//               <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
//             </div>
//           ) : agents.length === 0 ? (
//             <div className="flex items-center justify-center h-[100px]">
//               <p className="text-gray-500 text-sm">No agents found</p>
//             </div> */}
//             {loading ? (
//   <div className="grid grid-cols-2 gap-x-6 mb-6">
//     {[...Array(3)].map((_, i) => (
//       <ShimmerCard key={i} />
//     ))}
//   </div>
// ) : agents.length === 0 ? (
//   <div className="flex items-center justify-center h-[100px]">
//     <p className="text-gray-500 text-sm">No agents found</p>
//   </div>
//           ) : (
//             <div className="grid grid-cols-2 gap-x-6 mb-6">
//               {agents.slice(0, 6).map((agent, index) => (
//               <div key={agent.id} className="flex flex-col">
//                 <div className="flex items-center">
//                   <img
//                     src={agent.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.agent_name || 'Agent')}`}
//                     alt={agent.agent_name}
//                     className="rounded-full mr-3 w-10 h-10"
//                   />
//                   <div>
//                     <h3 className="text-xs font-medium">{agent.agent_name || 'Agent'}</h3>
//                     <div className="text-xs text-gray-500">
//                       Phone: {agent.phone || 'N/A'}
//                     </div>
//                     <div className="text-xs text-gray-500">
//                       Voice: {agent.voice || 'N/A'}
//                     </div>
//                   </div>
//                 </div>
//                 {index <= agents.length - 2 && <div key={index} className="h-[1px] my-[21px] w-full bg-[#155EEF1A]"/>}
//               </div>
//             ))}
//             </div>
//           )}

//           <div>
//             <button 
//               onClick={() => navigate('/agents')}
//               className="bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-4 rounded-lg text-xs"
//             >
//               Go to Agents
//             </button>
//           </div>
//         </div>

//         <div className="bg-white rounded-[20px] p-6 shadow-sm border border-[#1012141A] flex flex-col justify-between">
//           <div>
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-md font-medium">Knowledge base</h2>
//               <button 
//                 onClick={() => navigate('/knowledge-base')}
//                 className="w-6 h-6 bg-[#155EEF] rounded-full flex items-center justify-center hover:opacity-90"
//               >
//                 <Plus size={14} className="text-white" />
//               </button>
//             </div>

//             {loading ? (
//               // <div className="flex items-center justify-center py-8">
//               //   <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
//               // </div>
//                 <div className="space-y-4">
//     {[...Array(3)].map((_, i) => (
//       <div key={i} className="flex items-center justify-between animate-pulse">
//         <div className="flex items-center space-x-2">
//           <div className="bg-gray-200 rounded-full w-8 h-8" />
//           <div className="space-y-1">
//             <ShimmerLine width="120px" />
//             <ShimmerLine width="60px" />
//           </div>
//         </div>
//         <div className="w-4 h-4 bg-gray-200 rounded-full" />
//       </div>
//     ))}
//   </div>
//             ) : knowledgeBases.length === 0 ? (
//               <div className="flex items-center justify-center h-[100px]">
//                 <p className="text-gray-500 text-sm">No knowledge bases found</p>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {knowledgeBases.slice(0, 3).map((kb) => (
//                   <div key={kb.knowledge_base_id} className="border-b border-b-[#155EEF1A] pb-4 last:border-b-0">
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-start flex-col">
//                         <div className="flex items-center mb-1">
//                           <div className="mr-3 bg-[#F6F6F6] p-1.5 rounded rounded-full">
//                             <img src={Details} alt="details-icon"/>
//                           </div>
//                           <div className="font-medium text-sm">{kb.knowledge_base_name}</div>
//                         </div>
//                         <div className="text-gray-500 text-[10px]">
//                           {kb.knowledge_base_sources?.[0]?.filename || 'No files'}
//                         </div>
//                       </div>
//                       {kb.knowledge_base_sources?.[0] && (
//                         <div className="flex gap-2 self-center">
//                           {kb.knowledge_base_sources[0].type === "url" ? (
//                             <a
//                               href={kb.knowledge_base_sources[0].url}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="p-1 text-[#646465] hover:text-gray-600 transition-colors"
//                             >
//                               <Link size={14} />
//                             </a>
//                           ) : (kb.knowledge_base_sources[0].type === "text" || kb.knowledge_base_sources[0].type === "document") && 
//                              (kb.knowledge_base_sources[0].file_url || kb.knowledge_base_sources[0].content_url) ? (
//                             <a
//                               href={kb.knowledge_base_sources[0].file_url || kb.knowledge_base_sources[0].content_url}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="p-1 text-[#646465] hover:text-gray-600 transition-colors"
//                             >
//                               <Download size={14} />
//                             </a>
//                           ) : null}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//           <div>
//             <button 
//               onClick={() => navigate('/knowledge-base')}
//               className="bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-4 rounded-lg text-xs"
//             >
//               Go to Knowledge base
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         <StatCard
//           icon={Phone}
//           label="Total Calls"
//           value="345"
//           change={{ value: "+8,4%", positive: true }}
//         />
//         <StatCard
//           icon={Clock}
//           label="Avg Call Duration"
//           value="1m51"
//           change={{ value: "-3,7%", positive: false }}
//         />
//         <StatCard
//           icon={Smile}
//           label="Customer satisfaction"
//           value="82%"
//         />
//       </div>
//     </div>
//   );
// }





import { useAuth } from "../hooks/useAuth";
import { Phone, Clock, Plus, Link, Download, Smile } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Details from '../assets/icons/details.svg';
import { motion } from "framer-motion";


interface Agent {
  id: string;
  agent_name?: string;
  name: string;
  phone: string;
  voice: string;
  edited_at: Date;
  avatar?: string;
}

interface KnowledgeBase {
  knowledge_base_id: string;
  knowledge_base_name: string;
  status: string;
  knowledge_base_sources: Array<{
    type: string;
    source_id: string;
    filename: string;
    content_url?: string;
    file_url?: string;
    url?: string;
  }>;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
    },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

function StatCard({
  icon: Icon,
  label,
  value,
  change,
}: {
  icon: any;
  label: string;
  value: string;
  change?: { value: string; positive: boolean };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-[#1a1a1a] rounded-[20px] p-4 shadow-sm border border-[#1012141A] dark:border-gray-700 cursor-pointer"
    >
      <div className="flex items-center gap-x-2">
        <div className="flex items-center gap-x-2">
          <div className="flex w-10 h-10 items-center justify-center p-3 bg-[#F6F6F6] dark:bg-[#2c2c2c] rounded-full">
            <Icon className="text-gray-400 dark:text-gray-300" size={18} />
          </div>
          <span className="text-md font-medium">{label}</span>
        </div>
        {change && (
          <span
            className={`ml-auto text-xs font-medium px-2 py-1 rounded ${
              change.positive
                ? "text-[#36A60F] bg-[#36A60F1A] dark:bg-[#36A60F33]"
                : "text-[#E04B4B] bg-[#E04B4B1A] dark:bg-[#E04B4B33]"
            }`}
          >
            {change.value}
          </span>
        )}
      </div>
      <div className="text-5xl font-medium ml-12">{value}</div>
    </motion.div>
  );
}

// function StatCard({
//   icon: Icon,
//   label,
//   value,
//   change,
// }: {
//   icon: any;
//   label: string;
//   value: string;
//   change?: { value: string; positive: boolean };
// }) {
//   return (
//     // <motion.div
//     //   initial={{ opacity: 0, y: 12 }}
//     //   animate={{ opacity: 1, y: 0 }}
//     //   transition={{ duration: 0.5 }}
//     //   className="bg-white rounded-[20px] p-4 shadow-sm border border-[#1012141A]"
//     // >
//     <motion.div
//   initial={{ opacity: 0, y: 12 }}
//   animate={{ opacity: 1, y: 0 }}
//   whileHover={{ scale: 1.02 }}
//   transition={{ duration: 0.3 }}
//   className="bg-white rounded-[20px] p-4 shadow-sm border border-[#1012141A] cursor-pointer"
// >
//       <div className="flex items-center gap-x-2">
//         <div className="flex items-center gap-x-2">
//           <div className="flex w-10 h-10 items-center justify-center p-3 bg-[#F6F6F6] rounded-full">
//             <Icon className="text-gray-400" size={18} />
//           </div>
//           <span className="text-md font-medium">{label}</span>
//         </div>
//         {change && (
//           <span
//             className={`ml-auto text-xs font-medium px-2 py-1 rounded ${change.positive ? "text-[#36A60F] bg-[#36A60F1A]" : "text-[#E04B4B] bg-[#E04B4B1A]"}`}
//           >
//             {change.value}
//           </span>
//         )}
//       </div>
//       <div className="text-5xl font-medium ml-12">{value}</div>
//     </motion.div>
//   );
// }

// function StatCard({
//   icon: Icon,
//   label,
//   value,
//   change,
// }: {
//   icon: any;
//   label: string;
//   value: string;
//   change?: { value: string; positive: boolean };
// }) {
//   return (
//     <div className="bg-white rounded-[20px] p-4 shadow-sm border border-[#1012141A]">
//       <div className="flex items-center gap-x-2">
//         <div className="flex items-center gap-x-2">
//           <div className="flex w-10 h-10 items-center justify-center p-3 bg-[#F6F6F6] rounded rounded-full">
//             <Icon className="text-gray-400" size={18} />
//           </div>
//           <span className="text-md font-medium">{label}</span>
//         </div>
//         {change && (
//           <span
//             className={`ml-auto text-xs font-medium px-2 py-1 rounded ${change.positive ? "text-[#36A60F] bg-[#36A60F1A]" : "text-[#E04B4B] bg-[#E04B4B1A]"}`}
//           >
//             {change.value}
//           </span>
//         )}
//       </div>
//       <div className="text-5xl font-medium ml-12">{value}</div>
//     </div>
//   );
// }


const ShimmerLine = ({ width }: { width: string }) => (
  <div className={`bg-gray-200 rounded h-4 animate-pulse`} style={{ width }} />
);

const ShimmerCard = () => (
  <div className="flex flex-col">
    <div className="flex items-center">
      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse mr-3" />
      <div className="space-y-1">
        <ShimmerLine width="80px" />
        <ShimmerLine width="60px" />
        <ShimmerLine width="50px" />
      </div>
    </div>
  </div>
);


export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const firstName = user?.email?.split("@")[0] || "User";

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        // Fetch agents
        const agentsResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/list-agents?user_id=${user.uid}&workspace_id=1`
        );
        const agentsData = await agentsResponse.json();

        // Fetch knowledge bases
        const kbResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/knowledge-bases?user_id=${user.uid}`
        );
        const kbData = await kbResponse.json();

        setAgents(agentsData.agents || []);
        setKnowledgeBases(kbData.knowledge_bases_data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);
  const capFirst = (s: string) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
  return (
    <div className="dark:bg-[#141414] dark:text-white min-h-screen p-4 bg-white text-black">
      <h1 style={{ lineHeight: "100%" }}>Welcome {capFirst(firstName)}!</h1>
      <div className="page-subtitle mb-10">
        Let's save you{" "}
        <span className="bg-[#155EEF] text-white  px-2 py-0.25 rounded">68%</span>{" "}
        on payroll and schedule more appointments.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="  border-[#1012141A] bg-white dark:bg-[#1a1a1a] rounded-[20px] p-6 shadow-sm border border-[#e5e7eb] dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-md font-medium">Agents</h2>
            <button 
              onClick={() => navigate('/agents')}
              className="w-6 h-6 bg-[#155EEF] rounded-full flex items-center justify-center hover:opacity-90"
            >
              <Plus size={14} className="text-white" />
            </button>
          </div>

          {/* {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : agents.length === 0 ? (
            <div className="flex items-center justify-center h-[100px]">
              <p className="text-gray-500 text-sm">No agents found</p>
            </div> */}
            {loading ? (
  <div className="grid grid-cols-2 gap-x-6 mb-6">
    {[...Array(3)].map((_, i) => (
      <ShimmerCard key={i} />
    ))}
  </div>
) : agents.length === 0 ? (
  <div className="flex items-center justify-center h-[100px]">
    <p className="text-gray-500 text-sm">No agents found</p>
  </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 mb-6">
              {agents.slice(0, 6).map((agent, index) => (
                <motion.div
  custom={index}
  variants={fadeInUp}
  initial="hidden"
  animate="visible"
    whileHover={{ scale: 1.09 }}
  key={agent.id}
  className="flex flex-col hover:shadow-sm transition-all duration-200 rounded-lg p-2"
>
              <div key={agent.id} className="flex flex-col">
                <div className="flex items-center">
                  <img
                    src={agent.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.agent_name || 'Agent')}`}
                    alt={agent.agent_name}
                    className="rounded-full mr-3 w-10 h-10"
                  />
                  <div>
                    <h3 className="text-xs font-medium">{agent.agent_name || 'Agent'}</h3>
                    <div className="text-xs text-gray-500">
                      Phone: {agent.phone || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Voice: {agent.voice || 'N/A'}
                    </div>
                  </div>
                </div>
                {index <= agents.length - 2 && <div key={index} className="h-[1px] my-[21px] w-full bg-[#155EEF1A]"/>}
              </div>
              </motion.div>
            ))}
            </div>
          )}

          <div>
            {/* <button 
              onClick={() => navigate('/agents')}
              className="bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-4 rounded-lg text-xs"
            >
              Go to Agents
            </button> */}
            <motion.button
  whileTap={{ scale: 0.95 }}
  whileHover={{ scale: 1.05 }}
  onClick={() => navigate('/agents')}
  className="bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-4 rounded-lg text-xs"
>
  Go to Agents
</motion.button>

          </div>
        </div>

        {/* <div className="bg-white rounded-[20px] p-6 shadow-sm border border-[#1012141A] flex flex-col justify-between"> */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[20px] p-6 shadow-sm border border-[#e5e7eb] dark:border-gray-700 flex flex-col justify-between">
       
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-md font-medium">Knowledge base</h2>
              <button 
                onClick={() => navigate('/knowledge-base')}
                className="w-6 h-6 bg-[#155EEF] rounded-full flex items-center justify-center hover:opacity-90"
              >
                <Plus size={14} className="text-white" />
              </button>
            </div>

            {loading ? (
              // <div className="flex items-center justify-center py-8">
              //   <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              // </div>
                <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex items-center justify-between animate-pulse">
        <div className="flex items-center space-x-2">
          <div className="bg-gray-200 rounded-full w-8 h-8" />
          <div className="space-y-1">
            <ShimmerLine width="120px" />
            <ShimmerLine width="60px" />
          </div>
        </div>
        <div className="w-4 h-4 bg-gray-200 rounded-full" />
      </div>
    ))}
  </div>
            ) : knowledgeBases.length === 0 ? (
              <div className="flex items-center justify-center h-[100px]">
                <p className="text-gray-500 text-sm">No knowledge bases found</p>
              </div>
            ) : (
              <div className="space-y-4">
                <motion.div
  variants={staggerContainer}
  initial="hidden"
  animate="visible"
  className="space-y-4"
>
                {knowledgeBases.slice(0, 3).map((kb) => (
                  <motion.div
  variants={staggerContainer}
  initial="hidden"
  animate="visible"
  className="space-y-4"
>
                  <div key={kb.knowledge_base_id} className="border-b border-b-[#155EEF1A] pb-4 last:border-b-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start flex-col">
                        <div className="flex items-center mb-1">
                          <div className="mr-3 bg-[#F6F6F6] p-1.5 rounded rounded-full">
                            <img src={Details} alt="details-icon"/>
                          </div>
                          <div className="font-medium text-sm">{kb.knowledge_base_name}</div>
                        </div>
                        <div className="text-gray-500 text-[10px]">
                          {kb.knowledge_base_sources?.[0]?.filename || 'No files'}
                        </div>
                      </div>
                      {kb.knowledge_base_sources?.[0] && (
                        <div className="flex gap-2 self-center">
                          {kb.knowledge_base_sources[0].type === "url" ? (
                            <a
                              href={kb.knowledge_base_sources[0].url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-[#646465] hover:text-gray-600 transition-colors"
                            >
                              <Link size={14} />
                            </a>
                          ) : (kb.knowledge_base_sources[0].type === "text" || kb.knowledge_base_sources[0].type === "document") && 
                             (kb.knowledge_base_sources[0].file_url || kb.knowledge_base_sources[0].content_url) ? (
                            <a
                              href={kb.knowledge_base_sources[0].file_url || kb.knowledge_base_sources[0].content_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-[#646465] hover:text-gray-600 transition-colors"
                            >
                              <Download size={14} />
                            </a>
                          ) : null}
                        </div>
                          
                      )}
                    </div>
                  </div>
                  </motion.div>
                ))}
                </motion.div>
              </div>
            )}
          </div>
          <div className="py-4">
            {/* <button 
              onClick={() => navigate('/knowledge-base')}
              className="bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-4 rounded-lg text-xs"
            >
              Go to Knowledge base
            </button> */}
            <motion.button
  whileTap={{ scale: 0.95 }}
  whileHover={{ scale: 1.05 }}
 onClick={() => navigate('/knowledge-base')}
  className="bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-4 rounded-lg text-xs"
>
   Go to Knowledge base
</motion.button>

          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={Phone}
          label="Total Calls"
          value="345"
          change={{ value: "+8,4%", positive: true }}
        />
        <StatCard
          icon={Clock}
          label="Avg Call Duration"
          value="1m51"
          change={{ value: "-3,7%", positive: false }}
        />
        <StatCard
          icon={Smile}
          label="Customer satisfaction"
          value="82%"
        />
      </div>
    </div>
 

  );
}


{/* <div className="min-h-screen p-4 bg-white text-black dark:bg-[#141414] dark:text-white">
  <h1 className="text-2xl font-semibold mb-2">Welcome {capFirst(firstName)}!</h1>
  <div className="page-subtitle mb-10 text-gray-600 dark:text-gray-300">
    Let’s save you{" "}
    <span className="bg-[#155EEF] text-white px-2 py-0.5 rounded">68%</span>{" "}
    on payroll and schedule more appointments.
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
    
    <div className="bg-white dark:bg-[#1a1a1a] rounded-[20px] p-6 shadow-sm border border-[#e5e7eb] dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-md font-medium">Agents</h2>
        <button
          onClick={() => navigate("/agents")}
          className="w-6 h-6 bg-[#155EEF] rounded-full flex items-center justify-center hover:opacity-90"
        >
          <Plus size={14} className="text-white" />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-x-6 mb-6">
          {[...Array(3)].map((_, i) => (
            <ShimmerCard key={i} />
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="flex items-center justify-center h-[100px]">
          <p className="text-gray-500 dark:text-gray-400 text-sm">No agents found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 mb-6">
          {agents.slice(0, 6).map((agent, index) => (
            <motion.div
              key={agent.id}
              custom={index}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.09 }}
              className="flex flex-col hover:shadow-md transition-all duration-200 rounded-lg p-2"
            >
              <div className="flex items-center">
                <img
                  src={
                    agent.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      agent.agent_name || "Agent"
                    )}`
                  }
                  alt={agent.agent_name}
                  className="rounded-full mr-3 w-10 h-10"
                />
                <div>
                  <h3 className="text-xs font-medium">
                    {agent.agent_name || "Agent"}
                  </h3>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Phone: {agent.phone || "N/A"}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Voice: {agent.voice || "N/A"}
                  </div>
                </div>
              </div>
              {index <= agents.length - 2 && (
                <div className="h-[1px] my-[21px] w-full bg-[#155EEF1A] dark:bg-gray-700" />
              )}
            </motion.div>
          ))}
        </div>
      )}

      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => navigate("/agents")}
        className="bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-4 rounded-lg text-xs"
      >
        Go to Agents
      </motion.button>
    </div>

     
    <div className="bg-white dark:bg-[#1a1a1a] rounded-[20px] p-6 shadow-sm border border-[#e5e7eb] dark:border-gray-700 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-md font-medium">Knowledge base</h2>
          <button
            onClick={() => navigate("/knowledge-base")}
            className="w-6 h-6 bg-[#155EEF] rounded-full flex items-center justify-center hover:opacity-90"
          >
            <Plus size={14} className="text-white" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="flex items-center space-x-2">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full w-8 h-8" />
                  <div className="space-y-1">
                    <ShimmerLine width="120px" />
                    <ShimmerLine width="60px" />
                  </div>
                </div>
                <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full" />
              </div>
            ))}
          </div>
        ) : knowledgeBases.length === 0 ? (
          <div className="flex items-center justify-center h-[100px]">
            <p className="text-gray-500 dark:text-gray-400 text-sm">No knowledge bases found</p>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {knowledgeBases.slice(0, 3).map((kb) => (
              <div
                key={kb.knowledge_base_id}
                className="border-b border-b-[#155EEF1A] dark:border-gray-700 pb-4 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start flex-col">
                    <div className="flex items-center mb-1">
                      <div className="mr-3 bg-[#F6F6F6] dark:bg-gray-800 p-1.5 rounded-full">
                        <img src={Details} alt="details-icon" />
                      </div>
                      <div className="font-medium text-sm">{kb.knowledge_base_name}</div>
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-[10px]">
                      {kb.knowledge_base_sources?.[0]?.filename || "No files"}
                    </div>
                  </div>
                  {kb.knowledge_base_sources?.[0] && (
                    <div className="flex gap-2 self-center">
                      {kb.knowledge_base_sources[0].type === "url" ? (
                        <a
                          href={kb.knowledge_base_sources[0].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-[#646465] hover:text-gray-600 dark:text-gray-400 dark:hover:text-white transition-colors"
                        >
                          <Link size={14} />
                        </a>
                      ) : (kb.knowledge_base_sources[0].type === "text" ||
                          kb.knowledge_base_sources[0].type === "document") &&
                        (kb.knowledge_base_sources[0].file_url ||
                          kb.knowledge_base_sources[0].content_url) ? (
                        <a
                          href={
                            kb.knowledge_base_sources[0].file_url ||
                            kb.knowledge_base_sources[0].content_url
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-[#646465] hover:text-gray-600 dark:text-gray-400 dark:hover:text-white transition-colors"
                        >
                          <Download size={14} />
                        </a>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => navigate("/knowledge-base")}
        className="bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-4 rounded-lg text-xs"
      >
        Go to Knowledge base
      </motion.button>
    </div>
  </div>

   
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <StatCard
      icon={Phone}
      label="Total Calls"
      value="345"
      change={{ value: "+8,4%", positive: true }}
    />
    <StatCard
      icon={Clock}
      label="Avg Call Duration"
      value="1m51"
      change={{ value: "-3,7%", positive: false }}
    />
    <StatCard icon={Smile} label="Customer satisfaction" value="82%" />
  </div>
</div> */}