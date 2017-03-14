#version 330 core

in vec2 uv;
out vec4 color;

uniform int res_x;
uniform int res_y;


void main( void ) {
	vec2 resolution = vec2( res_x, res_y );
	vec2 uv = gl_FragCoord.xy / resolution.xy;
	color = vec4(uv, 0.5, 1.0);
}