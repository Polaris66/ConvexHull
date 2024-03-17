class ConvexHull {
    constructor(){
      this.points = [];
    }
  
    generatePoints(n, w, h){
      for(let i = 0; i < n; i++){
        // Points have indices, Vector of values
        this.points.push(createVector(w/8+random() * (3*w/4),h/8+random() * (3*h/4)));
      }
    }
    
    showPoints(P){
      P.forEach((p) => {
        stroke(255, 0, 0);
        point(p.x, p.y);
      })
    }

    slowConvexHull(P){
      let E = [];
      for(let p of P){
        for(let q of P){
          if(p!=q){
            let valid = true;
            for(let r of P){
              if((r!=p) && (r!=q)){
                if(((q.x - p.x) * (r.y - p.y)) - ((q.y - p.y) * (r.x - p.x)) > 0){
                  valid = false;
                }
              }
            }
            if(valid){
              E.add([p,q])
            }
          }
        }
      }
      return E;
    }

    showEdges(E){
      for(let e of E){
        // stroke(255, 255, 255);
        line(e[0].x, e[0].y, e[1].x, e[1].y);
      }
    }

    orientation(p1, p2, p3){
      let val = (p2.y - p1.y) * (p3.x - p2.x) - (p2.x - p1.x) * (p3.y - p2.y);

      return (val > 0); // clockwise or anti clockwise
    }

    jarvisAlgorithm(P){
      let hull = [];

      let n = P.length;
      let p0 = 0;
      for(let i = 1; i < n; i++){
        if(P[i].x < P[p0].x){
          p0 = i;
        }
      }
      let p = p0;
      let q;
      do{
        hull.push(P[p]);

        q = (p + 1) % n;
      
        for(let i = 0; i < n; i++){
          if(this.orientation(P[p], P[i], P[q])){
            q = i;
          }
        }

        p = q;
      }
      while(p!=p0);

      return hull;
    }

    points2Edges(P){
      let E = [];
      let n = P.length;
      for(let i = 0; i < n; i++){
        E.push([P[i], P[(i + 1) % n]]);
      }
      return E;
    }
  }
