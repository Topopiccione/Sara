#version 330 core

in vec2 uv;
out vec4 color;

uniform int res_x;
uniform int res_y;
uniform float time;
uniform vec3 cameraOrg;
uniform vec3 cameraTrg;
uniform vec3 cameraUpd;
uniform sampler2D tex;

const int MAX_ITER = 128;
const float MAX_DIST = 35.0;
const float EPSILON  = 0.001;
const float fieldOfView = 1.0;
const float zoom = 0.5;


vec3 cubemap( sampler2D sam, in vec3 d ) {
    vec3 n = abs(d);
//#if 0
    // sort components (small to big)    
    float mi = min(min(n.x,n.y),n.z);
    float ma = max(max(n.x,n.y),n.z);
    vec3 o = vec3( mi, n.x+n.y+n.z-mi-ma, ma );
    return texture2D( sam, abs(0.8*o.xy/o.z) ).xyz;
//#else
   vec2 uuv = (n.x>n.y && n.x>n.z) ? d.yz/d.x: 
              (n.y>n.x && n.y>n.z) ? d.zx/d.y:
                                     d.xy/d.z;
    return texture( sam, uuv ).xyz;
//#endif    
}



/// Primitive
float intersect(float d1, float d2) {
    return max(d2, d1);
}
float plane(vec3 p, vec3 n, float offs) {
	return dot(p, n) - offs;
}
float sphere(vec3 p, float r) {
	return length(p) - r;
}
float cylinder(in vec3 p, float r) {
    return length(p.xz) - r;
}
float cylinder(in vec3 p, float r, float h) {
    float d = cylinder(p, r);
    return max(d, abs(p.y) - h*0.5);
}
float sBox( vec3 p, vec3 b ) {
	vec3 d = abs(p) - b;
	return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}


