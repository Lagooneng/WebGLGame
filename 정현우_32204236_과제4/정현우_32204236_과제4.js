var canvas;
var gl;
var points = [];
var normals = [];
var texCoords = [];
var program;
var interval1, interval2, interval3;
// lookAt() 관련 변수
var eye = vec3(0.0, 7.0, 6.0);
// 모델-뷰 행렬, 투영 행렬
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
// perspective() 관련 변수
var fovy = 70;
var aspect = 1.0;
var near = 0.01;
var far = 15;

// lighting 관련 변수
var light = vec4(-4.0, 5.0, 0.0, 0.0 );
var lightAmbient = vec4(0.0, 0.63, 0.82, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 20.0;

var ambientLoc, diffuseLoc, specularLoc, shininessLoc, lightLoc;
var normalMatrix, normalMatrixLoc;
var ambientProduct, diffuseProduct, specularProduct;

// 계층적 모델링 관련 변수
var bottomId = 0;
var userId = 1;
var com1Id = 2;
var com2Id = 3;
var com3Id = 4;

var instanceMatrix;

var bottomHeight = 1.0;
var bottomWidth = 8.0;

var currentUserX = 3.0;
var currentUserZ = 3.0;
var userWidth = 1.0;

var currentCom1X = -3.0;
var currentCom1Z = -3.0;
var currentCom2X = -3.0;
var currentCom2Z = 3.0;
var currentCom3X = 3.0;
var currentCom3Z = -3.0;
var comWidth = 1.0;

var numNodes = 5;

var figure = [];
for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null);

// 정점 정보
var vertices = [
	vec4(0.5, -0.5, -0.5, 1.0),	// 우 상 밑 0
	vec4(-0.5, -0.5, -0.5, 1.0), 	// 좌 상 밑 1
	vec4(-0.5, -0.5, 0.5, 1.0),	// 좌 하 밑 2
	vec4(0.5, -0.5, 0.5, 1.0),		// 우 하 밑 3
	vec4(0.5, 0.5, -0.5, 1.0),		// 우 상 위 4
	vec4(-0.5, 0.5, -0.5, 1.0), 	// 좌 상 위 5
	vec4(-0.5, 0.5, 0.5, 1.0),		// 좌 하 위 6
	vec4(0.5, 0.5, 0.5, 1.0)		// 우 하 위 7
];

// texture 관련 변수
var texSize = 32;

var texCoord = [
	vec2(0, 0),
	vec2(0, 1),
	vec2(1, 1),
	vec2(1, 0)
];
var image1 = new Array()
for (var i =0; i<texSize; i++)  
	image1[i] = new Array();
for (var i =0; i<texSize; i++)
   for ( var j = 0; j < texSize; j++)
      image1[i][j] = new Float32Array(4);
      for (var i =0; i<texSize; i++) 
      	for (var j=0; j<texSize; j++) {
         	var c = (((i & 0x8) == 0) ^ ((j & 0x8)  == 0));
         	image1[i][j] = [c, c, c, 1];
      	}

var image2 = new Uint8Array(4*texSize*texSize);
   for ( var i = 0; i < texSize; i++ )
      for ( var j = 0; j < texSize; j++ )
        	for(var k =0; k<4; k++)
            image2[4*texSize*i+4*j+k] = 255*image1[i][j][k];

