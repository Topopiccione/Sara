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

const int MAX_ITER = 100;
const float MAX_DIST = 25.0;
const float EPSILON  = 0.001;
const float fieldOfView = 1.0;
vec2 resolution = vec2( res_x, res_y );

/////// Calcolo del colore: lettura da texture
vec4 texcube( sampler2D sam, in vec3 p, in vec3 n ) {
	vec4 x = texture( sam, p.yz );
	vec4 y = texture( sam, p.zx - vec2(1.0) );
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
    return texture( sam, .1*o.xy/o.z ).xyz;
#else
   vec2 uuv = (n.x>n.y && n.x>n.z) ? d.yz/d.x: 
              (n.y>n.x && n.y>n.z) ? d.zx/d.y:
                                     d.xy/d.z;
    return texture( sam, uuv ).xyz;
#endif    
}


float capsule( vec3 p, float r, float c ) {	return mix(length(p.xz)-r, length(vec3(p.x,abs(p.y)-c,p.z))-r, step(c,abs(p.y))); }
float sphere( vec3 center, float radius ) { return length( center ) - radius; }
float udBox( vec3 p, vec3 b ) { return length(max(abs(p)-b,0.0)); }
float sdPlane( vec3 p, vec4 n ) { return dot(p,n.xyz) + n.w; }
float sBox( vec3 p, vec3 b ) { vec3 d = abs(p) - b;	return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0)); }
float sdCross( in vec3 p, in vec2 dimz ) {
  float da = sBox(p.xyz,vec3(dimz.xyy));
  float db = sBox(p.yzx,vec3(dimz.yxy));
  float dc = sBox(p.zxy,vec3(dimz.yyx));
  return min(da,min(db,dc));
}

float distFunct( in vec3 pos ) {	
	//float cubo = sBox( pos, vec3(1.0) );
	//return cubo;
	return sphere( pos, 2.0 );
}

void main() {
	
	// Coordinate (x,y) che variano tra -1.0 e 1.0, come al solito
	vec2 pixelPos = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;
	pixelPos.x *= resolution.x / resolution.y;
	float t = time * 0.002;
	
	vec3 spaceUpDir   = cameraUpd;
	vec3 cameraOrigin = cameraTrg * vec3( 5.0 );
	vec3 cameraTarget = vec3( 0.0 );
	
	vec3 cameraDir    = normalize( cameraTarget - cameraOrigin );
	vec3 cameraRight  = normalize( cross( cameraDir, -spaceUpDir ) );
	vec3 cameraUp     = normalize( cross( cameraRight, -cameraDir ) );
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
	
	vec2 eps = vec2(0.0, EPSILON);
	vec3 normal = normalize(vec3(
		distFunct(pos + eps.yxx) - distFunct(pos - eps.yxx),
		distFunct(pos + eps.xyx) - distFunct(pos - eps.xyx),
		distFunct(pos + eps.xxy) - distFunct(pos - eps.xxy)));
	float diffuse = max(0.0, dot(-rayDir, normal));
	float specular = pow( diffuse, 32.0 );
	float colour = diffuse + specular;
	float lenPos = length(pos);
	
	//vec3 ff = texcube( tex, pos*0.06, normal ).xyz;
	vec3 ff = cubemap( tex, normal );
	vec3 cc = ff * colour;
	// finta occlusion map: dividere per potenze di lenPos
	color = vec4( vec3( cc ), 1.0 );
	//color = vec4( texture(tex, gl_FragCoord.xy / resolution) );
	
}