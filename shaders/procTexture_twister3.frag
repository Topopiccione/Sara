#version 330 core
// http://glslsandbox.com/e#38955.0
// modificate

in vec2 uv;
out vec4 color;

uniform int res_x;
uniform int res_y;
uniform float time;

float factor = 1.0;
vec3 colorr = vec3(0.2, 0.5, 1.0);

vec4 t(vec2 uv)
{
    float j = sin(uv.y * 3.14 + time * 5.0);
    float i = sin(uv.x * 15.0 - uv.y * 2.0 * 3.14 + time * 3.0);
    float n = -clamp(i, -0.2, 0.0) - 0.0 * clamp(j, -0.2, 0.0);
    
    return 3.5 * (vec4(colorr, 1.0) * n);
}

void main( void )
{
	vec2 resolution = vec2( res_x, res_y );
    float aspectRatio = resolution.x / resolution.y;
    vec2 p = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;
	p.y = -p.x;
    p.x *= aspectRatio;
    p *= 4.5;
    vec2 uv;
    
    float r = sqrt(dot(p, p));
    float a = atan(
        p.y * (0.3 + 0.1 * cos(time * 2.0 + p.y)),
        p.x * (0.3 + 0.1 * sin(time + p.x))
    ) + time;
    
    uv.x = time + 1.0 / (0.25*r + .01);
    uv.y = 4.0 * a / 1.1416;
    
    color = mix(vec4(0.0), t(uv) * r * r * 2.0, factor);
}