#version 330 core

in vec2 uv;
out vec4 color;

uniform int res_x;
uniform int res_y;
uniform float time;
//uniform vec2 angle;
uniform vec3 cameraOrg;
uniform vec3 cameraTrg;
uniform vec3 cameraUpd;

float f(vec3 o) {
	float a=(sin(o.x)+o.y*.25)*.35;
	o=vec3(cos(a)*o.x-sin(a)*o.y,sin(a)*o.x+cos(a)*o.y,o.z);
	return dot(cos(o)*cos(o),vec3(1.0))-1.2;
}

vec3 s(vec3 o,vec3 d) {
	float t=0.,a,b;
	for(int i=0; i<75; i++) {
		if(f(o+d*t)<0.0) {
			a=t-.125;b=t;
			for(int i=0; i<10;i++) {
				t=(a+b)*.5;
				if(f(o+d*t)<0.0)
					b=t;
				else a=t;
			}
			vec3 e=vec3(.1,0.0,0.0),p=o+d*t,n=-normalize(vec3(f(p+e),f(p+e.yxy),f(p+e.yyx))+vec3((sin(p*75.)))*.01);
			return vec3(
			mix(((max(-dot(n,vec3(.577)),0.) + 0.125*max(-dot(n,vec3(-.707,-.707,0)),0.)))*(mod(length(p.xy)*20.,2.)<1.0?vec3(.71,.85,.25):vec3(.79,.93,.4))
			,vec3(.93,.94,.85)
			,vec3(pow(t/9.,5.))));		
		}
		t+=.125;
	}
	return vec3(.93,.94,.85);
}

void main(void){
	//float t=dot(vec3(0.5),vec3(1,256,32536));
	//vec3 camDir = vec3(0.3, 0.5, -0.25);
	//camDir.z -= 2.15;
	//color=vec4(s(vec3(sin(t*1.5)*.5,cos(t)*.5,t), normalize((vec3((gl_FragCoord.xy-vec2(res_x,res_y))/vec2(res_x),0.55) + camDir) * rotationXY( angle ) )),1);
	float t = time / 460.0;
	vec3 camDir = normalize( cameraTrg - cameraOrg );
	vec3 camRgh = normalize( cross( camDir, cameraUpd ) );
	vec3 camUp  = normalize( cross( camRgh, camDir ) );
	vec2 pixelPos = -1.0 + 2.0 * gl_FragCoord.xy / vec2(res_x, res_y);
	pixelPos.x *= res_x / res_y;
	color=vec4(s(cameraOrg + vec3(sin(t*1.5)*.5,cos(t)*.5,t), normalize( camRgh * pixelPos.x + camUp * pixelPos.y + camDir )),1);
}