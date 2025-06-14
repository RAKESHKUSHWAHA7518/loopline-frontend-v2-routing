 const RippleLoader = () => (
    <div className="flex items-center justify-center">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-blue-500 rounded-full animate-ping"></div>
        <div className="absolute inset-2 border-4 border-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
        <div className="absolute inset-4 border-4 border-blue-300 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );

  export default RippleLoader;