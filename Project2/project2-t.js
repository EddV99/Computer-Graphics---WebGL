// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The transformation first applies scale, then rotation, and finally translation.
// The given rotation value is in degrees.
function GetTransform(positionX, positionY, rotation, scale) {
	let rotationRad = rotation * Math.PI / 180;
	
	let S = Array(scale, 0, 0,
		0, scale, 0,
		0, 0, 1);

	let R = Array(Math.cos(rotationRad), Math.sin(rotationRad), 0,
		-Math.sin(rotationRad), Math.cos(rotationRad), 0,
		0, 0, 1);

	let T = Array(1, 0, 0,
		0, 1, 0,
		positionX, positionY, 1);

	let result = multiplyMatrix(R, S);
	return multiplyMatrix(T, result);
}

// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The arguments are transformation matrices in the same format.
// The returned transformation first applies trans1 and then trans2.
function ApplyTransform(trans1, trans2) {
	return multiplyMatrix(trans2, trans1); 
}

// Helper method that multiplies two 3x3 matrices together. Matrices should be given
// in an array of 9 values in column-major order. This method will return the result
// in that format. 
//
// Assumes both matrices are 3x3, does no checking.
// If we have two matrices A and B then calling
// multiplyMatrix(A, B) does A * B
function multiplyMatrix(m1, m2) {
	topRowIndexOrder = [0, 3, 6]; //Indexes of top row
	midRowIndexOrder = [1, 4, 7];
	botRowIndexOrder = [2, 5, 8];
	
	resultIndexTop = 0;
	resultIndexMid = 1;
	resultIndexBot = 2;

	result = Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
	/*Since arrays are in column major order, 
	  accessing them in by index ascending order (i= 0, 1, 2,...)
	  is traversing the column. Each 3rd pass is the whole column. 
	*/
	for (let i = 0; i <= 8; i++) { 
		result[resultIndexTop] += m1[topRowIndexOrder[i % 3]] * m2[i]; //We can use properties of modulus to cylce the index order
		result[resultIndexMid] += m1[midRowIndexOrder[i % 3]] * m2[i];
		result[resultIndexBot] += m1[botRowIndexOrder[i % 3]] * m2[i];
		if ((i % 3) == 2) { 
			resultIndexTop += 3;
			resultIndexMid += 3;
			resultIndexBot += 3;
		}
	}
	return result;
}
