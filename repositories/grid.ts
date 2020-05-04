import { Square }from './square';
const SIZE_OF_SQUARES = 0.0018;

declare interface ICoordinates {
  topLeft?: Array<number>,
  topRight?: Array<number>,
  bottomRight?: Array<number>,
  bottomLeft?: Array<number>,
  length: number,
  width: number,
}

export class Grid {
    size: number;
    bigSquare: Square;
    grid: Array<Array<Square>>;
    postGrid: Array<Square>;
    constructor(activatedWindows: Array<Square>) {
        this.size = SIZE_OF_SQUARES;
        this.bigSquare = new Square({ latitude: 40.677162, longitude:-74.039831 }, { latitude: 40.889096,longitude:-73.894479 });
        this.grid = this.gridMaker(activatedWindows);
        this.postGrid = [];
    }

    gridMaker(activatedWindows: Array<Square>) {
        let grid: Array<Array<Square>> = [];
        let slidingWindow: Square = <Square>this.constructWindow();
        let { topLeft, topRight, bottomLeft, bottomRight } = slidingWindow;
        const { length, width } = slidingWindow.getDimensions();
        let i = 0;

        while(topLeft.latitude.toFixed(8) > this.bigSquare.bottomLeft.latitude.toFixed(8)) {
            grid.push([]);
            while(Math.abs(Number(topLeft.longitude.toFixed(8))) > Math.abs(Number(this.bigSquare.topRight.longitude.toFixed(8)))) {
                if(Math.abs(Number(topRight.longitude.toFixed(8))) < Math.abs(Number(this.bigSquare.topRight.longitude.toFixed(8)))) {
                    break;
                }

                let slidingWindowClone = slidingWindow.clone();
                slidingWindowClone.active = false; 

                for(let k = 0; k < activatedWindows.length; k++) {
                    if(activatedWindows[k].isEqual(slidingWindowClone)) {
                        slidingWindowClone.active = true;
                        slidingWindowClone.numOfCrimes = activatedWindows[k].numOfCrimes;
                        break;
                    }
                }

                grid[i].push(slidingWindowClone);
                topLeft.longitude += width;
                topRight.longitude += width;
                bottomLeft.longitude += width;
                bottomRight.longitude += width;
            }

            topLeft.longitude = bottomLeft.longitude = this.bigSquare.topLeft.longitude;
            topRight.longitude = bottomRight.longitude = topLeft.longitude + width;
            topLeft.latitude  = topRight.latitude  = topLeft.latitude - length;
            bottomLeft.latitude  = bottomRight.latitude  = bottomLeft.latitude - length;
            i++;

            if(bottomLeft.latitude < this.bigSquare.bottomLeft.latitude) {
                break; 
            }
        }
        return grid;
    }

    constructWindow(): Square {
        const { topLeft } = this.bigSquare;
        let p1 = { latitude: topLeft.latitude, longitude: topLeft.longitude };
        let p2 = { latitude: topLeft.latitude - this.size, longitude: topLeft.longitude + this.size };
        return new Square(p1, p2);
    }

    maximumRectangles(): void {
        let coor = this.maximumRectangle();
        while (coor.length != 0) {
            this.updateGrid(coor);
            coor = this.maximumRectangle();
        }
    }

    maximumRectangle(): ICoordinates {
        const m = this.grid.length, n = this.grid[0].length;
        let maxArea: number = 0;
        let coordinates = { length: 0, width: 0 };
        let histogram = new Array(n).fill(0)
        
        for(let r = 0; r < m; r++) {
            for(let c = 0; c < n; c++) {
                histogram[c] = (this.grid[r][c].active) ? histogram[c] + 1 : 0;
            }

            let histogramMaxArea: number;
            let start: number;
            let length: number;
            [ histogramMaxArea, start, length ] = this.maxSquareHistogram(histogram)
        
            if (histogramMaxArea > maxArea) {
                maxArea = histogramMaxArea
                let width = histogramMaxArea / length
                
                coordinates['topLeft'] = [r-width+1,start]
                coordinates['topRight'] = [r-width+1,start+length-1]
                coordinates['bottomRight'] = [r,start+length-1]
                coordinates['bottomLeft'] = [r,start]
                coordinates.length = length
                coordinates.width = width
            }     
        }
        return coordinates;
    }

    maxSquareHistogram(heights: Array<number>): Array<number> {
        let left = 0, right = 0, maxArea = 0;
        const n = heights.length;

        for(let i = 0; i < n; i++) {
            let runningMin = Number.MAX_VALUE;
            for(let j = i; j < n; j++) {
                runningMin = Math.min(runningMin,heights[j]);
                let currentArea = runningMin * (j - i + 1)
                if(currentArea > maxArea) {
                    left = i;
                    right = j;
                    maxArea = currentArea;
                }
            }
        }
        let l = right - left + 1
        return [maxArea,left,l];
    }

    updateGrid(coor: ICoordinates): void {
        const { topLeft, topRight, bottomLeft, bottomRight } = coor;
        let totalNumOfCrimes = 0;
        let count = 0;
        for(let r: number = <number>topLeft[0]; r <= <number>bottomLeft[0]; r++) {
            for(let c: number = <number>topLeft[1]; c <= <number>topRight[1]; c++) {
                this.grid[r][c].active = false
                totalNumOfCrimes += this.grid[r][c].numOfCrimes
                count++;
            }
        }

        const sqr = new Square(this.grid[topLeft[0]][topLeft[1]].topLeft, this.grid[bottomRight[0]][bottomRight[1]].bottomRight);
        sqr.numOfCrimes = totalNumOfCrimes/count;
        this.postGrid.push(sqr)        
    }
}
