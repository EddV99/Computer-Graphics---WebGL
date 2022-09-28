// [TO-DO] Complete the implementation of the following class and the vertex shader below.

class CurveDrawer {
	constructor()
	{
		this.prog   = InitShaderProgram( curvesVS, curvesFS );
		// [TO-DO] Other initializations should be done here.
		// This is a good place to get the locations of attributes and uniform variables.
		// 	Get locations of attributes
		this.t = gl.getAttribLocation(this.prog, 't');
		
		// 	Get locations of uniform variables
		this.mvp = gl.getUniformLocation(this.prog, 'mvp');
		this.p0 = gl.getUniformLocation(this.prog, 'p0');
		this.p1 = gl.getUniformLocation(this.prog, 'p1');
		this.p2 = gl.getUniformLocation(this.prog, 'p2');
		this.p3 = gl.getUniformLocation(this.prog, 'p3');

		// Initialize the attribute buffer
		this.steps = 100;
		var tv = [];
		for ( var i=0; i<this.steps; ++i ) {
			tv.push( i / (this.steps-1) );
		}
		// This is where you can create and set the contents of the vertex buffer object
		// for the vertex attribute we need.
		this.t_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.t_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tv), gl.STATIC_DRAW);

	}
	setViewport( width, height )
	{
		//[1, 0, 0, 0,  0, 1, 0, 0,  0, 0, 1, 0,  0, 0, 0, 1];
		// This is where we should set the transformation matrix
		var trans = [ 2/width,0,0,0,  0,-2/height,0,0, 0,0,1,0, -1,1,0,1 ]; 
		// just identity matrix, could be wrong
		// Do not forget to bind the program before you set a uniform variable value.
		gl.useProgram( this.prog );	// Bind the program
		gl.uniformMatrix4fv(this.mvp, false, trans);
	}
	updatePoints( pt )
	{
		// The control points have changed, we must update corresponding uniform variables.
		// Do not forget to bind the program before you set a uniform variable value.
		// We can access the x and y coordinates of the i^th control points using
		// var x = pt[i].getAttribute("cx");
		// var y = pt[i].getAttribute("cy");

		var p = [];
		for ( var i=0; i<4; ++i ) {
			var x = pt[i].getAttribute("cx");
			var y = pt[i].getAttribute("cy");
			p.push(x);
			p.push(y);
		}
		gl.useProgram(this.prog);
		var y = p.pop();
		var x = p.pop();
		gl.uniform2f(this.p3, x, y);
		y = p.pop();
		x = p.pop();
		gl.uniform2f(this.p2, x, y);
		y = p.pop();
		x = p.pop();
		gl.uniform2f(this.p1, x, y);
		y = p.pop();
		x = p.pop();
		gl.uniform2f(this.p0, x, y);
	}
	draw()
	{
		// This is where we give the command to draw the curve.
		// Do not forget to bind the program and set the vertex attribute.
		gl.useProgram(this.prog);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.t_buffer);
		gl.vertexAttribPointer(this.t, 1, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.t);
		gl.drawArrays(gl.LINE_STRIP, 0, 100); // might have to change to 100 
	}
}

// Vertex Shader
var curvesVS = `
	attribute float t;
	uniform mat4 mvp;
	uniform vec2 p0;
	uniform vec2 p1;
	uniform vec2 p2;
	uniform vec2 p3;
	vec2 bezier(vec2 p0, vec2 p1, vec2 p2, vec2 p3, float t);
	void main()
	{
		// [TO-DO] Replace the following with the proper vertex shader code
		vec2 ft = bezier(p0, p1, p2, p3, t);
		gl_Position = mvp * vec4(ft, 0, 1);
	}

	vec2 bezier(vec2 p0, vec2 p1, vec2 p2, vec2 p3, float t)
	{
		vec2 sum1 = pow(1.0 - t, 3.0) * p0;
		vec2 sum2 = (3.0 * pow(1.0 - t, 2.0) * t) * p1;
		vec2 sum3 = (3.0 * (1.0 - t) * t * t) * p2;
		vec2 sum4 = (t * t * t) * p3; 
		return sum1 + sum2 + sum3 + sum4;
	}

`;

// Fragment Shader
var curvesFS = `
	precision mediump float;
	void main()
	{
		gl_FragColor = vec4(1,0,0,1);
	}
`;