#version 330 core

uniform int res_x;
uniform int res_y;
uniform float time;

#define MAX_ITER 8

void main( void ) {
	float ttt = time / 1.4;
	vec2 sp = gl_FragCoord.xy / vec2( 300.0, 300.0 );
	vec2 p = sp * 5.0 - vec2( 10.0 );
	vec2 i = p;
	float c = 1.0;
	float inten = .1;

	for (int n = 0; n < MAX_ITER; n++) 
	{
		float t = ttt * (1.0 - (3.0 / float( n + 1) ) );
		i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
		c += 1.0/length(vec2(p.x / (sin(i.x+t)/inten),p.y / (cos(i.y+t)/inten)));
	}
	c /= float(MAX_ITER);
	c = 1.5-sqrt(c);
	gl_FragColor = vec4(vec3(c*c*c*c), 999.0);
}