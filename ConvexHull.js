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
        hull.push(hull[0]);
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
        for (let p of upper) {
            res.push(p);
        }
        for(let idx = lower.length-1; idx >= 0; idx--){
            res.push(lower[idx]);
        }
        // for (let p of lower) {
        //     res.push(p);
        // }
        console.log("upper");
        console.log(upper);
        console.log("lower");
        console.log(lower);
        console.log("hull");
        console.log(res);
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
        let a = this.findMedian(this.deepClone(S));
        this.simulation.push([
            TYPE.MEDIAN, a, k, m, this.deepClone(S)
        ]);
        console.log("Median");
        console.log(a);
        let [pi, pj] = this.bridge(S, a);
        this.simulation.push([
            TYPE.BRIDGE, a, k, m, this.deepClone(S), pi, pj
        ]);
        console.log("back in connect");
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

        return;
    }

    findMedian(S) {
        let T = this.deepClone(S);
        T.sort((a, b) => a.x - b.x);
        let k = T[0];
        let mid = Math.floor(T.length / 2);
        if (T.length % 2 === 0) {
            k = (T[mid - 1].x + T[mid].x) / 2;
        } else {
            k = T[mid].x;
        }
        return k;
    }

    // bridge(S, a) {
    //     // Points to right of a and left of a
    //     let right = new Set();
    //     let left = new Set();
    //     for (let point of S) {
    //         if (point.x <= a) left.add(point);
    //         else right.add(point);
    //     }

    //     // Get each pair of points in right with left
    //     for (let pleft of left) {
    //         for (let pright of right) {
    //             let isBridge = true;
    //             // Check if any other point is always on right of this line
    //             for (let point of S) {
    //                 if (point.equals(pleft) || point.equals(pright)) {
    //                     // Do Nothing
    //                 } else {
    //                     if (!this.isRightOfLine(point, pleft, pright)) isBridge = false;
    //                 }
    //             }
    //             if (isBridge) {
    //                 return [pleft, pright];
    //             }
    //         }
    //     }
    // }

    bridge(S, a) {
        strokeWeight(3);
        // line(a, 0, a, 600);
        if (S.length == 2) {
            if (S[0].x < S[1].x) return [S[0], S[1]];
            if (S[0].x >= S[1].x) return [S[1], S[0]];
        }

        let candidates = []
        let disjointSubsets = [];

        for (let i = 0; i < S.length - 1; i += 2) {
            disjointSubsets.push([S[i], S[i + 1]]);
        }

        let pairs = disjointSubsets.map(([a, b]) => {
            if (a.x > b.x) {
                return [b, a];
            } else {
                return [a, b];
            }
        });

        let newPairs = [];
        let slopes = [];
        for (let point of pairs) {
            let [pi, pj] = point;
            if (pi.x === pj.x) {
                if (pi.y > pj.y) candidates.push(pi);
                else candidates.push(pj);
            } else {
                let s = (pi.y - pj.y) / (pi.x - pj.x);
                newPairs.push([pi, pj]);
                slopes.push(createVector(s, 0));
            }
        }

        if (newPairs.length === 0) return candidates;
        if (S.length % 2 === 1) candidates.push(S[S.length - 1]);

        let K = this.findMedian(this.deepClone(slopes));
        console.log("K");
        console.log(K);
        let small = [];
        let equal = [];
        let large = [];
        console.log("newPairs");
        console.log(newPairs);
        for (let i = 0; i < slopes.length; i++) {
            console.log("i, slopes[i], K")
            console.log(i);
            console.log(slopes[i].x);
            console.log(K);
            if (Math.abs(slopes[i].x - K) < Number.EPSILON) {
                equal.push(newPairs[i]);
            }
            else if (slopes[i].x < K) {
                small.push(newPairs[i]);
            }
            else if (slopes[i].x > K) {
                large.push(newPairs[i]);
            }
        }
        console.log("K");
        console.log(K);
        console.log("small");
        console.log(small);
        console.log("equal");
        console.log(equal);
        console.log("large");
        console.log(large);
        // Get line having max intersection with y axis passing through our points

        let maxValue = -Infinity;
        for (let point of S) {
            let c = point.y - K * point.x;
            maxValue = Math.max(maxValue, c);
        }

        console.log("maxValue");
        console.log(maxValue);

        let MAX = [];
        for (let point of S) {
            let c = point.y - K * point.x;
            if (Math.abs(c - maxValue) < Number.EPSILON) {
                MAX.push(point);
            }
        }


        for (let point of MAX) {
            stroke(0, 255, 0);
            // line(point.x, point.y, 2 * point.x, K * point.x + point.y);
            // line(point.x, -1 * point.y, 2 * point.x, K * point.x - point.y);
            stroke(255);
        }

        let pk = MAX[0];
        let pm = MAX[0];
        for (let point of MAX) {
            if (point.x < pk.x) pk = point;
            if (point.x > pm.x) pm = point;
        }

        console.log("pk, pm");
        console.log(pk);
        console.log(pm);

        // Determine if h contains the bridge
        if (pk.x <= a && pm.x > a) {

            console.log("returning")
            console.log(pk);
            console.log(pm);
            // line(pk.x, pk.y, pm.x, pm.y);
            console.log("LENGTH")
            console.log(candidates.length);
            console.log("Candidates");
            console.log(candidates);
            return [pk, pm];
            // if (candidates.length === 1) {
            //     candidates.push(pk);
            //     candidates.push(pm);
            //     return this.bridge(candidates, this.findMedian(candidates));
            // } else {
            //     return [pk, pm];
            // }

        } else if (pm.x <= a) {
            for (let pair of small) {
                console.log("small - pair")
                candidates.push(pair[0]);
                candidates.push(pair[1]);
            }
            for (let pair of large) {
                console.log("large - pair")
                console.log(pair);
                candidates.push(pair[1]);
            }
            for (let pair of equal) {
                console.log("equal - pair")
                candidates.push(pair[1]);
            }

        } else if (pk.x > a) {
            for (let pair of large) {
                candidates.push(pair[0]);
                candidates.push(pair[1]);
            }
            for (let pair of small) {
                candidates.push(pair[0]);
            }
            for (let pair of equal) {
                candidates.push(pair[0]);
            }
        }
        console.log("candidates1");
        console.log(candidates);
        return this.bridge(candidates, a);
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
        let res = []
        for (let p of P) {
            res.push(createVector(p.x, -1 * p.y));
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