import { computed } from 'vue'

export function useChartAnalytics(monthlyData) {
    const generateMonthlyChartData = computed(() => {
        const now = new Date()
        const currentYear = now.getFullYear()

        const dataMap = new Map()
        monthlyData.value.forEach(item => {
            dataMap.set(item.month, item)
        })

        const allMonths = []
        const monthNames = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ]

        for (let month = 1; month <= 12; month++) {
            const monthKey = `${currentYear}-${String(month).padStart(2, '0')}`
            const data = dataMap.get(monthKey)

            allMonths.push({
                month: monthKey,
                totalRevenue: data?.totalRevenue || 0,
                totalProfit: data?.totalProfit || 0,
                label: monthNames[month - 1]
            })
        }

        return {
            labels: allMonths.map(item => item.label),
            revenueData: allMonths.map(item => item.totalRevenue),
            profitData: allMonths.map(item => item.totalProfit),
            year: currentYear
        }
    })

    const getYAxisStep = (data) => {
        const maxValue = Math.max(...data.filter(v => typeof v === 'number' && !isNaN(v)), 0)

        if (maxValue === 0) return 500000
        if (maxValue < 1000000) return 500000
        if (maxValue < 5000000) return 500000
        if (maxValue < 10000000) return 1000000
        if (maxValue < 50000000) return 2000000
        return 5000000
    }

    const getYAxisMax = (data, step) => {
        const maxValue = Math.max(...data.filter(v => typeof v === 'number' && !isNaN(v)), 0)
        return Math.ceil(maxValue / step) * step
    }

    const revenueChartData = computed(() => ({
        labels: generateMonthlyChartData.value.labels,
        datasets: [
            {
                label: 'Pendapatan Bulanan',
                data: generateMonthlyChartData.value.revenueData,
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1
            }
        ]
    }))

    const profitChartData = computed(() => ({
        labels: generateMonthlyChartData.value.labels,
        datasets: [
            {
                label: 'Profit Bulanan',
                data: generateMonthlyChartData.value.profitData,
                backgroundColor: 'rgba(34, 197, 94, 0.7)',
                borderColor: 'rgb(34, 197, 94)',
                borderWidth: 1,
            }
        ]
    }))

    const generateChartOptions = (data) => {
        const step = getYAxisStep(data)
        const maxY = getYAxisMax(data, step)

        return {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: { size: 12, weight: 'bold' },
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 10,
                    titleFont: { size: 12, weight: 'bold' },
                    bodyFont: { size: 11 },
                    callbacks: {
                        label: function (context) {
                            return `Rp ${context.parsed.y.toLocaleString('id-ID')}`
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    min: 0,
                    max: maxY,
                    ticks: {
                        stepSize: step,
                        callback: function (value) {
                            return 'Rp ' + (value / 1000000).toFixed(1) + 'juta'
                        }
                    }
                }
            }
        }
    }

    const chartOptions = computed(() => {
        const allData = [
            ...generateMonthlyChartData.value.revenueData,
            ...generateMonthlyChartData.value.profitData
        ]
        return generateChartOptions(allData)
    })

    return {
        generateMonthlyChartData,
        revenueChartData,
        profitChartData,
        chartOptions,
        getYAxisStep,
        getYAxisMax,
        generateChartOptions
    }
}
