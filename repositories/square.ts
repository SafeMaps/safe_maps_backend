import { IGeoCoordinates } from "./routes";


declare interface IDimensions {
  length: number,
  width: number,
}

export class Square {
  public topLeft: IGeoCoordinates;
  public topRight: IGeoCoordinates;
  public bottomRight: IGeoCoordinates;
  public bottomLeft: IGeoCoordinates;
  public numOfCrimes?: number | undefined;
  public active?: boolean | undefined;

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
  public getDimensions(): IDimensions {
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

  isEqual(window: Square): Boolean {
    const topLeftCheck = this.topLeft.latitude == window.topLeft.latitude && this.topLeft.longitude == window.topLeft.longitude;
    const topRightCheck = this.topRight.latitude == window.topRight.latitude && this.topRight.longitude == window.topRight.longitude
    const bottomLeftCheck = this.bottomLeft.latitude == window.bottomLeft.latitude && this.bottomLeft.longitude == window.bottomLeft.longitude
    const bottomRightCheck = this.bottomRight.latitude == window.bottomRight.latitude && this.bottomRight.longitude == window.bottomRight.longitude
    return (topLeftCheck && topRightCheck && bottomLeftCheck && bottomRightCheck);
}

  /**
   * returns a copy of the square
   * @returns {Square}
   */
  clone(): Square {
      return (new Square(this.topLeft,this.bottomRight));
  }
}