// 시작
window.onload = function init() {
	canvas = document.getElementById('gl-canvas');
	gl = WebGLUtils.setupWebGL( canvas );
   if ( !gl ) { alert( "WebGL isn't available" ); }
   cube();

   gl.viewport( 0, 0, canvas.width, canvas.height );
   gl.clearColor( 1, 1, 1, 1 );

   gl.enable(gl.DEPTH_TEST)
    
   program = initShaders( gl, "vertex-shader", "fragment-shader" );
   gl.useProgram( program );

   ambientProduct = mult(lightAmbient, materialAmbient);
   diffuseProduct = mult(lightDiffuse, materialDiffuse);
   specularProduct = mult(lightSpecular, materialSpecular);

   var vBuffer = gl.createBuffer();
   gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
   gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
   var vPosition = gl.getAttribLocation( program, "vPosition" );
   gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
   gl.enableVertexAttribArray( vPosition );


   var nBuffer = gl.createBuffer();
   gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
   gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );
   var vNormal = gl.getAttribLocation( program, "vNormal" );
   gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
   gl.enableVertexAttribArray( vNormal );


   var tBuffer = gl.createBuffer();
   gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
   gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW );
   var vTexCoord = gl.getAttribLocation( program, "vTexCoord");
   gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(vTexCoord);


   modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
   projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
   ambientLoc = gl.getUniformLocation(program, "ambientProduct");
   diffuseLoc = gl.getUniformLocation(program, "diffuseProduct");
   specularLoc = gl.getUniformLocation(program, "specularProduct");
   shininessLoc = gl.getUniformLocation(program, "shininess");
   normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");
   lightLoc = gl.getUniformLocation(program, "lightPosition");

   modelViewMatrix = lookAt(eye, vec3(0, 0, 0) , vec3(0, 1, 0));
   projectionMatrix = perspective(fovy, aspect, near, far);

   normalMatrix = [
        vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
        vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
        vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
   ];

   gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix) );
   gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
   gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

   gl.uniform4fv(diffuseLoc, flatten(diffuseProduct));
   gl.uniform4fv(specularLoc, flatten(specularProduct));
   gl.uniform1f(shininessLoc, materialShininess);
   gl.uniform4fv(lightLoc, flatten(light));

   initNodes(bottomId);
   initNodes(userId);
   initNodes(com1Id);
   initNodes(com2Id);
   initNodes(com3Id);

   configureTexture();

   interval1 = setInterval(comMove1, 200);
   interval2 = setInterval(comMove2, 400);
   interval3 = setInterval(comMove3, 100);
   render();

}

window.onkeydown = function(event) {
	if (event.key === 'd' && currentUserX + 0.5 < bottomWidth * 0.5) {
		currentUserX = currentUserX + 0.5;
	} else if (event.key === 'a' && currentUserX - 0.5 > -bottomWidth * 0.5) {;
		currentUserX = currentUserX - 0.5;
	} else if (event.key === 'w' && currentUserZ - 0.5 > -bottomWidth * 0.5) {
		currentUserZ = currentUserZ - 0.5;
	} else if (event.key === 's' && currentUserZ + 0.5 < bottomWidth * 0.5) {
		currentUserZ = currentUserZ + 0.5;
	}
}

function gameStop() {
	var userPos = vec2(currentUserX + userWidth * 0.5, currentUserZ + userWidth * 0.5);
	var com1Pos = vec2(currentCom1X + comWidth * 0.5, currentCom1Z + comWidth * 0.5);
	var com2Pos = vec2(currentCom2X + comWidth * 0.5, currentCom2Z + comWidth * 0.5);
	var com3Pos = vec2(currentCom3X + comWidth * 0.5, currentCom3Z + comWidth * 0.5);

	if ( (userPos[0] - com1Pos[0])*(userPos[0] - com1Pos[0]) + 
		(userPos[1] - com1Pos[1])*(userPos[1] - com1Pos[1]) < 1 ) {
		clearInterval(interval1);
		clearInterval(interval2);
		clearInterval(interval3);
		return true;
	}
	if ( (userPos[0] - com2Pos[0])*(userPos[0] - com2Pos[0]) + 
		(userPos[1] - com2Pos[1])*(userPos[1] - com2Pos[1]) < 1 ) {
		clearInterval(interval1);
		clearInterval(interval2);
		clearInterval(interval3);
		return true;
	}
	if ( (userPos[0] - com3Pos[0])*(userPos[0] - com3Pos[0]) + 
		(userPos[1] - com3Pos[1])*(userPos[1] - com3Pos[1]) < 1 ) {
		clearInterval(interval1);
		clearInterval(interval2);
		clearInterval(interval3);
		return true;
	}
}

function render() {
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
   traverse(bottomId);
   if (gameStop()) {
   	return 0;
   }
   requestAnimFrame(render);
}



function cube() {
	Square(0, 3, 2, 1);
	Square(4, 5, 6, 7); 	
	Square(0, 4, 7, 3);		
	Square(2, 6, 5, 1);	
	Square(1, 5, 4, 0);		
	Square(3, 7, 6, 2);
}

function Square(a, b, c, d) {
	points.push(vertices[a]);
	points.push(vertices[b]);
	points.push(vertices[c]);
	points.push(vertices[d]);

	normals.push(vertices[a][0], vertices[a][1], vertices[a][2], 0.0);
   normals.push(vertices[b][0], vertices[b][1], vertices[b][2], 0.0);
   normals.push(vertices[c][0], vertices[c][1], vertices[c][2], 0.0);
   normals.push(vertices[d][0], vertices[d][1], vertices[d][2], 0.0);

   texCoords.push(texCoord[0]);
   texCoords.push(texCoord[1]);
   texCoords.push(texCoord[2]);
   texCoords.push(texCoord[3]);
}

