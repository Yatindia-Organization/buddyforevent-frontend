// EventStatsChart.jsx
import React from 'react';
import ReactECharts from 'echarts-for-react';

const EventStatsChart = () => {
  const option = {
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['9 - 10am', '10 - 11am', '11 - 12am', '12 - 1 pm', '1 - 2pm'],
      axisLine: { lineStyle: { color: '#ccc' } },
      axisLabel: { color: '#666' },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#ccc' } },
      axisLabel: {
        formatter: (value) => `${value / 1000}k`,
        color: '#666',
      },
      splitLine: {
        lineStyle: {
          type: 'solid',
          color: '#eee',
        },
      },
    },
    series: [
      {
        data: [5000, 10000, 55000, 15000, 60000],
        type: 'line',
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 255, 0, 0.4)' },
              { offset: 1, color: 'rgba(0, 255, 0, 0.05)' },
            ],
          },
        },
        lineStyle: {
          color: 'green',
          width: 2,
          type: 'dotted',
        },
        symbol: 'none',
      },
    ],
  };

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0px 4px 20px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: '24px', color: '#14008C', margin: 0 }}>
          Event Participant Statistics
        </h2>
        <div style={{ color: '#555', fontSize: '16px' }}>Today count</div>
      </div>
      <ReactECharts option={option} style={{ height: '300px', width: '100%' }} />
    </div>
  );
};

export default EventStatsChart;
