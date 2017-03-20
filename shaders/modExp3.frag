#version 330 core

in vec2 uv;
out vec4 color;

uniform int res_x;
uniform int res_y;
uniform float time;
uniform vec3 cameraOrg;
uniform vec3 cameraTrg;
uniform vec3 cameraUpd;
uniform sampler2D tex;
vec2 resolution = vec2( res_x, res_y );

vec3 cubemap( sampler2D sam, in vec3 d )
{
    vec3 n = abs(d);

#if 0
    // sort components (small to big)    
    float mi = min(min(n.x,n.y),n.z);
    float ma = max(max(n.x,n.y),n.z);
    vec3 o = vec3( mi, n.x+n.y+n.z-mi-ma, ma );
    return texture( sam, .1*o.xy/o.z ).xyz;
#else
   vec2 uuv = (n.x>n.y && n.x>n.z) ? d.yz/d.x: 
              (n.y>n.x && n.y>n.z) ? d.zx/d.y:
                                     d.xy/d.z;
    return texture( sam, uuv ).xyz;
#endif    
}


void main()
{
	vec2 p = (-resolution.xy + 2.0*gl_FragCoord.xy) / resolution.y;

     // camera movement	
	float an = 0.001*time;
	vec3 ro = vec3( 3.5*sin(an), 1.0, 3.5*cos(an) );
    vec3 ta = vec3( 0.0, 1.0, 0.0 );
    // camera matrix
    vec3 ww = normalize( ta - ro );
    vec3 uu = normalize( cross(ww,vec3(0.0,1.0,0.0) ) );
    vec3 vv = normalize( cross(uu,ww));
	// create view ray
	vec3 rd = normalize( p.x*uu + p.y*vv + 1.5*ww );

    // sphere center	
	vec3 sc = vec3(0.0,1.0,0.0);

    vec3 col = vec3(0.0);
    
	// raytrace-plane
	float h = (0.0-ro.y)/rd.y;
	if( h>0.0 ) 
	{ 
		vec3 pos = ro + h*rd;
		vec3 nor = vec3(0.0,1.0,0.0); 
		vec3 di = sc - pos;
		float l = length(di);
		float occ = 1.0 - dot(nor,di/l)*1.0*1.0/(l*l); 

        col = texture2D( tex, 0.1*pos.xz ).xyz;
        col *= occ;
        col *= exp(-0.1*h);
	}

	// raytrace-sphere
	vec3  ce = ro - sc;
	float b = dot( rd, ce );
	float c = dot( ce, ce ) - 1.0;
	h = b*b - c;
	if( h>0.0 )
	{
		h = -b - sqrt(h);
        vec3 pos = ro + h*rd;
        vec3 nor = normalize(ro+h*rd-sc); 
        float occ = 0.5 + 0.5*nor.y;
        
        col = cubemap( tex, nor );
		//col = textureProj( tex, nor + pos ).xyz;
        col *= occ;
    }

	col = sqrt( col );
	
	color = vec4( col, 1.0 );
	//color = vec4( texture(tex, gl_FragCoord.xy / resolution) );
	//color = vec4( texture(tex, uv) );
}