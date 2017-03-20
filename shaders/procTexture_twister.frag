#version 330 core
// http://glslsandbox.com/e#39021.1

in vec2 uv;
out vec4 color;

uniform int res_x;
uniform int res_y;
uniform float time;

// Created by inigo quilez - iq/2013
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

void main( void ) {
	vec2 resolution = vec2( res_x, res_y );
    vec2 p = (-resolution.xy + 2.0*gl_FragCoord.xy)/resolution.y;

    p *= 0.75;
    
    float a = atan( p.y, p.x );
    float r = sqrt( dot(p,p) );
    
    a += sin(0.5*r-0.5*time );
	
	float h = 0.5 + 0.5*cos(9.0*a);

	float s = smoothstep(0.4,0.5,h);

    vec2 uv;
    uv.x = time + 1.0/(r + .1*s);
    uv.y = 3.0*a/3.1416;
 
	vec3 col = vec3(h*r,h,h); // better 

    float ao = smoothstep(0.0,0.3,h)-smoothstep(0.5,1.0,h);
    col *= 1.0 - 0.6*ao*r;
    col *= r;

    color = vec4( col, 1.0 );
}