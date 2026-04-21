import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private ws!: WebSocket;

  // estado reactivo (signals)
  buildings = signal<any[]>([]);

  connect() {
    this.ws = new WebSocket('wss://energy-api-c6yp.onrender.com/ws');

    this.ws.onopen = () => {
      console.log('WS connected');
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('REALTIME:', data);

      this.buildings.set(data); 
    };

    this.ws.onerror = (err) => {
      console.error('WS error:', err);
    };

    this.ws.onclose = () => {
      console.log('WS closed');
    };
  }
}