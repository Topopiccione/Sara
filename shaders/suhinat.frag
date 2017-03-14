// Suhinat by nystep
// http://www.pouet.net/topic.php?which=7920&page=60

#version 330 core

in vec2 uv;
out vec4 color;

uniform int res_x;
uniform int res_y;
uniform float time;



// sphere sponge
float ss( vec3 pos )
{
    float k=1, d=-k;
    for (int i=0;i<5;k*=2,i++)
        d = max( d, (3.1 - length( mod(pos * k, 6) - vec3( 3 ) )) / k );
    return d*.9;
}

// mandelbox
vec3 mb(vec3 w)
{
	float md = 2;
	float d = md;
	float mR2 = .2;
	float mp;

	vec4 scaleFactor = vec4(2, 2, 2, abs(2)) / mR2;
    vec4 p = vec4(w, 1), p0 = p;
    
    for (int i = 0; i < 6; i++)
	{
		md = min( md, d );
        p.xyz = clamp(p.xyz, -1, 1) * 2 - p.xyz;
        d = dot( p.xyz, p.xyz );
        p = p * clamp(max(mR2 / d, mR2), 0, 1) * scaleFactor + p0 + mR2 / scaleFactor;
    }
	
	// some originality in the distance calculation (?)
	p0 = abs(p);
    return vec3( (max(p0.x,max(p0.y,p0.z)) - 1) / p.w * .9, md, log( length(p) + 1 ) / 3 );
}

// the distance estimate for the whole 3d scene
vec3 dE( vec4 p )
{
	float t = time * 0.004;
	// dist is initially a worm sine thing intersected with a sphere sponge fractal
	float dist = max( length(p.xz-vec2(0,sin(p.z/10)*2-2))-(sin(p.y/10)+1), ss( p.xyz ) );
	float distWater = p.z+1.9; // distance to a plane
	if (distWater < 0.1)
	{
		// evaluate the bump only if close enough
		vec4 cst = vec4(7,2,22,5) * sin((p.x*0.011+0.5)+(p.y*0.0059+0.1));
		vec4 s1 = sin( p.xyxy*cst+cst.ywxz*t/3 )/4;
		distWater += s1.x*s1.y*s1.z*s1.w;
	}
	if (dist < p.w*4)
	{
		// evaluate the mandelbox only if close enough to add detail
		dist = max( dist, mb( p.xyz-round(p.xyz/4)*4 ).x );
	}
	return dist < distWater ? vec3(dist,0,1) : vec3(distWater,0.5,0);
}

// forward gradient at the position pos 
vec3 gn( vec4 pos, float signedDistanceAtPos )
{
	vec2 eps = vec2(pos.w,0);
	return normalize(vec3(dE( pos+eps.xyyy ).x - signedDistanceAtPos, 
		dE( pos+eps.yxyy ).x - signedDistanceAtPos, 
		dE( pos+eps.yyxy ).x - signedDistanceAtPos));
}

// noise func
vec4 c4(vec4 x)
{
	vec4 y = (x - fract(x)) * 0.001;
	return fract((y*1.172+0.5)*(y*5.911+0.1)*(y*7.352+0.9));
}

float nd( vec3 p )
{
	vec3 q = floor( p + 0.5 );
	vec3 u = sin( (p-q)*22/7 ) * 0.5 + 0.5;
	vec3 v = vec3( 11, 59, 151 );
	vec3 qv = q*v;
	vec3 rv = qv+v;

	vec4 m = mix( c4( vec4( qv.x+qv.y+qv.z, rv.x+qv.y+qv.z, qv.x+rv.y+qv.z, rv.x+rv.y+qv.z ) ),
				  c4( vec4( qv.x+qv.y+rv.z, rv.x+qv.y+rv.z, qv.x+rv.y+rv.z, rv.x+rv.y+rv.z ) ), u.z );

	vec2 o = mix( m.xy, m.zw, u.y );

	return mix(o.x,o.y,u.x);
}

// 3d rotation
mat3 mr( vec3 v, float f )
{
	float cosf = cos( f ), sinf = sin( f ), umcosf = 1-cosf;
	float x=v.x,y=v.y,z=v.z;

	return mat3( cosf+umcosf*x*x, umcosf*x*y-sinf*z, umcosf*x*z+sinf*y,
				umcosf*x*y+sinf*z, cosf+umcosf*y*y, umcosf*y*z-sinf*x,
				umcosf*x*z-sinf*y, umcosf*y*z+sinf*x, cosf+umcosf*z*z );
}

