import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  baseUrl = environment.apiUrl;

  
  async getBuildings() {
    const r = await fetch(`${this.baseUrl}/buildings`);
      return await r.json();
  }

  
  async createBuilding(b: any) {
    const r = await fetch(`${this.baseUrl}/buildings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(b)
      });
      console.log("API URL:", this.baseUrl);
      return await r.json();
  }

  
  async updateBuilding(id: number, b: any) {
    const r = await fetch(`${this.baseUrl}/buildings/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(b)
      });
      return await r.json();
  }

  
  async deleteBuilding(id: number) {
    const r = await fetch(`${this.baseUrl}/buildings/${id}`, {
          method: 'DELETE'
      });
      return await r.json();
  }
}