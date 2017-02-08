#version 330 core

in vec2 uv;
out vec4 color;

uniform int res_x;
uniform int res_y;
uniform float time;

void main( void ) {
	if ( gl_FragCoord.x < 100 )
		color = vec4( 1.0, 0.3, 0.7, 1.0);
	else
		color = vec4( 0.0, 0.3, 0.7, 1.0);
}

/*
#version 400

out vec4 frag_colour;
void main() {
  frag_colour = vec4(0.0, 0.5, 0.5, 1.0);
}*/