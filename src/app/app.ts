import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import Chart from 'chart.js/auto';
import { ApiService } from './services/api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements AfterViewInit {

  map: any;
  markersLayer = L.layerGroup();
  chart: any;

  buildings: any[] = [];
  selectedBuilding: any = null;
  searchTerm: string = '';
  loading: boolean = false;

  
  newName = '';
  newLat: number | null = null;
  newLng: number | null = null;
  newEnergy: number | null = null;
demoBuildings = [
  { name: "Hospital Lleida", lat: 41.615, lng: 0.63, energy: 1200 },
  { name: "School Lleida", lat: 41.62, lng: 0.61, energy: 800 },
  { name: "Library Lleida", lat: 41.618, lng: 0.625, energy: 500 },
  { name: "University Campus", lat: 41.61, lng: 0.62, energy: 1500 },
  { name: "City Hall", lat: 41.617, lng: 0.621, energy: 900 },
  { name: "Sports Center", lat: 41.619, lng: 0.635, energy: 700 },
  { name: "Museum", lat: 41.616, lng: 0.628, energy: 650 },
  { name: "Train Station", lat: 41.613, lng: 0.64, energy: 1100 },
  { name: "Mall Center", lat: 41.62, lng: 0.615, energy: 1300 },
  { name: "Office Tower", lat: 41.618, lng: 0.618, energy: 1400 }
];
  constructor(private api: ApiService) {}

  ngAfterViewInit() {
    this.map = L.map('map').setView([41.6176, 0.62], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
      .addTo(this.map);

    this.markersLayer.addTo(this.map);

    this.loadBuildings();
  }


loadBuildings() {
  this.loading = true;

  this.api.getBuildings().then(data => {

    console.log("DATA:", data);

   
    if (!data || data.length === 0) {
      console.log("Using demo buildings");
      this.buildings = this.demoBuildings;
    } else {
      this.buildings = data;
    }

    this.selectedBuilding = this.buildings[0];

    this.updateMap();
    this.updateChart();

    this.loading = false;
  });
}

updateMap() {
  const data = this.filteredBuildings();

  this.markersLayer.clearLayers();

  if (!data || data.length === 0) return;

  data.forEach(b => {
    if (!b.lat || !b.lng) return;

    const marker = L.circleMarker([b.lat, b.lng], {
      radius: b.energy / 200,
      color: this.getColor(b.energy),
      fillOpacity: 0.7
    }).bindPopup(`${b.name} (${b.energy})`);

    this.markersLayer.addLayer(marker);
  });
}


updateChart() {
  const data = this.filteredBuildings();

  if (!data || data.length === 0) return;

  const labels = data.map(b => b.name);
  const values = data.map(b => b.energy);

  if (!this.chart) {
    this.chart = new Chart('canvas', {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Energy',
          data: values
        }]
      }
    });
  } else {
    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = values;
    this.chart.update();
  }
}


focusBuilding(b: any) {
  this.selectedBuilding = b;

  // mover mapa
  if (this.map) {
    this.map.flyTo([b.lat, b.lng], 15, {
      duration: 1.2
    });
  }
}

getBuildings() {
  return fetch(`${environment.apiUrl}/buildings`)
    .then(r => r.json());
}

 
  filteredBuildings() {
    return this.buildings.filter(b =>
      b.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  
  addBuilding() {
    if (!this.newName || !this.newLat || !this.newLng || !this.newEnergy) return;

    this.api.createBuilding({
      name: this.newName,
      lat: this.newLat,
      lng: this.newLng,
      energy: this.newEnergy
    }).then(() => {
      this.resetForm();
      this.loadBuildings();
    });
  }

  
  deleteBuilding(id: number) {
    this.api.deleteBuilding(id).then(() => {
      this.loadBuildings();
    });
  }

  
  getColor(e: number) {
    if (e > 1000) return 'red';
    if (e > 700) return 'orange';
    return 'blue';
  }

  resetForm() {
    this.newName = '';
    this.newLat = null;
    this.newLng = null;
    this.newEnergy = null;
  }
  getTotalEnergy() {
  return this.buildings.reduce((sum, b) => sum + b.energy, 0);
}

getAvgEnergy() {
  return this.buildings.length
    ? this.getTotalEnergy() / this.buildings.length
    : 0;
}

getMaxEnergy() {
  return Math.max(...this.buildings.map(b => b.energy));
}
}