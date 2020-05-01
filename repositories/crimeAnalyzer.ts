import { IGeoCoordinates } from './routes';
import { Square } from './square';

interface IThreshold {
  readonly [method: string]: number,
}

declare interface IDBSubSquares {
  square_id?: number,
  upper_left_lat: number,
  upper_left_long: number,
  lower_right_lat: number,
  lower_right_long: number,
  number_of_crimes: number,
}

const GRID_SQUARE_SIZE: number = 0.0018;

export class CrimeAnalyzer {
  public constructor(private readonly db: any) {};
  /**
   * returns the squares within the area that is enclosed between the computed area with 
   * offsets between the source and destination.
   * @param {Square} queriedSquare the area between source and destination with offsets.
   * @param {string} dayOfWeek the day of the week we are analyzing the crime for.
   * @returns {Promise<Array<IDBSubSquares> | Error>}
   */
  private async getQueriedSubSquares(queriedSquare: Square, dayOfWeek: string): Promise<Array<IDBSubSquares>> {
    const { topLeft, topRight, bottomLeft } = queriedSquare;
    const restrictionLat = `BETWEEN ${queriedSquare.bottomLeft.latitude} AND ${queriedSquare.topLeft.latitude}`;
    const restrictionLong = `BETWEEN ${queriedSquare.topLeft.longitude} AND ${queriedSquare.topRight.longitude}`

    let q = `SELECT * FROM grid_${dayOfWeek.toLowerCase()} 
              WHERE upper_left_lat ${restrictionLat} 
                AND upper_left_long ${restrictionLong} 
                AND lower_right_lat ${restrictionLat} 
                AND lower_right_long ${restrictionLong}`;

    try {
        const queryArguments =  ['grid_' + dayOfWeek, bottomLeft.latitude, topLeft.latitude, topLeft.longitude, topRight.longitude];
        return <Promise<Array<IDBSubSquares>>>await this.db.any(q, [true]);
    } 
    catch(e) {
        return e;
    }
  }

  /**
   * returns the square defining the area in between the source and destination 
   * adjusted with an offset (padding) of 4 boxes (half a mile) radius for the queried square.
   * @param {Square} bigSquare the area enclosed between source and destination
   * @returns {Square}
   */
  private getQueriedSquareWithOffset(bigSquare: Square): Square {
    const biasedBoxes = 4;
    const gridSquareSize = GRID_SQUARE_SIZE;
    return new Square(
        {
            latitude:  bigSquare.bottomLeft.latitude-(biasedBoxes+1)*gridSquareSize, 
            longitude: bigSquare.topLeft.longitude-(biasedBoxes+1)*gridSquareSize
        },
        {
            latitude:  bigSquare.topRight.latitude+(biasedBoxes+1)*gridSquareSize, 
            longitude: bigSquare.topRight.longitude+(biasedBoxes+1)*gridSquareSize
        });
  }

  /**  
   * returns the minimum Average number of crimes per square based on weekday to activate sliding window
   * @param {string} dayOfWeek
   * @returns {number}
   */
  private getThreshold(dayOfWeek: string): number {
    const threshold: IThreshold = {
        all: 911,
        monday: 121,
        tuesday: 132,
        wednesday: 137,
        thursday: 139,
        friday: 150,
        saturday: 138,
        sunday: 117
    }
    return <number>threshold[dayOfWeek];
  }

  /**
   * returns the windows that pass the threshold value
   * @param {Array<Square>} grid
   * @param {string} dayOfWeek the day of the week we are analyzing the crime for.
   */
  private getActivatedWindows(grid: Array<Square>, dayOfWeek: string): Array<Square> {
    const threshold = this.getThreshold(dayOfWeek);
    const activatedWindows = grid.filter(square => square.numOfCrimes >= threshold);
    return <Array<Square>>activatedWindows;
  }

  /**
   * returns the window with the most crimes
   * @param {Square} w1 
   * @param {Square} w2 
   * @returns {number}
   */
  private compareWindows(w1: Square, w2: Square): number {
    if(w1.numOfCrimes > w2.numOfCrimes) return <number>1
    if(w1.numOfCrimes < w2.numOfCrimes) return <number>-1
    return <number>0
  }

  /**
   * Takes database squares and cast them using 'Square' module
   * @param {Array<IDBSubSquares>} squares 
   * @returns {Array<Square>}
   */
  private castSquares(squares: Array<IDBSubSquares>): Array<Square> {
    let grid: Array<Square> = [];
    squares.forEach(square => {
        let Pi = { latitude: square.upper_left_lat , longitude: square.upper_left_long };
        let Pj = { latitude: square.lower_right_lat, longitude: square.lower_right_long };
        let sqrObj = new Square(Pi, Pj);
        sqrObj.numOfCrimes = square.number_of_crimes;
        grid.push(sqrObj);
    });
    return <Array<Square>>grid;
  }

  /**
   * computes and returns the areas to avoid.
   * @param source the current location
   * @param destination the location to go to
   * @param {string} dayOfWeek 
   * @returns {Promise<Array<Square>>}
   */
  public async getAreasToAvoid(source: IGeoCoordinates, destination: IGeoCoordinates, dayOfWeek: string): Promise<Array<Square>> {
    const bigSquare = new Square(source, destination);
    const queriedSquare = this.getQueriedSquareWithOffset(bigSquare);
    const squares = await this.getQueriedSubSquares(queriedSquare, dayOfWeek);
    const grid = this.castSquares(squares);
    return this.getActivatedWindows(grid, dayOfWeek).sort(this.compareWindows).reverse().slice(0,20);
  }
}
