import ReactEcharts from 'echarts-for-react';

export default function PollResultsChart({ data }) {
    const options = {
        title: {
            text: `${data.total} - Participated`,
            left: 'center',
            top: 0
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        xAxis: {
            type: 'value',
        },
        yAxis: {
            type: 'category',
            data: data.options.map(opt => opt.label),
        },
        series: [
            {
                type: 'bar',
                data: data.options.map(opt => opt.count),
                itemStyle: {
                    color: '#2BA84A',
                },
                label: {
                    show: true,
                    position: 'right',
                }
            }
        ]
    };

    return <ReactEcharts option={options} style={{ height: 300 }} />;
}
