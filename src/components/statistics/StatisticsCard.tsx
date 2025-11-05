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
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-xl p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
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
