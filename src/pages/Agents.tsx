// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Plus, MoreHorizontal, Pencil } from 'lucide-react';
// import { useAuth } from '../hooks/useAuth';
// import { collection, getDocs } from 'firebase/firestore';
// import { db } from '../lib/firebase';

// interface Agent {
//   id: string;
//   agent_name?: string;
//   name: string;
//   phone: string;
//   voice: string;
//   edited_at: Date;
//   avatar?: string;
// }

// export function Agents() {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [loading, setLoading] = useState(false);
//   const [agents, setAgents] = useState<Agent[]>([]);
//   const [createLoading, setCreateLoading] = useState(false);
//   const [activeMenu, setActiveMenu] = useState<string | null>(null);

//   // Close menu when clicking outside
//   useEffect(() => {
//     const handleClickOutside = () => setActiveMenu(null);
//     document.addEventListener('click', handleClickOutside);
//     return () => document.removeEventListener('click', handleClickOutside);
//   }, []);

//   useEffect(() => {
//     const fetchAgents = async () => {
//       if (!user) return;

//       setLoading(true);
//       try {
//         const agentsRef = collection(db, 'users', user.uid, 'workspaces', '1', 'agents');
//         const agentsSnapshot = await getDocs(agentsRef);

//         const agentsList = agentsSnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data(),
//           edited_at: doc.data().edited_at?.toDate() || new Date(),
//         })) as Agent[];

//         setAgents(agentsList);
//       } catch (error) {
//         console.error('Error fetching agents:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAgents();
//   }, [user]);

//   const handleCreateAgent = async () => {
//     if (!user) return;

//     setCreateLoading(true);
//     try {
//       const apiData = {
//         user_id: user.uid,
//         workspace_id: '1',
//         llm_data: {
//           prompt: '',
//         },
//         agent_data: {
//           voice: '11labs-Emily',
//           language: 'English',
//           welcomeMessageEnabled: true,
//           welcomeMessage: 'Hello',
//         }
//       };

//       const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/create-agent`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(apiData),
//       });

//       const data = await response.json();

//       if (data.success && data.agent_id) {
//         navigate(`/agents/${data.agent_id}`);
//       } else {
//         throw new Error(data.error || 'Failed to create agent');
//       }
//     } catch (error) {
//       console.error('Error creating agent:', error);
//     } finally {
//       setCreateLoading(false);
//     }
//   };

//   return (
//     <div>
//       <div className="flex justify-between items-start mb-10">
//         <div>
//           <h1 className="text-4xl font-medium mb-4">Agents</h1>
//           <p className="text-xl font-medium">
//             Let's <span className="bg-[#155EEF] text-white px-2 py-0.5 rounded">boost your business</span> effortlessly with AI agents that get the job done!
//           </p>
//         </div>
//         <button
//           onClick={handleCreateAgent}
//           disabled={createLoading}
//           className="bg-[#155EEF] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-xs disabled:opacity-50 font-medium"
//         >
//           <Plus size={16} />
//           <span>{createLoading ? 'Creating...' : 'Create an Agent'}</span>
//         </button>
//       </div>

