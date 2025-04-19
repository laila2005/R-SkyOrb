document.addEventListener('DOMContentLoaded', function() {
    // =====================
    // Dark Mode Functionality
    // =====================
    const darkModeToggle = document.getElementById('darkModeToggle');
    const icon = darkModeToggle.querySelector('i');
    
    // Initialize theme from localStorage or prefer-color-scheme
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    let currentTheme = localStorage.getItem('theme') || 
                      (prefersDarkScheme.matches ? 'dark' : 'light');
    
    // Apply initial theme
    applyTheme(currentTheme);

    // Theme toggle handler
    darkModeToggle.addEventListener('click', function() {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(currentTheme);
        localStorage.setItem('theme', currentTheme);
    });

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update button icon and text
        if (theme === 'dark') {
            icon.classList.replace('bi-moon-fill', 'bi-sun-fill');
            darkModeToggle.innerHTML = '<i class="bi bi-sun-fill"></i> Light Mode';
        } else {
            icon.classList.replace('bi-sun-fill', 'bi-moon-fill');
            darkModeToggle.innerHTML = '<i class="bi bi-moon-fill"></i> Dark Mode';
        }
        
        // Update charts if they exist
        updateChartsForTheme(theme);
    }

    // =====================
    // Filter Functionality
    // =====================
    const filterButtons = document.querySelectorAll('[data-filter]');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.classList.remove('bg-primary', 'text-white');
            });
            
            this.classList.add('active');
            if (this.classList.contains('nav-link')) {
                this.classList.add('bg-primary', 'text-white');
            }
            
            // Filter cards
            document.querySelectorAll('.filter-item').forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // =====================
    // Chart Initialization
    // =====================
    let telemetryChart, powerFlowChart;
    
    function initCharts() {
        // Power Flow Chart
        const powerCtx = document.getElementById('powerFlowChart')?.getContext('2d');
        if (powerCtx) {
            powerFlowChart = new Chart(powerCtx, {
                type: 'line',
                data: getChartData('power'),
                options: getChartOptions('Current (A)')
            });
        }
        
        // Telemetry Chart
        const telemetryCtx = document.getElementById('telemetryChart')?.getContext('2d');
        if (telemetryCtx) {
            telemetryChart = new Chart(telemetryCtx, {
                type: 'line',
                data: getChartData('voltage'),
                options: getChartOptions('Voltage (V)')
            });
        }
        
        // Chart theme update handler
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            const newTheme = e.matches ? 'dark' : 'light';
            updateChartsForTheme(newTheme);
        });
    }
    
    function getChartData(type) {
        const now = new Date();
        const labels = Array.from({length: 24}, (_, i) => {
            const d = new Date(now);
            d.setHours(d.getHours() - 23 + i);
            return d.getHours() + ':00';
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
                    labels: {
                        color: 'var(--text-color)'
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'var(--chart-grid)'
                    },
                    ticks: {
                        color: 'var(--chart-text)'
                    }
                },
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: yLabel,
                        color: 'var(--chart-text)'
                    },
                    grid: {
                        color: 'var(--chart-grid)'
                    },
                    ticks: {
                        color: 'var(--chart-text)'
                    }
                }
            }
        };
    }
    
    function updateChartsForTheme(theme) {
        const gridColor = theme === 'dark' ? '#333' : '#e9ecef';
        const textColor = theme === 'dark' ? '#aaa' : '#495057';
        
        if (powerFlowChart) {
            powerFlowChart.options.scales.x.grid.color = gridColor;
            powerFlowChart.options.scales.y.grid.color = gridColor;
            powerFlowChart.options.scales.x.ticks.color = textColor;
            powerFlowChart.options.scales.y.ticks.color = textColor;
            powerFlowChart.update();
        }
        
        if (telemetryChart) {
            telemetryChart.options.scales.x.grid.color = gridColor;
            telemetryChart.options.scales.y.grid.color = gridColor;
            telemetryChart.options.scales.x.ticks.color = textColor;
            telemetryChart.options.scales.y.ticks.color = textColor;
            telemetryChart.update();
        }
    }

    // =====================
    // Real-time Updates
    // =====================
    function updateLastUpdateTime() {
        const now = new Date();
        document.getElementById('last-update').textContent = 
            now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    }
    
    function simulateRealTimeUpdates() {
        // Update battery level randomly
        const batteryLevel = document.querySelector('.progress-bar');
        if (batteryLevel) {
            const current = parseInt(batteryLevel.style.width || '100');
            const newLevel = Math.max(10, Math.min(100, current + (Math.random() * 2 - 1)));
            batteryLevel.style.width = `${newLevel}%`;
            batteryLevel.textContent = `${Math.round(newLevel)}%`;
        }
        
        // Add random log entry
        const logMessages = [
            'Telemetry packet received',
            'Attitude adjustment complete',
            'Solar panels generating power',
            'Iridium connection established',
            'Battery temperature warning',
            'Navigation system calibrating',
            'Payload interface active'
        ];
        
        const logContainer = document.querySelector('.command-history');
        if (logContainer) {
            const now = new Date();
            const newLog = document.createElement('div');
            newLog.className = 'mb-2';
            newLog.innerHTML = `
                <small class="text-muted">${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} UTC</small>
                <div>${logMessages[Math.floor(Math.random() * logMessages.length)]}</div>
            `;
            logContainer.prepend(newLog);
            if (logContainer.children.length > 5) {
                logContainer.removeChild(logContainer.lastChild);
            }
        }
        
        updateLastUpdateTime();
    }

    // =====================
    // Initialization
    // =====================
    initCharts();
    updateLastUpdateTime();
    setInterval(simulateRealTimeUpdates, 5000);
    
    // Initialize with 'All' filter active
    document.querySelector('[data-filter="all"]').click();
});
