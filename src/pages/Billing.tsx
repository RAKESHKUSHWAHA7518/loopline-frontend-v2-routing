// import { Download } from "lucide-react";
// import { useEffect, useState } from "react";
// import { useAuth } from "../hooks/useAuth";
// import {
//   fetchCustomerInvoices,
//   getCustomerId,
//   setupMonthlyPlanPayment,
//   getSubscriptions,
//   checkPaymentMethodSetup,
//   setupPaymentMethod,
//   createUserInFirebase,
// } from "../lib/customer";
// import React from "react";
// import { Plus } from "lucide-react";
// import { plans } from "../lib/plans";
// import RippleLoader from "../components/RippleLoader";
// import { motion } from "framer-motion";

// const PaymentMethodButton: React.FC<
//   React.ButtonHTMLAttributes<HTMLButtonElement>
// > = ({ children, ...props }) => <button {...props}>{children}</button>;

// export function Billing() {
//   const { user } = useAuth();
//   const [loading, setLoading] = useState(true);
//   const [customerId, setCustomerId] = useState<string>("");
//   const [pastInvoices, setPastInvoices] = useState<any[]>([]);
//   const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
//   const [currentPlan, setCurrentPlan] = useState<any>(null);
//   const [hasPaymentMethod, setHasPaymentMethod] = useState(false); //Added state
//   const [isLoadingPaymentMethod, setIsLoadingPaymentMethod] = useState(false);
//   const [paymentMethodError, setPaymentMethodError] = useState<string | null>(
//     null,
//   );
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const initializeCustomer = async () => {
//       if (!user) return;
//       try {
//         let id = await getCustomerId(user.uid);
//         if(!id){
//           id = await createUserInFirebase(user.email ?? "", user.uid);
//         }
//         if (id) {
//           setCustomerId(id);
//           const [invoices, subscriptionData, paymentMethodStatus] =
//             await Promise.all([
//               fetchCustomerInvoices(id),
//               getSubscriptions(id),
//               checkPaymentMethodSetup(id), //Added call
//             ]);
//           setPastInvoices(invoices);
//           setHasPaymentMethod(paymentMethodStatus?.hasDynamicSetup);
//           if (subscriptionData?.isActive) {
//             const details = subscriptionData;
//             setCurrentPlan({
//               name: details.planName,
//               price: `$${details.amount}`,
//               status: "active",
//               validUntil: new Date(details.currentPeriodEnd * 1000),
//             });
//           }
//         }
//       } catch (error) {
//         console.error("Error initializing customer:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     initializeCustomer();
//   }, [user]);

//   const handlePlanSelect = (productId: string) => {
//     setSelectedPlan(productId);
//     setError("");
//   };

//   const handleMakePayment = async () => {
//     if (!selectedPlan) {
//       setError("Please select a plan to continue");
//       return;
//     }

//     if (!user || !customerId) {
//       setError("Something went wrong. Please try again.");
//       return;
//     }

//     setError("");
//     setIsProcessing(true);

//     try {
//       await setupMonthlyPlanPayment(
//         user.uid,
//         selectedPlan,
//         customerId,
//         user.email || "",
//       );
//     } catch (error) {
//       console.error("Error setting up payment:", error);
//       setError("Failed to setup payment. Please try again.");
//       setLoading(false);
//     }
//   };

//   const handleSetupPaymentMethod = async () => {
//     if (!user || !user.email) {
//       console.error("User not found");
//       return;
//     }

//     if (!customerId) {
//       console.error("Customer ID not found");
//       return;
//     }

//     setIsLoadingPaymentMethod(true);
//     setPaymentMethodError(null);

//     try {
//       await setupPaymentMethod(user.uid, user.email, customerId);
//     } catch (error) {
//       console.error("Error setting up payment method:", error);
//       setPaymentMethodError(
//         error instanceof Error ? error.message : "An unexpected error occurred",
//       );
//     } finally {
//       setIsLoadingPaymentMethod(false);
//     }
//   };

//   //  const RippleLoader = () => (
//   //   <div className="flex items-center justify-center">
//   //     <div className="relative w-12 h-12">
//   //       <div className="absolute inset-0 border-4 border-blue-500 rounded-full animate-ping"></div>
//   //       <div className="absolute inset-2 border-4 border-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
//   //       <div className="absolute inset-4 border-4 border-blue-300 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
//   //     </div>
//   //   </div>
//   // );

//    const ShimmerRow = () => (
//   <tr className="animate-pulse">
//     {[...Array(4)].map((_, i) => (
//       <td key={i} className="px-6 py-4">
//         <div className="h-4 bg-gray-200 rounded w-3/4"></div>
//       </td>
//     ))}
//   </tr>
// );


//   return (
//     <div>
//       {/* <div className="flex justify-between bg-white dark:bg-[#141414] dark:border-white dark:text-white items-start mb-10">
//         <h1 className="text-4xl font-medium mb-4">Billing</h1> */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-[#141414] dark:border-white dark:text-white mb-10 gap-4">
//   <h1 className="text-3xl sm:text-4xl font-medium">Billing</h1>

//         {hasPaymentMethod ? (
//           <button className="bg-green-50 text-green-700 px-4 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium">
//             <span>✓ Payment method added</span>
//           </button>
//         ) : (
//           <PaymentMethodButton
//             className="bg-[#155EEF] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-xs disabled:opacity-50 font-medium"
//             onClick={!loading ? handleSetupPaymentMethod : undefined}
//             disabled={loading || isLoadingPaymentMethod}
//           >
//             {loading || isLoadingPaymentMethod ? (
//               <div className="flex justify-center items-center">
//                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//               </div>
//             ) : (
//               <>
//                 <Plus size={16} />
//                 Add a payment method
//               </>
//             )}
//           </PaymentMethodButton>
//         )}
//       </div>
//       {/* Plan Selection */}
//       {loading ? (
//         // <div className="mb-8">
//         //   <div className="flex justify-center items-center h-48">
//         //     {/* <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div> */}
//         //     <RippleLoader/>
//         //   </div>
//         // </div>
//         <div className="grid grid-cols-3 gap-5 pb-4">
//     {[1, 2, 3].map((_, idx) => (
//       <div
//         key={idx}
//         className="animate-pulse bg-slate-200 dark:bg-[#252525] rounded-3xl h-48 w-full"
//       ></div>
//     ))}
//   </div>
//       ) : !currentPlan ? (
//       <div className="flex flex-col gap-4">
//         {error || paymentMethodError && (
//           <div className="bg-red-50 dark:bg-[#252525] text-red-600 p-2 rounded-md text-xs">
//             {error || paymentMethodError}
//           </div>
//         )}
//         <div className="grid lg:grid-cols-3 sm:grid-cols-1 md:grid-cols-2 gap-5">
//           {plans.map((plan, idx) => {
//             const isSelected = selectedPlan === plan.productId;
//             const isEven = idx % 2 === 0;

//             return (
//                <motion.div
//             key={plan.name}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             whileHover={{ scale: 1.03 }}
//             transition={{ duration: 0.3 }}>
              
//               <div
//                 key={plan.name}
//                 className={`px-8 py-6 rounded-3xl flex flex-col gap-4  bg-white dark:bg-[#141414] dark:border-white dark:text-white  cursor-pointer transition-all border hover:border-blue-400 ${
//                   isSelected ? "shadow-xl" : "hover:shadow-md"
//                 }`}
//                 style={{
//                   backgroundColor: isEven ? "#155EEF" : "#101214",
//                   opacity: isSelected ? 1 : 0.4,
//                 }}
//                 onClick={() => handlePlanSelect(plan.productId)}
//               >
//                 <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
//                 <hr className="border-white" style={{ borderWidth: "1px" }} />
//                 <div className="flex flex-col gap-2">
//                   <p className="text-sm font-bold text-white">Price</p>
//                   <div className="text-4xl font-bold flex gap-1 items-end text-white">
//                     ${plan.price}
//                     <span className="text-sm font-normal mb-1 text-white">
//                       /
//                     </span>
//                     <span className="text-sm font-normal mb-1 text-white">
//                       month
//                     </span>
//                   </div>
//                 </div>
//               </div>
// </motion.div>
//             );
//           })}
//         </div>

//         <div className="relative w-full flex justify-center px-16 mb-8">

//           <motion.button
//   whileTap={{ scale: 0.95 }}
//   whileHover={{ scale: 1.02 }}
//   onClick={handleMakePayment}
//   disabled={!selectedPlan || isProcessing}
//   className="flex-1 bg-[#155EEF] text-white py-2 px-4 max-w-80 mx-auto rounded-md hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
// >
//   {isProcessing ? "Processing..." : "Complete Billing"}
// </motion.button>

//           {/* <button
//             type="button"
//             onClick={handleMakePayment}
//             disabled={!selectedPlan || isProcessing}
//             className="flex-1 bg-[#155EEF] text-white py-2 px-4 max-w-80 mx-auto rounded-md hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {loading ? "Processing..." : "Complete Billing"}
//           </button> */}
          
          
//         </div>
//       </div>
//       ) : (
//         <div className="mb-8    ">
//           <h2 className="text-2xl font-semibold mb-6 dark:text-white">Current Plan</h2>
//           {/* <div className="p-6 rounded-lg border border-blue-500 bg-blue-50"> */}
//             <motion.div
//   initial={{ opacity: 0, y: 10 }}
//   animate={{ opacity: 1, y: 0 }}
//     whileHover={{ scale: 1.02 }}
//   transition={{ duration: 0.4 }}
//   className="p-6 rounded-lg border  dark:bg-[#141414] dark:border-white dark:text-white border-blue-500 bg-blue-50"
// >
//   <div className="flex justify-between items-center">
//     <div>
//       <h3 className="text-xl font-medium">{currentPlan.name}</h3>
//       <p className="text-gray-600">
//         Valid until: {currentPlan.validUntil.toLocaleDateString()}
//       </p>
//       <p className="text-green-600 mt-2">
//         Status: {currentPlan.status}
//       </p>
//     </div>
//     <div className="text-3xl font-bold">
//       {currentPlan.price}
//       <span className="text-sm font-normal text-gray-600">/month</span>
//     </div>
//   </div>
// </motion.div>

//             {/* <div className="flex justify-between items-center">
//               <div>
//                 <h3 className="text-xl font-medium">{currentPlan.name}</h3>
//                 <p className="text-gray-600">
//                   Valid until: {currentPlan.validUntil.toLocaleDateString()}
//                 </p>
//                 <p className="text-green-600 mt-2">
//                   Status: {currentPlan.status}
//                 </p>
//               </div>
//               <div className="text-3xl font-bold">
//                 {currentPlan.price}
//                 <span className="text-sm font-normal text-gray-600">
//                   /month
//                 </span>
//               </div>
//             </div> */}
//           {/* </div> */}
//         </div>
//       )}

//       {/* Invoice history section */}
//       <div className="bg-white  dark:bg-[#252525] dark:text-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
//         <div className="px-6 py-4 border-b border-gray-200">
//           <h2 className="text-lg font-medium">Invoice History</h2>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 dark:bg-[#252525] text-left">
//               <tr>
//                 <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
//                   Invoice
//                 </th>
//                 <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
//                   Amount
//                 </th>
//                 <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
//                   Date
//                 </th>
//                 <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider"></th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {loading ? (
//                 // <tr>
//                 //   <td colSpan={5} className="px-6 py-4 text-center">
//                 //     <div className="flex justify-center">
//                 //       {/* <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div> */}
//                 //    {/* <RippleLoader/> */}
//                 //     </div>
//                 //   </td>
//                 // </tr>
//   //                <tr>
//   //   <td colSpan={5} className="px-6 py-4">
//   //     <div className="flex flex-col space-y-2">
//   //       {[...Array(3)].map((_, i) => (
//   //         <div key={i} className="animate-pulse flex justify-between px-4 py-2 bg-slate-200 rounded-md h-10" />
//   //       ))}
//   //     </div>
//   //   </td>
//   // </tr>
//   <>
//     {[...Array(6)].map((_, idx) => (
//               <ShimmerRow key={idx} />
//             ))}
//             </>
//               ) : pastInvoices.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan={5}
//                     className="px-6 py-4 text-center text-gray-500 dark:text-white"
//                   >
//                     No invoices found
//                   </td>
//                 </tr>
//               ) : (
//                 pastInvoices.map((invoice) => (
//                   <tr key={invoice.id}>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       {new Date(invoice.period_end * 1000).toLocaleString(
//                         "default",
//                         { month: "long", year: "numeric" },
//                       )}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       ${(invoice.amount_paid / 100).toFixed(2)}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       {new Date(invoice.created * 1000).toLocaleDateString()}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span
//                         className={`px-2 py-1 text-xs rounded-full ${
//                           invoice.status === "paid"
//                             ? "bg-green-100 text-green-800"
//                             : invoice.status === "open"
//                               ? "bg-yellow-100 text-yellow-800"
//                               : "bg-red-100 text-red-800"
//                         }`}
//                       >
//                         {invoice.status.charAt(0).toUpperCase() +
//                           invoice.status.slice(1)}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-right">
//                       <a
//                         href={invoice.hosted_invoice_url}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
//                       >
//                         <Download className="h-4 w-4 mr-1" />
//                         Download
//                       </a>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
  
//   );
// }

import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  fetchCustomerInvoices,
  getCustomerId,
  setupMonthlyPlanPayment,
  getSubscriptions,
  checkPaymentMethodSetup,
  setupPaymentMethod,
  createUserInFirebase,
} from "../lib/customer";
import React from "react";
import { Plus } from "lucide-react";
import { plans } from "../lib/plans";
import RippleLoader from "../components/RippleLoader";
import { motion } from "framer-motion";

const PaymentMethodButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, ...props }) => <button {...props}>{children}</button>;

export function Billing() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState<string>("");
  const [pastInvoices, setPastInvoices] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false);
  const [isLoadingPaymentMethod, setIsLoadingPaymentMethod] = useState(false);
  const [paymentMethodError, setPaymentMethodError] = useState<string | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeCustomer = async () => {
      if (!user) return;
      try {
        let id = await getCustomerId(user.uid);
        if(!id){
          id = await createUserInFirebase(user.email ?? "", user.uid);
        }
        if (id) {
          setCustomerId(id);
          const [invoices, subscriptionData, paymentMethodStatus] =
            await Promise.all([
              fetchCustomerInvoices(id),
              getSubscriptions(id),
              checkPaymentMethodSetup(id),
            ]);
          setPastInvoices(invoices);
          setHasPaymentMethod(paymentMethodStatus?.hasDynamicSetup);
          if (subscriptionData?.isActive) {
            const details = subscriptionData;
            setCurrentPlan({
              name: details.planName,
              price: `$${details.amount}`,
              status: "active",
              validUntil: new Date(details.currentPeriodEnd * 1000),
            });
          }
        }
      } catch (error) {
        console.error("Error initializing customer:", error);
      } finally {
        setLoading(false);
      }
    };
    initializeCustomer();
  }, [user]);

  const handlePlanSelect = (productId: string) => {
    setSelectedPlan(productId);
    setError("");
  };

  const handleMakePayment = async () => {
    if (!selectedPlan) {
      setError("Please select a plan to continue");
      return;
    }

    if (!user || !customerId) {
      setError("Something went wrong. Please try again.");
      return;
    }

    setError("");
    setIsProcessing(true);

    try {
      await setupMonthlyPlanPayment(
        user.uid,
        selectedPlan,
        customerId,
        user.email || "",
      );
    } catch (error) {
      console.error("Error setting up payment:", error);
      setError("Failed to setup payment. Please try again.");
      setLoading(false);
    }
  };

  const handleSetupPaymentMethod = async () => {
    if (!user || !user.email) {
      console.error("User not found");
      return;
    }

    if (!customerId) {
      console.error("Customer ID not found");
      return;
    }

    setIsLoadingPaymentMethod(true);
    setPaymentMethodError(null);

    try {
      await setupPaymentMethod(user.uid, user.email, customerId);
    } catch (error) {
      console.error("Error setting up payment method:", error);
      setPaymentMethodError(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setIsLoadingPaymentMethod(false);
    }
  };

  const ShimmerRow = () => (
    <tr className="animate-pulse">
      {[...Array(4)].map((_, i) => (
        <td key={i} className="px-3 sm:px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </td>
      ))}
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0a0a0a] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-[#141414] dark:border-gray-700 dark:text-white mb-6 sm:mb-8 lg:mb-10 gap-4 p-4 sm:p-6 rounded-lg shadow-sm border">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium">Billing</h1>

          {hasPaymentMethod ? (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium">
              <span>✓ Payment method added</span>
            </div>
          ) : (
            <PaymentMethodButton
              className="bg-[#155EEF] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-xs sm:text-sm disabled:opacity-50 font-medium w-full sm:w-auto justify-center"
              onClick={!loading ? handleSetupPaymentMethod : undefined}
              disabled={loading || isLoadingPaymentMethod}
            >
              {loading || isLoadingPaymentMethod ? (
                <div className="flex justify-center items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  <Plus size={16} />
                  <span className="hidden sm:inline">Add a payment method</span>
                  <span className="sm:hidden">Add payment</span>
                </>
              )}
            </PaymentMethodButton>
          )}
        </div>

        {/* Plan Selection */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 pb-4 mb-6 sm:mb-8">
            {[1, 2, 3].map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse bg-slate-200 dark:bg-[#252525] rounded-3xl h-48 sm:h-56 w-full"
              ></div>
            ))}
          </div>
        ) : !currentPlan ? (
          <div className="flex flex-col gap-4 sm:gap-6">
            {(error || paymentMethodError) && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 sm:p-4 rounded-md text-sm">
                {error || paymentMethodError}
              </div>
            )}
            
            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              {plans.map((plan, idx) => {
                const isSelected = selectedPlan === plan.productId;
                const isEven = idx % 2 === 0;

                return (
                  <motion.div
                    key={plan.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                  >
                    <div
                      className={`px-4 sm:px-6 lg:px-8 py-4 sm:py-6 rounded-2xl sm:rounded-3xl flex flex-col gap-3 sm:gap-4 cursor-pointer transition-all border hover:border-blue-400 ${
                        isSelected ? "shadow-xl" : "hover:shadow-md"
                      }`}
                      style={{
                        backgroundColor: isEven ? "#155EEF" : "#101214",
                        opacity: isSelected ? 1 : 0.4,
                      }}
                      onClick={() => handlePlanSelect(plan.productId)}
                    >
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{plan.name}</h3>
                      <hr className="border-white" style={{ borderWidth: "1px" }} />
                      <div className="flex flex-col gap-2">
                        <p className="text-xs sm:text-sm font-bold text-white">Price</p>
                        <div className="text-2xl sm:text-3xl lg:text-4xl font-bold flex gap-1 items-end text-white">
                          ${plan.price}
                          <span className="text-xs sm:text-sm font-normal mb-1 text-white">/</span>
                          <span className="text-xs sm:text-sm font-normal mb-1 text-white">month</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Payment Button */}
            <div className="w-full flex justify-center px-4 sm:px-16 mb-6 sm:mb-8">
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                onClick={handleMakePayment}
                disabled={!selectedPlan || isProcessing}
                className="w-full sm:w-auto sm:max-w-80 bg-[#155EEF] text-white py-3 sm:py-2 px-6 sm:px-4 rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isProcessing ? "Processing..." : "Complete Billing"}
              </motion.button>
            </div>
          </div>
        ) : (
          /* Current Plan Section */
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 dark:text-white px-2">Current Plan</h2>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.4 }}
              className="p-4 sm:p-6 rounded-lg border dark:bg-[#141414] dark:border-gray-700 dark:text-white border-blue-500 bg-blue-50"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-medium">{currentPlan.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    Valid until: {currentPlan.validUntil.toLocaleDateString()}
                  </p>
                  <p className="text-green-600 dark:text-green-400 mt-2 text-sm sm:text-base">
                    Status: {currentPlan.status}
                  </p>
                </div>
                <div className="text-2xl sm:text-3xl font-bold">
                  {currentPlan.price}
                  <span className="text-sm font-normal text-gray-600 dark:text-gray-400">/month</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Invoice History Section */}
        <div className="bg-white dark:bg-[#141414] dark:text-white rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium">Invoice History</h2>
          </div>

          {/* Mobile View - Cards */}
          <div className="block sm:hidden">
            {loading ? (
              <div className="p-4 space-y-4">
                {[...Array(3)].map((_, idx) => (
                  <div key={idx} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-24"></div>
                ))}
              </div>
            ) : pastInvoices.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No invoices found
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {pastInvoices.map((invoice) => (
                  <div key={invoice.id} className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">
                          {new Date(invoice.period_end * 1000).toLocaleString(
                            "default",
                            { month: "long", year: "numeric" },
                          )}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(invoice.created * 1000).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">
                          ${(invoice.amount_paid / 100).toFixed(2)}
                        </p>
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                            invoice.status === "paid"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                              : invoice.status === "open"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                          }`}
                        >
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <a
                        href={invoice.hosted_invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center text-sm"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download Invoice
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop/Tablet View - Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#252525] text-left">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <>
                    {[...Array(6)].map((_, idx) => (
                      <ShimmerRow key={idx} />
                    ))}
                  </>
                ) : pastInvoices.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                    >
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  pastInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(invoice.period_end * 1000).toLocaleString(
                          "default",
                          { month: "long", year: "numeric" },
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        ${(invoice.amount_paid / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(invoice.created * 1000).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            invoice.status === "paid"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                              : invoice.status === "open"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                          }`}
                        >
                          {invoice.status.charAt(0).toUpperCase() +
                            invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <a
                          href={invoice.hosted_invoice_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center text-sm justify-end"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}