#version 330 core
// http://glslsandbox.com/e#39231.0

in vec2 uv;
out vec4 color;

uniform int res_x;
uniform int res_y;
uniform float time;

//another way to make cheap noise
vec4 tessnoise(vec2 p) { 
	vec4 base = vec4(p, 0., 0.);
	vec4 rotation = vec4(0.0);
	
	float theta     	= fract(time*.025);
	float phase		= .55;
	float frequency		= .49;
		
	//yo dog, I heard you like fractals
	vec4 result      	= vec4(0.);			    
	for (float i = 0.; i < 16.; i++) {		
		base		+= rotation;		
		rotation	= fract(base.wxyz - base.zwxy + theta).wxyz;		
		rotation	*= (1.-rotation);
		base		*= frequency;
		base		+= base.wxyz * phase;

	}
	return rotation * 2.;
}

void main( void ) {
	vec2 resolution = vec2( res_x, res_y );
	vec2 aspect	= resolution/min(resolution.x, resolution.y);
	vec2 fc 	= gl_FragCoord.xy;
	vec2 uv 	= fc/resolution;

	vec2 p		= (uv - .5) * aspect;
	p 		*= pow(2., 13.);

	//blend and tweak to avoid repetition
	vec4 a		= tessnoise(p + 99999.);
	vec4 b		= tessnoise((p + pow(2., 17.))/8. + a.xy - a.zw);
	
	vec4 n		= vec4(dot(a, b))-a*b;
	color 	= n;
}//sphinx