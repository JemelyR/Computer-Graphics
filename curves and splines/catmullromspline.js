var CatmullRomSpline = function(canvasId)
{
	// Set up all the data related to drawing the curve
	this.cId = canvasId;
	this.dCanvas = document.getElementById(this.cId);
	this.ctx = this.dCanvas.getContext('2d');
	this.dCanvas.addEventListener('resize', this.computeCanvasSize());
	this.computeCanvasSize();

	// Setup all the data related to the actual curve.
	this.nodes = new Array();
	this.showControlPolygon = true;
	this.showTangents = true;

	// Assumes a equal parametric split strategy
	this.numSegments = 16;

	// Global tension parameter
	this.tension = 0.5;

	// Setup event listeners
	this.cvState = CVSTATE.Idle;
	this.activeNode = null;

	// closure
	var that = this;

	// Event listeners
	this.dCanvas.addEventListener('mousedown', function(event) {
        that.mousePress(event);
    });

	this.dCanvas.addEventListener('mousemove', function(event) {
		that.mouseMove(event);
	});

	this.dCanvas.addEventListener('mouseup', function(event) {
		that.mouseRelease(event);
	});

	this.dCanvas.addEventListener('mouseleave', function(event) {
		that.mouseRelease(event);
	});
}

CatmullRomSpline.prototype.setShowControlPolygon = function(bShow)
{
	this.showControlPolygon = bShow;
}

CatmullRomSpline.prototype.setShowTangents = function(bShow)
{
	this.showTangents = bShow;
}

CatmullRomSpline.prototype.setTension = function(val)
{
	this.tension = val;
}

CatmullRomSpline.prototype.setNumSegments = function(val)
{
	this.numSegments = val;
}

CatmullRomSpline.prototype.mousePress = function(event)
{
	if (event.button == 0) {
		this.activeNode = null;
		var pos = getMousePos(event);

		// Try to find a node below the mouse
		for (var i = 0; i < this.nodes.length; i++) {
			if (this.nodes[i].isInside(pos.x,pos.y)) {
				this.activeNode = this.nodes[i];
				break;
			}
		}
	}

	// No node selected: add a new node
	if (this.activeNode == null) {
		this.addNode(pos.x,pos.y);
		this.activeNode = this.nodes[this.nodes.length-1];
	}

	this.cvState = CVSTATE.SelectPoint;
	event.preventDefault();
}

CatmullRomSpline.prototype.mouseMove = function(event) {
	if (this.cvState == CVSTATE.SelectPoint || this.cvState == CVSTATE.MovePoint) {
		var pos = getMousePos(event);
		this.activeNode.setPos(pos.x,pos.y);
	} else {
		// No button pressed. Ignore movement.
	}
}

CatmullRomSpline.prototype.mouseRelease = function(event)
{
	this.cvState = CVSTATE.Idle; this.activeNode = null;
}

CatmullRomSpline.prototype.computeCanvasSize = function()
{
	var renderWidth = Math.min(this.dCanvas.parentNode.clientWidth - 20, 820);
    var renderHeight = Math.floor(renderWidth*9.0/16.0);
    this.dCanvas.width = renderWidth;
    this.dCanvas.height = renderHeight;
}

CatmullRomSpline.prototype.drawControlPolygon = function()
{
	for (var i = 0; i < this.nodes.length-1; i++)
		drawLine(this.ctx, this.nodes[i].x, this.nodes[i].y,
					  this.nodes[i+1].x, this.nodes[i+1].y);
}

CatmullRomSpline.prototype.drawControlPoints = function()
{
	for (var i = 0; i < this.nodes.length; i++)
		this.nodes[i].draw(this.ctx);
}

CatmullRomSpline.prototype.drawTangents = function()
{

// ################ Edit your code below
	// TODO: Task 4
    // Compute tangents at the nodes and draw them using drawLine(this.ctx, x0, y0, x1, y1);
	// Note: Tangents are available only for 2,..,n-1 nodes. The tangent is not defined for 1st and nth node.
    // The tangent of the i-th node can be computed from the (i-1)th and (i+1)th node
    // Normalize the tangent and compute a line with a length of 50 pixels from the current control point.
// ################
	

	for (var i = 1; i < this.nodes.length -1; i++) {
		var next = this.nodes[i+1];
		var before = this.nodes[i-1];
		var on = this.nodes[i];

		var tangentx = (next.x - before.x) / 2.0;
		var tangenty = (next.y - before.y)/2.0;

		var length = Math.sqrt((tangentx*tangentx)+(tangenty*tangenty));

		var normx = tangentx/length;
		var normy = tangenty/length;

		var endx = on.x+(normx * 50);
		var endy = on.y+(normy * 50);

		setColors(this.ctx, 'red');
		drawLine(this.ctx,on.x, on.y,  endx, endy);
	}

}

