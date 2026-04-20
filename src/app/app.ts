import { Component, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements AfterViewInit {
resetView() {
throw new Error('Method not implemented.');
}

 
  map: any;
buildings: any[] = [];
selectedBuilding: any;
searchTerm: any;

 constructor(private cd: ChangeDetectorRef,
  private zone: NgZone

 ) {}
  
ngAfterViewInit(): void {
  requestAnimationFrame(() => {

    this.map = L.map('map').setView([41.6176, 0.6200], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.loadBuildings(); 

  });
}
loadBuildings() {
  fetch('http://127.0.0.1:8000/buildings')
    .then(res => res.json())
    .then(data => {

      console.log("DATA:", data);

      this.buildings = data;
      this.selectedBuilding = data[0];

      this.renderMarkers();

      this.map.flyToBounds(
        this.buildings.map(b => [b.lat, b.lng])
      );

      this.cd.detectChanges();

    })
    .catch(err => console.error(err));
}

  renderMarkers() {

    this.buildings.forEach(b => {

      const marker = L.circleMarker([b.lat, b.lng], {
  radius: b.energy / 200, 
  color: this.getColor(b.energy),
  fillOpacity: 0.7
}).addTo(this.map) 
        .bindPopup(`
          <strong>${b.name}</strong><br>
          Energy: ${b.energy} kWh
        `);

     marker.on('click', () => {
  this.zone.run(() => {
    this.focusBuilding(b);
  });
});
    });

  }
 
 getColor(energy: number): string {
  if (energy > 1000) return 'red';
  if (energy > 700) return 'orange';
  return 'blue';
}
  focusBuilding(b: any) {

     this.selectedBuilding = b;
       this.cd.detectChanges();

    this.map.flyTo([b.lat, b.lng], 15, {
      duration: 1.2
    });

    L.popup()
      .setLatLng([b.lat, b.lng])
      .setContent(`
        <strong>${b.name}</strong><br>
        Energy: ${b.energy} kWh
      `)
      .openOn(this.map);
  }

}