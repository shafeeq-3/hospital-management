const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="text-center py-12 px-4">
      {Icon && (
        <div className="flex justify-center mb-4">
          <Icon className="w-16 h-16 text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
