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

  // Detectar modo oscuro (Tailwind dark class en <html>)
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const textPrimary = isDark ? '#E5E7EB' : '#374151'; // gray-200 vs gray-700
  const textSecondary = isDark ? '#D1D5DB' : '#6B7280'; // gray-300 vs gray-500
  const gridColor = isDark ? '#374151' : '#F3F4F6'; // gray-700 vs gray-100
  const chartBg = isDark ? '#1F2937' : '#FFFFFF'; // gray-800 vs white

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
          color: textPrimary,
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
      // Plugin de fondo personalizado
      custom_bg: {
        // Este valor será leído por el plugin con el mismo id
        color: chartBg,
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
          color: textSecondary,
          font: {
            size: 11,
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
      <Bar
        data={chartData}
        options={barOptions}
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
  );
};

export default SimpleChart;
