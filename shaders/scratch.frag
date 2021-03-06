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
uniform int aaLevel;

const int MAX_ITER = 128;
const float MAX_DIST = 135.0;
const float EPSILON  = 0.001;
const float fieldOfView = 1.0;

//float time = 350.0;

// livello di anti-aliasing
// attivo se >= 2

vec3 cubemap( sampler2D sam, in vec3 d ) {
    vec3 n = abs(d);
#if 1
    // sort components (small to big)    
    float mi = min(min(n.x,n.y),n.z);
    float ma = max(max(n.x,n.y),n.z);
    vec3 o = vec3( mi, n.x+n.y+n.z-mi-ma, ma );
    return texture2D( sam, abs(0.8*o.xy/o.z) ).xyz;
#else
   vec2 uuv = (n.x>n.y && n.x>n.z) ? d.yz/d.x: 
              (n.y>n.x && n.y>n.z) ? d.zx/d.y:
                                     d.xy/d.z;
    return texture( sam, uuv ).xyz;
#endif    
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
	colore = cubemap( tex, 0.1*pos + vec3(-1.0, 0.30, 0.15) );
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

float randNo( vec2 co ){
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

//// Background
// da hills.frag
vec3 GetSky(in vec3 rd) {
	vec3 sunLight  = normalize( vec3( -0.75, 0.2, -0.6 ) );
	vec3 sunColour = vec3(1.0, .75, .6);

	float sunAmount = max( dot( rd, sunLight), 0.5 );
	float v = pow(1.0-max(rd.y,0.0),6.);
	vec3  sky = mix(vec3(.1, .2, .3), vec3(.32, .32, .32), v);
	sky = sky + sunColour * sunAmount * sunAmount * .25;
	sky = sky + sunColour * min(pow(sunAmount, 800.0)*1.5, .3);
	return clamp(sky, 0.0, 1.0);
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
	
	//// Cometa
	// pos.y = max( pos.y, -2.5 );
	// pos.y = min( pos.y, 1.0 );
	// //pos.xz = rotate( pos.xz, 0.005 * time );
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
	
	vec3 q = pos;	
	float fatt = length( q / 5.0 ) * 0.5;
	float d = sin( fatt - time * 0.02 ) * ( sin( fatt * 2.0 - time * 0.01 ) * 1.5 + 0.5 ) - fatt * 1.5;	
	q.xy = rotate(q.xy, 0.04 * length(q.xy) * sin(time * 0.001) );
	q.zy = rotate(q.zy, 0.002 * length(q.zy) * sin(time * 0.0075));
	q.y = max( q.y, 0.0 );
	q.y = min( q.y, 100.0 );
	q.xz = rotate( q.xz, 0.5 * d );
	q.y = repeat( q.y, 2.5 );
	float penn = pennello( q, colore );
	return penn;
}

vec4 render( vec2 pixelPos, vec2 resoluiton, float t ) {
	// Controlli manuali disabilitati!!!!
	vec3 spaceUpDir   = vec3(0.0, 0.0, 1.0); //cameraUpd;
	vec3 cameraOrigin = vec3(1.0, 0.0, 0.0); //cameraOrg;
	vec3 cameraTarget = vec3(0.0, 3.0, 0.0); //cameraTrg * 3.0;
	// Aggiungo movimento alla camera
	cameraOrigin.xz -= rotate(cameraOrigin.xz, 22.5 * sin( t * 0.001 )) * 2.0; cameraOrigin -= vec3(0.0, 1.0, 0.0);
	vec3 cameraDir    = normalize( cameraTarget - cameraOrigin );
	vec3 cameraRight  = normalize( cross( cameraDir, spaceUpDir ) );
	vec3 cameraUp     = normalize( cross( cameraRight, cameraDir ) );
	vec3 rayDir       = normalize( (cameraRight * pixelPos.x + cameraUp * pixelPos.y) * fieldOfView + cameraDir);
	
	float totalDist = 0.0;
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
		totalDist += dist;
		pos += dist * rayDir;
	}
	
	// bersaglio mancato!
	if (rayMiss) {
		//color = vec4( 0.5, 0.2, 0.3, 1.0);
		color = vec4( GetSky( vec3(-rayDir.y, rayDir.zx )), 1.0 ) * 1.8;
		//return color;
	} else {
		/*vec2 eps = vec2(0.0, EPSILON);
		vec3 normal = normalize(vec3(
			distFunct(pos + eps.yxx, dummy) - distFunct(pos - eps.yxx, dummy),
			distFunct(pos + eps.xyx, dummy) - distFunct(pos - eps.xyx, dummy),
			distFunct(pos + eps.xxy, dummy) - distFunct(pos - eps.xxy, dummy)));
		float diffuse = max(0.35, dot(-rayDir, normal));
		float specular = pow( diffuse, 16.0 );
		
		float lenPos = length(pos);*/
		
		color = vec4( ccc * 2.0, 1.0 );
	}
	return color;
}

void main( void ) {
	
	vec2 resolution = vec2( res_x, res_y );
	float t = time * 0.2;
	vec4 col = vec4(0.0);

	if (aaLevel > 1) {
		float r = randNo( gl_FragCoord.xy / resolution );

		for( int j = 0; j < aaLevel; j++ ) 
			for( int i = 0; i < aaLevel; i++ ) {
				vec2 pixelPos = ( -1.0 + 2.0 * (gl_FragCoord.xy+vec2(i,j)/float(aaLevel)) / resolution.xy ) * resolution.x / resolution.y;
				float t = time * 0.2 + (float(aaLevel*j + i))/float(aaLevel*aaLevel) * (0.4/30.0);
			
				col += render( pixelPos, resolution, t /*+ r*0.5*/ );
			}
		col /= float(aaLevel*aaLevel);
		color = col;
	} else {
		vec2 pixelPos = ( -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy ) * resolution.x / resolution.y;
		color = render(pixelPos, resolution, t );
	}


}



/*
void main() {
	
	vec2 resolution = vec2( res_x, res_y );
	vec2 pixelPos = ( -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy ) * resolution.x / resolution.y;
	float t = time * 0.2;
	
	vec3 spaceUpDir   = cameraUpd;
	vec3 cameraOrigin = cameraOrg;
	vec3 cameraTarget = cameraTrg * 3.0;
	// Aggiungo movimento alla camera
	cameraOrigin.xz -= rotate(cameraOrigin.xz, 22.5 * sin( t * 0.001 )) * 2.0; cameraOrigin -= vec3(0.0, 1.0, 0.0);
	vec3 cameraDir    = normalize( cameraTarget - cameraOrigin );
	vec3 cameraRight  = normalize( cross( cameraDir, spaceUpDir ) );
	vec3 cameraUp     = normalize( cross( cameraRight, cameraDir ) );
	vec3 rayDir       = normalize( (cameraRight * pixelPos.x + cameraUp * pixelPos.y) * fieldOfView + cameraDir);
	
	float totalDist = 0.0;
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
		color = vec4( GetSky( vec3(-rayDir.y, rayDir.zx )), 1.0 ) * 1.8;
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
	
	//vec3 ff = cubemap( tex, pos ) * 3.0;
	//vec3 colour = (vec3(0.1/totalDist) + vec3((diffuse + specular)/lenPos)) * ff * 1.25;
	//vec3 colour = vec3(0.5/totalDist) * ff * 0.5;
	//color = vec4( colour, 1.0 );
	
	//color = vec4( texture(tex, gl_FragCoord.xy / resolution) );
	color = vec4( ccc * 2.0, 1.0 );
	//color = vec4( vec3((diffuse + specular)/(lenPos * 0.3)) * ccc, 1.0 );
	//color = vec4( (vec3(1.0/totalDist) + vec3((diffuse + specular)/lenPos)) * ccc, 1.0 );
	
	//color = vec4( vec3(0.1/totalDist) + vec3((diffuse + specular)/lenPos), 1.0 );
	//color = vec4( vec3((diffuse + specular)/lenPos), 1.0 );
	// ^^^ usare una di queste due per mostrare le geometrie
	
}*/