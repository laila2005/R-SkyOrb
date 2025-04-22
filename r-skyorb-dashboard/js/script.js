document.addEventListener('DOMContentLoaded', function() {
    // =====================
    // Theme Management
    // =====================
    const darkModeToggle = document.getElementById('darkModeToggle');
    let currentTheme = localStorage.getItem('theme') || 
                      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        darkModeToggle.innerHTML = theme === 'dark' ? 
            '<i class="bi bi-sun-fill"></i> Light Mode' : 
            '<i class="bi bi-moon-fill"></i> Dark Mode';
        updateChartsForTheme(theme);
    }

    darkModeToggle.addEventListener('click', () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(currentTheme);
        localStorage.setItem('theme', currentTheme);
    });

    // =====================
    // Chart Management
    // =====================
    let telemetryChart, powerFlowChart;
    
    function initCharts() {
        try {
            const powerCtx = document.getElementById('powerFlowChart')?.getContext('2d');
            if (powerCtx) {
                powerFlowChart = new Chart(powerCtx, {
                    type: 'line',
                    data: getChartData('power'),
                    options: getChartOptions('Current (A)')
                });
            } else {
                console.error('Power Flow Chart canvas not found');
            }
            
            const telemetryCtx = document.getElementById('telemetryChart')?.getContext('2d');
            if (telemetryCtx) {
                telemetryChart = new Chart(telemetryCtx, {
                    type: 'line',
                    data: getChartData('voltage'),
                    options: getChartOptions('Voltage (V)')
                });
            } else {
                console.error('Telemetry Chart canvas not found');
            }
        } catch (error) {
            console.error('Error initializing charts:', error);
        }
    }
    
    function getChartData(type) {
        const now = new Date();
        const labels = Array.from({length: 24}, (_, i) => {
            const d = new Date(now);
            d.setHours(d.getHours() - 23 + i);
            return d.getHours().toString().padStart(2, '0') + ':00';
        });
        
        if (type === 'power') {
            return {
                labels: labels.slice(-6),
                datasets: [
                    {
                        label: 'Current Draw',
                        data: [2.1, 2.3, 2.0, 2.2, 2.1, 2.0],
                        borderColor: '#e53e3e',
                        backgroundColor: 'rgba(229, 62, 62, 0.2)',
                        tension: 0.1
                    },
                    {
                        label: 'Generation',
                        data: [2.5, 2.4, 2.6, 2.3, 2.5, 2.4],
                        borderColor: '#38a169',
                        backgroundColor: 'rgba(56, 161, 105, 0.2)',
                        tension: 0.1
                    }
                ]
            };
        } else {
            return {
                labels: labels,
                datasets: [
                    {
                        label: 'Battery Voltage',
                        data: Array.from({length: 24}, (_, i) => 12 - (i * 0.1)),
                        borderColor: '#3182ce',
                        backgroundColor: 'rgba(49, 130, 206, 0.2)',
                        tension: 0.1
                    }
                ]
            };
        }
    }
    
    function getChartOptions(yLabel) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: 'var(--text-color)' }
                }
            },
            scales: {
                x: {
                    grid: { color: 'var(--chart-grid)' },
                    ticks: { color: 'var(--chart-text)' }
                },
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: yLabel,
                        color: 'var(--chart-text)'
                    },
                    grid: { color: 'var(--chart-grid)' },
                    ticks: { color: 'var(--chart-text)' }
                }
            }
        };
    }
    
    function updateChartsForTheme(theme) {
        const gridColor = theme === 'dark' ? '#333' : '#e9ecef';
        const textColor = theme === 'dark' ? '#aaa' : '#495057';
        
        [powerFlowChart, telemetryChart].forEach(chart => {
            if (chart) {
                chart.options.scales.x.grid.color = gridColor;
                chart.options.scales.y.grid.color = gridColor;
                chart.options.scales.x.ticks.color = textColor;
                chart.options.scales.y.ticks.color = textColor;
                chart.options.plugins.legend.labels.color = textColor;
                chart.update();
            }
        });
    }

    // Initialize charts before applying theme
    initCharts();
    applyTheme(currentTheme);

    // =====================
    // Filter Functionality
    // =====================
    const filterButtons = document.querySelectorAll('[data-filter]');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            console.log('Applying filter:', filter); // Debug log
            
            // Update button states
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.classList.add('btn-outline-primary');
            });
            this.classList.add('active');
            this.classList.remove('btn-outline-primary');
            
            // Filter widgets
            document.querySelectorAll('.filter-item').forEach(item => {
                const categories = item.getAttribute('data-category').split(' ');
                item.style.display = (filter === 'all' || categories.includes(filter)) ? 'block' : 'none';
            });
        });
    });

    // =====================
    // Search Functionality
    // =====================
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.toLowerCase();
        document.querySelectorAll('.card').forEach(card => {
            const text = card.textContent.toLowerCase();
            card.parentElement.style.display = text.includes(query) ? 'block' : 'none';
        });
    });

    // =====================
    // Log Filter Functionality
    // =====================
    const logFilterInput = document.getElementById('log-filter-input');
    const logFilterBtn = document.getElementById('log-filter-btn');
    
    logFilterBtn.addEventListener('click', () => {
        const query = logFilterInput.value.toLowerCase();
        document.querySelectorAll('.log-entry').forEach(entry => {
            const text = entry.textContent.toLowerCase();
            entry.style.display = text.includes(query) ? 'block' : 'none';
        });
    });

    // =====================
    // Telemetry Controls
    // =====================
    const telemetrySelect = document.getElementById('telemetry-select');
    const timeRange = document.getElementById('time-range');
    const timeRangeLabel = document.getElementById('time-range-label');
    
    telemetrySelect.addEventListener('change', () => {
        if (telemetryChart) {
            telemetryChart.data = getChartData(telemetrySelect.value);
            telemetryChart.options.scales.y.title.text = telemetrySelect.value === 'power' ? 'Current (A)' : 
                                                       telemetrySelect.value === 'temp' ? 'Temperature (°C)' : 
                                                       telemetrySelect.value === 'comms' ? 'Signal Strength' : 'Altitude (ft)';
            telemetryChart.update();
        }
    });
    
    timeRange.addEventListener('input', () => {
        const hours = timeRange.value;
        timeRangeLabel.textContent = `Last ${hours} hour${hours > 1 ? 's' : ''}`;
        if (telemetryChart) {
            const now = new Date();
            const labels = Array.from({length: hours}, (_, i) => {
                const d = new Date(now);
                d.setHours(d.getHours() - (hours - 1) + i);
                return d.getHours().toString().padStart(2, '0') + ':00';
            });
            telemetryChart.data.labels = labels;
            telemetryChart.update();
        }
    });

    // =====================
    // Manual Commands
    // =====================
    const commandButtons = {
        'reset-power-btn': 'Reset Power Module',
        'ping-comms-btn': 'Ping Communication',
        'run-diag-btn': 'Run Diagnostics',
        'calibrate-sensors-btn': 'Calibrate Sensors',
        'emergency-stop-btn': 'Emergency Stop'
    };
    
    Object.keys(commandButtons).forEach(id => {
        const btn = document.getElementById(id);
        btn.addEventListener('click', () => {
            const command = commandButtons[id];
            addCommandHistory(command, `Executing ${command.toLowerCase()}`);
        });
    });

    function addCommandHistory(command, response) {
        const history = document.querySelector('.command-history');
        const now = new Date();
        const entry = document.createElement('div');
        entry.className = 'mb-2';
        entry.innerHTML = `
            <small class="text-muted">${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} UTC</small>
            <div>Sent: ${command}</div>
            <div>Response: ${response}</div>
        `;
        history.prepend(entry);
        if (history.children.length > 5) {
            history.removeChild(history.lastChild);
        }
    }

    // =====================
    // Configurable Controls
    // =====================
    const tempThreshold = document.getElementById('temp-threshold');
    const tempThresholdValue = document.getElementById('temp-threshold-value');
    const batteryThreshold = document.getElementById('battery-threshold');
    const batteryThresholdValue = document.getElementById('battery-threshold-value');
    
    tempThreshold.addEventListener('input', () => {
        tempThresholdValue.textContent = `${tempThreshold.value}°C`;
    });
    
    batteryThreshold.addEventListener('input', () => {
        batteryThresholdValue.textContent = `${batteryThreshold.value}%`;
    });

    document.getElementById('save-preset-btn').addEventListener('click', () => {
        alert('Preset saved!');
    });
    
    document.getElementById('load-preset-btn').addEventListener('click', () => {
        alert('Preset loaded!');
    });

    // =====================
    // Real-time Updates
    // =====================
    function updateLastUpdateTime() {
        const now = new Date();
        document.getElementById('last-update').textContent = 
            now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
        document.getElementById('health-check-time').textContent = 
            now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    }
    
    function simulateRealTimeUpdates() {
        // Update battery level
        const batteryLevel = document.querySelector('.progress-bar');
        if (batteryLevel) {
            const current = parseInt(batteryLevel.style.width) || 78;
            const newLevel = Math.max(10, Math.min(100, current + (Math.random() * 4 - 2)));
            batteryLevel.style.width = `${newLevel}%`;
            batteryLevel.textContent = `${Math.round(newLevel)}%`;
            batteryLevel.setAttribute('aria-valuenow', newLevel);
        }
        
        // Update charts
        if (powerFlowChart) {
            powerFlowChart.data.datasets[0].data.push(2 + Math.random() * 0.3);
            powerFlowChart.data.datasets[1].data.push(2.3 + Math.random() * 0.3);
            powerFlowChart.data.datasets.forEach(ds => ds.data.shift());
            powerFlowChart.update();
        }
        
        // Update logs
        const logMessages = [
            'Telemetry packet received',
            'Attitude adjustment complete',
            'Solar panels generating power',
            'Iridium connection established',
            'Battery temperature warning',
            'Navigation system calibrating',
            'Payload interface active'
        ];
        const logContainer = document.querySelector('.log-container');
        if (logContainer) {
            const now = new Date();
            const newLog = document.createElement('div');
            newLog.className = 'log-entry';
            const message = logMessages[Math.floor(Math.random() * logMessages.length)];
            const badge = message.includes('warning') ? 'bg-warning' : 'bg-info';
            newLog.innerHTML = `
                <div class="d-flex justify-content-between">
                    <small class="text-muted">${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} UTC</small>
                    <span class="badge ${badge}">${message.includes('warning') ? 'WARN' : 'INFO'}</span>
                </div>
                <div>${message}</div>
            `;
            logContainer.prepend(newLog);
            if (logContainer.children.length > 6) {
                logContainer.removeChild(logContainer.lastChild);
            }
        }
        
        updateLastUpdateTime();
    }

    // =====================
    // MiniMap Placeholder
    // =====================
    function initMiniMap() {
        const miniMap = document.getElementById('miniMap');
        if (miniMap) {
            miniMap.innerHTML = '<div style="text-align: center; padding-top: 60px; color: var(--text-color);">Map Placeholder (Requires Leaflet.js)</div>';
        }
    }

    // =====================
    // Initialization
    // =====================
    initMiniMap();
    updateLastUpdateTime();
    setInterval(simulateRealTimeUpdates, 5000);
    document.getElementById('filter-all').click();
});
