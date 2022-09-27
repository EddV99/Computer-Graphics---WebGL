attribute vec3 pos;
attribute vec4 clr;

uniform mat4 trans; // used for all vertices uniformily *Note vertices call this file one by one. 

varying vec4 vcolor; // pipeline for fragment shader (passing to fragement shader code)

void main()
{
    gl_Position = trans * vec4(pos, 1); // gl_Position is in canonical view
    vcolor = clr;
}