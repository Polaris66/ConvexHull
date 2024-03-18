class ConvexHull {
    constructor() {
        this.points = [];
    }

    generatePoints(n, w, h) {
        for (let i = 0; i < n; i++) {
            this.points.push(createVector(random() * w, random() * h));
        }
    }

    showPoints() {
        this.points.forEach((p) => {
            point(p.x, p.y);
        });
    }
    
    KPS(P) {
        if (P.length < 1) {
        }

        //Find pmin and pmax
        let pmin = P[0];
        let pmax = P[0];
        for (let i = 1; i < S.length; i++) {
            if (P[i].x < pmin.x || (P[i].x == pmin.x && P[i].y > pmin.y)) {
                pmin = P[i];
            }
            if (P[i].x > pmax.x || (P[i].x == pmax.x && P[i].y > pmax.y)) {
                pmax = P[i];
            }
        }

        // Step 2: Find pumin and pumax
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

        const T_upper = [pumin, pumax];
        for (let i = 0; i < P.length; i++) {
            const p = P[i];
            if (p.x > pumin.x && p.x < pumax.x) {
                T_upper.push(p);
            }
        }

        // Compute upper hull
        const upperHull = this.upperHull(pumin, pumax, T_upper);

        // Find plmin and plmax
        let plmin = pmin;
        let plmax = pmax;
        for (let i = 0; i < S.length; i++) {
            if (S[i].x == pmin.x && S[i].y < plmin.y) {
                plmin = P[i];
            }
            if (S[i].x == pmax.x && S[i].y < plmax.y) {
                plmax = P[i];
            }
        }

        const T_lower = [plmin, plmax];
        for (let i = 0; i < P.length; i++) {
            const p = P[i];
            if (p.x > plmin.x && p.x < plmax.x) {
                T_lower.push(p);
            }
        }

        // Compute lower hull
        const lowerHull = this.lowerHull(plmin, plmax, T_lower);

        // // Combine upper and lower hulls
        return { pumin, pumax, plmin, plmax }
        // return convexHull;
    }

    // upperHull(pumin, pumax, T) {
    //     // Implement upper hull computation here
    // }

    // lowerHull(plmin, plmax, T) {
    //     // Implement lower hull computation here
    // }
    
    
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