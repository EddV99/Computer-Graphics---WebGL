// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// You can use the MatrixMult function defined in project5.html to multiply two 4x4 matrices in the same format.
function GetModelViewMatrix(translationX, translationY, translationZ, rotationX, rotationY) {
	// Modify the code below to form the transformation matrix.
	var trans = [
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

	var mv = MatrixMult(rotY, rotX);
	mv = MatrixMult(trans, mv);

	return mv;
}


// Complete the implementation of the following class.

class MeshDrawer {
	// The constructor is a good place for taking care of the necessary initializations.
	constructor() {
		// Program
		this.prog = InitShaderProgram(meshVS, meshFS);

		// Uniform Locations
		this.show = gl.getUniformLocation(this.prog, 'show');
		this.swap = gl.getUniformLocation(this.prog, 'swap');
		this.shininess = gl.getUniformLocation(this.prog, 'shininess');
		this.sampler = gl.getUniformLocation(this.prog, 'texture');
		this.mvp = gl.getUniformLocation(this.prog, 'mvp');
		this.mv = gl.getUniformLocation(this.prog, 'mv');
		this.mvn = gl.getUniformLocation(this.prog, 'mvn');
		this.lightDir = gl.getUniformLocation(this.prog, 'lightDir');

		// Attribute Locations
		this.pos = gl.getAttribLocation(this.prog, 'pos');
		this.texturePos = gl.getAttribLocation(this.prog, 'texturePos');
		this.normal = gl.getAttribLocation(this.prog, 'normal');

		// Buffers
		this.posBuffer = gl.createBuffer();
		this.tPosBuffer = gl.createBuffer();
		this.normalsBuffer = gl.createBuffer();

		// Texture
		this.texture = gl.createTexture();

		// Initial States
		this.swapYZ(0);
		this.showTexture(0);
	}

	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions,
	// an array of 2D texture coordinates, and an array of vertex normals.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex and every three consecutive 
	// elements in the normals array form a vertex normal.
	// Note that this method can be called multiple times.
	setMesh(vertPos, texCoords, normals) {
		// Update the contents of the vertex buffer objects.
		gl.useProgram(this.prog);
		this.numTriangles = vertPos.length / 3;

		gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.tPosBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
	}
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox.
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ(swap) {
		// Set the uniform parameter(s) of the vertex shader
		gl.useProgram(this.prog);
		if (swap) {
			gl.uniform1i(this.swap, 1);
		} else {
			gl.uniform1i(this.swap, 0);
		}
	}

	// This method is called to draw the triangular mesh.
	// The arguments are the model-view-projection transformation matrixMVP,
	// the model-view transformation matrixMV, the same matrix returned
	// by the GetModelViewProjection function above, and the normal
	// transformation matrix, which is the inverse-transpose of matrixMV.
	draw(matrixMVP, matrixMV, matrixNormal) {
		// Complete the WebGL initializations before drawing
		gl.useProgram(this.prog);
		// Set uniform variables
		gl.uniformMatrix4fv(this.mvp, false, matrixMVP);
		gl.uniformMatrix4fv(this.mv, false, matrixMV);
		gl.uniformMatrix3fv(this.mvn, false, matrixNormal);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
		gl.vertexAttribPointer(this.pos, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.pos);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.tPosBuffer);
		gl.vertexAttribPointer(this.texturePos, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.texturePos);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
		gl.vertexAttribPointer(this.normal, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.normal);

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

		// Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		gl.uniform1i(this.sampler, 0);

		this.showTexture(1);
	}

	// This method is called when the user changes the state of the
	// "Show Texture" checkbox.
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture(show) {
		// set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
		gl.useProgram(this.prog);
		if (show) {
			gl.uniform1i(this.show, 1);
		} else {
			gl.uniform1i(this.show, 0);
		}
	}

	// This method is called to set the incoming light direction
	setLightDir(x, y, z) {
		// set the uniform parameter(s) of the fragment shader to specify the light direction.
		gl.useProgram(this.prog);
		gl.uniform3f(this.lightDir, x, y, z);
	}

	// This method is called to set the shininess of the material
	setShininess(shininess) {
		// set the uniform parameter(s) of the fragment shader to specify the shininess.
		gl.useProgram(this.prog);
		gl.uniform1f(this.shininess, shininess);
	}
}



