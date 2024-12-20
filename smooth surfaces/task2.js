function catmullClarkSubdivision(vertices, faces) {
    var newVertices = [];
    var newFaces = [];
    
    var edgeMap = {};
    // This function tries to insert the centroid of the edge between
    // vertices a and b into the newVertices array.
    // If the edge has already been inserted previously, the index of
    // the previously inserted centroid is returned.
    // Otherwise, the centroid is inserted and its index returned.
    function getOrInsertEdge(a, b, centroid) {
        var edgeKey = a < b ? a + ":" + b : b + ":" + a;
        if (edgeKey in edgeMap) {
            return edgeMap[edgeKey];
        } else {
            var idx = newVertices.length;
            newVertices.push(centroid);
            edgeMap[edgeKey] = idx;
            return idx;
        }
    }



    // TODO: Implement a function that computes one step of the Catmull-Clark subdivision algorithm.
    //
    // Input:
    // `vertices`: An array of Vectors, describing the positions of every vertex in the mesh
    // `faces`: An array of arrays, specifying a list of faces. Every face is a list of vertex
    //          indices, specifying its corners. Faces may contain an arbitrary number
    //          of vertices (expect triangles, quadrilaterals, etc.)
    //
    // Output: Fill in newVertices and newFaces with the vertex positions and
    //         and faces after one step of Catmull-Clark subdivision.
    // It should hold:
    //         newFaces[i].length == 4, for all i
    //         (even though the input may consist of any of triangles, quadrilaterals, etc.,
    //          Catmull-Clark will always output quadrilaterals)
    //
    // Pseudo code follows:

    // ************************************
    // ************** Step 1 **************
    // ******** Linear subdivision ********
    // ************************************
    // for v in vertices:
    //      addVertex(v.clone())
        for (var i = 0; i < vertices.length; i++) {
            var v = vertices[i];
            newVertices.push(v);
        }
    
    // for face in faces:s
    //      facePointIndex = addVertex(centroid(face))
    //      for v1 in face:
    //          v0 = previousVertex(face, v1)
    //          v2 = nextVertex(face, v1)
    //          edgePointA = getOrInsertEdge(v0, v1, centroid(v0, v1))
    //          edgePointB = getOrInsertEdge(v1, v2, centroid(v1, v2))
    //          addFace(facePointIndex, edgePointA, v1, edgePointB)
        for(var i = 0; i < faces.length; i++){
            var face = faces[i];
            var centroid = new Vector(0, 0, 0);
            var facePointIndex = newVertices.length; 
        
            for(var j = 0; j < face.length; j++){
                Vector.add(centroid, vertices[faces[i][j]], centroid);
            }

            Vector.multiply(centroid, (1.0/face.length), centroid);
            newVertices.push(centroid);

            for(var j = 0; j < face.length; j++){
                var v0 = face[(j) % face.length];
                var v1 = face[(j+1) % face.length];
                var v2 = face[(j+2) % face.length];

                var edgePointA = (vertices[v0].add(vertices[v1])).multiply(0.5);
                var edgePointB = (vertices[v1].add(vertices[v2])).multiply(0.5);

                var newFace = [facePointIndex, getOrInsertEdge(v0, v1, edgePointA), v1, getOrInsertEdge(v1, v2, edgePointB)];
                newFaces.push(newFace);
            }

            
           
        }

    // ************************************
    // ************** Step 2 **************
    // ************ Averaging *************
    // ************************************
    // avgV = []
    // avgN = []
    // for i < len(newVertices):
    //      append(avgV, new Vector(0, 0, 0))
    //      append(avgN, 0)
    // for face in newFaces:
    //      c = centroid(face)
    //      for v in face:
    //          avgV[v] += c
    //          avgN[v] += 1
    //
    // for i < len(avgV):
    //      avgV[i] /= avgN[i]

       var avgV = [];
       var avgN = [];

       for(var i = 0; i < newVertices.length; i++){
           avgV.push(new Vector(0, 0, 0));
           avgN.push(0);
        }
       
       for(var i = 0; i < newFaces.length; i++){
            var face = newFaces[i];
            var centroid = new Vector(0, 0, 0);

            for(var j = 0; j < face.length; j++){
                Vector.add(centroid, newVertices[face[j]], centroid);
            }
            Vector.multiply(centroid, (1.0/face.length), centroid);

            var c = centroid;
            
            for(var j = 0; j < face.length; j++){
                var v = face[j];
                Vector.add(avgV[v], c, avgV[v]);
                avgN[v] ++;
            }
        }
        for(var i = 0; i < avgV.length; i++){
            Vector.multiply(avgV[i], (1.0/avgN[i]), avgV[i]);
        }
    
    // ************************************
    // ************** Step 3 **************
    // ************ Correction ************
    // ************************************
    // for i < len(avgV):
    //      newVertices[i] = lerp(newVertices[i], avgV[i], 4/avgN[i])
    
    for (var i = 0; i < avgV.length; i++) {
        var av = avgV[i];
        var newVertex = newVertices[i];
        var an = avgN[i];
      
        if (an > 0) {
          newVertex.x += (av.x - newVertex.x) * (4.0 / an);
          newVertex.y += (av.y - newVertex.y) * (4.0 / an);
          newVertex.z += (av.z - newVertex.z) * (4.0 / an);
        }
        newVertices[i] = newVertex;
    }
    
    // Do not remove this line
     return new Mesh(newVertices, newFaces);
 }

