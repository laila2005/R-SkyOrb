// Filter functionality
document.querySelectorAll('[data-filter]').forEach(button => {
    button.addEventListener('click', function() {
        const filter = this.getAttribute('data-filter');
        
        // Update active button
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.classList.remove('active');
        });
        this.classList.add('active');
        
        // Show/hide cards
        document.querySelectorAll('.filter-item').forEach(card => {
            if (filter === 'all' || card.getAttribute('data-category') === filter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const powerCtx = document.getElementById('powerFlowChart')?.getContext('2d');
    if (powerCtx) {
        new Chart(powerCtx, {
            type: 'line',
            data: {
                labels: ['-5m', '-4m', '-3m', '-2m', '-1m', 'Now'],
                datasets: [
                    {
                        label: 'Current Draw (A)',
                        data: [2.1, 2.3, 2.0, 2.2, 2.1, 2.0],
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        tension: 0.1
                    },
                    {
                        label: 'Generation (A)',
                        data: [2.5, 2.4, 2.6, 2.3, 2.5, 2.4],
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    const telemetryCtx = document.getElementById('telemetryChart')?.getContext('2d');
    if (telemetryCtx) {
        const telemetryChart = new Chart(telemetryCtx, {
            type: 'line',
            data: {
                labels: Array.from({length: 24}, (_, i) => `${i}:00`),
                datasets: [
                    {
                        label: 'Battery Voltage (V)',
                        data: [12.1, 12.0, 11.9, 11.8, 11.7, 11.6, 11.5, 11.4, 11.3, 11.2, 11.1, 11.0, 10.9, 10.8, 10.7, 10.6, 10.5, 10.4, 10.3, 10.2, 10.1, 10.0, 9.9, 9.8],
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });

        // Update chart based on selection
        document.getElementById('telemetry-select')?.addEventListener('change', function() {
            const selected = this.value;
            let newData;
            
            switch(selected) {
                case 'temp':
                    newData = {
                        label: 'Temperature (°C)',
                        data: [25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2],
                        borderColor: 'rgba(255, 159, 64, 1)',
                        backgroundColor: 'rgba(255, 159, 64, 0.2)'
                    };
                    break;
                case 'comms':
                    newData = {
                        label: 'Signal Strength (%)',
                        data: [95, 94, 93, 92, 91, 90, 89, 88, 87, 86, 85, 84, 83, 82, 81, 80, 79, 78, 77, 76, 75, 74, 73, 72],
                        borderColor: 'rgba(153, 102, 255, 1)',
                        backgroundColor: 'rgba(153, 102, 255, 0.2)'
                    };
                    break;
                case 'altitude':
                    newData = {
                        label: 'Altitude (km)',
                        data: [10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5, 17, 17.5, 18, 18.5, 19, 19.5, 20, 20.5, 21, 21.5],
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)'
                    };
                    break;
                default: // power
                    newData = {
                        label: 'Battery Voltage (V)',
                        data: [12.1, 12.0, 11.9, 11.8, 11.7, 11.6, 11.5, 11.4, 11.3, 11.2, 11.1, 11.0, 10.9, 10.8, 10.7, 10.6, 10.5, 10.4, 10.3, 10.2, 10.1, 10.0, 9.9, 9.8],
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)'
                    };
            }
            
            telemetryChart.data.datasets[0] = newData;
            telemetryChart.update();
        });
    }

    // Update time range
    document.getElementById('time-range')?.addEventListener('input', function() {
        const hours = this.value;
        document.querySelector('.form-range + span').textContent = `Last ${hours} hours`;
    });

    // Simulate real-time updates
    setInterval(() => {
        const now = new Date();
        const lastUpdateEl = document.getElementById('last-update');
        if (lastUpdateEl) {
            lastUpdateEl.textContent = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
        }
        
        // Update random data for demo purposes
        const batteryLevel = document.querySelector('.progress-bar.bg-success');
        if (batteryLevel) {
            const currentLevel = parseInt(batteryLevel.style.width);
            const newLevel = Math.max(10, Math.min(100, currentLevel + (Math.random() * 2 - 1)));
            batteryLevel.style.width = `${newLevel}%`;
            batteryLevel.textContent = `${Math.round(newLevel)}%`;
        }
    }, 5000);
});