// shading
vec3 sh( float material, vec4 rp, vec4 rd )
{
	float t = time * 0.004;
	vec3 resultColor;
	vec3 direction = vec3(.7,-.7,0), vec = vec3(0,1,0);
	vec3 lightDirection = mr( direction, t/20 ) * vec;
	float lightVisi = clamp(sqrt(lightDirection.z*0.5+0.5)*2-.7,0,1);

	if (material > 0)
	{
		// sky
		vec3 skycolor = vec3(0.1,0.2,0.4) + mix( vec3(.8,.6,.4), vec3(0.4,0.5,1), sqrt(abs(rd.z)) );
		vec3 perlinPos = (rp.xyz - rd.xyz * (10+rp.z) / rd.z) / 5 + t / 4;
		float perlinY=1, perlinX=0, cloud;

		for(int i=0;i<5;perlinY/=2,i++)
			perlinX += nd( perlinPos * perlinY ) / perlinY;

		cloud = perlinX * perlinY * 2.6 - 1.6;

		resultColor = mix( skycolor + pow( max( dot( lightDirection, rd.xyz ), 0 ), 64 ), vec3(cloud), clamp(cloud,0,1) ) * (lightVisi*0.8+0.2) + vec3(0,0.1,0);
	}
	else
	{
		// fractal
		vec3 inNormal = gn( rp, dE(rp).x );
		vec3 ds = mb( vec3(rp.x,rp.y-(round(rp.y/2)*2),rp.z) ).yzy;
		float lambertianplusphong = max( dot( lightDirection, inNormal ) , 0 ) + 
									pow( max( dot( reflect( lightDirection, inNormal ), rd.xyz ), 0 ), 4 );

		float ao = 1;
		float eps = rp.w*3;
		float k = 0.15 / eps;
		float d = 2 * eps;

		for (int i=0; i<6; d+=eps, k/=2, i++)
			ao -= ( d - dE(rp + vec4(inNormal,0) * d).x ) * k;

		resultColor = mix( vec3(1,0.2,0.2), vec3(1,1,0.2), sin(dot(ds,ds.yxz))*0.2+0.5 ) * 
					  mix( mix(.3,lambertianplusphong,lightVisi), clamp(ao, 0, 1), .6-lightVisi*.3 );
	}

	return resultColor;
}

// raymarching

vec4 rm( vec4 rp, vec4 rd )
{
	float reflected=0, t=0, hit=1, dot3=0.3;
	vec4 dist=vec4(0);

	// raymarch
	for (int i=0;abs(rp.x)<1.5 && t<5 && i<110;i++)
	{
		dist = vec4( dE( rp+=rd*(t-dist.w) ), t );

		if (rp.w > dist.x) // is the distance inferior to "cone radius" ?
		{
			if (dist.y > 0)
			{
				// we hit the ocean, reflect the ray
				hit *= dist.y; // dist.y = amount of recursive reflections
				t = rp.w*2;
				dist.w = 0;
				rd.xyz = reflect( rd.xyz, gn( rp, dist.x ) );
				reflected = dot3;
			}
			else hit = 0; // we've hit the object
			
			if ( hit < dot3 ) t=6; // if we hit it's finished
		}
		t += dist.x;
	}

	if (rd.z<0 && hit>dot3)
	{
		// raytrace the ocean... 
		rp -= rd * (1.9+rp.z) / rd.z;
		// and reflect the ray for proper shading
		rd.xyz = reflect( rd.xyz, gn( rp, dE(rp).x ) );
		reflected = dot3;
	}

	return vec4( mix( sh( hit, rp, rd ), vec3(0.4,0.6,0.8), reflected ), 0 );
}

/** main */

void main()
{
	vec4 p = vec4( time * 0.004, 1.0, res_x, res_y );
	float t = time * 0.004;
	float part;
	float beat = exp(p.y-t)/20;
	float localt = sin( (modf( t/20, part )-0.5)*22/7 ) * 0.5 + 0.5;
	part += 3;
	vec2 screenUVs = (gl_FragCoord.xy-p.zw) / p.zw * vec2(1,p.w/p.z);
	vec4 colour=vec4(0),
	randoms = (vec4( nd(vec3(part+1)), nd(vec3(part+11)), nd(vec3(part+111)), nd(vec3(part+1111)) ) - 0.5)*22/7,
	randomsm1 = (vec4( nd(vec3(part)), nd(vec3(part+10)), nd(vec3(part+110)), nd(vec3(part+1110)) ) - 0.5)*22/7;

	if (abs(screenUVs.y) < 0.5)
	{
		// camera path is here, inside the call to raymarching
		colour = rm( vec4( .2+beat,t/4-13,-1.75-beat,0 ), vec4( mr( normalize(vec3(0,mix(randomsm1.xy,randoms.xy,localt))), mix(randomsm1.w,randoms.w,localt)*.7 ) * mr( vec3(0,0,1), screenUVs.x ) * mr( vec3(0,1,0), -screenUVs.y ) * normalize(vec3(-1,0,1)), 1/p.w ) );
		colour *= colour;
		colour += beat*6;
	}
	
	color = colour;
}