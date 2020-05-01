/**
* @fileOverview Controllers to handle user-account and auth related endpoints
* @author Patrick Vanegas
* @version 1.0.0
*/
import { Request, Response } from 'express';
import { RouteRepository } from '../repositories';
import { IGeoCoordinates, IReturnRouteAndAreasToAvoid } from '../repositories/routes';
import { celebrate, Joi } from 'celebrate';

export = RouteHandler;

/**
 * Handles enpoints that interact with routing services
 * @namespace RouteHandler
 */
namespace RouteHandler {
  /**
   * Used to validate whether the source and destination are objects and contain two keys
   * for the latitude and longitude in string format.
   */
  export const coordinatesValidation = celebrate({
    body: Joi.object({
      source: Joi.object({
        latitude: Joi.number(),
        longitude: Joi.number(),
      }),
      destination: Joi.object({
        latitude: Joi.number(),
        longitude: Joi.number(),
      }),
    }),
  });

  /**
   * Obtains a route from the HERE Maps API given source and destination objects containing the latitude
   * and longitude of each geoposition.
   * @param {RouteRepository} routeRepository the repository that holds methods to interact with routing
   */
  export function getRoute(routeRepository: RouteRepository) : Function {
    return async function (req: Request, res: Response) : Promise<void> {
      const source: IGeoCoordinates = <IGeoCoordinates>req.body.source;
      const destination: IGeoCoordinates = <IGeoCoordinates>req.body.destination;

      try {
        const routeInformation: IReturnRouteAndAreasToAvoid = await routeRepository.getRoute(source, destination);
        if (routeInformation) {
          res.status(200).json(routeInformation);
          return;
        }
        res.sendStatus(400);
      } catch (error) {
        console.log(error)
        res.sendStatus(500);
      }
    }
  }
}
