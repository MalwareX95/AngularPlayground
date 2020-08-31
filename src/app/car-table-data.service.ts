import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface Car {
  vin: string,
  brand: string,
  year: number,
  color: string,
}

@Injectable({
  providedIn: 'root'
})
export class CarTableDataService {
  constructor(
    private http: HttpClient,
  ) {
  }

  getAllData(): Observable<Car[]> {
    return this.http.get<Car[]>('./assets/data/cars-large.json');
  }
}
