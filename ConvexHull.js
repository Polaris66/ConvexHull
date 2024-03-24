class ConvexHull {

    constructor() {
        this.points = [];
        this.hull = [];
        this.flag = false;
        // We keep simulating by iterating through the instructions here
        this.simulation = [];
    }

    generatePoints(n, w, h) {
        for (let i = 0; i < n; i++) {
            this.points.push(createVector(w / 8 + random() * (3 * w / 4), h / 8 + random() * (3 * h / 4)));
        }
        this.showPoints(this.points);
        return;
    }

    // Slow Convex Hull

    slowConvexHull(P) {
        let E = [];
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
                        E.push([p, q]);
                    }
                }
            }
        }
        return E;
    }

    // Jarvis

    jarvisAlgorithm(P) {
        let hull = [];

        let n = P.length;
        let p0 = 0;
        for (let i = 1; i < n; i++) {
            if (P[i].x < P[p0].x) {
                p0 = i;
            }
        }

        let p = p0;
        let q;
        do {
            hull.push(P[p]);

            q = (p + 1) % n;

            for (let i = 0; i < n; i++) {
                if (this.orientation(P[p], P[i], P[q])) {
                    q = i;
                }
            }

            p = q;
        }
        while (p != p0);

        return hull;
    }

    orientation(p1, p2, p3) {
        let val = (p2.y - p1.y) * (p3.x - p2.x) - (p2.x - p1.x) * (p3.y - p2.y);

        return (val > 0); // clockwise or anti clockwise
    }

    // Code for showing
    showEdges(E) {
        for (let e of E) {
            line(e[0].x, e[0].y, e[1].x, e[1].y);
        }
    }

    showPoints() {
        this.points.forEach((p) => {
            point(p);
        });
    }


    points2Edges(P) {
        let E = [];
        let n = P.length;
        for (let i = 0; i < n; i++) {
            E.push([P[i], P[(i + 1) % n]]);
        }
        return E;
    }

    // KPS

    deepClone(P) {
        return [...P];
    }

    KPS(P) {
        let q = this.deepClone(P);
        this.UpperHull(q);
        let upper = this.deepClone(this.hull);
        this.hull = [];
        let r = this.mirror(P);
        console.log("r val")
        console.log(r);
        console.log(upper);
        this.UpperHull(r);
        let lower = this.mirror(this.hull);
        let res = [];
        for(let p of lower){
            res.push(p);
        }
        for (let p of upper) {
            res.push(p);
        }
        console.log("hull")
        console.log(this.hull);
        return res;
    }

    UpperHull(P) {
        let pmin = P[0];
        let pmax = P[0];
        for (let point of P) {
            if (point.x < pmin.x) pmin = point;
            else if ((point.x == pmin.x) && (point.y > pmin.y)) pmin = point;
            if (point.x > pmax.x) pmax = point;
            else if ((point.x == pmax.x) && (point.y > pmax.y)) pmax = point;
        }
        if (pmin.equals(pmax)) {
            this.hull.push(pmin);
            return;
        }

        let T = [pmin, pmax];
        for (let p of P) {
            if ((p.x > pmin.x) && (p.x < pmax.x)) {
                T.push(p);
            }
        }

        this.connect(pmin, pmax, T);
        return;
    }

    connect(k, m, S) {
        let a = this.findMedian(S);
        this.simulation.push([
            TYPE.MEDIAN, a, k, m, this.deepClone(S)
            ]);
        console.log(a);
        let [pi, pj] = this.bridge(S, a);
        this.simulation.push([
            TYPE.BRIDGE, a, k, m, this.deepClone(S), pi, pj
            ]);
        console.log("back in connect");
        if (!this.flag || true) {
            this.flag = true;
            let sLeft = [pi];
            let sRight = [pj];
            for (let point of S) {
                if (point.x < pi.x) sLeft.push(point);
                if (point.x > pj.x) sRight.push(point);
            }

            if (pi.equals(k)) {
                this.simulation.push([
                    TYPE.HULL_1_k, a, k, m, this.deepClone(S), pi, pj
                    ]);
                this.hull.push(pi);
            } else {
                this.simulation.push([
                    TYPE.ELIMINATE_l, a, k, m, this.deepClone(sLeft), pi, pj
                    ]);
                this.connect(k, pi, sLeft);
            }
            if (pj.equals(m)) {
                this.simulation.push([
                    TYPE.HULL_1_j, a, k, m, this.deepClone(S), pi, pj
                    ]);
                this.hull.push(pj)
            } else {
                this.simulation.push([
                    TYPE.ELIMINATE_r, a, k, m, this.deepClone(sRight), pi, pj
                    ]);
                this.connect(pj, m, sRight);
            }
        }
        return;
    }

    findMedian(S) {
        S.sort((a, b) => a.x - b.x);
        let k = S[0];
        let mid = Math.floor(S.length / 2);
        if (S.length % 2 === 0) {
            k = (S[mid - 1].x + S[mid].x) / 2;
        } else {
            k = S[mid].x;
        }
        return k;
    }

    bridge(S, a){
        // Points to right of a and left of a
        let right = new Set();
        let left = new Set();
        for(let point of S){
            if(point.x <= a)    left.add(point);
            else    right.add(point);
        }

        // Get each pair of points in right with left
        for(let pleft of left){
            for(let pright of right){
                let isBridge = true;
                // Check if any other point is always on right of this line
                for(let point of S){
                    if(point.equals(pleft) || point.equals(pright)){
                        // Do Nothing
                    } else {
                        if(!this.isRightOfLine(point, pleft, pright))   isBridge = false;
                    }
                }
                if(isBridge){
                    return [pleft, pright];
                }
            }
        }
    }

    // bridge(S, a) {
    //     stroke(255, 0, 0);
    //     console.log("Finding Bridge for ");
    //     console.log(S);
    //     line(a, 0, a, 600);
    //     let candidates = [];
    //     if (S.length == 2) {
    //         if (S[0].x < S[1].x) return [S[0], S[1]];
    //         if (S[0].x >= S[1].x) return [S[1], S[0]];
    //     }

    //     let pairs = [];
    //     for (let idx = 0; idx < S.length - 1; idx += 2) {
    //         let first = S[idx];
    //         let second = S[idx + 1];
    //         if (first.x < second.x) {
    //             pairs.push([first, second]);
    //         } else {
    //             pairs.push([second, first]);
    //         }
    //     }

    //     if (S.length % 2 === 1) candidates.push(S[S.length - 1]);

    //     let slopes = [];

    //     for (let pair of pairs) {
    //         let pi = pair[0];
    //         let pj = pair[1];
    //         if (pi.x == pj.x) {
    //             if (pi.y > pj.y) {
    //                 candidates.push(pi);
    //             } else {
    //                 candidates.push(pj);
    //             }
    //         } else {
    //             slopes.push([pair, (pi.y - pj.y) / (pi.x - pj.x)]);
    //         }
    //     }

    //     slopes.sort((a, b) => a[1] - b[1]);
    //     console.log("slopes");
    //     console.log(slopes);

    //     let K = slopes[Math.floor(slopes.length / 2)];
    //     console.log("K");
    //     console.log(K);
    //     let small = [];
    //     let equal = [];
    //     let large = [];
    //     for (let pair of slopes) {
    //         if (pair[1] < K[1]) small.push(pair[0]);
    //         else if (pair[1] === K[1]) equal.push(pair[0]);
    //         else if (pair[1] > K[1]) large.push(pair[0]);
    //     }

    //     // Get line having max intersection with y axis passing through our points
    //     let max = [];
    //     for (let point of S) {
    //         let c = point.y - K[1] * point.x;
    //         max.push([point, c]);
    //     }

    //     max.sort((a, b) => a[1] - b[1]);

    //     console.log("max");
    //     console.log(max);


    //     let pk = max[0][0];
    //     let pm = max[1][0];

    //     console.log("pk");
    //     console.log(pk);

    //     console.log("pm");
    //     console.log(pm);

    //     for (let point of max) {
    //         if (point.x < pk.x) pk = point;
    //         if (point.x > pm.x) pm = point;
    //     }


    //     // Determine if h contains the bridge
    //     if (pk.x <= a && pm.x > 0) {
    //         console.log("returning")
    //         console.log(pk);
    //         console.log(pm);
    //         line(pk.x, pk.y, pm.x, pm.y);
    //         return [pk, pm];
    //     } else if (pm.x <= a) {
    //         for (let pair of large) {
    //             console.log("large - pair")
    //             console.log(pair);
    //             candidates.push(pair[1]);
    //         }
    //         for (let pair of equal) {
    //             console.log("equal - pair")
    //             candidates.push(pair[1]);
    //         }
    //         for (let pair of small) {
    //             console.log("small - pair")
    //             candidates.push(pair[1]);
    //             candidates.push(pair[0]);
    //         }
    //     } else if (pk.x > a) {
    //         for (let pair of small) {
    //             candidates.push(pair[0]);
    //         }
    //         for (let pair of equal) {
    //             candidates.push(pair[0]);
    //         }
    //         for (let pair of large) {
    //             candidates.push(pair[0]);
    //             candidates.push(pair[1]);
    //         }
    //     }
    //     console.log("candidates1");
    //     console.log(candidates);
    //     return this.bridge(candidates, a);
    // }



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
        let res = []
        for (let p of P) {
            res.push(createVector(-1 * p.x, -1 * p.y));
        }
        return res;
    }

    deepClonePoints(P) {
        let res = []
        for (let p of P) {
            res.push(createVector(p.x, p.y));
        }
        return res;
    }

    // // left of a line
    // isLeftOfLine(point, p1, p2) {
    //     let crossProduct = (p2.x - p1.x) * (point.y - p1.y) - (p2.y - p1.y) * (point.x - p1.x);
    //     return crossProduct > 0;
    // }

    // right of a line
    isRightOfLine(point, p1, p2) {
        let crossProduct = (p2.x - p1.x) * (point.y - p1.y) - (p2.y - p1.y) * (point.x - p1.x);
        return crossProduct < 0;
    }
}