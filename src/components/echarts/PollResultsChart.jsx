// src/components/echarts/PollResultsChart.jsx
import React from 'react';
import ReactEcharts from 'echarts-for-react';

function useCSSVariable(name) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

export default function PollResultsChart({ data, total }) {
  // Guard: only render when we have a non-empty array
  if (!Array.isArray(data) || data.length === 0) return null;

  // Pull theme colors from your CSS vars
  const textColor       = useCSSVariable('--color-text');
  const secondaryColor  = useCSSVariable('--color-text-secondary');
  const primaryColor    = useCSSVariable('--color-primary');
  const cardBgColor     = useCSSVariable('--color-card-bg');

  // Labels and values
  const labels = data.map(d => d.label);
  const values = data.map(d => d.value);

  const option = {
    backgroundColor: cardBgColor,
    title: {
      text: `${total} Participated`,
      left: 'center',
      top: 0,
      textStyle: {
        color: textColor,
        fontSize: 16,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      textStyle: { color: textColor }
    },
    grid: {
      left: '3%', right: '4%', bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: secondaryColor } },
      axisLabel: { color: secondaryColor },
      splitLine: { lineStyle: { color: 'transparent' } }
    },
    yAxis: {
      type: 'category',
      data: labels,
      axisLine: { lineStyle: { color: secondaryColor } },
      axisLabel: { color: secondaryColor }
    },
    series: [
      {
        name: 'Votes',
        type: 'bar',
        data: values,
        itemStyle: { color: primaryColor },
        label: {
          show: true,
          position: 'right',
          color: textColor
        },
        barMaxWidth: '40%'
      }
    ]
  };

  return (
    <div className="bg-card p-4 rounded">
      <ReactEcharts
        option={option}
        style={{ height: 300, width: '100%' }}
      />
    </div>
  );
}
