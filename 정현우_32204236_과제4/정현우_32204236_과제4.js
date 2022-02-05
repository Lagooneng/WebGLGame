/**
 *
 * 리뷰어 : 정채윤 2022.02.05
 *
 * -- 코드 관점 포인트 요약 -----
 * 
 * 첫째 포인트 : 변수명과 함수명만 보고도 프로그래밍 의도를 파악할 수 있어야 함.
 *		1. 변수명은 명사로 시작하는 단어 조합 사용( 예. user, catEnemy, dogEnemy, bossEnemy ) ***
 *		2. 함수명은 동사로 시작하는 단어 조합 사용( 예. moveUser, attackEnumy ) ***
 
 * 두번째 포인트 : 조건문 사용방법
 *		1. 들여쓰기 최소화( 복잡도 증가 방지 )
 *		2. 복잡한 조건의 경우 함수로 분리하여 의미를 쉽게 파악할 수 있는 이름을 부여하라.
 *		3. 중복 조건을 제거하라.
 *		4. 조건문을 사용하기 전에 객체를 사용할 수 있는지 선 검토하라. ***
 *		   ( 예. Factory 메서드의 키값을 받아서 if, switch 문으로 분기처리 하는 대신 객체의 키/밸류로 제어 )
 *
 * 세번째 포인트 : 함수, 객체는 하나의 기능만 담당
 *		1. 함수는 입력받은 값은 항상 똑같은 값을 반환하도록 작성( 데이터 불변성 )
 * 		2. 인자 갯수는 4개 이상을 넘기지 않는게 좋으며, 넘어갈 경우 객체를 사용 권장.
 */

var canvas;
var gl;
var points = [];
var normals = [];

// 코드리뷰 : texCoords -> textureCoords 이름은 의미 파악이 쉽고, 식별이 용이한 단어 사용( text 와 혼동 )
var texCoords = [];

// 코드리뷰 : Webgl 에서 사용하는 useProgram() 메서드의 인자값인 것 같은데 그림자 효과 관련 객체라면 shaderProgram 과 같이 더 구체적인 표현이 좋을 듯 함.
var program;

// 코드리뷰 : 반복되는 네이티브 메서드의 참조값은 map( 키, 밸류 ) 형태를 가진 객체로 관리하는게 더 효율적일 것 같음.
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

// 코드리뷰 : 조건문, 반복문 등 구현부가 한줄인 경우 블럭 또는 줄바꿈 들여쓰기 사용( 회사 코딩컨벤션 마다 좀 다름 )
for( var i=0; i<numNodes; i++)
	figure[i] = createNode(null, null, null);

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

// 코드리뷰 : image와 같이 일반적인 단어 보다 tileImageByFloat32 또는 chessboardByFloat32 구체적인 이름 사용 
var image1 = new Array()

// 코드리뷰 : 데이터 생성 초기화
for (var i =0; i<texSize; i++)  
	image1[i] = new Array();

	for ( var j = 0; j < texSize; j++)
      		image1[i][j] = new Float32Array(4);

// 코드리뷰 : 데이터 갱신 로직 분리
for (var i =0; i<texSize; i++) {
      	for (var j=0; j<texSize; j++) {
         	var c = (((i & 0x8) == 0) ^ ((j & 0x8)  == 0));
		
		// 변수 선언 마지막 다음 로직은 2칸 줄바꿈( 가독성 향상 )
         	image1[i][j] = [c, c, c, 1];
      	}
}

// 코드리뷰 : image와 같이 일반적인 단어 보다 tileImageByUnit8 또는 chessboardByUnit3 구체적인 이름 사용 
var image2 = new Uint8Array(4*texSize*texSize);

for ( var i = 0; i < texSize; i++ )
	for ( var j = 0; j < texSize; j++ )
		for(var k =0; k<4; k++)
			image2[4*texSize*i+4*j+k] = 255*image1[i][j][k];

