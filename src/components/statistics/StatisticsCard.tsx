import React from 'react';

interface StatisticsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
  subtitle?: string;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({ 
  title, 
  value, 
  icon, 
  className = '',
  subtitle 
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="text-blue-500">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticsCard;
