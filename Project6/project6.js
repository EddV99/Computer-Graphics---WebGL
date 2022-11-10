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

bool IntersectShadowRay(Ray ray);
bool IntersectRay( inout HitInfo hit, Ray ray );
vec3 Blinn(Material mtl, vec3 normal, vec3 view, vec3 light, vec3 I);

float bias = 0.3;

// Does Blinn Material Model shading. Returns color as vec3.
vec3 Blinn(Material mtl, vec3 normal, vec3 view, vec3 light, vec3 I)
{
	vec3 h = normalize(light + view);

	float cosTheta = dot(normal, light);
	float cosPhi = dot(normal, h);

	return I * ((max(0.0, cosTheta) * mtl.k_d) + (mtl.k_s * pow(max(0.0, cosPhi), mtl.n)));
}

// Shades the given point and returns the computed color.
vec3 Shade( Material mtl, vec3 position, vec3 normal, vec3 view )
{
	vec3 color = vec3(0,0,0);
	Ray shadowRay;
	for ( int i=0; i<NUM_LIGHTS; ++i ) {

		shadowRay.pos = position;
		shadowRay.dir = normalize(lights[i].position - position);

		// Check for shadows
		if ( !IntersectShadowRay( shadowRay )){
			color += Blinn(mtl, normal, view, normalize(lights[i].position - position), lights[i].intensity);
		}
		else{
			//color += mtl.k_d * lights[i].intensity;
			color += Blinn(mtl, normal, view, normalize(lights[i].position - position), lights[i].intensity * .5);
		}
	}
	return color;
}
bool IntersectShadowRay(Ray ray){
	Sphere sphere;
	for ( int i=0; i<NUM_SPHERES; ++i ) {
	
		// grab sphere to test
		sphere = spheres[i];

		// This implementation assumes we wont be in sphere!!!! [FIX FOR FINAL TURN IN]
		float a = dot(ray.dir, ray.dir);
		float b = dot(2.0 * ray.dir, ray.pos - sphere.center);
		float c = dot(ray.pos - sphere.center, ray.pos - sphere.center) - pow(sphere.radius, 2.0);

		float delta = pow(b, 2.0) - (4.0 * a * c);
		
		// Test for ray-sphere intersection
		if (delta >= bias){ // change 0.0 comparison for bias 
			return true;
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
	Sphere sphere;
	float closest = 1.0; // z-value of positions to find closest. 
	hit.t = 1e30;
	bool foundHit = false;
	for ( int i=0; i<NUM_SPHERES; ++i ) {
		// Test for ray-sphere intersection

		// grab sphere to test
		sphere = spheres[i];

		// This implementation assumes we wont be in sphere!!!! [FIX FOR FINAL TURN IN]
		float a = dot(ray.dir, ray.dir);
		float b = dot(2.0 * ray.dir, ray.pos - sphere.center);
		float c = dot(ray.pos - sphere.center, ray.pos - sphere.center) - pow(sphere.radius, 2.0);

		float delta = pow(b, 2.0) - (4.0 * a * c);

		if (delta >= 0.0){ // change 0.0 comparison for bias 
			// If delta is positive or zero then we found a hit.
			foundHit = true;

			float t = (-b - sqrt(delta)) / (2.0*a); // use negative for first hit
			vec3 x = ray.pos + (t * ray.dir); // position is x = p + td

			if( closest > 0.0){
				// update closest sphere
				closest = x.z;

				// If intersection is found, update the given HitInfo
				hit.t = t;
				hit.position = x;
				hit.normal = normalize(2.0 * (x - sphere.center));
				hit.mtl = sphere.mtl;
			}
			else if (x.z > closest)
			{
				// update closest sphere
				closest = x.z;

				// If intersection is found, update the given HitInfo
				hit.t = t;
				hit.position = x;
				hit.normal = normalize(2.0 * (x - sphere.center));
				hit.mtl = sphere.mtl;
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
			r.pos = hit.position;
			r.dir = reflect(view, hit.normal);

			if ( IntersectRay( h, r ) ) {
				// Hit found, so shade the hit point
				view = normalize( -r.dir );
				Shade(h.mtl, h.position, h.normal, view);
				// Update the loop variables for tracing the next reflection ray
				hit = h;
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