//       {loading ? (
//         <div className="text-center py-12 text-gray-500">Loading agents...</div>
//       ) : agents.length === 0 ? (
//         <div className="flex items-center justify-center h-[50vh]">
//           <p className="text-gray-500 text-lg">No agents found</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {agents.map((agent) => (
//             <div 
//               key={agent.id}
//               className="bg-white rounded-[20px] p-6 pt-9 shadow-sm border border-[#1012141A] hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-y-6"
//               onClick={() => navigate(`/agents/${agent.id}?name=${encodeURIComponent(agent.agent_name || 'Single Prompt Agent')}`)}
//             >
//               <div className="flex items-start justify-between">
//                 <div className="flex items-center space-x-3">
//                   <img 
//                     src={agent.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.agent_name || 'Single Prompt Agent')}&background=random`}
//                     alt={agent.agent_name || 'Single Prompt Agent'}
//                     className="w-10 h-10 rounded-full"
//                   />
//                   <div>
//                     <h3 className="font-medium text-xs">{agent.agent_name || 'Single Prompt Agent'}</h3>
//                     <div className="text-[10px] text-[#646465]">
//                       Phone: {agent.phone}
//                     </div>
//                     <div className="text-[10px] text-[#646465]">
//                       Voice: {agent.voice}
//                     </div>
//                   </div>
//                 </div>
//                 <div className="relative">
//                   <button 
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       setActiveMenu(agent.id);
//                     }} 
//                     className="text-gray-400 hover:text-gray-600"
//                   >
//                     <MoreHorizontal size={20} />
//                   </button>
//                   {activeMenu === agent.id && (
//                     <div 
//                       className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200"
//                       onClick={(e) => e.stopPropagation()}
//                     >
//                       <button
//                         onClick={() => {
//                           setActiveMenu(null);
//                           navigate(`/agents/${agent.id}?name=${encodeURIComponent(agent.agent_name || 'Single Prompt Agent')}`);
//                         }}
//                         className="w-full px-3 py-2 text-left text-xs text-[#646465] hover:bg-gray-50 flex items-center gap-2"
//                       >
//                         <Pencil size={14} />
//                         Edit
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//               <div className='h-[1px] w-full bg-[#155EEF1A]'/>
//               <div className="text-[10px] text-gray-400">
//                 Edited on {agent.edited_at.toLocaleDateString()}, {agent.edited_at.toLocaleTimeString()}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }


// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Plus, MoreHorizontal, Pencil } from 'lucide-react';
// import { useAuth } from '../hooks/useAuth';
// import { collection, getDocs } from 'firebase/firestore';
// import { db } from '../lib/firebase';
// import { motion } from 'framer-motion';
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';

// interface Agent {
//   id: string;
//   agent_name?: string;
//   name: string;
//   phone: string;
//   voice: string;
//   edited_at: Date;
//   avatar?: string;
// }

// export function Agents() {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [loading, setLoading] = useState(false);
//   const [agents, setAgents] = useState<Agent[]>([]);
//   const [createLoading, setCreateLoading] = useState(false);
//   const [activeMenu, setActiveMenu] = useState<string | null>(null);

//   useEffect(() => {
//     const handleClickOutside = () => setActiveMenu(null);
//     document.addEventListener('click', handleClickOutside);
//     return () => document.removeEventListener('click', handleClickOutside);
//   }, []);

//   useEffect(() => {
//     const fetchAgents = async () => {
//       if (!user) return;
//       setLoading(true);
//       try {
//         const agentsRef = collection(db, 'users', user.uid, 'workspaces', '1', 'agents');
//         const agentsSnapshot = await getDocs(agentsRef);
//         const agentsList = agentsSnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data(),
//           edited_at: doc.data().edited_at?.toDate() || new Date(),
//         })) as Agent[];
//         setAgents(agentsList);
//       } catch (error) {
//         console.error('Error fetching agents:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAgents();
//   }, [user]);

//   const handleCreateAgent = async () => {
//     if (!user) return;
//     setCreateLoading(true);
//     try {
//       const apiData = {
//         user_id: user.uid,
//         workspace_id: '1',
//         llm_data: { prompt: '' },
//         agent_data: {
//           voice: '11labs-Emily',
//           language: 'English',
//           welcomeMessageEnabled: true,
//           welcomeMessage: 'Hello',
//         },
//       };

//       const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/create-agent`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(apiData),
//       });

//       const data = await response.json();

//       if (data.success && data.agent_id) {
//         navigate(`/agents/${data.agent_id}`);
//       } else {
//         throw new Error(data.error || 'Failed to create agent');
//       }
//     } catch (error) {
//       console.error('Error creating agent:', error);
//     } finally {
//       setCreateLoading(false);
//     }
//   };