// 시작
window.onload = function init() {
	canvas = document.getElementById('gl-canvas');
	gl = WebGLUtils.setupWebGL( canvas );
	
	// 줄바꿈
	if ( !gl ) 
		alert( "WebGL isn't available" );
	
	cube();

	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 1, 1, 1, 1 );
	gl.enable(gl.DEPTH_TEST)
    
   program = initShaders( gl, "vertex-shader", "fragment-shader" );
   gl.useProgram( program );

   ambientProduct = mult(lightAmbient, materialAmbient);
   diffuseProduct = mult(lightDiffuse, materialDiffuse);
   specularProduct = mult(lightSpecular, materialSpecular);
	
	// 코드리뷰 : 변수명은 기능을 표현할 수 있는 더 구체적인 이름 사용해야 할 듯( 리터럴 함수는 별도 분리 필요 )
	var setBuffer = function(points) {
		gl.bindBuffer( gl.ARRAY_BUFFER, gl.createBuffer());
		gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
	};
	
	var setPosition = function(pointerIndex, locationItem, locationId) {
		var position = gl.getAttribLocation( locationItem, locationId );
		gl.vertexAttribPointer( position, pointerIndex, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( position );
	};

   	setBuffer(points);
	setPosition(4, program, 'vPosition');
	
	setBuffer(normals);
	setPosition(4, program, 'vNormal');
	
	setBuffer(texCoords);
	setPosition(2, program, 'vTexCoord');


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


// 코드리뷰 : 이벤트와 로직은 별도 분리해서 처리하는게 확장성에서 유리. UI 컨트롤러가 있는 경우 클릭시에도 해당 로직을 사용할 수 있음
// 예. window.onkeydown = moveUserHandler();

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

// 코드리뷰 : stopGame 동사 + 명사 형태의 이름 사용 
function gameStop() {
	var userPos = vec2(currentUserX + userWidth * 0.5, currentUserZ + userWidth * 0.5);
	var com1Pos = vec2(currentCom1X + comWidth * 0.5, currentCom1Z + comWidth * 0.5);
	var com2Pos = vec2(currentCom2X + comWidth * 0.5, currentCom2Z + comWidth * 0.5);
	var com3Pos = vec2(currentCom3X + comWidth * 0.5, currentCom3Z + comWidth * 0.5);

	// 코드리뷰 : 다른 함수에서도 사용할 수 있으므로 리터럴 함수 보다 별도 함수로 분리해서 사용 
	var isHit = function(userPos, enermyPos) {
		return userPos[0] - com1Pos[0])*(userPos - enermyPos[0]) + 
			(userPos[1] - enermyPos[1])*(userPos[1] - enermyPos[1]) < 1;
	}
	
	// 코드리뷰 : 복잡한 조건식은 함수로 분리
	if (isHit(userPos, com1Pos)) {
		// 코드리뷰 : 아래 인터벌 구문도 stopRender() 함수를 만들어 한곳에서 제어하는게 좋을 듯.
		clearInterval(interval1);
		clearInterval(interval2);
		clearInterval(interval3);
		return true;
	}
	
	if (isHit(userPos, com2Pos)) {
		// 코드리뷰 : 아래 인터벌 구문도 stopRender() 함수를 만들어 한곳에서 제어하는게 좋을 듯.
		clearInterval(interval1);
		clearInterval(interval2);
		clearInterval(interval3);
		return true;
	}
	
	if (isHit(userPos, com3Pos)) {
		// 코드리뷰 : 아래 인터벌 구문도 stopRender() 함수를 만들어 한곳에서 제어하는게 좋을 듯.
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

function initNodes(id) {
	
	// 코드리뷰 : 조건문 사용 전 객체를 활용할 수 있는지 검토
	var nodesData = {
		[bottomId]: {item: bottom, userId: userId, comId: null},
		[userId]: {item: user, userId: null, comId: com1Id},
		[com1Id]: {item: bottom, userId: null, comId: com2Id},
		[com2Id]: {item: bottom, userId: null, comId: com3Id},
		[com3Id]: {item: bottom, userId: null, comId: null},
	};
	
	// 코드리뷰 : 객체를 사용할 때는 반드시 유효성 검증이 필요
	if (!nodesData[id]) {
		return;
		
	figure[id] = createNode( nodesData[id].item, nodesData[id].userId, nodesData[id].comId );
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

	// 코드리뷰 : com1 보다는 좀 더 적의 특징을 표현할 수 있는 구체적인 이름이 좋을 듯 BallEnermy,
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
function getChangedDistance() {
	return (currentUserX + 2 - (currentCom1X + 0.5))*(currentUserX + 2 - (currentCom1X + 0.5)) + 
		(currentUserZ - 2 - currentCom1Z)*(currentUserZ - 2 - currentCom1Z);
}
	
	// 코드리뷰 : 사선 움직임이라면 moveEnermyDiagonally가 적합할 듯 함.
function comMove1() {
	// 0 동 1 서 2 남 3 북
	
	// idx 변수는 좌표만 구하면 되니 필요없을 듯 함.
	// var idx;
	var distance = 1000;
	
	// 매 렌더링 될 때 마다 거리값을 가져옴 
	var temp = getChangedDistance();
	
	// 동
	if ( currentCom1X + 0.5 < bottomWidth * 0.5) {
		distance = temp;
		currentCom1X +=  0.5;
	}

	// 서
	temp = getChangedDistance();
	
	if ( distance > temp && currentCom1X - 0.5 > -bottomWidth * 0.5 ) {
		distance = temp;
		currentCom1X -= 0.5;
	}

	// 남
	temp = getChangedDistance();
	
	if ( distance > temp && currentCom1Z + 0.5 < bottomWidth * 0.5) {
		distance = temp;
		currentCom1Z += 0.5;
	}

	// 북
	temp = getChangedDistance();
	
	if ( distance > temp && currentCom1Z - 0.5 > -bottomWidth * 0.5 ) {
		currentCom1Z -= 0.5;
	}
}

// 유저를 정확히 쫓아 가는 움직임
	
	// 코드리뷰 : 직선 움직임이라면 moveEnermyStraight가 적합할 듯 함.
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
