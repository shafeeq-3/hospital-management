const Card = ({ children, className = '', hover = false, onClick }) => {
  const hoverClass = hover ? 'hover:shadow-lg transition-shadow duration-200 cursor-pointer' : '';
  
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-md p-6 ${hoverClass} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