//   return (
//     <div>
//       <div className="flex justify-between dark:dark:bg-[#141414] dark:text-white items-start mb-10">
//         <div>
//           <h1 className="text-4xl font-medium mb-4">Agents</h1>
//           <p className="text-xl font-medium">
//             Let's{' '}
//             <span className="bg-[#155EEF] text-white px-2 py-0.5 rounded">
//               boost your business
//             </span>{' '}
//             effortlessly with AI agents that get the job done!
//           </p>
//         </div>
//         <button
//           onClick={handleCreateAgent}
//           disabled={createLoading}
//           className="bg-[#155EEF] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-xs disabled:opacity-50 font-medium"
//         >
//           <Plus size={16} />
//           <span>{createLoading ? 'Creating...' : 'Create an Agent'}</span>
//         </button>
//       </div>

//       {loading ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {Array.from({ length: 6 }).map((_, i) => (
//             <div
//               key={i}
//               className="bg-white dark:bg-[#1a1a1a] rounded-[20px] p-6 pt-9 shadow-sm border border-[#1012141A] dark:border-slate-400"
//             >
//               <div className="flex items-start space-x-3 mb-4">
//                 <Skeleton circle height={40} width={40} />
//                 <div className="flex-1">
//                   <Skeleton width={100} height={10} />
//                   <Skeleton width={140} height={10} />
//                   <Skeleton width={90} height={10} />
//                 </div>
//               </div>
//               <Skeleton height={1} />
//               <Skeleton width={120} height={10} style={{ marginTop: 16 }} />
//             </div>
//           ))}
//         </div>
//       ) : agents.length === 0 ? (
//         <div className="flex items-center justify-center h-[50vh]">
//           <p className="text-gray-500 text-lg">No agents found</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {agents.map((agent, index) => (
//             <motion.div
//               key={agent.id}
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.05 }}
//               className="bg-white dark:bg-[#1a1a1a] dark:text-white rounded-[20px] p-6 pt-9 shadow-sm border border-[#1012141A] dark:border-gray-400 hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-y-6"
//               onClick={() =>
//                 navigate(`/agents/${agent.id}?name=${encodeURIComponent(agent.agent_name || 'Single Prompt Agent')}`)
//               }
//             >
//               <div className="flex items-start justify-between">
//                 <div className="flex items-center space-x-3">
//                   <img
//                     src={
//                       agent.avatar ||
//                       `https://ui-avatars.com/api/?name=${encodeURIComponent(
//                         agent.agent_name || 'Single Prompt Agent'
//                       )}&background=random`
//                     }
//                     alt={agent.agent_name || 'Single Prompt Agent'}
//                     className="w-10 h-10 rounded-full"
//                   />
//                   <div className='text-[#646465] dark:text-gray-300'>
//                     <h3 className="font-medium text-xs">{agent.agent_name || 'Single Prompt Agent'}</h3>
//                     <div className="text-[10px] text-[#646465] dark:text-gray-400">Phone: {agent.phone}</div>
//                     <div className="text-[10px] text-[#646465] dark:text-gray-400">Voice: {agent.voice}</div>
//                   </div>
//                 </div>
//                 <div className="relative">
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       setActiveMenu(agent.id);
//                     }}
//                     className="text-gray-400 hover:text-gray-600"
//                   >
//                     <MoreHorizontal size={20} />
//                   </button>
//                   {activeMenu === agent.id && (
//                     <div
//                       className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a1a1a] rounded-md shadow-lg py-1 z-10 border border-gray-200"
//                       onClick={(e) => e.stopPropagation()}
//                     >
//                       <button
//                         onClick={() => {
//                           setActiveMenu(null);
//                           navigate(`/agents/${agent.id}?name=${encodeURIComponent(agent.agent_name || 'Single Prompt Agent')}`);
//                         }}
//                         className="w-full px-3 py-2 text-left text-xs text-[#646465] dark:text-white hover:bg-gray-50 dark:bg-[#1a1a1a] flex items-center gap-2"
//                       >
//                         <Pencil size={14} />
//                         Edit
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//               <div className="h-[1px] w-full bg-[#155EEF1A]" />
//               <div className="text-[10px] text-gray-400">
//                 Edited on {agent.edited_at.toLocaleDateString()}, {agent.edited_at.toLocaleTimeString()}
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreHorizontal, Pencil } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface Agent {
  id: string;
  agent_name?: string;
  name: string;
  phone: string;
  voice: string;
  edited_at: Date;
  avatar?: string;
}

