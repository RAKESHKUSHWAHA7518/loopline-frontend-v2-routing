// import { useState, useEffect } from "react";
// import { Star, Mic2, Zap, Brain, Phone, Mic } from "lucide-react";

// export function LandingPage({ onOpenLogin }: { onOpenLogin: () => void }) {
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

//   useEffect(() => {
//     const handleMouseMove = (e: MouseEvent) => {
//       setMousePosition({ x: e.clientX, y: e.clientY });
//     };

//     window.addEventListener("mousemove", handleMouseMove);
//     return () => window.removeEventListener("mousemove", handleMouseMove);
//   }, []);

//   return (
//     <div className="min-h-screen bg-black text-white relative overflow-hidden">
//       {/* Mouse highlight effect */}
//       <div
//         className="pointer-events-none fixed inset-0 z-1"
//         style={{
//           background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(29, 78, 216, 0.15), transparent 80%)`,
//         }}
//       />

//       {/* Navigation */}
//       <nav className="absolute top-0 left-0 w-full z-[1]">
//         <div className="w-full mx-auto sm:px-6 lg:px-14 py-8 flex justify-between items-center">
//           <div className="flex items-center">
//             <Mic2 className="h-8 w-8 text-blue-500" />
//             <span className="ml-2 text-xl font-bold">Digital Assistant</span>
//           </div>
//           <div className="flex items-center space-x-8">
//             <a
//               href="#features"
//               className="text-gray-300 hover:text-white transition-colors"
//             >
//               Features
//             </a>
//             <a
//               href="#how-it-works"
//               className="text-gray-300 hover:text-white transition-colors"
//             >
//               How it works
//             </a>
//           </div>
//           <button
//             onClick={onOpenLogin}
//             className="bg-[#155EEF] text-white px-8 py-2.5 rounded-[10px] hover:bg-blue-700 transition-colors text-sm"
//           >
//             Get started
//           </button>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <div className="relative pb-20 sm:pt-40 lg:pt-30 sm:pb-24">
//         <div className="flex flex-col gap-6 items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//           {/* Rating */}
//           <div className="flex items-center justify-center space-x-1">
//             {[...Array(5)].map((_, i) => (
//               <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
//             ))}
//             <span className="pl-2 text-gray-400 text-sm">
//               4.8/5 based on 6,381 reviews
//             </span>
//           </div>

//           {/* Main heading */}
//           <h1 className="sm:text-[56px] font-bold mb-0">
//             Digital Assistant:
//             <br />
//             AI for Instant Support
//           </h1>

//           {/* Subtitle */}
//           <p className="text-gray-400 text-md max-w-2xl mx-auto">
//             Create intelligent voice agents that handle customer support,
//             appointments, and sales calls 24/7. Boost efficiency and reduce
//             costs with AI-powered conversations.
//           </p>

//           {/* Microphone Icon with Glow */}
//           <div className="relative w-full">
//             <div className="absolute inset-0 bg-blue-600 rounded-full blur-3xl opacity-20" />
//             <div
//               className="w-48 h-48 rounded-full flex items-center justify-center mx-auto"
//               style={{
//                 background:
//                   "radial-gradient(50% 50% at 50% 50%, #155EEF 0%, #326CDD 78%, rgba(50, 108, 221, 0) 100%)",
//               }}
//             >
//               <Mic className="text-white" size={40} />
//             </div>
//           </div>

//           {/* CTA Button */}
//           <button
//             onClick={onOpenLogin}
//             className="bg-[#155EEF] text-white px-8 py-2.5 rounded-[10px] hover:bg-blue-700 transition-colors text-sm"
//           >
//             Get started
//           </button>
//         </div>
//       </div>

//       {/* Features Section */}
//       <div id="features" className="py-20 bg-black/50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             <div className="p-6 rounded-lg border border-gray-800 hover:border-blue-500 transition-colors">
//               <Zap className="w-12 h-12 text-blue-500 mb-4" />
//               <h3 className="text-xl font-bold mb-2">Instant Response</h3>
//               <p className="text-gray-400">
//                 24/7 availability with zero wait times. Your customers get
//                 immediate assistance whenever they need it.
//               </p>
//             </div>
//             <div className="p-6 rounded-lg border border-gray-800 hover:border-blue-500 transition-colors">
//               <Brain className="w-12 h-12 text-blue-500 mb-4" />
//               <h3 className="text-xl font-bold mb-2">AI-Powered</h3>
//               <p className="text-gray-400">
//                 Advanced natural language processing ensures human-like
//                 conversations and accurate responses.
//               </p>
//             </div>
//             <div className="p-6 rounded-lg border border-gray-800 hover:border-blue-500 transition-colors">
//               <Phone className="w-12 h-12 text-blue-500 mb-4" />
//               <h3 className="text-xl font-bold mb-2">Multi-Channel</h3>
//               <p className="text-gray-400">
//                 Deploy your digital assistant across voice, chat, and messaging
//                 platforms seamlessly.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from "react";
import { Star, Mic2, Zap, Brain, Phone, Mic } from "lucide-react";
import looplineLogo from '../assets/icons/logo.png';

