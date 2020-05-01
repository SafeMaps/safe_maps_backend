import { IGeoCoordinates } from "./routes";


declare interface IDimensions {
  length: number,
  width: number,
}

declare interface ISquareClone {
  topLeft: IGeoCoordinates,
  topRight: IGeoCoordinates,
  bottomRight: IGeoCoordinates,
  bottomLeft: IGeoCoordinates,
}

export class Square {
  public topLeft: IGeoCoordinates;
  public topRight: IGeoCoordinates;
  public bottomRight: IGeoCoordinates;
  public bottomLeft: IGeoCoordinates;
  public numOfCrimes?: number | undefined;

  /**
   * returns a square computed from two opposing points: (topLeft, bottomRight) and (topRight, bottomLeft) as:
   * @param Pi (topLeft, bottomRight) 
   * @param Pj (topRight, bottomLeft)
   */
  public constructor(Pi: IGeoCoordinates, Pj: IGeoCoordinates) {
    this.topLeft = { latitude: Math.max(Pi.latitude, Pj.latitude), longitude: Math.min(Pi.longitude, Pj.longitude) };
    this.topRight = { latitude: Math.max(Pi.latitude, Pj.latitude), longitude: Math.max(Pi.longitude, Pj.longitude) };
    this.bottomRight = { latitude: Math.min(Pi.latitude, Pj.latitude), longitude: Math.max(Pi.longitude, Pj.longitude) };
    this.bottomLeft = { latitude: Math.min(Pi.latitude, Pj.latitude), longitude: Math.min(Pi.longitude, Pj.longitude) };
  }

  /**
   * returns the dimensions (length and width) of the square
   */
  private getDimensions(): IDimensions {
    return <IDimensions>{
      length: this.topLeft.latitude - this.bottomLeft.latitude,
      width: Math.abs(this.topLeft.longitude) - Math.abs(this.topRight.longitude)
    }
  }

  /**
   * returns the dimensions of the square in meters
   * @returns {IDimensions}
   */
  public getDimensionsInMeters(): IDimensions {
      let { length, width } = this.getDimensions();

      function measure(lat1: number, lon1: number, lat2: number, lon2: number): number {
        var R = 6378.137; // Radius of earth in KM
        var dLat: number = <number>lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
        var dLon: number = <number>lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
        var a: number = <number>Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
        var c: number = <number>2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d: number = <number>R * c;
        return <number>d * 1000;
      }

      length = Number(measure(0, 0, 0, length).toFixed(2));
      width  = Number(measure(0, 0, 0, width).toFixed(2));
      return <IDimensions>{ length, width };
  }

  /**
   * returns a copy of the square
   * @returns {Square}
   */
  clone(): ISquareClone {
      return <ISquareClone>{
        topLeft: {...this.topLeft},
        topRight: {...this.topRight},
        bottomLeft: {...this.bottomLeft},
        bottomRight: {...this.bottomRight}
      }
  }
}
