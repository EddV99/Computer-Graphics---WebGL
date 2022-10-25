// This function takes the projection matrix, the translation, and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// The given projection matrix is also a 4x4 matrix stored as an array in column-major order.
// You can use the MatrixMult function defined in project4.html to multiply two 4x4 matrices in the same format.
function GetModelViewProjection(projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY) {
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	var cx = Math.cos(rotationX);
	var sx = Math.sin(rotationX);
	var rotX = [
		1, 0, 0, 0,
		0, cx, sx, 0,
		0, -sx, cx, 0,
		0, 0, 0, 1
	];

	var cy = Math.cos(rotationY);
	var sy = Math.sin(rotationY);
	var rotY = [
		cy, 0, -sy, 0,
		0, 1, 0, 0,
		sy, 0, cy, 0,
		0, 0, 0, 1
	];

	var mvp = MatrixMult(rotY, rotX);
	mvp = MatrixMult(trans, mvp);
	mvp = MatrixMult(projectionMatrix, mvp);
	return mvp;
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer {
	// The constructor is a good place for taking care of the necessary initializations.
	constructor() {
		// Initialize program
		this.prog = InitShaderProgram(meshVS, meshFS);

		// Get locations of uniform and attribute variables
		this.mvp = gl.getUniformLocation(this.prog, 'mvp');
		this.swap = gl.getUniformLocation(this.prog, 'swap');

		this.pos = gl.getAttribLocation(this.prog, 'pos');

		// Create buffers (We don't set buffer here)
		this.posBuffer = gl.createBuffer();

		// Create texture
		this.texture = gl.createTexture();

		// Set initial swap state
		this.swapYZ(0);
	}

	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions
	// and an array of 2D texture coordinates.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex.
	// Note that this method can be called multiple times.
	setMesh(vertPos, texCoords) {
		gl.useProgram(this.prog);

		this.numTriangles = vertPos.length / 3;

		gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);
	}

	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ(swap) {
		gl.useProgram(this.prog);

		if (swap) {
			gl.uniform1i(this.swap, 1);
		} else {
			gl.uniform1i(this.swap, 0);
		}
	}

	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	draw(trans) {
		gl.useProgram(this.prog);

		// Set uniform mvp
		gl.uniformMatrix4fv(this.mvp, false, trans);
		
		// Set pos attribute
		gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
		gl.vertexAttribPointer(this.pos, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.pos);

		gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);

	}

	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture(img) {
		// Bind the texture
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		// You can set the texture image data using the following command.
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);

		gl.generateMipMap(gl.TEXTURE_2D);
		// [TO-DO] Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.
	}

	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture(show) {
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
	}

}

var meshVS = `
uniform mat4 mvp;
uniform bool swap;
attribute vec3 pos;
void main()
{
	if (swap)
	{
		gl_Position = mvp * vec4(pos.xzy, 1);
	}
	else
	{
		gl_Position = mvp * vec4(pos, 1);
	}
}
`
var meshFS = `
precision mediump float;
void main()
{
	gl_FragColor = vec4(1,gl_FragCoord.z*gl_FragCoord.z,0,1);
}
`