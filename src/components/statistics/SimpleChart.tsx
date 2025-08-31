import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface SimpleChartProps {
  data: Record<string, number>;
  type: 'bar' | 'pie';
  colors?: string[];
}

const SimpleChart: React.FC<SimpleChartProps> = ({
  data,
  type,
  colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316']
}) => {
  const entries = Object.entries(data);

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        No hay datos disponibles
      </div>
    );
  }

  const chartData = {
    labels: entries.map(([label]) => label),
    datasets: [
      {
        data: entries.map(([, value]) => value),
        backgroundColor: colors.slice(0, entries.length),
        borderColor: colors.slice(0, entries.length).map(color => color),
        borderWidth: type === 'pie' ? 2 : 1,
        borderRadius: type === 'bar' ? 4 : 0,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
          color: '#374151',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context: any) => {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed * 100) / total).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
    },
  };

  if (type === 'pie') {
    return (
      <div style={{ height: '250px' }}>
        <Pie
          data={chartData}
          options={{
            ...commonOptions,
            plugins: {
              ...commonOptions.plugins,
              legend: {
                ...commonOptions.plugins.legend,
                position: 'bottom' as const,
                labels: {
                  ...commonOptions.plugins.legend.labels,
                  padding: 10,
                  font: {
                    size: 10,
                  },
                },
              },
            },
          }}
        />
      </div>
    );
  }

  const barOptions = {
    ...commonOptions,
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#f3f4f6',
          drawBorder: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
          callback: function(value: any) {
            return Number.isInteger(value) ? value : '';
          },
        },
      },
    },
    plugins: {
      ...commonOptions.plugins,
      legend: {
        display: false,
      },
    },
  };

  return (
    <div style={{ height: '250px' }}>
      <Bar data={chartData} options={barOptions} />
    </div>
  );
};

export default SimpleChart;
