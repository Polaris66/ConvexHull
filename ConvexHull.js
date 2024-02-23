class ConvexHull {
    constructor(){
      this.points = new Set([])
    }
  
    generatePoints(n, w, h){
      for(let i = 0; i < n; i++){
        // Points have indices, Vector of values
        this.points.add(createVector(random() * w,random() * h));
      }
    }
    
    showPoints(){
      this.points.forEach((p) => {
        point(p.x, p.y);
      })
    }

    slowConvexHull(P){
      P = Array.from(P);
      let E = new Set([])
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
      E = Array.from(E);
      for(let e of E){
        line(e[0].x, e[0].y, e[1].x, e[1].y);
      }
    }
  }