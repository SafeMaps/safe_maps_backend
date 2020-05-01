/**
 * @fileOverview Repository for routing actions.
 * @author Patrick Vanegas
 * @version 1.0.1
 */
import axios from 'axios';
import * as dotenv from "dotenv";
import { CrimeAnalyzer } from './crimeAnalyzer';
import { Square } from './square';

dotenv.config();

export interface IGeoCoordinates {
    latitude: number,
    longitude: number,
}

export interface IAreasToAvoidGeoCoordinates {
  readonly latitude: number,
  readonly longitude: number,
}

export declare interface IReturnGeoCoordinates {
  readonly latitude: number,
  readonly longitude: number,
}

export declare interface IReturnRouteAndAreasToAvoid {
  readonly areasToAvoid: Array<IAreasToAvoid> | undefined,
  readonly routeCoordinates: Array<IReturnGeoCoordinates>
}

declare interface IAreasToAvoid {
  readonly topLeft: IAreasToAvoidGeoCoordinates,
  readonly bottomRight: IAreasToAvoidGeoCoordinates,
}


const { SAFE_MAPS_API_KEY } = process.env;

export class RouteRepository {
  crimeAnalyzer: CrimeAnalyzer;
  week: Array<string>;

  public constructor(private readonly db: any, private readonly secret: number) {
    this.crimeAnalyzer = new CrimeAnalyzer(this.db);
    this.week = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  };

  /**
   * Obtains a desired route from the HERE Maps API given source and destination geolocation objects.
   * @param {IRequestGeoCoordinates} source An object containing the geoposition of the source address
   * @param {IRequestGeoCoordinates} destination An object containing the geoposition of the destination address
   * @param {Array<IAreasToAvoid>} areasToAvoid An array containing the rectangular regions that the routing API should avoid
   * @returns {Array<IReturnGeoCoordinates>} An Array of coordinates that define the obtained route itself
   */
  public async getRoute(source: IGeoCoordinates, destination: IGeoCoordinates): Promise<IReturnRouteAndAreasToAvoid> {
    const areasToAvoid: Array<Square> = await this.crimeAnalyzer.getAreasToAvoid(source, destination, this.week[new Date().getUTCDay()]);
    const sourceLatitude: number = <number>source.latitude;
    const sourceLongitude: number = <number>source.longitude;
    const destinationLatitude: number = <number>destination.latitude;
    const destinationLongitude: number = <number>destination.longitude;

    const routeCoordinates: Array<IReturnGeoCoordinates> = [];
    let routeEndpoint: string = <string>`https://route.ls.hereapi.com/routing/7.2/calculateroute.json?apiKey=${SAFE_MAPS_API_KEY}&waypoint0=geo!${sourceLatitude},${sourceLongitude}&waypoint1=geo!${destinationLatitude},${destinationLongitude}&mode=fastest;bicycle;traffic:disabled&legAttributes=shape`;

    if (areasToAvoid !== undefined) {
      routeEndpoint += '&avoidareas=';

      if (areasToAvoid.length >= 1) {
        areasToAvoid.forEach(({ topLeft, bottomRight } , index) => {
          routeEndpoint += `${topLeft.latitude},${topLeft.longitude};${bottomRight.latitude},${bottomRight.longitude}${index !== areasToAvoid.length - 1 ? '!' : ""}`;
        });
      }
    }

    try {
      const res = await axios.get(routeEndpoint);
      res.data.response.route[0].leg[0].shape.map((m: { split: (arg0: string) => string[]; }) => {
          const latlong: Array<string> = (m as string).split(',');
          const lat: number = <number>parseFloat(latlong[0]);
          const long: number = <number>parseFloat(latlong[1]);
          routeCoordinates.push({ latitude: lat, longitude: long });
      });
    } catch (error) {
      return error;
    } finally {
      return {
        areasToAvoid,
        routeCoordinates,
      }
    }
  }
}
