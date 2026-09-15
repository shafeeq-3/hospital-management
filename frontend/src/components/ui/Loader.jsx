const Loader = ({ size = 'md', fullScreen = false }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const loader = (
    <div className="flex items-center justify-center">
      <div className={`${sizes[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}></div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center">
          <div className={`${sizes.xl} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4`}></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return loader;
};

export default Loader;
