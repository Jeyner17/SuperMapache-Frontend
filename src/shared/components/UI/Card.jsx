const Card = ({ children, className = '', hover = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-dark-card
        rounded-xl shadow-sm
        border border-gray-200 dark:border-dark-border
        transition-all duration-200
        ${hover ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;