export function Agents() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [createLoading, setCreateLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchAgents = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const agentsRef = collection(db, 'users', user.uid, 'workspaces', '1', 'agents');
        const agentsSnapshot = await getDocs(agentsRef);
        const agentsList = agentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          edited_at: doc.data().edited_at?.toDate() || new Date(),
        })) as Agent[];
        setAgents(agentsList);
      } catch (error) {
        console.error('Error fetching agents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [user]);

  const handleCreateAgent = async () => {
    if (!user) return;
    setCreateLoading(true);
    try {
      const apiData = {
        user_id: user.uid,
        workspace_id: '1',
        llm_data: { prompt: '' },
        agent_data: {
          voice: '11labs-Emily',
          language: 'English',
          welcomeMessageEnabled: true,
          welcomeMessage: 'Hello',
        },
      };

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/create-agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      });

      const data = await response.json();

      if (data.success && data.agent_id) {
        navigate(`/agents/${data.agent_id}`);
      } else {
        throw new Error(data.error || 'Failed to create agent');
      }
    } catch (error) {
      console.error('Error creating agent:', error);
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="px-2 sm:px-4 py-4 max-w-screen-xl mx-auto dark:bg-[#141414] dark:text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-medium mb-2 sm:mb-4">Agents</h1>
          <p className="text-base sm:text-xl font-medium">
            Let's{' '}
            <span className="bg-[#155EEF] text-white px-2 py-0.5 rounded">boost your business</span>{' '}
            effortlessly with AI agents that get the job done!
          </p>
        </div>
        <button
          onClick={handleCreateAgent}
          disabled={createLoading}
          className="bg-[#155EEF] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm disabled:opacity-50 font-medium"
        >
          <Plus size={16} />
          <span>{createLoading ? 'Creating...' : 'Create an Agent'}</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#1a1a1a] rounded-[20px] p-6 pt-9 shadow-sm border border-[#1012141A] dark:border-slate-400"
            >
              <div className="flex items-start space-x-3 mb-4">
                <Skeleton circle height={40} width={40} />
                <div className="flex-1">
                  <Skeleton width={100} height={10} />
                  <Skeleton width={140} height={10} />
                  <Skeleton width={90} height={10} />
                </div>
              </div>
              <Skeleton height={1} />
              <Skeleton width={120} height={10} style={{ marginTop: 16 }} />
            </div>
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="flex items-center justify-center h-[50vh]">
          <p className="text-gray-500 text-lg">No agents found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-[#1a1a1a] dark:text-white rounded-[20px] p-6 pt-9 shadow-sm border border-[#1012141A] dark:border-gray-400 hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-y-6"
              onClick={() => navigate(`/agents/${agent.id}?name=${encodeURIComponent(agent.agent_name || 'Single Prompt Agent')}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={agent.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.agent_name || 'Single Prompt Agent')}&background=random`}
                    alt={agent.agent_name || 'Single Prompt Agent'}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className='text-[#646465] dark:text-gray-300'>
                    <h3 className="font-medium text-xs">{agent.agent_name || 'Single Prompt Agent'}</h3>
                    <div className="text-[10px] text-[#646465] dark:text-gray-400">Phone: {agent.phone}</div>
                    <div className="text-[10px] text-[#646465] dark:text-gray-400">Voice: {agent.voice}</div>
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenu(agent.id);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MoreHorizontal size={20} />
                  </button>
                  {activeMenu === agent.id && (
                    <div
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a1a1a] rounded-md shadow-lg py-1 z-10 border border-gray-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          setActiveMenu(null);
                          navigate(`/agents/${agent.id}?name=${encodeURIComponent(agent.agent_name || 'Single Prompt Agent')}`);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-[#646465] dark:text-white hover:bg-gray-50 dark:bg-[#1a1a1a] flex items-center gap-2"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="h-[1px] w-full bg-[#155EEF1A]" />
              <div className="text-[10px] text-gray-400">
                Edited on {agent.edited_at.toLocaleDateString()}, {agent.edited_at.toLocaleTimeString()}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
