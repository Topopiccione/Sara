#version 330 core

in vec2 uv;
out vec4 color;

uniform int res_x;
uniform int res_y;
uniform float time;
uniform vec3 cameraOrg;
uniform vec3 cameraTrg;
uniform vec3 cameraUpd;

mat3 rotationXY( vec2 angl ) {
	vec2 c = cos( -angl.yx );
	vec2 s = sin( -angl.yx );
	// Variante originale
	return mat3(
		c.y, 0, -s.y,
		s.y*s.x, c.x, c.y*s.x,
		s.y*c.x, -s.x, c.y*c.x);
}

vec2 resolution = vec2(res_x, res_y);
vec2 mouse = vec2(0.5, 0.5);
float timee = time * 0.005;
void main( void ) {
	//vec3 pos = vec3(0,0,-16) * rotationXY( angle );
	//vec3 dir = normalize(vec3((gl_FragCoord.xy - resolution.xy*.5) / resolution.xy, 1.) * rotationXY( angle ));
	
	vec3 pos = vec3(-1,-1,-16) * cameraTrg;
	vec3 ww = normalize( cameraOrg - pos );
	vec3 uu = normalize( cross(ww,cameraUpd) );
    vec3 vv = normalize( cross(uu,ww) );
	vec2 pp = (gl_FragCoord.xy - resolution.xy*.5) / resolution.xy;
	vec3 dir = normalize( pp.x*uu + pp.y*vv + ww );
	
	//vec3 dir = normalize(vec3((gl_FragCoord.xy - resolution.xy*.5) / resolution.xy, 1.));
	vec3 colour = vec3(.05,.1,.15);
	for (float y = 5.; y >= -5.; y--) {
		for (float x = -5.; x <= 5.; x++) {
			vec3 s = vec3(x+sin(timee+y*.7),sin(timee+x*.5+y*.5),y+sin(timee-x*.7));
			float t = dot(s-pos,dir);
			vec3 diff = (pos+t*dir-s)*3.;
			float dist = length(diff);
			float dof = abs(1./(pos.z-s.z)-mouse.y*.2+.2)*2.;
			float dofdist = (length(diff)-1.)/dof;
			dofdist = max(-1.,min(1.,dofdist));
			dofdist = sign(dofdist)*(1.-pow(1.-abs(dofdist),1.5));
			float invalpha = dofdist*.5+.5;
			colour = colour*invalpha*0.995 + vec3(.3,.7,.3)*pow(dist,3.) * dot(normalize(diff+vec3(0,0,2)),vec3(1))*(1.-invalpha);
		}
	}
	color = vec4(colour, 1.0 );
};