CatmullRomSpline.prototype.draw = function()
{

// ################ Edit your code below
	// TODO: Task 5: Draw the Catmull-Rom curve (see the assignment for more details)
    // Hint: You should use drawLine to draw lines, i.e.
	// setColors(this.ctx,'black');
	// .....
	// drawLine(this.ctx, x0, y0, x1, y1);
	// ....
// ################
	
	//loop through nodes, c0-c3, within that loop through segments, then calc new node, t = i/num-seg,  x = c0+t*c1+t^2*c2+t^2*c3
	//after that through loop through nodes and draw segments
	for (var i = 2; i < this.nodes.length-1; i++) {
		var on = this.nodes[i-1];
		var before = this.nodes[i-2];
		var next = this.nodes[i];
		var twoahead = this.nodes[i+1];

		var c0 = on;
		var c1x = before.x*(-this.tension) + next.x*this.tension;
		var c1y = before.y*(-this.tension) + next.y*this.tension;
		var c2x = (2.0*this.tension)*before.x + (this.tension -3.0)*on.x + (3.0 - (2.0*this.tension))*next.x + twoahead.x*(-this.tension);
		var c2y = (2.0*this.tension)*before.y + (this.tension -3.0)*on.y + (3.0 - (2.0*this.tension))*next.y + twoahead.y*(-this.tension);
		var c3x = before.x*(-this.tension) + on.x*(2.0-this.tension) + next.x*(this.tension-2.0) + twoahead.x*this.tension;
		var c3y = before.y*(-this.tension) + on.y*(2.0-this.tension) + next.y*(this.tension-2.0) + twoahead.y*this.tension;

		for (var j = 0; j<this.numSegments; j++){
			var tj = j/this.numSegments;//tj
			var xj = c0.x+tj * c1x + (tj*tj) * c2x + (tj*tj) * c3x;//x(tj)
			var yj = c0.y+tj * c1y + (tj*tj) * c2y + (tj*tj) * c3y;//y(tj)
			//Pj=P(tj)=(x,y)

			var tj1 = (j+1)/this.numSegments;//tj+1
			var xj1 = c0.x+tj1 * c1x + (tj1*tj1) * c2x + (tj1*tj1) * c3x;//x(tj1)
			var yj1 = c0.y+tj1 * c1y + (tj1*tj1) * c2y + (tj1*tj1) * c3y;//y(tj1)
			//Pj+1

			setColors(this.ctx,'black');
			drawLine(this.ctx, xj, yj, xj1, yj1);
							
		}
	}

	
	
	
}

// NOTE: Task 4 code.
CatmullRomSpline.prototype.drawTask4 = function()
{
	// clear the rect
	this.ctx.clearRect(0, 0, this.dCanvas.width, this.dCanvas.height);

    if (this.showControlPolygon) {
		// Connect nodes with a line
        setColors(this.ctx,'rgb(10,70,160)');
        for (var i = 1; i < this.nodes.length; i++) {
            drawLine(this.ctx, this.nodes[i-1].x, this.nodes[i-1].y, this.nodes[i].x, this.nodes[i].y);
        }
		// Draw nodes
		setColors(this.ctx,'rgb(10,70,160)','white');
		for (var i = 0; i < this.nodes.length; i++) {
			this.nodes[i].draw(this.ctx);
		}
    }

	// We need atleast 4 points to start rendering the curve.
    if(this.nodes.length < 4) return;

	// draw all tangents
	if(this.showTangents)
		this.drawTangents();
}

// NOTE: Task 5 code.
CatmullRomSpline.prototype.drawTask5 = function()
{
	// clear the rect
	this.ctx.clearRect(0, 0, this.dCanvas.width, this.dCanvas.height);

    if (this.showControlPolygon) {
		// Connect nodes with a line
        setColors(this.ctx,'rgb(10,70,160)');
        for (var i = 1; i < this.nodes.length; i++) {
            drawLine(this.ctx, this.nodes[i-1].x, this.nodes[i-1].y, this.nodes[i].x, this.nodes[i].y);
        }
		// Draw nodes
		setColors(this.ctx,'rgb(10,70,160)','white');
		for (var i = 0; i < this.nodes.length; i++) {
			this.nodes[i].draw(this.ctx);
		}
    }

	// We need atleast 4 points to start rendering the curve.
    if(this.nodes.length < 4) return;

	// Draw the curve
	this.draw();

	if(this.showTangents)
		this.drawTangents();
}


// Add a control point to the curve
CatmullRomSpline.prototype.addNode = function(x,y)
{
	this.nodes.push(new Node(x,y));
}
