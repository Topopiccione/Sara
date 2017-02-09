#version 330 core

out vec4 color;

uniform float time;
uniform int res_x;
uniform int res_y;
uniform vec3 cameraDirection;

float  iGlobalTime = time* 0.005;

const int MaxSteps = 77;
const float MinimumDistance = 0.0009;
const float normalDistance = 0.0002;

const int Iterations = 77;
const float PI = 3.141592;
const float Scale = 3.0;
const float FieldOfView = 1.0;
const float Jitter = 0.05;
const float FudgeFactor = 0.7;
const float NonLinearPerspective = 2.0;

const float Ambient = 0.32184;
const float Diffuse = 0.5;
const vec3 LightDir = vec3( 1.0 );
const vec3 LightColor = vec3( 1.0, 1.0, 0.858824 );
const vec3 LightDir2 = vec3( 1.0, -1.0, 1.0 );
const vec3 LightColor2 = vec3(0.0,0.333333,1.0);
const vec3 Offset = vec3(0.92858,0.92858,0.32858);

vec2 rotate(vec2 v, float a) { return vec2(cos(a)*v.x + sin(a)*v.y, -sin(a)*v.x + cos(a)*v.y); }

// Two light sources. No specular 
vec3 getLight( vec3 color, vec3 normal, vec3 dir) {
	vec3 lightDir = normalize(LightDir);
	float diffuse = max(0.0,dot(-normal, lightDir));
	
	vec3 lightDir2 = normalize(LightDir2);
	float diffuse2 = max(0.0,dot(-normal, lightDir2));
	
	return (diffuse*Diffuse)*(LightColor*color) + (diffuse2*Diffuse)*(LightColor2*color);
}


// DE: Infinitely tiled Menger IFS.
//
// For more info on KIFS, see:
// http://www.fractalforums.com/3d-fractal-generation/kaleidoscopic-%28escape-time-ifs%29/
float DE( vec3 z )
{
	// Folding 'tiling' of 3D space;
	z  = abs( 1.0 - mod( z, 2.0 ) );

	float d = 1000.0;
	for ( int n = 0; n < Iterations; n++ ) {
		z.xy = rotate( z.xy, 4.0 + 2.0 * cos( iGlobalTime / 8.0 ) );		
		z = abs( z );
		if ( z.x < z.y ){ 
			z.xy = z.yx;
		}
		if ( z.x < z.z ) {
			z.xz = z.zx;
		}
		if ( z.y < z.z ) {
			z.yz = z.zy;
		}
		z = Scale * z - Offset * ( Scale - 1.0 );
		if ( z.z < ( -0.5 * Offset.z * ( Scale - 1.0 ) ) ) {
			z.z += Offset.z * ( Scale - 1.0 );
		}
		d = min(d, length(z) * pow(Scale, float(-n)-1.0));
	}
	
	return ( d - 0.001 );
}

// Finite difference normal
vec3 getNormal( vec3 pos ) {
	vec3 e = vec3( 0.0, normalDistance, 0.0 );
	return normalize( vec3( DE(pos+e.yxx)-DE(pos-e.yxx), DE(pos+e.xyx)-DE(pos-e.xyx), DE(pos+e.xxy)-DE(pos-e.xxy) )	);
}

// Solid color 
vec3 getColor( vec3 normal, vec3 pos ) { return vec3( 1.0 ); }

float rand( vec2 co ){ return fract( cos( dot( co, vec2( 4.898, 7.23 ) ) ) * 23421.631 ); }

vec4 rayMarch( vec3 from, vec3 dir ) {
	// Add some noise to prevent banding
	float totalDistance = Jitter * rand( gl_FragCoord.xy + vec2( iGlobalTime ) );
	vec3 dir2 = dir;
	float distance;
	int steps = 0;
	vec3 pos;
	for ( int i = 0; i < MaxSteps; i++ ) {
		// Non-linear perspective applied here.
		dir.zy = rotate( dir2.zy, totalDistance * cos( iGlobalTime / 4.0 ) * NonLinearPerspective );
		
		pos = from + totalDistance * dir;
		distance = DE( pos ) * FudgeFactor;
		totalDistance += distance;
		if (distance < MinimumDistance) {
			break;
		}
		steps = i;
	}
	
	// 'AO' is based on number of steps.
	// Try to smooth the count, to combat banding.
	float smoothStep = float(steps) + distance / MinimumDistance;
	float ao = 1.1 - smoothStep / ( float(MaxSteps) );
	
	// Since our distance field is not signed,
	// backstep when calc'ing normal
	vec3 normal = getNormal( pos - dir * normalDistance * 3.0);
	
	vec3 color = getColor( normal, pos );
	vec3 light = getLight( color, normal, dir );
	color = ( color * Ambient + light ) * ao;
	return vec4( color, 1.0 );
}

void main( void ) {
	// Camera position (eye), and camera target
	vec3 camPos = 0.5 * iGlobalTime * vec3( 0.0, 0.0, 0.3333 );
	//vec3 target = camPos + vec3( 1.0, 0.0, 0.0 );
	vec3 target = camPos + cameraDirection;
	vec3 camUp  = vec3( 0.0, 1.0, 0.0);
	
	// Calculate orthonormal camera reference system
	vec3 camDir   = normalize( target - camPos ); // direction for center ray
	camUp = normalize( camUp - dot( camDir, camUp ) * camDir ); // orthogonalize
	vec3 camRight = normalize( cross( camDir, camUp ) );
	
	vec2 coord = -1.0 + 2.0 * gl_FragCoord.xy / vec2( res_x, res_y );
	coord.x *= res_x / res_y;
	
	// Get direction for this pixel
	vec3 rayDir = normalize( camDir + (coord.x * camRight + coord.y * camUp ) * FieldOfView );
	
	color = rayMarch( camPos, rayDir );


}




