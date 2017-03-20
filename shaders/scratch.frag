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

const int MAX_ITER = 50;
const float MAX_DIST = 35.0;
const float EPSILON  = 0.001;
const float fieldOfView = 0.5;
const float zoom = 0.5;


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

float singoloPennello( vec3 pos ) {
	//pos.xz = rotate(pos.xz, -length(pos.xy) * 0.5);
	pos.xz = repeatAng( pos.xz, 13 );
	pos.yz = rotate( pos.yz, 0.1 );
	pos.y -= 0.6 * abs(pos.z);
	pos.z = max( pos.z, -2.0 );
	pos.z = min( pos.z, 2.0 );
	pos.z = repeat( pos.z, 0.2 );
	return setola( pos, 0.05, 2.0 );// + cisti( pos, time, 20.0, 0.008 );
}

/////// Calcolo del colore: lettura da texture
vec4 texcube( sampler2D sam, in vec3 p, in vec3 n ) {
	vec4 x = texture( sam, p.yz );
	vec4 y = texture( sam, p.zx );
	vec4 z = texture( sam, p.yx );
    vec3 a = abs(n);
	return (x*a.x + y*a.y + z*a.z) / (a.x + a.y + a.z);
}

vec3 cubemap( sampler2D sam, in vec3 d ) {
    vec3 n = abs(d);
#if 0
    // sort components (small to big)    
    float mi = min(min(n.x,n.y),n.z);
    float ma = max(max(n.x,n.y),n.z);
    vec3 o = vec3( mi, n.x+n.y+n.z-mi-ma, ma );
    return texture2D( sam, abs(.09*o.xy/o.z) ).xyz;
#else
   vec2 uuv = (n.x>n.y && n.x>n.z) ? d.yz/d.x: 
              (n.y>n.x && n.y>n.z) ? d.zx/d.y:
                                     d.xy/d.z;
    return texture( sam, uuv ).xyz;
#endif    
}



float distFunct( vec3 pos ) {
	////// Singolo cilindro
	// pos.x = repeat( pos.x, 1.0 );
	// pos.z = repeat( pos.z, 0.5 );
	// float set = setola( pos, 0.2, 2.0 );
	// return set;
	// return set + cisti( pos, time, 20.0, 0.04 );
	
	////// Singolo pennello
	// float penn = singoloPennello( pos );
	// return penn;
	
	////// Cometa
	// pos.y = max( pos.y, -2.5 );
	// pos.y = min( pos.y, 1.0 );
	// pos.xz = rotate( pos.xz, 0.005 * time );
	// pos.y = repeat(pos.y, 2.5 );
	// pos.z += 1.0;
	// float penn = pennello( pos );
	// return penn;
	
	////// Fila indiana
	pos.y = max( pos.y, -2.5 );
	pos.xz = rotate( pos.xz, 0.005 * time );
	pos.y = repeat(pos.y, 2.5 );
	pos.z += 1.0;
	float penn = pennello( pos );
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
	
	// Raymarch loop
	for ( int i = 0; i < MAX_ITER; i++ ) {
		if (dist < EPSILON|| totalDist > MAX_DIST)
        	break;
		dist = distFunct(pos);
		totalDist += dist * 0.1;
		pos += dist * rayDir;
	}
	
	color = vec4( vec3(0.75/totalDist), 1.0 );
	
	vec2 eps = vec2(0.0, EPSILON);
	vec3 normal = normalize(vec3(
		distFunct(pos + eps.yxx) - distFunct(pos - eps.yxx),
		distFunct(pos + eps.xyx) - distFunct(pos - eps.xyx),
		distFunct(pos + eps.xxy) - distFunct(pos - eps.xxy)));
	float diffuse = max(0.35, dot(-rayDir, normal));
	float specular = pow( diffuse, 4.25 );
	
	float lenPos = length(pos);
	
	//vec3 ff = texcube( tex, 0.1*vec3(pos.x,4.0*res_y-pos.y,pos.z), normal ).xyz;
	//vec3 ff = texcube( tex, 0.1*pos, normal ).xyz;
    //vec3 colour = (vec3(0.1/totalDist) + vec3((diffuse + specular)/lenPos)) * ff * 1.25;
	//vec3 colour = vec3(0.5/totalDist) * ff * 2.5;
	//color = vec4( colour, 1.0 );
	
	//color = vec4( vec3((diffuse + specular)/lenPos), 1.0 ) * textureProj( tex, normal );
	//color = vec4( texture(tex, gl_FragCoord.xy / resolution) );
	
	vec3 ff = cubemap( tex, pos );
	color = vec4( vec3((diffuse + specular)/lenPos) * ff, 1.0 );
	
	//color = vec4( vec3(0.1/totalDist) + vec3((diffuse + specular)/lenPos), 1.0 );
	//color = vec4( vec3((diffuse + specular)/lenPos), 1.0 );
	
}