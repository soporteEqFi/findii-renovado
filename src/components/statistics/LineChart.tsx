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
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const textPrimary = isDark ? '#E5E7EB' : '#111827'; // gray-200 vs gray-900
  const textSecondary = isDark ? '#D1D5DB' : '#6B7280'; // gray-300 vs gray-500
  const gridColor = isDark ? '#374151' : '#F3F4F6'; // gray-700 vs gray-100
  const chartBg = isDark ? '#1F2937' : '#FFFFFF'; // gray-800 vs white
  
  if (entries.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">{title}</h3>
        <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
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
      custom_bg: {
        color: chartBg,
      },
    },
    scales: {
      x: {
        grid: {
          color: gridColor,
          drawBorder: false,
        },
        ticks: {
          color: textSecondary,
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: gridColor,
          drawBorder: false,
        },
        ticks: {
          color: textSecondary,
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
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">{title}</h3>
      <div style={{ height: `${height}px` }}>
        <Line
          data={chartData}
          options={options}
          plugins={[{
            id: 'custom_bg',
            beforeDraw: (chart: any, _args: any, opts: any) => {
              const { ctx, chartArea } = chart;
              if (!chartArea) return;
              ctx.save();
              ctx.fillStyle = opts?.color || chartBg;
              ctx.fillRect(chartArea.left, chartArea.top, chartArea.width, chartArea.height);
              ctx.restore();
            }
          }]}
        />
      </div>
    </div>
  );
};
