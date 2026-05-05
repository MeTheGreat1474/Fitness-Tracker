document.addEventListener('DOMContentLoaded', function() {
    // Theme Colors
    const lime = '#d1fc00';
    const cyan = '#00e3fd';
    const gray800 = '#1e1e1e';
    const onSurfaceVariant = '#9e9e9e';

    // Shared Data
    const stepDataWeekly = [25000, 42000, 38000, 30000, 50000, 84200, 60000];
    const stepLabelsWeekly = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

    let stepChart, intensityChart, caloriesChart;

    // ==========================================
    // STEP TRAJECTORY LINE CHART
    // ==========================================
    const stepCanvas = document.getElementById('stepTrajectoryChart');
    if (stepCanvas) {
        const stepCtx = stepCanvas.getContext('2d');
        
        // Create subtle gradient for the line chart fill
        const gradient = stepCtx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(209, 252, 0, 0.2)');
        gradient.addColorStop(1, 'rgba(209, 252, 0, 0)');

        stepChart = new Chart(stepCtx, {
            type: 'line',
            data: {
                labels: stepLabelsWeekly,
                datasets: [{
                    label: 'Steps',
                    data: stepDataWeekly,
                    borderColor: lime,
                    borderWidth: 3,
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.4, // Smooth curve
                    pointBackgroundColor: lime,
                    pointBorderColor: '#000',
                    pointBorderWidth: 2,
                    pointRadius: function(context) {
                        // Only show point on 'SAT' (index 5) to match mockup peak
                        const index = context.dataIndex;
                        return index === 5 ? 6 : 0; 
                    },
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: lime,
                        bodyColor: '#fff',
                        padding: 10,
                        displayColors: false,
                    }
                },
                scales: {
                    x: {
                        grid: { display: false, drawBorder: false },
                        ticks: { color: onSurfaceVariant, font: { size: 10, weight: 'bold' } }
                    },
                    y: {
                        grid: { display: false, drawBorder: false },
                        ticks: { display: false } // Hide y-axis numbers for clean look
                    }
                }
            }
        });
    }

    // ==========================================
    // HIGH INTENSITY BAR CHART
    // ==========================================
    const intensityCanvas = document.getElementById('highIntensityChart');
    
    // Mock data for weekly high intensity minutes
    const intensityDataWeekly = [40, 60, 30, 80, 120, 50, 40];
    
    if (intensityCanvas) {
        const intensityCtx = intensityCanvas.getContext('2d');
        
        // Color only the active/highest bar cyan, rest dark grey
        const barColors = intensityDataWeekly.map((val, index) => index === 4 ? cyan : gray800);

        intensityChart = new Chart(intensityCtx, {
            type: 'bar',
            data: {
                labels: stepLabelsWeekly,
                datasets: [{
                    data: intensityDataWeekly,
                    backgroundColor: barColors,
                    borderRadius: 4,
                    barPercentage: 0.6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                scales: {
                    x: {
                        grid: { display: false, drawBorder: false },
                        ticks: { color: onSurfaceVariant, font: { size: 10, weight: 'bold' } }
                    },
                    y: {
                        grid: { display: false, drawBorder: false },
                        ticks: { display: false }
                    }
                }
            }
        });
    }

    // ==========================================
    // CALORIES CONSUMED VS BURNED CHART
    // ==========================================
    const calCanvas = document.getElementById('caloriesChart');
    
    // Mock data for weekly calories
    const consumedWeekly = [2200, 2400, 2100, 2500, 2600, 2450, 2300];
    const burnedWeekly = [2500, 2600, 2300, 2800, 2900, 2800, 2100];

    if (calCanvas) {
        const calCtx = calCanvas.getContext('2d');
        
        caloriesChart = new Chart(calCtx, {
            type: 'bar',
            data: {
                labels: stepLabelsWeekly,
                datasets: [
                    {
                        label: 'Consumed (kcal)',
                        data: consumedWeekly,
                        backgroundColor: lime,
                        borderRadius: 4,
                        barPercentage: 0.7,
                        categoryPercentage: 0.8
                    },
                    {
                        label: 'Burned (kcal)',
                        data: burnedWeekly,
                        backgroundColor: cyan,
                        borderRadius: 4,
                        barPercentage: 0.7,
                        categoryPercentage: 0.8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'end',
                        labels: {
                            color: onSurfaceVariant,
                            usePointStyle: true,
                            boxWidth: 8,
                            font: { size: 11, weight: 'bold', family: "'Manrope', sans-serif" }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 10
                    }
                },
                scales: {
                    x: {
                        grid: { display: false, drawBorder: false },
                        ticks: { color: onSurfaceVariant, font: { size: 10, weight: 'bold' } }
                    },
                    y: {
                        grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
                        ticks: { color: onSurfaceVariant, font: { size: 10 } }
                    }
                }
            }
        });
    }

    // ==========================================
    // INTERACTIVITY (Time Filters)
    // ==========================================
    const btnDaily = document.getElementById('btn-daily');
    const btnWeekly = document.getElementById('btn-weekly');
    const btnMonthly = document.getElementById('btn-monthly');

    const stepValueElement = document.getElementById('step-value');
    const intensityValueElement = document.getElementById('intensity-value');
    const caloriesValueElement = document.getElementById('calories-value');

    function setActiveBtn(activeBtn) {
        // Reset all buttons
        [btnDaily, btnWeekly, btnMonthly].forEach(btn => {
            if (btn) {
                btn.classList.remove('active');
                btn.style.backgroundColor = 'transparent';
                btn.style.color = 'var(--bs-gray-400)';
            }
        });
        // Activate target button
        if (activeBtn) {
            activeBtn.classList.add('active');
            activeBtn.style.backgroundColor = lime;
            activeBtn.style.color = '#000';
        }
    }

    if (btnDaily) {
        btnDaily.addEventListener('click', () => {
            setActiveBtn(btnDaily);
            // Mock Daily Data
            if (stepValueElement) stepValueElement.innerHTML = `12,482 <span class="fs-6 font-normal text-on-surface-variant">/day</span>`;
            if (stepChart) {
                stepChart.data.labels = ['12AM', '4AM', '8AM', '12PM', '4PM', '8PM', '11PM'];
                stepChart.data.datasets[0].data = [0, 0, 3000, 5000, 8000, 12482, 12482];
                stepChart.data.datasets[0].pointRadius = (ctx) => ctx.dataIndex === 5 ? 6 : 0;
                stepChart.update();
            }

            if (intensityValueElement) intensityValueElement.innerHTML = `45 <span class="fs-6 font-normal text-on-surface-variant">min</span>`;
            if (intensityChart) {
                // 24 hours labels. Only show specific labels on the axis
                intensityChart.data.labels = Array.from({length: 24}, (_, i) => {
                    if (i === 0) return '12AM';
                    if (i === 6) return '6AM';
                    if (i === 12) return '12PM';
                    if (i === 18) return '6PM';
                    if (i === 23) return '11PM';
                    return '';
                });
                
                // Mock 24-hour intensity data (peaks in morning and evening)
                const dailyIntensity = [
                    0, 0, 0, 0, 0, 5, 25, 45, 15, 0, 0, 0, 
                    0, 0, 0, 0, 10, 35, 60, 20, 0, 0, 0, 0
                ];
                
                intensityChart.data.datasets[0].data = dailyIntensity;
                // Highlight active hours (value > 0) in cyan, others dark grey
                intensityChart.data.datasets[0].backgroundColor = dailyIntensity.map(val => val > 0 ? cyan : gray800);
                intensityChart.update();
            }

            if (caloriesValueElement) caloriesValueElement.innerHTML = `<span class="text-primary-container">2,450</span> IN <span class="text-on-surface-variant fs-4 px-2">/</span> <span class="text-tertiary">2,800</span> OUT`;
            if (caloriesChart) {
                caloriesChart.data.labels = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
                caloriesChart.data.datasets[0].data = [500, 800, 900, 250];
                caloriesChart.data.datasets[1].data = [300, 1000, 1200, 300];
                caloriesChart.update();
            }
        });
    }

    if (btnWeekly) {
        btnWeekly.addEventListener('click', () => {
            setActiveBtn(btnWeekly);
            // Mock Weekly Data (Default)
            if (stepValueElement) stepValueElement.innerHTML = `84,200 <span class="fs-6 font-normal text-on-surface-variant">/wk</span>`;
            if (stepChart) {
                stepChart.data.labels = stepLabelsWeekly;
                stepChart.data.datasets[0].data = stepDataWeekly;
                stepChart.data.datasets[0].pointRadius = (ctx) => ctx.dataIndex === 5 ? 6 : 0;
                stepChart.update();
            }

            if (intensityValueElement) intensityValueElement.innerHTML = `320 <span class="fs-6 font-normal text-on-surface-variant">min</span>`;
            if (intensityChart) {
                intensityChart.data.labels = stepLabelsWeekly;
                intensityChart.data.datasets[0].data = intensityDataWeekly;
                intensityChart.data.datasets[0].backgroundColor = intensityDataWeekly.map((val, index) => index === 4 ? cyan : gray800); // highlight FRI
                intensityChart.update();
            }

            if (caloriesValueElement) caloriesValueElement.innerHTML = `<span class="text-primary-container">16,550</span> IN <span class="text-on-surface-variant fs-4 px-2">/</span> <span class="text-tertiary">18,000</span> OUT`;
            if (caloriesChart) {
                caloriesChart.data.labels = stepLabelsWeekly;
                caloriesChart.data.datasets[0].data = consumedWeekly;
                caloriesChart.data.datasets[1].data = burnedWeekly;
                caloriesChart.update();
            }
        });
    }

    if (btnMonthly) {
        btnMonthly.addEventListener('click', () => {
            setActiveBtn(btnMonthly);
            // Mock Monthly Data
            if (stepValueElement) stepValueElement.innerHTML = `324,500 <span class="fs-6 font-normal text-on-surface-variant">/mo</span>`;
            if (stepChart) {
                stepChart.data.labels = ['W1', 'W2', 'W3', 'W4'];
                stepChart.data.datasets[0].data = [80000, 84200, 75000, 85300];
                stepChart.data.datasets[0].pointRadius = (ctx) => ctx.dataIndex === 3 ? 6 : 0;
                stepChart.update();
            }

            if (intensityValueElement) intensityValueElement.innerHTML = `1,280 <span class="fs-6 font-normal text-on-surface-variant">min</span>`;
            if (intensityChart) {
                intensityChart.data.labels = ['W1', 'W2', 'W3', 'W4'];
                const monthlyIntensity = [250, 300, 320, 410];
                intensityChart.data.datasets[0].data = monthlyIntensity;
                intensityChart.data.datasets[0].backgroundColor = monthlyIntensity.map((val, index) => index === 3 ? cyan : gray800); // highlight W4
                intensityChart.update();
            }

            // Calories Mock Data
            if (caloriesValueElement) caloriesValueElement.innerHTML = `<span class="text-primary-container">72,000</span> IN <span class="text-on-surface-variant fs-4 px-2">/</span> <span class="text-tertiary">78,500</span> OUT`;
            if (caloriesChart) {
                caloriesChart.data.labels = ['W1', 'W2', 'W3', 'W4'];
                caloriesChart.data.datasets[0].data = [18000, 16550, 19000, 18450];
                caloriesChart.data.datasets[1].data = [20000, 18000, 19500, 21000];
                caloriesChart.update();
            }
        });
    }
});