var meshVS = `
// uniform varibles
uniform bool swap;
uniform mat4 mvp;
uniform mat4 mv;

// attribute varibles
attribute vec3 pos;
attribute vec3 normal;
attribute vec2 texturePos;

// varying varibles
varying vec2 vtexturePos;
varying vec3 vnormal;
varying vec3 viewDirection;

vec4 vdir;
void main()
{
	vec4 vdir = mv * vec4(pos, 1);
	viewDirection = normalize(-1.0*vdir.xyz);

	if ( swap )
	{
		gl_Position = mvp * vec4(pos.xzy, 1);
		vnormal = normal.xzy;
		vtexturePos = texturePos;
	}
	else
	{
		gl_Position = mvp * vec4(pos, 1);
		vnormal = normal;
		vtexturePos = texturePos;
	}
}
`
var meshFS = `
precision mediump float;

// uniform varibles
uniform bool show;
uniform float shininess;
uniform sampler2D texture;
uniform vec3 lightDir;
uniform mat3 mvn;

// varying varibles
varying vec2 vtexturePos;
varying vec3 vnormal;
varying vec3 viewDirection;

// function declaration
vec3 blinn(vec3 Kd);

void main()
{
	if ( show )
	{
		vec4 tc = texture2D(texture, vtexturePos);
		gl_FragColor = vec4(blinn(tc.xyz), tc.w);
	}
	else
	{
		gl_FragColor = vec4(blinn(vec3(1, 1, 1)), 1);
	}
}

// Does Blinn Material Model shading. Returns color as vec3.
vec3 blinn(vec3 Kd)
{
	vec3 Ks = vec3(1, 1, 1); // specular
	vec3 I = vec3(1, 1, 1); // intensity

	vec3 n = mvn * vnormal; // normal in camera space
	vec3 h = normalize(lightDir + viewDirection);

	float cosTheta = dot(n, lightDir);
	float cosPhi = dot(n, h);

	return I * ((cosTheta * Kd) + (Ks * pow(cosPhi, shininess)));
}
`


// This function is called for every step of the simulation.
// Its job is to advance the simulation for the given time step duration dt.
// It updates the given positions and velocities.
function SimTimeStep(dt, positions, velocities, springs, stiffness, damping, particleMass, gravity, restitution) {
	var forces = Array(positions.length); // The total for per particle

	// Compute the total force of each particle
	//	First add gravity force to each particle
	let mg = gravity.mul(particleMass);
	for (let i = 0; i < forces.length; ++i) {
		forces[i] = mg.copy();
	}

	// For each mass-spring system find spring and damping forces
	for (let i = 0; i < springs.length; ++i) {
		// mass-spring system
		let mss = springs[i];

		// spring force
		let length = (positions[mss.p1].sub(positions[mss.p0])).len();
		let direction = (positions[mss.p1].sub(positions[mss.p0])).div(length);
		let springForce0 = direction.mul(length - mss.rest).mul(stiffness);

		// damping force
		let changeOfLength = (velocities[mss.p1].sub(velocities[mss.p0])).dot(direction);
		let dampingForce0 = direction.mul(changeOfLength).mul(damping * stiffness);

		// update forces
		forces[mss.p0].inc((springForce0.add(dampingForce0)));
		forces[mss.p1].dec((springForce0.add(dampingForce0)));
	}

	// Update positions and velocities for each particle
	for (let i = 0; i < positions.length; ++i) {
		let acceleration = forces[i].div(particleMass);

		// semi-implicit euler
		velocities[i].inc(acceleration.mul(dt));
		positions[i].inc(velocities[i].mul(dt));
	}

	// Handle collisions
	for (let i = 0; i < positions.length; ++i) {
		if (positions[i].x > 1) {
			let h = (positions[i].x - 1) * restitution;
			positions[i].x = 1 - h;
			velocities[i].x = -restitution * velocities[i].x;
		}
		if (positions[i].y > 1) {
			let h = (positions[i].y - 1) * restitution;
			positions[i].y = 1 - h;
			velocities[i].y = -restitution * velocities[i].y;
		}
		if (positions[i].z > 1) {
			let h = (positions[i].z - 1) * restitution;
			positions[i].z = 1 - h;
			velocities[i].z = -restitution * velocities[i].z;
		}

		if (positions[i].x < -1) {
			let h = Math.abs(positions[i].x - (-1)) * restitution;
			positions[i].x = h + -1;
			velocities[i].x = -restitution * velocities[i].x;
		}
		if (positions[i].y < -1) {
			let h = Math.abs(positions[i].y - (-1)) * restitution;
			positions[i].y = h + -1;
			velocities[i].y = -restitution * velocities[i].y;
		}
		if (positions[i].z < -1) {
			let h = Math.abs(positions[i].z - (-1)) * restitution;
			positions[i].z = h + -1;
			velocities[i].z = -restitution * velocities[i].z;
		}
	}
}