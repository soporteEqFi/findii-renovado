import React from 'react';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-xl p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
      <div className="h-64">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
