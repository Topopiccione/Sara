#version 330 core

in vec2 uv;
out vec4 color;

uniform int res_x;
uniform int res_y;
uniform float time;
uniform vec3 cameraOrg;
uniform vec3 cameraTrg;
uniform vec3 cameraUpd;


vec2 resolution = vec2(res_x, res_y);
vec2 mouse = vec2(0.5, 0.5);
float timee = time * 0.005;
void main( void ) {
	/////////// Originale
	//vec3 pos = vec3(0,0,-16) * rotationXY( angle );
	//vec3 dir = normalize(vec3((gl_FragCoord.xy - resolution.xy*.5) / resolution.xy, 1.) * rotationXY( angle ));
	
	/*vec3 pos = vec3(12.) * cameraTrg;
	vec3 ww = normalize( cameraOrg - pos );
	vec3 uu = normalize( cross(ww,cameraUpd) );
    vec3 vv = normalize( cross(uu,ww) );
	vec2 pp = (gl_FragCoord.xy - resolution.xy*.5) / resolution.xy;
	vec3 dir = normalize( pp.x*uu + pp.y*vv + ww );*/
	vec2 pp = ( -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy ) * resolution.x / resolution.y;
	vec3 spaceUpDir   = cameraUpd;
	vec3 cameraOrigin = cameraOrg;
	vec3 cameraTarget = cameraTrg;
	vec3 ww    = normalize( cameraTarget - cameraOrigin );
	vec3 uu  = normalize( cross( ww, spaceUpDir ) );
	vec3 vv     = normalize( cross( uu, ww ) );
	vec3 dir       = normalize( (uu * pp.x + vv * pp.y) + ww);
	vec3 pos = cameraOrigin;
	
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