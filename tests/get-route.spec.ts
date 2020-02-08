'use strict'

const exp = require('chai').expect
import { RouteRepository, IRequestGeoCoordinates } from '../repositories/routes';
import config from '../config';
import { db } from '../app';

describe('getRoute() successfully obtains route coordinates for a given source and destination', () => {
    it('should return an array of objects containing geolocation coordinates (i.e. latitude and longitude)', async () => {
      const routeRepository = new RouteRepository(db, config.secret)

      const mockData = {
        source: {
          latitude: "52.5",
          longitude: "13.4",
        },
        destination: {
          latitude: "52.5",
          longitude: "13.45",
        }
      }

      const source: IRequestGeoCoordinates = mockData.source;
      const destination: IRequestGeoCoordinates = mockData.destination;

      const response = await routeRepository.getRoute(source, destination);
      exp(response).to.be.an('array').that.is.not.empty
    })
})
