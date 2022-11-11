var raytraceFS = `
struct Ray {
	vec3 pos;
	vec3 dir;
};

struct Material {
	vec3  k_d;	// diffuse coefficient
	vec3  k_s;	// specular coefficient
	float n;	// specular exponent
};

struct Sphere {
	vec3     center;
	float    radius;
	Material mtl;
};

struct Light {
	vec3 position;
	vec3 intensity;
};

struct HitInfo {
	float    t;
	vec3     position;
	vec3     normal;
	Material mtl;
};

uniform Sphere spheres[ NUM_SPHERES ];
uniform Light  lights [ NUM_LIGHTS  ];
uniform samplerCube envMap;
uniform int bounceLimit;

float bias = 0.0001;
vec3 I_a = vec3(.1, .1 ,.1);

bool IntersectRay( inout HitInfo hit, Ray ray );
vec3 Blinn(Material mtl, vec3 viewDir, vec3 lightDir, vec3 normal, vec3 I);
bool IntersectShadowRay(Ray ray);

vec3 Blinn(Material mtl, vec3 viewDir, vec3 lightDir, vec3 normal, vec3 I){
	normal = (normal);
	//lightDir = normalize(lightDir);
	vec3 h = normalize(viewDir + lightDir);

	float cosTheta = dot(normal, lightDir);
	float cosPhi = dot(normal, h);

	return I * ((mtl.k_d * max(0.0, cosTheta)) + (mtl.k_s * pow(max(0.0, cosPhi), mtl.n)));
}
// Shades the given point and returns the computed color.
vec3 Shade( Material mtl, vec3 position, vec3 normal, vec3 view )
{
	vec3 color = vec3(0,0,0);

	Ray shadowRay;
	shadowRay.pos = position;
	for ( int i=0; i<NUM_LIGHTS; ++i ) {
		// TO-DO: Check for shadows
		// TO-DO: If not shadowed, perform shading using the Blinn model
		Light light = lights[i];
		shadowRay.dir = (light.position - shadowRay.pos);
		//shadowRay.dir = normalize((shadowRay.pos - light.position));

		if( IntersectShadowRay(shadowRay) ){ // is in shadow
		} else{ // not in shadow
			color += Blinn(mtl, view, normalize(shadowRay.dir), normal, light.intensity);
		}

		//color += mtl.k_d * lights[i].intensity;	// change this line
	}
	return color;
}
bool IntersectShadowRay(Ray ray){

	
	for ( int i=0; i<NUM_SPHERES; ++i ) {
		
		vec3 d =  (ray.dir);
		vec3 pminusc = ray.pos - spheres[i].center;
		float a = dot(d, d);
		float b = dot(2.0 * d, pminusc);
		float c = dot(pminusc, pminusc) - (spheres[i].radius * spheres[i].radius);

		float delta = (b * b) - (4.0 * a * c);

		if(delta >= bias){ // found hit if greater than zero
			float t = (-b - sqrt(delta)) / (2.0 * a);
			if(t >= 0.0){
				return true;
			}
			
		}
	}
	return false;
}
// Intersects the given ray with all spheres in the scene
// and updates the given HitInfo using the information of the sphere
// that first intersects with the ray.
// Returns true if an intersection is found.
bool IntersectRay( inout HitInfo hit, Ray ray )
{
	hit.t = 1e30;
	bool foundHit = false;
	float closestSoFar = 1e30;

	for ( int i=0; i<NUM_SPHERES; ++i ) {
		// TO-DO: Test for ray-sphere intersection
		// TO-DO: If intersection is found, update the given HitInfo
	
		vec3 d = (ray.dir);
		vec3 pminusc = ray.pos - spheres[i].center;
		float a = dot(d, d);
		float b = dot(2.0*d, pminusc);
		float c = dot(pminusc, pminusc)- (spheres[i].radius * spheres[i].radius);

		float delta = (b * b) - (4.0 * a * c);

		if(delta >= bias){ // found hit if greater than zero
			float t = (-b - sqrt(delta)) / (2.0 * a); // minus one is closest
			vec3 x = ray.pos + (t * d);
			if(t < closestSoFar && t >= 0.0){
				foundHit = true;
				closestSoFar = t;

				hit.t = t;
				hit.position = x; //x = p + (t*d)
				hit.normal = normalize(hit.position - spheres[i].center);
				hit.mtl = spheres[i].mtl;
			}
		}
	}
	return foundHit;
}

// Given a ray, returns the shaded color where the ray intersects a sphere.
// If the ray does not hit a sphere, returns the environment color.
vec4 RayTracer( Ray ray )
{
	HitInfo hit;
	if ( IntersectRay( hit, ray ) ) {
		vec3 view = normalize( -ray.dir );
		vec3 clr = Shade( hit.mtl, hit.position, hit.normal, view );
			
		// Compute reflections
		vec3 k_s = hit.mtl.k_s;
		for ( int bounce=0; bounce<MAX_BOUNCES; ++bounce ) {
			if ( bounce >= bounceLimit ) break;
			if ( hit.mtl.k_s.r + hit.mtl.k_s.g + hit.mtl.k_s.b <= 0.0 ) break;
			
			Ray r;	// this is the reflection ray
			HitInfo h;	// reflection hit info
			
			// TO-DO: Initialize the reflection ray
			r.dir = (2.0 * dot(view, hit.normal) * hit.normal - view);
			//r.dir = -reflect(view, hit.normal);
			r.pos = hit.position;
			if ( IntersectRay( h, r ) ) {
				// TO-DO: Hit found, so shade the hit point
				
				//k_s = h.mtl.k_s;

				clr += k_s * Shade(h.mtl, h.position, h.normal, normalize( -r.dir ));
				
				// TO-DO: Update the loop variables for tracing the next reflection ray
				
				view = normalize(-r.dir);

				hit.t = h.t;
				hit.position = h.position;
				hit.normal = h.normal;
				hit.mtl = h.mtl;
				//k_s = h.mtl.k_s;

			} else {
				// The refleciton ray did not intersect with anything,
				// so we are using the environment color
				clr += k_s * textureCube( envMap, r.dir.xzy ).rgb;
				break;	// no more reflections
			}
		}
		return vec4( clr, 1 );	// return the accumulated color, including the reflections
	} else {
		return vec4( textureCube( envMap, ray.dir.xzy ).rgb, 0 );	// return the environment color
	}
}
`;