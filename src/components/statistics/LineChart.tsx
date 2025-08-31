import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LineChartProps {
  data: Record<string, number>;
  title: string;
  color?: string;
  height?: number;
}

export const LineChart: React.FC<LineChartProps> = ({ 
  data, 
  title, 
  color = '#3B82F6',
  height = 400 
}) => {
  const entries = Object.entries(data).sort(([a], [b]) => a.localeCompare(b));
  
  if (entries.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6">{title}</h3>
        <div className="flex items-center justify-center h-48 text-gray-500">
          No hay datos disponibles
        </div>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const chartData = {
    labels: entries.map(([date]) => formatDate(date)),
    datasets: [
      {
        label: 'Solicitudes',
        data: entries.map(([, value]) => value),
        borderColor: color,
        backgroundColor: `${color}20`,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: color,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: color,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (context: any) => {
            const index = context[0].dataIndex;
            const originalDate = entries[index][0];
            const date = new Date(originalDate);
            return date.toLocaleDateString('es-ES', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
          },
          label: (context: any) => {
            return `${context.parsed.y} solicitudes`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: '#f3f4f6',
          drawBorder: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
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
            size: 12,
          },
          callback: function(value: any) {
            return Number.isInteger(value) ? value : '';
          },
        },
      },
    },
    elements: {
      point: {
        hoverRadius: 8,
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-6">{title}</h3>
      <div style={{ height: `${height}px` }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};