function scale4(a, b, c) {
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}

function configureTexture() {
   var texture = gl.createTexture();
   gl.activeTexture( gl.TEXTURE0 );
   gl.bindTexture( gl.TEXTURE_2D, texture );
   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image2);
   gl.generateMipmap( gl.TEXTURE_2D );
   gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
   gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
   gl.uniform1i(gl.getUniformLocation( program, "texture"), 0);
}

function createNode(render, sibling, child){
   var node = {
   render: render,
   sibling: sibling,
   child: child,
   }
   return node;
}

function initNodes(Id) {
	switch(Id) {
		case bottomId:
		figure[bottomId] = createNode( bottom, userId, null );
		break;

		case userId:
	   figure[userId] = createNode( user, null, com1Id );
	   break;

	   case com1Id:
	   figure[com1Id] = createNode( com1, null, com2Id );
	   break;

	   case com2Id:
	   figure[com2Id] = createNode( com2, null, com3Id );
	   break;

	   case com3Id:
	   figure[com3Id] = createNode( com3, null, null );
	   break;
	}
}

function traverse(Id) {

   if(Id == null) return;
   figure[Id].render();
   if(figure[Id].child != null) traverse(figure[Id].child);
   if(figure[Id].sibling != null) traverse(figure[Id].sibling);
}

