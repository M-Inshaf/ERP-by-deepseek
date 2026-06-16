/**
 * Hummingbird ERP - Dashboard Module
 * Real-time KPIs, Charts, Recent Activities
 */

class DashboardModule {
    static render(container) {
        container.innerHTML = `
            <!-- KPI Cards Row -->
            <div class="kpi-grid" id="kpiGrid">
                <div class="kpi-card glass-card card-glow reveal" style="--delay: 0.1s">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #3b82f6, #2563eb);">
                        <i class="fas fa-tshirt"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Active Orders</span>
                        <span class="kpi-value counter-animate" id="kpiOrders">0</span>
                        <span class="kpi-change positive">+12% <i class="fas fa-arrow-up"></i></span>
                    </div>
                </div>
                
                <div class="kpi-card glass-card card-glow reveal" style="--delay: 0.2s">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
                        <i class="fas fa-industry"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">In Production</span>
                        <span class="kpi-value counter-animate" id="kpiProduction">0</span>
                        <span class="kpi-change positive">+8% <i class="fas fa-arrow-up"></i></span>
                    </div>
                </div>
                
                <div class="kpi-card glass-card card-glow reveal" style="--delay: 0.3s">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                        <i class="fas fa-money-bill-wave"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Revenue (MTD)</span>
                        <span class="kpi-value counter-animate" id="kpiRevenue">Rs. 0</span>
                        <span class="kpi-change positive">+15% <i class="fas fa-arrow-up"></i></span>
                    </div>
                </div>
                
                <div class="kpi-card glass-card card-glow reveal" style="--delay: 0.4s">
                    <div class="kpi-icon" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">
                        <i class="fas fa-boxes"></i>
                    </div>
                    <div class="kpi-info">
                        <span class="kpi-label">Inventory Items</span>
                        <span class="kpi-value counter-animate" id="kpiInventory">0</span>
                        <span class="kpi-change neutral">Stable</span>
                    </div>
                </div>
            </div>
            
            <!-- Charts Row -->
            <div class="charts-grid">
                <div class="chart-card glass-card reveal" style="--delay: 0.5s">
                    <div class="chart-header">
                        <h3>Production Overview</h3>
                        <select class="form-input form-select chart-period" onchange="DashboardModule.updateCharts()">
                            <option value="7">Last 7 Days</option>
                            <option value="30" selected>Last 30 Days</option>
                            <option value="90">Last 90 Days</option>
                        </select>
                    </div>
                    <div class="chart-body">
                        <canvas id="productionChart"></canvas>
                    </div>
                </div>
                
                <div class="chart-card glass-card reveal" style="--delay: 0.6s">
                    <div class="chart-header">
                        <h3>Revenue vs Expenses</h3>
                    </div>
                    <div class="chart-body">
                        <canvas id="revenueChart"></canvas>
                    </div>
                </div>
            </div>
            
            <!-- Bottom Row -->
            <div class="bottom-grid">
                <div class="activity-card glass-card reveal" style="--delay: 0.7s">
                    <div class="card-header">
                        <h3><i class="fas fa-clock"></i> Recent Activities</h3>
                    </div>
                    <div class="activity-list" id="activityList">
                        <!-- Dynamic activity items -->
                    </div>
                </div>
                
                <div class="alerts-card glass-card reveal" style="--delay: 0.8s">
                    <div class="card-header">
                        <h3><i class="fas fa-bell"></i> Alerts</h3>
                    </div>
                    <div class="alert-list" id="alertList">
                        <!-- Dynamic alerts -->
                    </div>
                </div>
            </div>
        `;

        DashboardModule.loadKPIs();
        DashboardModule.loadCharts();
        DashboardModule.loadActivities();
        DashboardModule.loadAlerts();
        DashboardModule.animateReveal();
    }

    static loadKPIs() {
        const subGarments = db.getCollection('subGarments');
        const production = db.getCollection('production');
        const inventory = db.getCollection('inventory');
        const payments = db.getCollection('payments');

        // Animate counter
        const animateValue = (element, start, end, duration, prefix = '') => {
            const range = end - start;
            const increment = range / (duration / 16);
            let current = start;
            
            const timer = setInterval(() => {
                current += increment;
                if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                    current = end;
                    clearInterval(timer);
                }
                element.textContent = prefix + Math.round(current).toLocaleString();
            }, 16);
        };

        const ordersCount = subGarments.length;
        const productionCount = production.filter(p => p.status === 'in-progress').length;
        const revenueTotal = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const inventoryCount = inventory.length;

