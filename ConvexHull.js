class ConvexHull {

    constructor() {
        this.points = [];
        this.hull = [];
        this.flag = false;
        // We keep simulating by iterating through the instructions here
        this.simulation = [];
    }

    // Brute Force
    bruteForce(P, visualize = false) {
        let E = [];
        for (let p of P) {
            for (let q of P) {
                if (p != q) {
                    if (visualize) this.simulation.push([TYPE.BF_GET_PAIR, this.deepClone(E), this.deepClone(P), p, q]);
                    let valid = true;
                    for (let r of P) {
                        if (r != p && r != q) {
                            if (visualize) this.simulation.push([TYPE.BF_CHECKPOINT, this.deepClone(E), this.deepClone(P), p, q, r]);
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
                        if (visualize) this.simulation.push([TYPE.BF_UPDATE_HULL, this.deepClone(E), this.deepClone(P), p, q]);
                    }
                }
            }
        }
        //console.log("this.simulation");
        //console.log(this.simulation);
        return E;
    }

    // Jarvis
    jarvisAlgorithm(P, visualize = false) {
        let hull = [];

        let n = P.length;
        let p0 = 0;
        for (let i = 1; i < n; i++) {
            if (P[i].x < P[p0].x) {
                p0 = i;
            }
        }

        if (visualize) this.simulation.push([TYPE.J_LEFTMOST, [], P[p0], this.deepClone(P)]);

        let p = p0;
        let q;
        do {
            hull.push(P[p]);
            if (visualize) this.simulation.push([TYPE.J_UPDATE_HULL, this.deepClone(hull), P[p], P[p], P[p], this.deepClone(P)]);
            q = (p + 1) % n;

            for (let i = 0; i < n; i++) {
                if (visualize) this.simulation.push([TYPE.J_CHOOSEQ, this.deepClone(hull), P[p], P[q], P[i], this.deepClone(P)]);
                if (this.orientation(P[p], P[i], P[q])) {
                    if (visualize) this.simulation.push([TYPE.J_REJECTORIENTATION, this.deepClone(hull), P[p], P[q], P[i], this.deepClone(P)]);
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

    // KPS
    KPS(P, visualize = false) {
        this.UpperHull(P, visualize);
        let upper = this.deepClone(this.hull);
        this.hull = [];
        //console.log(upper);
        this.UpperHull(this.mirror(P), visualize);
        let lower = this.deepClone(this.mirror(this.hull));
        let res = [];
        for (let p of upper) {
            res.push(p);
        }
        for (let idx = 0; idx < lower.length; idx++) {
            res.push(lower[idx]);
        }
        //console.log("upper");
        //console.log(upper);
        //console.log("lower");
        //console.log(lower);
        //console.log("hull");
        //console.log(res);
        return res;
    }

    UpperHull(P, visualize) {
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

        this.connect(pmin, pmax, T, visualize);
        return;
    }

    connect(k, m, S, visualize) {
        let a = this.findMedian(S).x;
        if (visualize) this.simulation.push([TYPE.MEDIAN, a, k, m, this.deepClone(S)]);
        //console.log("Median");
        //console.log(a);
        let [pi, pj] = this.bridge(S, a);
        if (visualize) this.simulation.push([TYPE.BRIDGE, a, k, m, this.deepClone(S), pi, pj]);
        //console.log("back in connect");
        let sLeft = [pi];
        let sRight = [pj];
        for (let point of S) {
            if (point.x < pi.x) sLeft.push(point);
            if (point.x > pj.x) sRight.push(point);
        }

        if (pi.equals(k)) {
            if (visualize) this.simulation.push([TYPE.HULL_1_k, a, k, m, this.deepClone(S), pi, pj]);
            this.hull.push(pi);
        } else {
            if (visualize) this.simulation.push([TYPE.ELIMINATE_l, a, k, m, this.deepClone(sLeft), pi, pj]);
            this.connect(k, pi, sLeft, visualize);
        }
        if (pj.equals(m)) {
            if (visualize) this.simulation.push([TYPE.HULL_1_j, a, k, m, this.deepClone(S), pi, pj]);
            this.hull.push(pj)
        } else {
            if (visualize) this.simulation.push([TYPE.ELIMINATE_r, a, k, m, this.deepClone(sRight), pi, pj]);
            this.connect(pj, m, sRight, visualize);
        }
        return;
    }


    bridge(S, a) {
        // strokeWeight(3);
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

        let K = this.findMedian(slopes).x;
        // line(a, 0, a, 600);
        //console.log("K");
        //console.log(K);
        let small = [];
        let equal = [];
        let large = [];
        //console.log("newPairs");
        //console.log(newPairs);
        for (let i = 0; i < slopes.length; i++) {
            // console.log("i, slopes[i], K")
            // console.log(i);
            // console.log(slopes[i].x);
            // console.log(K);
            if (Math.abs(slopes[i].x - K) < 0.00001) {
                equal.push(newPairs[i]);
            }
            else if (slopes[i].x < K) {
                small.push(newPairs[i]);
            }
            else if (slopes[i].x > K) {
                large.push(newPairs[i]);
            }
        }
        //console.log("K");
        //console.log(K);
        //console.log("small");
        //console.log(small);
        //console.log("equal");
        //console.log(equal);
        //console.log("large");
        //console.log(large);
        // Get line having max intersection with y axis passing through our points

        let maxValue = -Infinity;
        for (let point of S) {
            let c = point.y - K * point.x;
            maxValue = Math.max(maxValue, c);
        }

        //console.log("maxValue");
        //console.log(maxValue);

        let MAX = [];
        for (let point of S) {
            let c = point.y - K * point.x;
            if (Math.abs(c - maxValue) < 0.00001) {
                MAX.push(point);
            }
        }

        //console.log(MAX);
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

        //console.log("pk, pm");
        //console.log(pk);
        //console.log(pm);

        // Determine if h contains the bridge
        if (pk.x <= a && pm.x > a) {

            // console.log("returning")
            // console.log(pk);
            // console.log(pm);
            // line(pk.x, pk.y, pm.x, pm.y);
            // console.log("LENGTH")
            // console.log(candidates.length);
            // console.log("Candidates");
            // console.log(candidates);
            return [pk, pm];
        } else if (pm.x <= a) {
            for (let pair of small) {
                // console.log("small - pair")
                candidates.push(pair[0]);
                candidates.push(pair[1]);
            }
            for (let pair of large) {
                // console.log("large - pair")
                // console.log(pair);
                candidates.push(pair[1]);
            }
            for (let pair of equal) {
                // console.log("equal - pair")
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
        //console.log("candidates1");
        //console.log(candidates);
        return this.bridge(candidates, a);
    }


    // Auxillary Functions
    slowMedian(S) {
        let T = this.deepClone(S);
        T.sort((a, b) => a.x - b.x);
        // console.log("T");
        // console.log(T);
        let k = T[0].x;
        let mid = Math.floor(T.length / 2);
        // console.log("mid");
        // console.log(mid);
        // console.log(T.length % 2);
        if ((T.length % 2) == 0) {
            // console.log('hi');
            k = createVector((T[mid].x + T[mid - 1].x) / 2, (T[mid].y + T[mid - 1].y) / 2);
        } else {
            k = createVector(T[mid].x, T[mid].y);
        }
        // console.log("k");
        // console.log(k);
        return k.copy();

    }

    findMedian(S) {
        let T = S;
        if (T.length == 1) {
            return T[0].copy();
        }
        if (T.length % 2) {
            return this.quickSelect(T, Math.floor(T.length / 2)).copy();
        }
        else {
            let a = this.quickSelect(T, Math.floor(T.length / 2) - 1);
            let b = this.quickSelect(T, Math.floor(T.length / 2));
            // console.log(T);
            // console.log(a);
            // console.log(b);
            return (a.copy()).add(b.copy()).div(2);
        }
    }

    quickSelect(A, k) {
        if (A.length == 1) {
            return A[0];
        }

        // console.log("A");
        // console.log(A);
        // console.log("k");
        // console.log(k);
        let pivot = this.medianOfMedians(A);
        // console.log("Pivot");
        // console.log(pivot);
        let lows = [];
        let highs = [];
        let pivots = [];
        for (let el of A) {
            if (Math.abs(el.x - pivot.x) < 0.00001) {
                pivots.push(el);
            }
            else if (el.x > pivot.x) {
                highs.push(el);
            }
            else if (el.x < pivot.x) {
                lows.push(el);
            }
        }
        if (k < lows.length) {
            return this.quickSelect(lows, k);
        }
        else if (k < (lows.length + pivots.length)) {
            return pivots[0];
        }
        else {
            return this.quickSelect(highs, k - lows.length - pivots.length);
        }
    }

    medianOfMedians(A) {
        if (A.length <= 5) {
            return this.slowMedian(A);
        }

        const chunks = this.chunked(A, 5);
        const medians = chunks.map(chunk => this.medianOfMedians(chunk));

        return this.medianOfMedians(medians);
    }

    chunked(A, chunk_size) {
        let chunks = [];
        for (let i = 0; i < A.length; i += chunk_size) {
            chunks.push(A.slice(i, i + chunk_size));
        }
        return chunks;
    }

    deepClone(P) {
        return [...P];
    }

    mirror(P) {
        let res = [];
        for (let p of P) {
            res.push(createVector(-p.x, -p.y));
        }
        return res;
    }
}