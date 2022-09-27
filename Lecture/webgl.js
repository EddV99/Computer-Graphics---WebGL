window.onload = function () {
	// canvas from html
	canvas = document.getElementById("mycanvas");
	gl = canvas.getContext("webgl");

	// canvas height/width
	const pixelRatio = window.devicePixelRatio || 1;
	canvas.width = pixelRatio * canvas.clientWidth;
	canvas.height = pixelRatio * canvas.clientHeight;
	// set up gl viewport to whole canvas
	gl.viewport(0, 0, canvas.width, canvas.height);

	gl.clearColor(1, 1, 1, 0); // set background color as white
	gl.lineWidth(1.0); // set line thickness

	//positions for rectangle
	var positions = [
		-0.8, 0.4, 0,
		0.8, 0.4, 0,
		0.8, -0.4, 0,
		-0.8, 0.4, 0,
		0.8, -0.4, 0,
		-0.8, -0.4, 0
	];
	var colors = [
		1, 0, 0, 1,
		0, 1, 0, 1,
		0, 0, 1, 1,
		1, 0, 0, 1,
		0, 0, 1, 1,
		1, 0, 1, 1
	];

	/*Send data to gpu buffer
	*/

	// create buffer for position vector
	var position_buffer = gl.createBuffer();

	// bind pos buffer to ARRAY_BUFFER
	gl.bindBuffer(
		gl.ARRAY_BUFFER,
		position_buffer);
	// set buffer data
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array(positions),
		gl.STATIC_DRAW);

	// create buffer for color vector
	var color_buffer = gl.createBuffer();

	// bind color buffer to ARRAY_BUFFER
	gl.bindBuffer(
		gl.ARRAY_BUFFER,
		color_buffer);
	// set buffer data
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array(colors),
		gl.STATIC_DRAW);

	const vs_source = document.getElementById("vertexShader").text;
	// Create vertex shader and compile
	const vs = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vs, vs_source);
	gl.compileShader(vs);
	// Error check
	if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(vs));
		gl.deleteShader(vs);
	}
	const fs_source = document.getElementById("fragmentShader").text;
	// Create fragment shader and compile
	const fs = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fs, fs_source);
	gl.compileShader(fs);
	// Error check
	if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(fs));
		gl.deleteShader(fs);
	}

	// link both shaders
	prog = gl.createProgram();
	gl.attachShader(prog, vs);
	gl.attachShader(prog, fs);
	gl.linkProgram(prog);

	// Error check
	if(! gl.getProgramParameter(prog, gl.LINK_STATUS)){
		alert(gl.getProgramInfoLog(prog));
	}
	// get uniform matrix in vertex shader
	var m = gl.getUniformLocation(prog, 'trans');
	// tranformation matrix we are using
	var matrix = [
		1,0,0,0,
		0,1,0,0,
		0,0,1,0,
		0,0,0,1];
	// have to tell what vertex + fragment program we are using
	gl.useProgram(prog);
	// set uniform varible in vertex shader
	gl.uniformMatrix4fv(m, false, matrix);
	
	// set attributes in shaders
	var p = gl.getAttributeLocation(prog, 'pos');
	gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);
	gl.vertexAttribPointer(p, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(p);

	var c = gl.getAttributeLocation(prog, 'clr');
	gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
	gl.vertexAttribPointer(c, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(c);

	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.useProgram(prog);
	gl.drawArrays(gl.TRIANGLES, 0, 6);
}