function extraCreditMesh() {
    // TODO: Insert your own creative mesh here

    //made an arrow head
    var vertices = [
        new Vector(1,  2, 0), new Vector(-1, 2, 0), new Vector(0, 0.7,  0),
        new Vector(0, -0.7, 0), new Vector( 0, 0, 0.3), new Vector(0, 0, -0.3)
	];
	var faces = [
		[0, 2, 4], [0, 4, 3], [0, 3, 5], [0, 5, 2],
        [1, 2, 5], [1, 5, 3], [1, 3, 4], [1, 4, 2]
	];
    

    return new Mesh(vertices, faces);
}

var Task2 = function(gl) {
    this.pitch = 0;
    this.yaw = 0;
    this.subdivisionLevel = 0;
    this.selectedModel = 0;
    this.gl = gl;
    
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    
    this.baseMeshes = [];
    for (var i = 0; i < 6; ++i)
        this.baseMeshes.push(this.baseMesh(i).toTriangleMesh(gl));
    
    this.computeMesh();
}

Task2.prototype.setSubdivisionLevel = function(subdivisionLevel) {
    this.subdivisionLevel = subdivisionLevel;
    this.computeMesh();
}

Task2.prototype.selectModel = function(idx) {
    this.selectedModel = idx;
    this.computeMesh();
}

Task2.prototype.baseMesh = function(modelIndex) {
    switch(modelIndex) {
    case 0: return createCubeMesh(); break;
    case 1: return createTorus(8, 4, 0.5); break;
    case 2: return createSphere(4, 3); break;
    case 3: return createIcosahedron(); break;
    case 4: return createOctahedron(); break;
    case 5: return extraCreditMesh(); break;
    }
    return null;
}

Task2.prototype.computeMesh = function() {
    var mesh = this.baseMesh(this.selectedModel);
    
    for (var i = 0; i < this.subdivisionLevel; ++i)
        mesh = catmullClarkSubdivision(mesh.vertices, mesh.faces);
    
    this.mesh = mesh.toTriangleMesh(this.gl);
}

Task2.prototype.render = function(gl, w, h) {
    gl.viewport(0, 0, w, h);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var projection = Matrix.perspective(35, w/h, 0.1, 100);
    var view =
        Matrix.translate(0, 0, -5).multiply(
        Matrix.rotate(this.pitch, 1, 0, 0)).multiply(
        Matrix.rotate(this.yaw, 0, 1, 0));
    var model = new Matrix();
    
    if (this.subdivisionLevel > 0)
        this.baseMeshes[this.selectedModel].render(gl, model, view, projection, false, true, new Vector(0.7, 0.7, 0.7));

    this.mesh.render(gl, model, view, projection);
}

Task2.prototype.dragCamera = function(dx, dy) {
    this.pitch = Math.min(Math.max(this.pitch + dy*0.5, -90), 90);
    this.yaw = this.yaw + dx*0.5;
}
