#version 330 core

in vec2 uv;
out vec4 color;

uniform sampler2D tex;
uniform int res_x;
uniform int res_y;
uniform float Offc;
uniform float time;

void main2(void)
{
	vec2 texCoord = gl_FragCoord.xy / vec2( res_x, res_y );
	vec2 normCoord = 2.0 * texCoord - 1.0;
	float r = length( normCoord );
	float phi = atan( normCoord.y, normCoord.x );
	
	r = pow(r, 1.0/Offc) / Offc;
	
	normCoord.x = r * cos(phi);
	normCoord.y = r * sin(phi);
	texCoord = normCoord / 2.0 + 0.5;
	color = vec4( texture2D( tex, texCoord ).xyz, 1.0);
}

void main(void)
{

	float xx = gl_FragCoord.x;
	float yy = gl_FragCoord.y;
	float t = time / 80.0;
	vec2 texCoord = vec2( uv.s, (1.0 - uv.t) );
	float lum = length( texture2D( tex, texCoord ).xyz );
	vec3 tc = vec3( 1.0, 1.0, 1.0 );
	
	if (lum < 1.0) {
      if (mod(xx + yy, Offc) == 0.0) 
        tc = vec3(0.0, 0.0, 0.0);
    }  
  
    if (lum < 0.75) {
      if (mod(xx - yy, Offc) == 0.0) 
        tc = vec3(0.0, 0.0, 0.0);
    }  
  
    if (lum < 0.5) {
      if (mod(xx + yy - 1.0, Offc) == 0.0) 
        tc = vec3(0.0, 0.0, 0.0);
    }  
  
    if (lum < 0.3) {
      if (mod(xx - yy - 1.0, Offc) == 0.0) 
        tc = vec3(0.0, 0.0, 0.0);
    }
	
	if ( xx > ( res_x / 2.0 ) + ( 60.0 * cos( t * 3.3)) * sin ( yy / 64.0 + (2.0 * t )))
		color = vec4( tc, 1.0 );
	else
		color = vec4( texture2D( tex, texCoord ).xyz, 1.0);
}