export function LandingPage({ onOpenLogin }: { onOpenLogin: () => void }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Mouse highlight effect */}
      <div
        className="pointer-events-none fixed inset-0 z-1"
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(29, 78, 216, 0.15), transparent 80%)`,
        }}
      />

      {/* Navigation */}

       <nav className="absolute top-0 left-0 w-full z-[2] ">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-14 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
    
 
    <div className="flex justify-center  sm:justify-start">
      <img
        src={looplineLogo} // Replace with actual path or import
        alt="Loopline Logo"
        className="lg:h-16 h-12 w-auto"
      />
    </div>

   <div className="flex flex-row items-center justify-center sm:justify-end gap-2 sm:gap-6 text-sm flex-wrap">
  <a href="#features" className="text-gray-300 hover:text-white transition">
    Features
  </a>
  <a href="#how-it-works" className="text-gray-300 hover:text-white transition">
    How it works
  </a>
  <button
    onClick={onOpenLogin}
    className="bg-[#155EEF] text-white px-6 py-2 rounded-md hover:bg-blue-700 transition text-sm"
  >
    Get started
  </button>
</div>

    {/* <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-4 sm:gap-6 text-sm">
      <div className="flex gap-6">
        <a href="#features" className="text-gray-300 hover:text-white transition">Features</a>
        <a href="#how-it-works" className="text-gray-300 hover:text-white transition">How it works</a>
      </div>
      <button
        onClick={onOpenLogin}
        className="bg-[#155EEF] text-white px-6 py-2 rounded-md hover:bg-blue-700 transition text-sm"
      >
        Get started
      </button>
    </div> */}
  </div>
</nav>  

      



     {/* Hero Section */}
  <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 lg:pt-32 lg:pb-24  ">
   {/* <div className="relative  pb-20 sm:pt-40 lg:pt-30 sm:pb-24"> */}
  <div className="flex flex-col items-center gap-6 text-center px-4 sm:px-6 max-w-4xl mx-auto">
  
    <div className="flex items-center justify-center space-x-1 py-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
      ))}
      <span className="pl-2 text-gray-400 text-sm">
        4.8/5 based on 6,381 reviews
      </span>
    </div>

    
    <h1 className="text-3xl sm:text-4xl lg:text-5xl lg:text-nowrap font-bold leading-tight">
      {/* Digital Assistant: */}
      Automate Growth,  
      {/* <br className="hidden sm:block" /> */}
      {/* AI for Instant Support */}
        Empower Your Day
    </h1>

    
    <p className="text-gray-400 text-base sm:text-lg max-w-2xl">
      Create intelligent voice agents that handle customer support,
      appointments, and sales calls 24/7. Boost efficiency and reduce
      costs with AI-powered conversations.
    </p>

    
    <div className="relative w-full flex justify-center">
      <div className="absolute inset-0 w-48 h-48 mx-auto bg-blue-600 rounded-full blur-3xl opacity-20" />
      <div
        className="w-48 h-48 rounded-full flex items-center justify-center"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, #155EEF 0%, #326CDD 78%, rgba(50, 108, 221, 0) 100%)",
        }}
      >
        <Mic className="text-white" size={40} />
      </div>
    </div>

    
    <button
      onClick={onOpenLogin}
      className="bg-[#155EEF] text-white px-6 py-2.5 rounded-md hover:bg-blue-700 transition-colors text-sm mt-4"
    >
      Get started
    </button>
  </div>
</div> 

      {/* Hero Section */}
       {/* <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-28   lg:pt-32 lg:pb-24">
        <div className="flex flex-col items-center gap-6 text-center px-4 sm:px-6 max-w-4xl mx-auto">
         
          <div className="flex items-center justify-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
            ))}
            <span className="pl-2 text-gray-400 text-sm">
              4.8/5 based on 6,381 reviews
            </span>
          </div>

         
          <h1 className="text-3xl sm:text-4xl lg:text-[56px] font-bold leading-tight">
            Digital Assistant:
            <br className="hidden sm:block" />
            AI for Instant Support
          </h1>

          
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl">
            Create intelligent voice agents that handle customer support,
            appointments, and sales calls 24/7. Boost efficiency and reduce
            costs with AI-powered conversations.
          </p>

          
          <div className="relative w-full flex justify-center">
            <div className="absolute inset-0 w-48 h-48 mx-auto bg-blue-600 rounded-full blur-3xl opacity-20" />
            <div
              className="w-48 h-48 rounded-full flex items-center justify-center"
              style={{
                background:
                  "radial-gradient(50% 50% at 50% 50%, #155EEF 0%, #326CDD 78%, rgba(50, 108, 221, 0) 100%)",
              }}
            >
              <Mic className="text-white" size={40} />
            </div>
          </div>

          
          <button
            onClick={onOpenLogin}
            className="bg-[#155EEF] text-white px-6 py-2.5 rounded-md hover:bg-blue-700 transition-colors text-sm mt-4"
          >
            Get started
          </button>
        </div>
      </div>  */}

      {/* Features Section */}
      <div id="features" className="py-20 bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-12 h-12 text-blue-500 mb-4" />,
                title: "Instant Response",
                desc: "24/7 availability with zero wait times. Your customers get immediate assistance whenever they need it.",
              },
              {
                icon: <Brain className="w-12 h-12 text-blue-500 mb-4" />,
                title: "AI-Powered",
                desc: "Advanced natural language processing ensures human-like conversations and accurate responses.",
              },
              {
                icon: <Phone className="w-12 h-12 text-blue-500 mb-4" />,
                title: "Multi-Channel",
                desc: "Deploy your digital assistant across voice, chat, and messaging platforms seamlessly.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-lg border border-gray-800 hover:border-blue-500 transition-colors"
              >
                {feature.icon}
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
