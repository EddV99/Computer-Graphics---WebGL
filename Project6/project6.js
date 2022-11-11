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

float bias = 0.001;

bool IntersectRay( inout HitInfo hit, Ray ray );
vec3 Blinn(Material mtl, vec3 viewDir, vec3 lightDir, vec3 normal, vec3 I);
bool IntersectShadowRay(Ray ray);

vec3 Blinn(Material mtl, vec3 viewDir, vec3 lightDir, vec3 normal, vec3 I){

	vec3 h = normalize(normalize(viewDir) + normalize(lightDir));

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
		Light light = lights[i];

		shadowRay.dir = normalize(light.position - shadowRay.pos);
		
		// Check for shadows
		if( IntersectShadowRay(shadowRay) ){ // is in shadow
		} else{ // Not shadowed, perform shading using the Blinn model
			color += Blinn(mtl, view, shadowRay.dir, normal, light.intensity);
		}
	}
	return color;
}
bool IntersectShadowRay(Ray ray){

	for ( int i=0; i<NUM_SPHERES; ++i ) {
		
		vec3 d = (ray.dir);
		vec3 pminusc = ray.pos - spheres[i].center;
		float a = dot(d, d);
		float b = dot(2.0 * d, pminusc);
		float c = dot(pminusc, pminusc) - (spheres[i].radius * spheres[i].radius);

		float delta = (b * b) - (4.0 * a * c);

		if(delta >= bias){ // found hit if greater than zero
			float t = (-b - sqrt(delta)) / (2.0 * a);

			if(t >= 0.0){ // ignore intersects behind the view
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

		// Test for ray-sphere intersection
		vec3 d = (ray.dir);
		vec3 pminusc = ray.pos - spheres[i].center;

		float a = dot(d, d);
		float b = dot(2.0*d, pminusc);
		float c = dot(pminusc, pminusc)- (spheres[i].radius * spheres[i].radius);

		float delta = (b * b) - (4.0 * a * c);

		if(delta >= bias){ // found hit if greater than zero
			float t = (-b - sqrt(delta)) / (2.0 * a); // minus one is closest
			
			if(t < closestSoFar && t >= 0.0){ // ignore -t, since it's behind the view
				foundHit = true;
				closestSoFar = t;

				// Intersection is found, update the given HitInfo
				hit.t = t;
				hit.position = ray.pos + (t * d); 
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
			
			// Initialize the reflection ray
			r.dir = 2.0 * dot(view, hit.normal) * hit.normal - view;
			r.pos = hit.position;

			if ( IntersectRay( h, r ) ) {
				//k_s = h.mtl.k_s;
				// Hit found, so shade the hit point

				clr += k_s * Shade(h.mtl, h.position, h.normal, (-r.dir));
				
				// Update the loop variables for tracing the next reflection ray
				view = (-r.dir);

				hit.t = h.t;
				hit.position = h.position;
				hit.normal = h.normal;
				hit.mtl = h.mtl;
				k_s = h.mtl.k_s;
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