function bottom() {
	lightAmbient = vec4(0.0, 0.63, 0.82, 1.0 );
	ambientProduct = mult(lightAmbient, materialAmbient);

	gl.uniform1i(gl.getUniformLocation( program, "objNum"), 0);
   instanceMatrix = mult(modelViewMatrix, scale4( bottomWidth, bottomHeight, bottomWidth));
   gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));

   gl.uniform4fv(ambientLoc, flatten(ambientProduct));

   for(var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function user() {
	lightAmbient = vec4(1.0, 0.84, 0.0, 1.0 );
	ambientProduct = mult(lightAmbient, materialAmbient);

	gl.uniform1i(gl.getUniformLocation( program, "objNum"), 1);
   instanceMatrix = mult(modelViewMatrix, scale4( userWidth, userWidth, userWidth));
   instanceMatrix = mult(instanceMatrix, translate(currentUserX, bottomHeight + 0.1, currentUserZ));
   gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));

   gl.uniform4fv(ambientLoc, flatten(ambientProduct));

   for(var i =0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function com1() {
	lightAmbient = vec4(1.0, 0.0, 0.56, 1.0 );
	ambientProduct = mult(lightAmbient, materialAmbient);

	gl.uniform1i(gl.getUniformLocation( program, "objNum"), 2);
   instanceMatrix = mult(modelViewMatrix, scale4( comWidth, comWidth, comWidth));
   instanceMatrix = mult(instanceMatrix, translate(currentCom1X, bottomHeight + 0.1, currentCom1Z));
   gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));

   gl.uniform4fv(ambientLoc, flatten(ambientProduct));

   for(var i =0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function com2() {
	lightAmbient = vec4(0.0, 0.7, 0.2, 1.0 );
	ambientProduct = mult(lightAmbient, materialAmbient);

	gl.uniform1i(gl.getUniformLocation( program, "objNum"), 2);
   instanceMatrix = mult(modelViewMatrix, scale4( comWidth, comWidth, comWidth));
   instanceMatrix = mult(instanceMatrix, translate(currentCom2X, bottomHeight + 0.1, currentCom2Z));
   gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));

   gl.uniform4fv(ambientLoc, flatten(ambientProduct));

   for(var i =0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function com3() {
	lightAmbient = vec4(0.4, 0.2, 0.6, 1.0 );
	ambientProduct = mult(lightAmbient, materialAmbient);

	gl.uniform1i(gl.getUniformLocation( program, "objNum"), 2);
   instanceMatrix = mult(modelViewMatrix, scale4( comWidth, comWidth, comWidth));
   instanceMatrix = mult(instanceMatrix, translate(currentCom3X, bottomHeight + 0.1, currentCom3Z));
   gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));

   gl.uniform4fv(ambientLoc, flatten(ambientProduct));

   for(var i =0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

// 유저의 x + 2 y - 2 위치를 쫒아가는 움직임
function comMove1() {
	// 0 동 1 서 2 남 3 북
	var idx;
	var distance = 1000;
	// 동
	var temp = (currentUserX + 2 - (currentCom1X + 0.5))*(currentUserX + 2 - (currentCom1X + 0.5)) +  
		(currentUserZ - 2 - currentCom1Z)*(currentUserZ - 2 - currentCom1Z);
	if ( currentCom1X + 0.5 < bottomWidth * 0.5) {
		distance = temp;
		idx = 0;
	}

	// 서
	temp = (currentUserX + 2 - (currentCom1X - 0.5))*(currentUserX + 2 - (currentCom1X - 0.5)) +  
		(currentUserZ - 2 - currentCom1Z)*(currentUserZ - 2 - currentCom1Z);
	if ( distance > temp && currentCom1X - 0.5 > -bottomWidth * 0.5 ) {
		distance = temp;
		idx = 1;
	}

	// 남
	temp = (currentUserX + 2 - currentCom1X)*(currentUserX + 2 - currentCom1X) +  
		(currentUserZ - 2 - (currentCom1Z + 0.5))*(currentUserZ - 2 - (currentCom1Z + 0.5));
	if ( distance > temp && currentCom1Z + 0.5 < bottomWidth * 0.5) {
		distance = temp;
		idx = 2;
	}

	// 북
	temp = (currentUserX + 2 - currentCom1X)*(currentUserX + 2 - currentCom1X) +  
		(currentUserZ - 2  - (currentCom1Z - 0.5))*(currentUserZ - 2 - (currentCom1Z - 0.5));
	if ( distance > temp && currentCom1Z - 0.5 > -bottomWidth * 0.5 ) {
		idx = 3;
	}

	if (idx === 0) {
		currentCom1X = currentCom1X + 0.5;
	} else if (idx === 1) {
		currentCom1X = currentCom1X - 0.5;
	} else if (idx === 2) {
		currentCom1Z = currentCom1Z + 0.5;
	} else {
		currentCom1Z = currentCom1Z - 0.5;
	}
}

// 유저를 정확히 쫓아 가는 움직임
function comMove2() {
	// 0 동 1 서 2 남 3 북
	var idx;
	var distance = 1000;
	// 동
	var temp = (currentUserX  - (currentCom2X + 0.5))*(currentUserX - (currentCom2X + 0.5)) +  
		(currentUserZ - currentCom2Z)*(currentUserZ - currentCom2Z);
	if ( currentCom2X + 0.5 < bottomWidth * 0.5) {
		distance = temp;
		idx = 0;
	}

	// 서
	temp = (currentUserX  - (currentCom2X - 0.5))*(currentUserX  - (currentCom2X - 0.5)) +  
		(currentUserZ - currentCom2Z)*(currentUserZ - currentCom2Z);
	if ( distance > temp && currentCom2X - 0.5 > -bottomWidth * 0.5) {
		distance = temp;
		idx = 1;
	}

	// 남
	temp = (currentUserX - currentCom2X)*(currentUserX - currentCom2X) +  
		(currentUserZ  - (currentCom2Z + 0.5))*(currentUserZ - (currentCom2Z + 0.5));
	if ( distance > temp && currentCom2Z + 0.5 < bottomWidth * 0.5 ) {
		distance = temp;
		idx = 2;
	}

	// 북
	temp = (currentUserX - currentCom2X)*(currentUserX - currentCom2X) +  
		(currentUserZ - (currentCom2Z - 0.5))*(currentUserZ  - (currentCom2Z - 0.5));
	if ( distance > temp && currentCom2Z - 0.5 > -bottomWidth * 0.5 ) {
		idx = 3;
	}

	if (idx === 0) {
		currentCom2X = currentCom2X + 0.5;
	} else if (idx === 1) {
		currentCom2X = currentCom2X - 0.5;
	} else if (idx === 2) {
		currentCom2Z = currentCom2Z + 0.5;
	} else {
		currentCom2Z = currentCom2Z - 0.5;
	}
}

var count = 0;
var patrol = 12;
// 정해진 경로를 순찰
function comMove3() {
	if ( count < patrol ) {
		currentCom3Z = currentCom3Z + 0.5;
	} else if ( count < patrol * 2 ) {
		currentCom3X = currentCom3X - 0.5;
	} else if ( count < patrol * 3 ) {
		currentCom3Z = currentCom3Z - 0.5;
	} else {
		currentCom3X = currentCom3X + 0.5;
	}
	count = count + 1;
	if ( count === patrol * 4 ) {
		count = 0;
	}
}
