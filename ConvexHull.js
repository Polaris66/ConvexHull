class ConvexHull {

    constructor() {
        this.points = [];
        this.hull = [];
        this.flag = false;
        this.flag1 = false;
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

    deepClone(P){
        return [...P];
    }

    KPS(P) {
        let q = this.deepClone(P);
        this.UpperHull(q);
        let upper = this.deepClone(this.hull);
        upper = this.deepClone(upper);
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
        for(let p of upper){
            res.push(p);
        }
        return res;
    }

    UpperHull(P) {
        let pmin = P[0];
        let pmax = P[0];
        for(let point of P){
            if(point.x < pmin.x) pmin = point;
            else if((point.x == pmin.x) && (point.y > pmin.y)) pmin = point;
            if(point.x > pmax.x) pmax = point;
            else if((point.x == pmax.x) && (point.y > pmax.y)) pmax = point;
        }
        if(pmin.equals(pmax)){
            this.hull.push(pmin);
            return;
        }

        let T = [pmin, pmax];
        for(let p of P){
            if((p.x > pmin.x) && (p.x < pmax.x)){
                T.push(p);
            }
        }
        
        this.connect(pmin, pmax, T);
        return;
    }

    connect(k, m, S) {
        let a = this.findMedian(S);
        console.log(a);
        let [pi, pj] = this.bridge(S, a);

        let sLeft = [pi];
        let sRight = [pj];
        for(let point of S){
            if(point.x < pi.x) sLeft.push(point);
            if(point.x > pj.x) sRight.push(point);
        }
        
        if(pi.equals(k)){
            this.hull.push(pi);
        } else { 
            this.connect(k, pi, sLeft);
        }
        if(pj.equals(m)) {
            this.hull.push(pj)
        } else {
           this.connect(pj, m, sRight);
        }
        return;
    }

    findMedian(S){
        S.sort((a, b) => a.x - b.x);
        let k = S[0];
        let mid = Math.floor(S.length / 2);
        if(S.length%2 === 0){
            k = (S[mid-1].x + S[mid].x)/2;
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
    //     console.log("Inside Bridge");
    //     if(S.length === 2){
    //         if(S[0].x < S[1].x){
    //             // stroke(0, 0, 255);
    //             // line(S[0].x, S[0].y, S[1].x, S[1].y);
    //             // stroke(255);
    //             console.log("Found Bridge Points. Returning");
    //             console.log(S[0]);
    //             console.log(S[1]);
    //             this.showPoints();
    //             return [S[0], S[1]];
    //         }
    //         else{
    //             // stroke(0, 0, 255);
    //             // line(S[1].x, S[1].y, S[0].x, S[0].y);
    //             // stroke(255);
    //             console.log("Found Bridge Points. Returning");
    //             console.log(S[0]);
    //             console.log(S[1]);
    //             this.showPoints();
    //             return [S[1], S[0]];
    //         }
    //     }

    //     let candidates = [];
    //     let disjointSubsets = [];

    //     for(let i = 0; i < S.length-1; i+=2){
    //         disjointSubsets.push([S[i], S[i+1]]);
    //     }

    //     if(S.length % 2 === 1){
    //         candidates.push(S[S.length - 1]);
    //     }
        
    //     let pairs = disjointSubsets.map(([a,b]) => {   
    //         if(a.x > b.x){
    //             return [b,a];
    //         } else {
    //             return [a, b];
    //         }
    //     });

    //     console.log("pairs")
    //     console.log(pairs);
        
    //     let newPairs = [];
    //     for(let point of pairs){
    //         let [pi, pj] = point;
    //         if(pi.x === pj.x){
    //             if(pi.y > pj.y) {
    //                 candidates.push(pi);
    //             }
    //             else {
    //                 candidates.push(pj);
    //             }
    //         } else {
    //             let s = (pi.y - pj.y)/(pi.x - pj.x);
    //             newPairs.push([pi, pj, s]);
    //         }  
    //     }

    //     console.log("newPairs")
    //     console.log(newPairs);
    //     console.log("candidates");
    //     console.log(candidates);
    //     if(newPairs.length === 0) return candidates;


    //     // Find median of the slopes
    //     let k;
    //     newPairs.sort((a, b) => a[2] - b[2]);

    //     // console.log(newPairs);
    //     let mid = Math.floor(newPairs.length / 2);
    //     k = newPairs[mid][2];

    //     console.log("median Slope");
    //     console.log(k);



    //     let small = newPairs.filter((p) => {
    //         return p[2] < k;
    //     });
    //     let equal = newPairs.filter((p) => {
    //         return p[2] === k;
    //     });
    //     let large = newPairs.filter((p) => {
    //         return p[2] > k;
    //     });

    //     console.log("small")
    //     console.log(small)

    //     console.log("equal")
    //     console.log(equal)

    //     console.log("large")
    //     console.log(large)
        
    //     let maxc = S[0].y - k*S[1].x;
    //     let max = new Set();

    //     max.add(S[0]);
    //     for(let point of S){
    //         if(point.y-k*point.x == maxc){
    //             max.add(point);
    //         } else if(point.y-k*point.x > maxc){
    //             max.clear();
    //             maxc = point.y-k*point.x;
    //             max.add(point);
    //         }
    //     }
    //     console.log("max")
    //     console.log(max);

    //     let [pk] = max;
    //     let [pm] = max;
    //     for(let point of max){
    //         if(point.x < pk.x) pk = point;
    //         if(point.x > pm.x) pm = point;
    //     }

    //     console.log("pk")
    //     console.log(pk)

    //     console.log("pm")
    //     console.log(pm)

    //     stroke(255,0,0);
    //     strokeWeight(10);
    //     point(pk);
    //     point(pm);
    //     strokeWeight(5);
    //     stroke(0,0,255);

    //     if(!this.flag1){
    //         console.log("reached here!");
    //         stroke(255,255,255);
    //         strokeWeight(10);
    //         line(pk.x, pk.y, pm.x, pm.y);
    //         strokeWeight(5);
    //         stroke(0,0,255);
    //         this.flag1 = true;
    //     }

        

    //     if((pk.x <= a) && (pm.x > a)){
    //         if(!this.flag){
    //             console.log("===");
    //             console.log(pk.x);
    //             console.log(a);
    //             console.log(pm.x);
    //         }
    //         console.log("Returning pk, pm")
    //         console.log(pk);
    //         console.log(pm);
    //         return [pk,pm];
    //     }

    //     if(pm.x <= a){
    //         for(let [pi, pj, _] of large){
    //             candidates.push(pj);
    //         }
    //         for(let [pi, pj, _] of equal){
    //             candidates.push(pj);
    //         }
    //         for(let [pi, pj, _] of small){
    //             candidates.push(pi);
    //             candidates.push(pj);
    //         }
    //     }

    //     if(pk.x > a){
    //         for(let [pi, pj, _] of small){
    //             candidates.push(pi);
    //         }
    //         for(let [pi, pj, _] of equal){
    //             candidates.push(pi);
    //         }
    //         for(let [pi, pj, _] of large){
    //             candidates.push(pi);
    //             candidates.push(pj);
    //         }

    //     }
    //     console.log("Calling Bridge again");
    //     console.log("candidates");
    //     console.log(candidates)
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
            res.push(createVector(-1*p.x, -1*p.y));
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
