class ConvexHull {

    constructor() {
        this.points = [];
        this.hull = [];
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
            createVector(313.5525735639671, 27.65974897591565),
            createVector(314.85005402405034, 240.21167187808607),
            createVector(419.4072693378745, 196.27012795606436),
            createVector(360.08926879425513, 449.75512688006444),
            createVector(390.9358853900112, 50.42540011701266),
            createVector(505.45127045630545, 125.0332464782726)];
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

    KPS(P) {
        let upper = this.UpperHull(this.makeSet(P));
        let lower = this.LowerHull((this.makeSet(P)));
        return [...upper, ...lower];
    }

    UpperHull(P) {
        let [min] = P;
        let [max] = P; 
        for(let point of P){
            if(point.x < min.x) min = point;
            else if(point.x == min.x && point.y > min.y) min = point;
            if(point.x > min.x) min = point;
            else if(point.x == min.x && point.y > min.y) min = point;
        }
        console.log(min);
        console.log(max);
        if(min === max){
            this.hull.push(min);
        }

        let T = this.deepCloneSet(P);
        
        return this.connect(min, max, T);
    }

    deepCloneSet(S){
        let s = new Set();
        for(let point of S){
            s.add(point);
        }
        return s;
    }

    medianXOfSet(s) {
        let x = [];
        for(let point of s){
            x.push(point.x);
        }
        const sortedX = x.sort((a, b) => a - b);
        const medianIdx = Math.floor(sortedX.length / 2);
        const median = sortedX.length % 2 === 0 ? (sortedX[medianIdx - 1] + sortedX[medianIdx]) / 2 : sortedX[medianIdx];
        return median;
    }

    makeSet(arr){
        let st = new Set();
        for(let a of arr){
            st.add(a);
        }
        return st;
    }

    bridge(S, a) {
        let candidates = new Set();
        if(S.length === 2){
            let [i] = S;
            S.delete(i);
            let [j] = S;
            S.delete(j);
            if(i.x < j.x) return new Set([i, j]);
            else return new Set([j, i]);
        }

        // Make S/2 disjoint sets
        let disjointSubsets = new Set();
        let s = this.deepCloneSet(S);
        while(s.size > 1){
            let [first] = s;
            s.delete(first);
            let [second] = s;
            s.delete(second);
            disjointSubsets.add([first, second]);
        }
        if(s.size === 1){
            let [first] = s;
            candidates.add(first);
        }

        
    }

    connect(k, m, S) {
        let a = this.medianXOfSet(S);
        let [pi, pj] = this.bridge(S, a);
        let sLeft = new Set();
        let sRight = new Set();
        for(let point of S){
            if(point.x < S[pi].x) sLeft.add(point);
            if(point.x > S[pj].x) sRight.add(point);
        }
        if(pi === k) this.hull.push(pi);
        else this.connect(k, pi, sLeft);

        if(pj === m) this.hull.push(pj);
        else this.connect(pj, m, sRight);
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