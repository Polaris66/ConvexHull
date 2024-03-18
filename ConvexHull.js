class ConvexHull {

    constructor() {
        this.points = [];
        this.hull = [];
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

    KPS(P) {
        let upper = this.UpperHull(P);
        console.log(upper);
        return upper;
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
            return pmin;
        }

        let T = [pmin, pmax];
        for(let p of P){
            if((p.x > pmin.x) && (p.x < pmax.x)){
                T.push(p);
            }
        }
        return this.connect(pmin, pmax, T);
    }

    connect(k, m, S) {
        let a = this.findMedian(S);
        stroke(255,0,0)
        line(a, 0, a, 600);
        stroke(0,255,0)
        
        let [pi, pj] = this.bridge(S, a);
        line(pi.x, pi.y, pj.x, pj.y);

        let sLeft = [pi];
        let sRight = [pj];
        for(let point of S){
            if(point.x < pi.x) sLeft.push(point);
            if(point.x > pj.x) sRight.push(point);
        }
        
        let hull = [];
        if(pi.equals(k)){
            hull.push(pi);
        }    
        else{ 
            hull.concat(this.connect(k, pi, sLeft));
        }
        
        if(pj.equals(m)) {
            hull.push(pj)
        }
        else {
            hull.concat(this.connect(pj, m, sRight));
        }

        return hull;
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

    bridge(S, a) {
        if(S.length === 2){
            if(S[0].x < S[1].x){
                return [S[0], S[1]];
            }
            else{
                return [S[1], S[0]];
            }
        }

        let candidates = [];
        let disjointSubsets = [];

        for(let i = 0; i < S.length-1; i+=2){
            disjointSubsets.push([S[i], S[i+1]]);
        }

        if(S.length % 2 === 1){
            candidates.push(S[S.length - 1]);
        }
        
        let pairs = disjointSubsets.map(([a,b]) => {   
            if(a.x > b.x){
                return [b,a];
            } else {
                return [a, b];
            }
        });
        
        let newPairs = [];
        for(let point of pairs){
            let [pi, pj] = point;
            if(pi.x === pj.x){
                if(pi.y > pj.y) candidates.push(pi);
                else candidates.push(pj);
            } else {
                let s = (pi.y - pj.y)/(pi.x - pj.x);
                newPairs.push([pi, pj, s]);
            }  
        }

        if(newPairs.length === 0) return candidates;


        // Find median of the slopes
        let k;
        newPairs.sort((a, b) => a[2] - b[2]);
        // console.log(newPairs);
        let mid = Math.floor(newPairs.length / 2);

        

        if(newPairs.length%2 === 0){
            k = (newPairs[mid-1][2] + newPairs[mid][2])/2;
        } else {
            k = newPairs[mid][2];
        }

        let small = newPairs.filter((p) => {
            return p[2] < k;
        });
        let equal = newPairs.filter((p) => {
            return p[2] === k;
        });
        let large = newPairs.filter((p) => {
            return p[2] > k;
        });

        let pk = S[0];
        let pm = S[0];
        for(let point of S){
            
            if((point.y - k*point.x) > (pk.y - k*pk.x)){
                pk = point;
            } else if((point.y - k*point.x) === ((pk.y - k*pk.x) && (point.x < pk.x))){
                pk = point;
            }

            if((point.y - k*point.x) > (pk.y - k*pm.x)){
                pm = point;
            } else if(((point.y - k*point.x) === (pk.y - k*pm.x))&& (point.x > pm.x)){
                pm = point; 
            }
        }
        if((pk.x <= a) && (pm.x > a)) return [pk,pm];
        
        if(pm.x <= a){
            for(let [pi, pj, _] of large){
                candidates.push(pj);
            }
            for(let [pi, pj, _] of equal){
                candidates.push(pj);
            }
            for(let [pi, pj, _] of small){
                candidates.push(pi);
                candidates.push(pj);
            }
        }

        if(pk.x > a){
            for(let [pi, pj, _] of small){
                candidates.push(pi);
            }
            for(let [pi, pj, _] of equal){
                candidates.push(pi);
            }
            for(let [pi, pj, _] of large){
                candidates.push(pi);
                candidates.push(pj);
            }

        }
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
        let newP = []
        for (let p of P) {
            p.x *= -1;
            p.y *= -1;
            newP.push([p.x, p.y]);
        }
        return newP;
    }

    // // left of a line
    // isLeftOfLine(point, p1, p2) {
    //     let crossProduct = (p2.x - p1.x) * (point.y - p1.y) - (p2.y - p1.y) * (point.x - p1.x);
    //     return crossProduct > 0;
    // }

    // // right of a line
    // isRightOfLine(point, p1, p2) {
    //     let crossProduct = (p2.x - p1.x) * (point.y - p1.y) - (p2.y - p1.y) * (point.x - p1.x);
    //     return crossProduct < 0;
    // }
}