//// Rotazioni e modifiche
vec2 rotate(vec2 p, float ang) {
    float c = cos(ang), s = sin(ang);
    return vec2(p.x*c - p.y*s, p.x*s + p.y*c);
}
float repeat(float coord, float spacing) {
    return mod(coord, spacing) - spacing*0.5;
}
float repeatAli(float coord, float spacing) {
    return mod(coord + 0.1, spacing) - spacing*0.5;
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

//// Distorsioni
float cisti( vec3 pos, float time, float numeroCisti, float larghezzaCisti ) {
	return sin(pos.y * numeroCisti + time* 0.002) * larghezzaCisti;
}


//// Forme composte
float setola( vec3 pos, float r, float h ) {
	float cyl = cylinder( pos, r, h );
	float punta = sphere( pos - vec3(0.0,h/2.0,0.0), r );
	return min(cyl, punta);
}

float setola( vec3 pos, float r, float h, out vec3 colore ) {
	float cyl = cylinder( pos, r, h );
	float punta = sphere( pos - vec3(0.0,h/2.0,0.0), r );
	colore = cubemap( tex, pos + vec3(0.51, 0.0, 0.0) );
	return min(cyl, punta);
}

float pennello( vec3 pos ) {
	pos.xz = rotate(pos.xz, -length(pos.xy)*0.2*cos(time * 0.025));
	pos.xz = repeatAng( pos.xz, 13 );
	pos.yz = rotate( pos.yz, 0.1 );
	pos.y -= 0.6 * abs(pos.z);
	pos.z = max( pos.z, -2.0 );
	pos.z = min( pos.z, 2.0 );
	pos.z = repeatAli( pos.z, 0.2 );
	return setola( pos, 0.05, 2.0 );// + cisti( pos, time, 20.0, 0.008 );
}

float pennello( in vec3 pos, out vec3 colore ) {
	pos.xz = rotate(pos.xz, -length(pos.xy)*0.2*cos(time * 0.025));
	pos.xz = repeatAng( pos.xz, 13 );
	pos.yz = rotate( pos.yz, 0.1 );
	colore = cubemap( tex, pos + vec3(0.51, 0.0, 0.0) );
	pos.y -= 0.6 * abs(pos.z);
	pos.z = max( pos.z, -2.0 );
	pos.z = min( pos.z, 2.0 );
	pos.z = repeatAli( pos.z, 0.2 );
	return setola( pos, 0.05, 2.0 );// + cisti( pos, time, 20.0, 0.008 );
}

float singoloPennello( vec3 pos, out vec3 colore ) {
	//pos.xz = rotate(pos.xz, -length(pos.xy) * 0.5);
	colore = cubemap( tex, pos + vec3(0.51, 0.0, 0.0) );
	pos.xz = repeatAng( pos.xz, 13 );
	pos.yz = rotate( pos.yz, 0.1 );
	pos.y -= 0.6 * abs(pos.z);
	pos.z = max( pos.z, -2.0 );
	pos.z = min( pos.z, 2.1 );
	pos.z = repeat( pos.z, 0.2332 );
	return setola( pos, 0.05, 2.0 );// + cisti( pos, time, 20.0, 0.008 );
}


//// Background
// da hills.frag
vec3 GetSky(in vec3 rd) {
	vec3 sunLight  = normalize( vec3( -0.75, 0.2, -0.6 ) );
	vec3 sunColour = vec3(1.0, .75, .6);

	float sunAmount = max( dot( rd, sunLight), 0.0 );
	float v = pow(1.0-max(rd.y,0.0),6.);
	vec3  sky = mix(vec3(.1, .2, .3), vec3(.32, .32, .32), v);
	sky = sky + sunColour * sunAmount * sunAmount * .25;
	sky = sky + sunColour * min(pow(sunAmount, 800.0)*1.5, .3);
	return clamp(sky, 0.0, 1.0);
}


vec2 sim2d(vec2 p,float s){
   vec2 ret=p;
   ret=p+s/2.0;
   ret=fract(ret/s)*s-s/2.0;
   return ret;
}


float distFunct( in vec3 pos, out vec3 colore ) {
	////// Singolo cilindro
	// pos.x = repeat( pos.x, 1.2 );
	// pos.z = repeat( pos.z, 0.7 );
	// //float set = setola( pos, 0.2, 2.0 ); // Variante senza texture
	// float set = setola( pos, 0.2, 2.0, colore );
	// return set;
	// return set + cisti( pos, time, 20.0, 0.04 );
	
	////// Singolo pennello
	// float penn = singoloPennello( pos, colore );
	// return penn;
	
	////// Cometa
	// pos.y = max( pos.y, -2.5 );
	// pos.y = min( pos.y, 1.0 );
	// pos.xz = rotate( pos.xz, 0.005 * time );
	// pos.y = repeat(pos.y, 2.5 );
	// pos.z += 1.0;
	// float penn = pennello( pos, colore );
	// return penn;
	
	////// Fila indiana
	// pos.y = max( pos.y, -2.5 );
	// pos.xz = rotate( pos.xz, 0.005 * time );
	// pos.y = repeat(pos.y, 2.5 );
	// pos.z += 1.0;
	// float penn = pennello( pos, colore );
	// return penn;
	
	////// Cespugli rotanti
	// float penn;
	// // float s = 0.025;
	// // pos = pos-mod(pos-s/2.0,s);
	// float d=sin(length(pos/2.0)*1.0-time*0.02)*(sin(length(pos/50.0)*4.0-time*0.01)*0.5+0.5);
	// pos.xz = sim2d(pos.xz, 2.5 );
	// pos.xz = rotate( pos.xz, 1.4 * d );
	// penn = singoloPennello( pos, colore );
	// return penn;
	
	float d=sin(length(pos/2.0)*1.0-time*0.02)*(sin(length(pos/50.0)*4.0-time*0.01)*1.5+0.5);
	pos.y = max( pos.y, -2.5 );
	pos.xz = rotate( pos.xz, 0.5 * d );
	pos.y = repeat(pos.y, 2.5 );
	pos.z += 1.0;
	float penn = pennello( pos, colore );
	return penn;
}




void main() {
	
	vec2 resolution = vec2( res_x, res_y );
	vec2 pixelPos = ( -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy ) * resolution.x / resolution.y;
	float t = time * 0.2;
	
	vec3 cameraTar = vec3(0.0);
	vec3 cameraOrigin = vec3(6.0) * cameraTrg;
	
	vec3 cameraDir	= normalize( cameraTar - cameraOrigin );
	//vec3 cameraDir    = normalize( cameraTrg - cameraOrg );
	vec3 cameraRight  = normalize( cross( cameraDir, -cameraUpd ) );
	vec3 cameraUp     = normalize( cross( cameraRight, -cameraDir ) );
	vec3 rayDir       = normalize( (cameraRight * pixelPos.x + cameraUp * pixelPos.y) * fieldOfView + cameraDir);
	
	float totalDist = 0.0;
	//vec3 pos = cameraOrg;
	vec3 pos = cameraOrigin;
	float dist = EPSILON;
	
	vec3 ccc;
	vec3 dummy;
	bool rayMiss = false;
	
	// Raymarch loop
	for ( int i = 0; i < MAX_ITER; i++ ) {
		if (dist < EPSILON)
        	break;
		if ( totalDist > MAX_DIST ) {
			rayMiss = true;
			break;
		}
		dist = distFunct(pos, ccc);
		totalDist += dist * 0.1;
		pos += dist * rayDir;
	}
	
	// bersaglio mancato!
	if (rayMiss) {
		//color = vec4( 0.5, 0.2, 0.3, 1.0);
		color = vec4( GetSky( vec3(-rayDir.y, rayDir.xz )), 1.0 );
		return;
	}
		
	vec2 eps = vec2(0.0, EPSILON);
	vec3 normal = normalize(vec3(
		distFunct(pos + eps.yxx, dummy) - distFunct(pos - eps.yxx, dummy),
		distFunct(pos + eps.xyx, dummy) - distFunct(pos - eps.xyx, dummy),
		distFunct(pos + eps.xxy, dummy) - distFunct(pos - eps.xxy, dummy)));
	float diffuse = max(0.35, dot(-rayDir, normal));
	float specular = pow( diffuse, 16.0 );
	
	float lenPos = length(pos);
	
	//vec3 ff = texcube( tex, 0.1*vec3(pos.x,4.0*res_y-pos.y,pos.z), normal ).xyz;
	//vec3 ff = texcube( tex, 0.1*pos, normal ).xyz;
    //vec3 colour = (vec3(0.1/totalDist) + vec3((diffuse + specular)/lenPos)) * ff * 1.25;
	//vec3 colour = vec3(0.5/totalDist) * ff * 2.5;
	//color = vec4( colour, 1.0 );
	
	//color = vec4( texture(tex, gl_FragCoord.xy / resolution) );
	
	// vec3 ff = cubemap( tex, pos ) * 3.0;
	//color = vec4( ccc * 2.0, 1.0 );
	//color = vec4( vec3((diffuse + specular)/(lenPos * 0.3)) * ccc, 1.0 );
	color = vec4( (vec3(1.0/totalDist) + vec3((diffuse + specular)/lenPos)) * ccc, 1.0 );
	
	//color = vec4( vec3(0.1/totalDist) + vec3((diffuse + specular)/lenPos), 1.0 );
	//color = vec4( vec3((diffuse + specular)/lenPos), 1.0 );
	// ^^^ usare una di queste due per mostrare le geometrie
	
}