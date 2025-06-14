import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Save, Plus, Trash2 } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import RippleLoader from '../components/RippleLoader';
import { motion } from 'framer-motion';


interface Agent {
  agent_id: string;
  agent_name?: string;
  routing?: {
    calendar_id: string;
    address: string;
    zipcode: string;
  };
}

interface FormData {
  ghl_private_key: string;
  location_id: string;
  agents: Array<{
    agent_id: string;
    agent_name: string;
    calendar_id: string;
    address: string;
    zipcode: string;
  }>;
}

export function Routing() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      ghl_private_key: '',
      location_id: '',
      agents: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'agents',
  });

  useEffect(() => {
    fetchAgents();
  }, [user]);

  const fetchAgents = async () => {
    if (!user) return;

    try {
      const workspaceRef = doc(db, 'users', user.uid, 'workspaces', '1');
      const workspaceDoc = await getDoc(workspaceRef);

      if (workspaceDoc.exists()) {
        const data = workspaceDoc.data();
        reset({
          ghl_private_key: data.private_key || '',
          location_id: data.location_id || '',
          agents: data.routing_agents?.map((agent: any) => ({
            agent_id: `existing-${Date.now()}`,
            agent_name: `Agent ${Date.now()}`,
            calendar_id: agent.calendar_id || '',
            address: agent.address || '',
            zipcode: agent.zipcode || ''
          })) || []
        });
      } else {
        reset({
          ghl_private_key: '',
          location_id: '',
          agents: []
        });
      }
    } catch (error) {
      console.error('Error fetching workspace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      if (!user) throw new Error('No user authenticated');

      const workspaceRef = doc(db, 'users', user.uid, 'workspaces', '1');

      // Transform the data to match the required structure
      const routing_agents = data.agents.map(agent => ({
        calendar_id: agent.calendar_id,
        address: agent.address,
        zipcode: agent.zipcode
      }));

      await setDoc(workspaceRef, {
        private_key: data.ghl_private_key,
        location_id: data.location_id,
        routing_agents
      }, { merge: true });

      setSaving(false);
    } catch (error) {
      console.error('Error saving routing settings:', error);
      setSaving(false);
    }
  }

  const handleAddAgent = () => {
    append({
      agent_id: `new-${Date.now()}`,
      agent_name: `Agent ${fields.length + 1}`,
      calendar_id: '',
      address: '',
      zipcode: '',
    });
  };

   const ShimmerBlock=() =>{
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/2" />
      <div className="h-10 bg-gray-200 rounded" />
      <div className="h-10 bg-gray-200 rounded" />
    </div>
  );
}

  // if (loading) {
  //   return <div className="p-6   h-screen flex items-center justify-center"><RippleLoader/> </div>;
  // }

  if (loading) {
  return (
    <div className="p-6 h-screen flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <div className="bg-white p-6 rounded-lg shadow">
          <ShimmerBlock />
          <div className="mt-8 space-y-6">
            {[1, 2].map((_, i) => (
              <div key={i} className="bg-gray-100 p-4 rounded-md animate-pulse">
                <div className="h-4 w-1/3 bg-gray-300 rounded mb-2" />
                <div className="h-10 bg-gray-300 rounded mb-2" />
                <div className="h-10 bg-gray-300 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


  return (
    <div className="max-w-4xl bg-white dark:bg-[#141414] dark:border-white dark:text-white mx-auto py-6 px-4">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Routing Settings</h1>
          {/* <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save changes'}</span>
          </button> */}
          <motion.button
  className=" "
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02 }}
  transition={{ duration: 0.4, ease: 'easeOut' }}
>
          <button
  type="submit"
  disabled={saving}
  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
>
  {saving ? (
    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  ) : (
    <Save size={16} />
  )}
  <span>{saving ? 'Saving...' : 'Save changes'}</span>
</button>
</motion.button>

        </div>

        {/* Global Settings */}
        <div className="bg-white dark:bg-[#252525] text-black dark:text-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">Global Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                GHL Private Key
              </label>
              <input
                type="password"
                {...register('ghl_private_key', { required: 'GHL Private Key is required' })}
                className={`w-full px-3 py-2 border bg-white dark:bg-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.ghl_private_key ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your GHL private key"
              />
              {errors.ghl_private_key && (
                <p className="mt-1 text-sm text-red-600">{errors.ghl_private_key.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                Location ID
              </label>
              <input
                type="text"
                {...register('location_id', { required: 'Location ID is required' })}
                className={`w-full px-3 py-2 bg-white dark:bg-black border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.location_id ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter location ID"
              />
              {errors.location_id && (
                <p className="mt-1 text-sm text-red-600">{errors.location_id.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Agent Settings */}
        <div className="bg-white dark:bg-[#252525] rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Agent Settings</h2>
            <button
              type="button"
              onClick={handleAddAgent}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
            >
              <Plus size={16} />
              <span>Add Agent</span>
            </button>
          </div>

          <div className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                <div className="flex items-center justify-between mb-4">
                  <input
                    type="text"
                    {...register(`agents.${index}.agent_name` as const, {
                      required: 'Agent name is required',
                    })}
                    className={`text-lg bg-white dark:bg-black font-medium bg-transparent border-b-2 focus:outline-none focus:border-blue-500 ${
                      errors.agents?.[index]?.agent_name ? 'border-red-500' : 'border-transparent'
                    }`}
                    placeholder="Enter agent name"
                  />
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-gray-400 dark:text-white hover:text-gray-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                      Calendar ID
                    </label>
                    <input
                      type="text"
                      {...register(`agents.${index}.calendar_id` as const, {
                        required: 'Calendar ID is required',
                      })}
                      className={`w-full px-3 py-2 border bg-white dark:bg-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.agents?.[index]?.calendar_id ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter calendar ID"
                    />
                    {errors.agents?.[index]?.calendar_id && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.agents?.[index]?.calendar_id?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      {...register(`agents.${index}.address` as const, {
                        required: 'Address is required',
                      })}
                      className={`w-full px-3 py-2 border bg-white dark:bg-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.agents?.[index]?.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter address"
                    />
                    {errors.agents?.[index]?.address && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.agents?.[index]?.address?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                      Zipcode
                    </label>
                    <input
                      type="text"
                      {...register(`agents.${index}.zipcode` as const, {
                        required: 'Zipcode is required',
                      })}
                      className={`w-full px-3 py-2 border bg-white dark:bg-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.agents?.[index]?.zipcode ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter zipcode"
                    />
                    {errors.agents?.[index]?.zipcode && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.agents?.[index]?.zipcode?.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {fields.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-white">
                No agents added. Click "Add Agent" to get started.
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}