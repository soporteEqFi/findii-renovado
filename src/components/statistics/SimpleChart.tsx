import React from 'react';

interface SimpleChartProps {
  data: Record<string, number>;
  type: 'bar' | 'pie' | 'line';
  colors?: string[];
}

const SimpleChart: React.FC<SimpleChartProps> = ({ 
  data, 
  type, 
  colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'] 
}) => {
  const entries = Object.entries(data);
  const maxValue = Math.max(...Object.values(data));

  if (type === 'bar') {
    return (
      <div className="h-full flex items-end justify-center space-x-2">
        {entries.map(([key, value], index) => (
          <div key={key} className="flex flex-col items-center">
            <div className="text-xs text-gray-600 mb-1">{value}</div>
            <div
              className="w-12 rounded-t"
              style={{
                height: `${(value / maxValue) * 200}px`,
                backgroundColor: colors[index % colors.length],
                minHeight: '10px'
              }}
            />
            <div className="text-xs text-gray-500 mt-2 text-center max-w-[60px] truncate">
              {key}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'pie') {
    const total = Object.values(data).reduce((sum, value) => sum + value, 0);
    let currentAngle = 0;

    return (
      <div className="h-full flex items-center justify-center">
        <div className="relative">
          <svg width="200" height="200" className="transform -rotate-90">
            {entries.map(([key, value], index) => {
              const angle = (value / total) * 360;
              const x1 = 100 + 80 * Math.cos((currentAngle * Math.PI) / 180);
              const y1 = 100 + 80 * Math.sin((currentAngle * Math.PI) / 180);
              const x2 = 100 + 80 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
              const y2 = 100 + 80 * Math.sin(((currentAngle + angle) * Math.PI) / 180);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              const pathData = [
                `M 100 100`,
                `L ${x1} ${y1}`,
                `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');

              const result = (
                <path
                  key={key}
                  d={pathData}
                  fill={colors[index % colors.length]}
                  stroke="white"
                  strokeWidth="2"
                />
              );

              currentAngle += angle;
              return result;
            })}
          </svg>
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold">{total}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
        </div>
        <div className="ml-4 space-y-2">
          {entries.map(([key, value], index) => (
            <div key={key} className="flex items-center text-sm">
              <div
                className="w-3 h-3 rounded mr-2"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-gray-700">{key}: {value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center text-gray-500">
      Tipo de gráfico no soportado
    </div>
  );
};

export default SimpleChart;