        animateValue(document.getElementById('kpiOrders'), 0, ordersCount, 1000);
        animateValue(document.getElementById('kpiProduction'), 0, productionCount, 1000);
        animateValue(document.getElementById('kpiRevenue'), 0, revenueTotal, 1000, 'Rs. ');
        animateValue(document.getElementById('kpiInventory'), 0, inventoryCount, 1000);
    }

    static loadCharts() {
        // Production Chart
        const prodCtx = document.getElementById('productionChart')?.getContext('2d');
        if (prodCtx) {
            new Chart(prodCtx, {
                type: 'bar',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    datasets: [
                        {
                            label: 'Produced',
                            data: [120, 150, 180, 140],
                            backgroundColor: 'rgba(59, 130, 246, 0.7)',
                            borderRadius: 8,
                            borderSkipped: false,
                        },
                        {
                            label: 'Completed',
                            data: [110, 140, 170, 130],
                            backgroundColor: 'rgba(16, 185, 129, 0.7)',
                            borderRadius: 8,
                            borderSkipped: false,
                        },
                        {
                            label: 'Damaged',
                            data: [5, 8, 3, 6],
                            backgroundColor: 'rgba(239, 68, 68, 0.7)',
                            borderRadius: 8,
                            borderSkipped: false,
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                usePointStyle: true,
                                padding: 20,
                                font: { size: 11 }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: getComputedStyle(document.documentElement)
                                    .getPropertyValue('--border-color').trim()
                            }
                        },
                        x: {
                            grid: { display: false }
                        }
                    }
                }
            });
        }

        // Revenue Chart
        const revCtx = document.getElementById('revenueChart')?.getContext('2d');
        if (revCtx) {
            new Chart(revCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [
                        {
                            label: 'Revenue',
                            data: [450000, 520000, 480000, 610000, 550000, 680000],
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            fill: true,
                            tension: 0.4,
                            pointRadius: 4,
                            pointHoverRadius: 8,
                        },
                        {
                            label: 'Expenses',
                            data: [300000, 340000, 310000, 380000, 350000, 400000],
                            borderColor: '#ef4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            fill: true,
                            tension: 0.4,
                            pointRadius: 4,
                            pointHoverRadius: 8,
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                usePointStyle: true,
                                padding: 20,
                                font: { size: 11 }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: (value) => 'Rs. ' + value.toLocaleString()
                            },
                            grid: {
                                color: getComputedStyle(document.documentElement)
                                    .getPropertyValue('--border-color').trim()
                            }
                        },
                        x: {
                            grid: { display: false }
                        }
                    }
                }
            });
        }
    }

    static loadActivities() {
        const activities = [
            { icon: 'fa-plus-circle', color: '#10b981', text: 'New sub garment order created', time: '5 min ago', badge: 'HB-2026-000042' },
            { icon: 'fa-check-circle', color: '#3b82f6', text: 'Production batch completed', time: '1 hour ago', badge: 'Batch #128' },
            { icon: 'fa-money-bill', color: '#f59e0b', text: 'Payment received from customer', time: '3 hours ago', badge: 'Rs. 45,000' },
            { icon: 'fa-exclamation-triangle', color: '#ef4444', text: 'Material stock running low', time: '5 hours ago', badge: 'Fabric A-123' },
            { icon: 'fa-file-invoice', color: '#8b5cf6', text: 'Invoice generated', time: '1 day ago', badge: 'INV-2026-089' },
        ];

        document.getElementById('activityList').innerHTML = activities.map((item, i) => `
            <div class="activity-item" style="animation-delay: ${i * 0.1}s">
                <div class="activity-icon" style="background: ${item.color}20; color: ${item.color};">
                    <i class="fas ${item.icon}"></i>
                </div>
                <div class="activity-content">
                    <p class="activity-text">${item.text}</p>
                    <span class="activity-time">${item.time}</span>
                </div>
                <span class="activity-badge">${item.badge}</span>
            </div>
        `).join('');
    }

    static loadAlerts() {
        const alerts = [
            { type: 'warning', text: 'Fabric stock below minimum level', module: 'inventory' },
            { type: 'danger', text: 'Production delay on Batch #125', module: 'production' },
            { type: 'info', text: 'Monthly report ready for download', module: 'reports' },
            { type: 'warning', text: 'Customer payment overdue', module: 'payments' },
        ];

        document.getElementById('alertList').innerHTML = alerts.map(alert => `
            <div class="alert-item alert-${alert.type}" onclick="app.navigateTo('${alert.module}')">
                <i class="fas ${alert.type === 'warning' ? 'fa-exclamation-triangle' : alert.type === 'danger' ? 'fa-times-circle' : 'fa-info-circle'}"></i>
                <span>${alert.text}</span>
            </div>
        `).join('');
    }

    static animateReveal() {
        // Intersection Observer for scroll reveal
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.15 });

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }

    static updateCharts() {
        // Refresh charts when period changes
        this.loadCharts();
    }
}
