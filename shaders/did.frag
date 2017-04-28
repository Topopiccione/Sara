#version 330 core

in vec2 uv;
out vec4 color;

uniform int res_x;
uniform int res_y;
uniform float time;
uniform vec3 cameraOrg;
uniform vec3 cameraTrg;
uniform vec3 cameraUpd;

const int MAX_ITER = 100;
const float MAX_DIST = 25.0;
const float EPSILON  = 0.001;
const float fieldOfView = 1.0;
vec2 resolution = vec2( res_x, res_y );
const float PI = 3.14;


float nlength( vec3 v, float n ){
	return pow(v.x, n) + pow(v.y, n) + pow(v.z, n);
}

float smin( float a, float b, float k ) {
    float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
    return mix( b, a, h ) - k*h*(1.0-h);
}

float sphere( vec3 center, float radius ) {
	return length( center ) - radius;
}

float sBox( vec3 p, vec3 b ) {
	vec3 d = abs(p) - b;
	return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}

vec2 rotate(vec2 p, float ang) {
    float c = cos(ang), s = sin(ang);
    return vec2(p.x*c - p.y*s, p.x*s + p.y*c);
}
vec2 repeatAng(vec2 p, float n) {
    float ang = 2.0*3.14/n;
    float sector = floor(atan(p.x, p.y)/ang + 0.5);
    p = rotate(p, sector*ang);
    return p;
}
vec3 repeatAngS(vec2 p, float n) {
    float ang = 2.0*3.14/n;
    float sector = floor(atan(p.x, p.y)/ang + 0.5);
    p = rotate(p, sector*ang);
    return vec3(p.x, p.y, mod(sector, n));
}
float pModPolar(inout vec2 p, float repetitions) {
	float angle = 2*PI/repetitions;
	float a = atan(p.y, p.x) + angle/2.;
	float r = length(p);
	float c = floor(a/angle);
	a = mod(a,angle) - angle/2.;
	p = vec2(cos(a), sin(a))*r;
	// For an odd number of repetitions, fix cell index of the cell in -x direction
	// (cell index would be e.g. -5 and 5 in the two halves of the cell):
	if (abs(c) >= (repetitions/2)) c = abs(c);
	return c;
}

vec3 transl( vec3 pos, vec3 tran ) {
	mat4 mm = mat4(1.0, 0.0, 0.0, tran.x,
				0.0, 1.0, 0.0, tran.y,
				0.0, 0.0, 1.0, tran.z,
				0.0, 0.0, 0.0, 1.0);
	return (mm * vec4(pos, 1.0)).xyz;
}

/*
float distFunct( vec3 pos) {
	float cubo = sBox( pos, vec3(1.0, 2.0, 0.0) );
	//float croce = sdCross( pos, vec2( 3.0, 0.25 ) );
	
	//pos.y += 1.9;
	//float piano = sdPlane( pos, vec4(0.0, 1.0, 0.0, +0.0) );
	
	return cubo;
}
*/

float distFunct( vec3 pos ) {

	float s = 1.0;
	vec3 fp = pos - mod(pos - s * 0.5, s);
	//pos += vec3(1.16, 0.2, 0.0);
	//float c = pModPolar(pos.yz, 4);
	//pos = transl(pos, vec3(1.0, 0.5, 0.2));
	//pos = min(pos, -vec3(1.0, 0.15, 0.15) );
	pos.xyz = mod(pos.xyz, 1.25) - 1.25 * 0.5;
	//pos.y = mod(pos.y, 1.25) - 1.25 * .5;
	//pos = repeatAngS(pos.xz - vec2(0.5,1.0), 15);
	
	float cubo = sBox( pos, vec3(0.15) );
	
	return cubo;
}


void main()
{
	
	// Coordinate (x,y) che variano tra -1.0 e 1.0, come al solito
	vec2 pixelPos = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;
	pixelPos.x *= resolution.x / resolution.y;
	float t = time * 0.002;
	
	vec3 spaceUpDir   = cameraUpd;
	vec3 cameraOrigin = cameraOrg;
	vec3 cameraTarget = cameraTrg;
	vec3 cameraDir    = normalize( cameraTarget - cameraOrigin );
	vec3 cameraRight  = normalize( cross( cameraDir, spaceUpDir ) );
	vec3 cameraUp     = normalize( cross( cameraRight, cameraDir ) );
	vec3 rayDir       = normalize( (cameraRight * pixelPos.x + cameraUp * pixelPos.y) * fieldOfView + cameraDir);
	
	
	float totalDist = 0.0;
	vec3 pos = cameraOrigin;
	float dist = EPSILON;
	
	// Raymarch loop
	for ( int i = 0; i < MAX_ITER; i++ ) {
		if (dist < EPSILON|| totalDist > MAX_DIST)
        		break;
		dist = distFunct(pos);
		totalDist += dist;
		pos += dist * rayDir;
	}
	
	// calcolo illuminazione: arrivati qui abbiamo distanza percorsa; se > MAX_DIST raggio non ha intersecato
	// la superficie, altrimenti calcolo normale alla superficie in quel punto (campiono superficie nell'intorno
	// del punto trovato per ricavare tre componenti della normale) con cui posso calcolare le componenti
	// di riflessione e diffusione.
	vec2 eps = vec2(0.0, EPSILON);
	vec3 normal = normalize(vec3(
		distFunct(pos + eps.yxx) - distFunct(pos - eps.yxx),
		distFunct(pos + eps.xyx) - distFunct(pos - eps.xyx),
		distFunct(pos + eps.xxy) - distFunct(pos - eps.xxy)));
	
	// Diffuse lighting: prodotto scalare tra -rayDir e normale (non deve essere minore di 0)
	float diffuse = max(0.0, dot(-rayDir, normal));
	
	// Specular lighting: diffuse elevato ad una potenza "grande"
	float specular = pow( diffuse, 32.0 );
	
	// colore finale =  somma delle componenti di diffusione e riflessione
	float colour = diffuse + specular;

	float lenPos = length(pos);
	// finta occlusion map: dividere per potenze di lenPos
	color = vec4( vec3( colour/(lenPos*lenPos), colour*0.5 / (lenPos*lenPos), colour*0.9/lenPos ), 1.0 );
	//color = vec4( shdw, shdw * 0.5, shdw * 0.9, 1.0 );
	
}