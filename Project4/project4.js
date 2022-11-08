// This function takes the projection matrix, the translation, and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// The given projection matrix is also a 4x4 matrix stored as an array in column-major order.
// You can use the MatrixMult function defined in project4.html to multiply two 4x4 matrices in the same format.
function GetModelViewProjection(projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY) {

	var translation = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	var cosx = Math.cos(rotationX);
	var sinx = Math.sin(rotationX);
	var rotX = [
		1, 0, 0, 0,
		0, cosx, sinx, 0,
		0, -sinx, cosx, 0,
		0, 0, 0, 1
	];

	var cosy = Math.cos(rotationY);
	var siny = Math.sin(rotationY);
	var rotY = [
		cosy, 0, -siny, 0,
		0, 1, 0, 0,
		siny, 0, cosy, 0,
		0, 0, 0, 1
	];

	// Rotate from x axis then y 
	var mvp = MatrixMult(rotY, rotX);
	// Then do translation
	mvp = MatrixMult(translation, mvp);
	// last projection matrix
	mvp = MatrixMult(projectionMatrix, mvp);
	return mvp;
}

class MeshDrawer {
	// The constructor is a good place for taking care of the necessary initializations.
	constructor() {
		// Initialize program
		this.prog = InitShaderProgram(meshVS, meshFS);

		// Uniform locations
		this.mvp = gl.getUniformLocation(this.prog, 'mvp');
		this.swap = gl.getUniformLocation(this.prog, 'swap');
		this.show = gl.getUniformLocation(this.prog, 'show');
		this.sampler = gl.getUniformLocation(this.prog, 'texture');

		// Attribute locations
		this.pos = gl.getAttribLocation(this.prog, 'pos');
		this.texPos = gl.getAttribLocation(this.prog, 'texPos');

		// Create buffers (We don't set buffer here)
		this.posBuffer = gl.createBuffer();
		this.texPosBuffer = gl.createBuffer();

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

		// Send pos data to gpu
		gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);
		// Send texture pos data to gpu
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texPosBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
	}

	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ(swap) {
		gl.useProgram(this.prog);

		if (swap) {
			gl.uniform1i(this.swap, 1); // one same as true
		} else {
			gl.uniform1i(this.swap, 0); // set to false
		}
	}

	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	draw(trans) {
		gl.useProgram(this.prog);

		// Set uniform mvp
		gl.uniformMatrix4fv(this.mvp, false, trans);

		// Get ready to use data in gpu
		gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
		gl.vertexAttribPointer(this.pos, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.pos);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texPosBuffer);
		gl.vertexAttribPointer(this.texPos, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.texPos);

		gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);

	}

	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture(img) {
		gl.useProgram(this.prog);

		// Bind the texture
		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		// You can set the texture image data using the following command.
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
		gl.generateMipmap(gl.TEXTURE_2D);

		// Use unit 0
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		// Setting sampler to id of unit
		gl.uniform1i(this.sampler, 0);

		// Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.
		this.showTexture(1);
	}

	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture(show) {
		gl.useProgram(this.prog);

		if (show) {
			gl.uniform1i(this.show, 1);
		} else {
			gl.uniform1i(this.show, 0);
		}
	}

}

var meshVS = `
uniform mat4 mvp;
uniform bool swap;
attribute vec3 pos;
attribute vec2 texPos;
varying vec2 texCoord;
void main()
{
	if (swap)
	{
		gl_Position = mvp * vec4(pos.xzy, 1);
		gl_Position = mvp * vec4(pos.xzy, 1); // Use swizzle to swap y & z
		texCoord = texPos;
	}
	else
	{
		gl_Position = mvp * vec4(pos, 1);
		texCoord = texPos;
	}
}
`
var meshFS = `
precision mediump float;
uniform bool show;
uniform sampler2D texture;
varying vec2 texCoord;
void main()
{
	gl_FragColor = vec4(1,gl_FragCoord.z*gl_FragCoord.z,0,1);
	if (show)
	{
		gl_FragColor = texture2D(texture, texCoord);
	}
	else
	{
		gl_FragColor = vec4(1, gl_FragCoord.z*gl_FragCoord.z, 0, 1);
	}
	
}
`