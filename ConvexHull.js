class ConvexHull {

    constructor() {
        this.points = [];
        this.left;
        this.right;
    }

    generatePoints(n, w, h) {
        for (let i = 0; i < n; i++) {
            this.points.push(createVector(w / 8 + random() * (3 * w / 4), h / 8 + random() * (3 * h / 4)));
        }
        this.points = [
            createVector(117.26619935034265, 389.0061390155947),
            createVector(120.69221916765201, 96.68016953679835),
            createVector(124.16054907376757, 330.764053557565),
            createVector(142.01135788907902, 338.99091823753406),
            createVector(313.5525735639671, 127.65974897591565),
            createVector(314.85005402405034, 240.21167187808607),
            createVector(319.4072693378745, 196.27012795606436),
            createVector(360.08926879425513, 449.75512688006444),
            createVector(390.9358853900112, 450.42540011701266),
            createVector(505.45127045630545, 425.0332464782726)];
        return;
    }

    

    showPoints() {
        this.points.forEach((p) => {
            point(p.x, p.y);
        });
    }


    partition(arr, left, right, pivotIndex) {
        const pivotValue = arr[pivotIndex].x;
        [arr[pivotIndex], arr[right]] = [arr[right], arr[pivotIndex]];
        let storeIndex = left;
        for (let i = left; i < right; i++) {
            if (arr[i].x < pivotValue) {
                [arr[i], arr[storeIndex]] = [arr[storeIndex], arr[i]];
                storeIndex++;
            }
        }
        [arr[right], arr[storeIndex]] = [arr[storeIndex], arr[right]];
        return storeIndex;
    }

    select(arr, left, right, k) {
        while (true) {
            if (left === right) {
                return arr[left];
            }
            let pivotIndex = Math.floor((left + right) / 2);
            pivotIndex = this.partition(arr, left, right, pivotIndex);
            if (k === pivotIndex) {
                return arr[k];
            } else if (k < pivotIndex) {
                right = pivotIndex - 1;
            } else {
                left = pivotIndex + 1;
            }
        }
    }

    //Median of medians
    findMedianOfPairs(P) {
        const k = Math.floor(P.length / 2);
        const medianPoint = this.select(P, 0, P.length - 1, k);
        return medianPoint;
    }

    mirror(P) {
        let newP = []
        for (let p of P) {
            p.x *= -1;
            p.y *= -1;
            newP.push([p.x, p.y]);
        }
        return newP;
    }

    KPS(P) {
        let upper = this.UpperHull(P);
        let lower = this.mirror(this.UpperHull(this.mirror(P)));
        return [...upper, ...lower];
    }

    UpperHull(P) {
        console.log("===Upper Hull Points")
        console.log(P);
        console.log("==End Upper")
        let pmin = P[0];
        let pmax = P[0];
        for (let i = 1; i < P.length; i++) {
            if (P[i].x < pmin.x || (P[i].x == pmin.x)) {
                pmin = P[i];
            }
            if (P[i].x > pmax.x || (P[i].x == pmax.x)) {
                pmax = P[i];
            }
        }

        let pumin = pmin;
        let pumax = pmax;
        for (let i = 0; i < P.length; i++) {
            if (P[i].x == pmin.x && P[i].y > pumin.y) {
                pumin = P[i];
            }
            if (P[i].x == pmax.x && P[i].y > pumax.y) {
                pumax = P[i];
            }
        }
        return this.connect(pumin, pumax, P);
    }

    findMedian(a) {
        let sortedArray = a.slice();
        let n = sortedArray.length;
        
        sortedArray.sort((a, b) => a - b);
        
        if (n % 2 !== 0)
            return sortedArray[Math.floor(n / 2)];
        return (sortedArray[Math.floor((n - 1) / 2)] + sortedArray[Math.floor(n / 2)]) / 2;
    }

    makeSet(arr){
        let st = new Set();
        for(let a of arr){
            st.add(a);
        }
        return st;
    }

    bridge(P, verticalLine) {
        let candidates = new Set();

        if (P.length === 2) {
            this.sleep(100);
            if (P[0].x < P[1].x) {
                return [P[0], P[1]];
            } else {
                return [P[1], P[0]];
            }
        }
        let pairs = [];
        

        let modify = this.makeSet(P);
        while (modify.size >= 2) {
            let [r1] = modify;
            modify.delete(r1);
            let [r2] = modify;
            modify.delete(r2);
            let tmp = [r1, r2];
            tmp.sort((a, b) => {
                if (a.x !== b.x) {
                    return a.x - b.x;
                }
                return a.y - b.y;
            });
            for(let t of tmp){
                pairs.push(tmp);
            }
        }

        if (modify.size === 1) {
            let [first] = modify;
            candidates.add(first);
        }

        let slopes = [];
        pairs.forEach(p => {
            let pi = p[0];
            let pj = p[1];
            if (pi.x === pj.x) {
                let pairArray = [pi, pj];
                pairs = removeItemOnce(pi);
                pairs = removeItemOnce(pj);
                if (pi.y > pj.y) {
                    candidates.add(pi);
                } else {
                    candidates.add(pj);
                }
            } else {
                let s = (pi.y - pj.y) / (pi.x - pj.x);
                slopes.push(s);
            }
        });

        
        // Check this
        let medianIdx = Math.floor(slopes.length / 2);
        if (slopes.length % 2 == 0) {
            medianIdx -= 1;
        }
        // Replace with quickselect later
        let medianSlope = this.findMedian(slopes);
        let small = pairs.reduce((acc, pair, i) => {
            if (slopes[i] < medianSlope) {
                acc.add(pair);
            }
            return acc;
        }, new Set());

        let equal = pairs.reduce((acc, pair, i) => {
            if (slopes[i] === medianSlope) {
                acc.add(pair);
            }
            return acc;
        }, new Set());

        let large = pairs.reduce((acc, pair, i) => {
            if (slopes[i] > medianSlope) {
                acc.add(pair);
            }
            return acc;
        }, new Set());

        let maxSlope = -Infinity;
        
        for (let p of P) {
            let s = p.y - medianSlope * p.x;
            if (maxSlope < s) maxSlope = s;
        }

        let maxSet = new Set();
        for (let p of P) {
            if (p.y - medianSlope * p.x === maxSlope) {
                maxSet.add(p);
            }
        }
        
        let maxArray = Array.from(maxSet);



        let left = maxArray[0];
        let right = maxArray[0];

        for(let point of maxArray){
            if(left.x > point.x) left = point;
            else if(left.x === point.x && left.y > point.y){
                left = point;
            }
            if(right.x < point.x) right = point;
            else if(right.x === point.x && right.y < point.y){
                right = point;
            }
        }

        if (left.x <= verticalLine && right.x > verticalLine) {
            return [left, right];
        }


        if (right.x <= verticalLine) {
            large.forEach(pair => {
                candidates.add(pair[1]);
            });
            equal.forEach(pair => {
                candidates.add(pair[1]);
            });
            small.forEach(pair => {
                candidates.add(pair[1]);
            });
        }

        if (left.x > verticalLine) {
            small.forEach(pair => {
                candidates.add(pair[0]);
            });
            equal.forEach(pair => {
                candidates.add(pair[0]);
            });
            large.forEach(pair => {
                candidates.add(pair[0]);
            });
        }

        return this.bridge([...candidates], verticalLine);
    }

    connect(lower, upper, P) {
        
        console.log("===Connect Points, lower, upper")
        console.log(P);
        console.log(lower);
        console.log(upper);
        console.log("==fgh")

        if (lower === upper) return [lower];

        let [left, right] = this.bridge(P, this.findMedianOfPairs(P).x);     
        let pointsLeft = [];
        let pointsRight = [];
        for(let p of P){

            if(p.x < left.x) pointsLeft.push(p);
            if(p.x > right.x) pointsRight.push(p);
        }

        return [...this.connect(lower, left, pointsLeft), ...this.connect(right, upper, pointsRight)]
    }

    sleep(ms) {
        return new Promise(r => setTimeout(r, ms));
    }


    // left of a line
    isLeftOfLine(point, p1, p2) {
        let crossProduct = (p2.x - p1.x) * (point.y - p1.y) - (p2.y - p1.y) * (point.x - p1.x);
        return crossProduct > 0;
    }

    // right of a line
    isRightOfLine(point, p1, p2) {
        let crossProduct = (p2.x - p1.x) * (point.y - p1.y) - (p2.y - p1.y) * (point.x - p1.x);
        return crossProduct < 0;
    }


    slowConvexHull(P) {
        P = Array.from(P);
        let E = new Set([]);
        for (let p of P) {
            for (let q of P) {
                if (p != q) {
                    let valid = true;
                    for (let r of P) {
                        if (r != p && r != q) {
                            if (
                                (q.x - p.x) * (r.y - p.y) -
                                (q.y - p.y) * (r.x - p.x) >
                                0
                            ) {
                                valid = false;
                            }
                        }
                    }
                    if (valid) {
                        E.add([p, q]);
                    }
                }
            }
        }
        return E;
    }

    showEdges(E) {
        E = Array.from(E);
        for (let e of E) {
            line(e[0].x, e[0].y, e[1].x, e[1].y);
        }
    }
}

function getRndmFromSet(set) {
    var rndm = Math.floor(Math.random() * set.length);
    return set[rndm];
}

function getFirstItemOfSet(set) {
    return [...set][0];
}

function removeItemOnce(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
  }