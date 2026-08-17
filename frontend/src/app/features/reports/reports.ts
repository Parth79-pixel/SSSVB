import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { ReportsService } from './reports.service';
import { ReportsSummary, DailyRevenuePoint, TopProduct } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class Reports implements OnInit, AfterViewInit {
  @ViewChild('salesChart') salesChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('topProductsChart') topProductsChartRef!: ElementRef<HTMLCanvasElement>;

  summary: ReportsSummary | null = null;
  loading = true;

  weeklyData: DailyRevenuePoint[] = [];
  topProductsData: TopProduct[] = [];

  viewReady = false;
  weeklyLoaded = false;
  topProductsLoaded = false;
  chartsRendered = false;

  constructor(
    private reportsService: ReportsService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.reportsService.getSummary().subscribe((summary) => {
      this.summary = summary;
      this.loading = false;
      this.cdr.detectChanges();
      this.tryRenderCharts();
    });

    this.reportsService.getWeeklyRevenue().subscribe((weekly) => {
      this.weeklyData = weekly;
      this.weeklyLoaded = true;
      this.tryRenderCharts();
    });

    this.reportsService.getTopProducts().subscribe((topProducts) => {
      this.topProductsData = topProducts;
      this.topProductsLoaded = true;
      this.tryRenderCharts();
    });
  }

  ngAfterViewInit() {
    this.viewReady = true;
    this.tryRenderCharts();
  }

  tryRenderCharts() {
    if (this.chartsRendered) return;
    if (!this.viewReady || !this.weeklyLoaded || !this.topProductsLoaded) return;

    this.chartsRendered = true;
    setTimeout(() => {
      this.renderSalesChart();
      this.renderTopProductsChart();
      this.cdr.detectChanges();
    });
  }

  renderSalesChart() {
    if (!this.salesChartRef) return;
    const ctx = this.salesChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(212, 175, 55, 0.25)');
    gradient.addColorStop(1, 'rgba(212, 175, 55, 0)');

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.weeklyData.map((d) => d.label),
        datasets: [
          {
            label: 'Revenue',
            data: this.weeklyData.map((d) => Number(d.total)),
            borderColor: '#d4af37',
            borderWidth: 3,
            fill: true,
            backgroundColor: gradient,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 8,
            pointBackgroundColor: '#d4af37',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1a1a1a',
            titleColor: '#d4af37',
            bodyColor: '#fff',
            displayColors: false,
            callbacks: {
              label: (context) => {
                const value = typeof context.parsed.y === 'number' ? context.parsed.y : 0;
                return ' ₹ ' + value.toLocaleString();
              },
            },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#888' } },
          y: {
            grid: { color: 'rgba(255,255,255,0.03)' },
            beginAtZero: true,
            ticks: { color: '#888', callback: (v) => '₹' + Number(v).toLocaleString() },
          },
        },
      },
    });
  }

  renderTopProductsChart() {
    if (!this.topProductsChartRef) return;
    const ctx = this.topProductsChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.topProductsData.map((p) => p.product_name),
        datasets: [
          {
            data: this.topProductsData.map((p) => p.total_qty),
            backgroundColor: 'rgba(212, 175, 55, 0.7)',
            hoverBackgroundColor: '#d4af37',
            borderRadius: 8,
            barThickness: 20,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { display: false, grid: { display: false } },
          y: {
            grid: { display: false },
            ticks: { color: '#fff', font: { size: 12, weight: 500 } },
          },
        },
      },
    });
  }
}