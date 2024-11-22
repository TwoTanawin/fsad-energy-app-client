// src/app/dashboard/dashboard.component.ts
import {
  Chart,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  LineController,
} from 'chart.js';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2'; // Import SweetAlert2

Chart.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  LineController
);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private postUrl = 'http://localhost:3000/devices/data';
  sentData: any[] = [];
  timer: any;
  isSending = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeCharts();
  }

  ngOnDestroy() {
    this.stopSendingData();
  }

  generateData() {
    const random = Math.random;
    const addNoise = (value: number) =>
      value + value * 0.02 * (random() - 0.5) * 2;

    return {
      isActive: true,
      voltage: addNoise(230.0),
      current: addNoise(10.0),
      power: addNoise(230.0 * 10.0 * 0.95),
      energy: addNoise(100.0),
      frequency: addNoise(50.0),
      PF: addNoise(0.95),
      electricPrice: addNoise(0.15),
    };
  }

  sendData() {
    const token = this.authService.getToken();
    if (!token) {
      // Show error alert if token is missing
      Swal.fire({
        icon: 'error',
        title: 'Token Missing',
        text: 'Please log in again to generate a valid token.',
        confirmButtonText: 'Go to Login',
      }).then(() => {
        this.router.navigate(['/auth']);
      });
      return;
    }

    const data = { device: this.generateData() };

    this.http.post(this.postUrl, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }).subscribe(
      (response: any) => {
        const deviceData = response.device || data.device;
        this.sentData.push(deviceData);

        if (this.sentData.length > 10) this.sentData.shift();

        this.updateCharts();
      },
      (error) => {
        // Show error alert if HTTP request fails
        Swal.fire({
          icon: 'error',
          title: 'Failed to Send Data',
          text: error.error?.message || 'An unexpected error occurred.',
          confirmButtonText: 'Retry',
        });
      }
    );
  }

  startSendingData() {
    this.timer = setInterval(() => this.sendData(), 3000);
    this.isSending = true;

    // Show a confirmation alert that data generation has started
    Swal.fire({
      icon: 'info',
      title: 'Data Generation Started',
      text: 'Data is being sent every 3 seconds.',
      timer: 2000,
      showConfirmButton: false,
    });
  }

  stopSendingData() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isSending = false;

    // Show a confirmation alert that data generation has stopped
    Swal.fire({
      icon: 'info',
      title: 'Data Generation Stopped',
      text: 'No more data will be sent.',
      timer: 2000,
      showConfirmButton: false,
    });
  }

  calculateAverage(key: string): number {
    if (this.sentData.length === 0) return 0;
    return this.sentData.reduce((sum, data) => sum + (data[key] || 0), 0) / this.sentData.length;
  }

  initializeCharts() {
    this.createChart('lineChartVoltage', 'Voltage Over Index', 'voltage', 'rgb(75, 192, 192)');
    this.createChart('lineChartPower', 'Power Over Index', 'power', 'rgb(192, 75, 75)');
    this.createChart('lineChartCurrent', 'Current Over Index', 'current', 'rgb(75, 75, 192)');
  }

  createChart(elementId: string, title: string, key: string, color: string) {
    const ctx = document.getElementById(elementId) as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: title,
            data: [],
            borderColor: color,
            tension: 0.2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
        },
        scales: {
          x: { title: { display: true, text: 'Data Index' } },
          y: { title: { display: true, text: key } },
        },
      },
    });
  }

  updateCharts() {
    const keys = ['voltage', 'power', 'current'];
    const chartIds = ['lineChartVoltage', 'lineChartPower', 'lineChartCurrent'];

    chartIds.forEach((chartId, index) => {
      const key = keys[index];
      const ctx = document.getElementById(chartId) as HTMLCanvasElement;
      const chart = Chart.getChart(ctx);

      if (chart) {
        chart.data.labels = this.sentData.map((_, idx) => idx.toString());
        chart.data.datasets[0].data = this.sentData.map(data => data[key]);
        chart.update();
      }
    });
  }

  backToTokenInput() {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You will be redirected to the login page.',
      showCancelButton: true,
      confirmButtonText: 'Yes, go back',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/auth']);
      }
    });
  }
}
