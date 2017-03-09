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

float udBox( vec3 p, vec3 b ) {
  return length(max(abs(p)-b,0.0));
}

float sBox( vec3 p, vec3 b ) {
	vec3 d = abs(p) - b;
	return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}

float sdCross( in vec3 p, in vec2 dimz ) {
  float da = sBox(p.xyz,vec3(dimz.xyy));
  float db = sBox(p.yzx,vec3(dimz.yxy));
  float dc = sBox(p.zxy,vec3(dimz.yyx));
  return min(da,min(db,dc));
}

// cilindro con sfere; r = spessore, c = altezza;
float capsule( vec3 p, float r, float c ) {
	return mix(length(p.xz)-r, length(vec3(p.x,abs(p.y)-c,p.z))-r, step(c,abs(p.y)));
}

float sdPlane( vec3 p, vec4 n ) {
  // n must be normalized
  return dot(p,n.xyz) + n.w;
}

/*
float distFunct( vec3 pos) {
	float cubo = sBox( pos, vec3(1.0) );
	float croce = sdCross( pos, vec2( 3.0, 0.25 ) );
	
	pos.y += 1.9;
	float piano = sdPlane( pos, vec4(0.0, 1.0, 0.0, +0.0) );
	
	return min(piano , min(cubo, croce) );
}

*/
float distFunct( vec3 pos ) {
	
	vec3 q = mod( pos, vec3(3.0) ) - 0.5 * vec3(3.0);
	float reticolo = smin( udBox( q, vec3(0.4) ), sdCross( q, vec2(3.0, 0.2) ), 0.2 );
	pos.z += 3.0;
	reticolo = min( udBox( pos, vec3( 0.3 ) ), reticolo );
	pos.x -= 3.0;
	return min( udBox( pos, vec3(0.7) ), reticolo );
	//return smin( udBox( pos, vec3(1.0) ), reticolo, 0.5 );

	//float cubo = sBox( pos, vec3(1.0) );
	//float s = 1.0;

	//for ( int i=0; i < 1; i++ ){
	//	vec3 newcoord = mod( pos * s, vec3(1.0/s) ) - 0.5 * vec3(1.0/s);
	//	s *= 3.0;
	//	float croce = sdCross( newcoord, vec2(3.0, 1.0/s) );
	//	cubo = max(cubo ,-croce);
	//}

	//return croce;
	//return cubo;
}


// calcolo delle ombre, grazie a Las, da http://www.pouet.net/topic.php?which=7931&page=2
// p: point as usual; l: direction to lightsource - normalized, 
// r: "some kind of shadow hardness"; d: stepwidth; i: number of steps
float shadow( vec3 p, vec3 l, float r, float d, float i ) {
	float o;
	for( ; i > 0.0; i-- ) {
		o = min( distFunct( p + l*i*d ), r );
	}
	return max( o / r, 0.0 );
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
	
	// Direzione in cui punta la camera ( versore ) = normalized cameraOrigin - cameraTarget
	vec3 cameraDir    = normalize( cameraTarget - cameraOrigin );
	
	// Direzione destra dalla prospettiva della camera, calcolata con prodotto vettoriale normalizzato
	// regola della mano destra
	vec3 cameraRight  = normalize( cross( cameraDir, spaceUpDir ) );
	
	// Direzione superiore della prospettiva della camera, calcolata con prodotto vettoriale normalizzato
	vec3 cameraUp     = normalize( cross( cameraRight, cameraDir ) );
	
	// calcola la direzione del raggio a partire dalle coordinate del punto dello schermo
	// e dalla posizione della camera
	vec3 rayDir       = normalize( (cameraRight * pixelPos.x + cameraUp * pixelPos.y) * fieldOfView + 1.5*cameraDir);
	
	
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

	//float shdw = shadow(pos, normalize(vec3(0.5,1.0,0.0)), 0.1, 0.1, 15.0);
	float shdw = shadow(pos, normalize(-rayDir), 0.1, 0.1, 15.0);
	colour += shdw * 1.75;

	float lenPos = length(pos);

	/*
	// test antialiasing che tanto non funziona
	float w = 3.0*fwidth(dist);
	eps = vec2(0.0, EPSILON * 10.0);
	float cx = colour + mix(distFunct(pos - eps.yxx), distFunct(pos + eps.yxx), smoothstep(-w,w,dist));
	float cy = colour + mix(distFunct(pos - eps.xyx), distFunct(pos + eps.xyx), smoothstep(-w,w,dist));
	float cz = colour + mix(distFunct(pos - eps.xxy), distFunct(pos + eps.xxy), smoothstep(-w,w,dist));
	color = vec4( vec3( cx/(lenPos*lenPos), cy*0.5 / (lenPos*lenPos), cz*0.9/lenPos ), 1.0 );
	return;
	*/

	// finta occlusion map: dividere per potenze di lenPos
	color = vec4( vec3( colour/(lenPos*lenPos), colour*0.5 / (lenPos*lenPos), colour*0.9/lenPos ), 1.0 );
	//color = vec4( shdw, shdw * 0.5, shdw * 0.9, 1.0 );
	
}