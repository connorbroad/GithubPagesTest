uniform sampler2D tDiffuse;
uniform float pixelSize;
uniform float retroFilterStr;
uniform vec4 tintColor;
varying vec2 vUv;
uniform float time;

float radius = 0.4;
float blur = 2.0;

vec3 linearToSRGB(vec3 color) {
    return pow(color, vec3(1.0 / 2.2));
}

vec4 toGreyscale(vec4 color) {
    float grey = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    return vec4(vec3(grey), color.a);
}

// from https://www.shadertoy.com/view/NdBGRW
float squircle(vec2 uv, vec2 size, float radius){
    radius = 1.0 / radius / min(size.x, size.y);
    float shape = length(pow(abs(uv / size), radius * size));
    return smoothstep(-50.0, 50.0, (shape - 1.0) / min(1.0, fwidth(shape)));
}  

void main() {      
    vec2 uvMinusOneOne = vUv * 2.0 - 1.0; // convert from 0 to 1 to -1 to 1  
    
    float vignette = squircle(uvMinusOneOne, vec2(1.0), radius);
    vignette = smoothstep(1.0, 0.0, vignette);
    vec4 vignetteColor = vec4(vignette, vignette, vignette, 1.0);

    vec4 gameColor = texture2D(tDiffuse, vUv); // the color coming from the materials in the game 

    // pixelation
    vec2 pixelatedUV = uvMinusOneOne;//(floor(distortedUV * pixelSize) / pixelSize) + (1.0 / pixelSize / 2.0);
    vec4 finalColor = vignetteColor * gameColor;
    finalColor.rgb = linearToSRGB(finalColor.rgb);

    // stepped greyscale
    float numGreyShades = 6.0;
    finalColor = toGreyscale(finalColor);
    finalColor.rgb = floor(finalColor.rgb * numGreyShades) / numGreyShades;

    // clamp01 the colors
    finalColor.rgb = clamp(finalColor.rgb, 0.0, 1.0);  

    // add a grid of white lines over the whole canvas
    float gridIntensity = 0.1;
    float lineThickness = 0.3; 
    float gridSpacing = pixelSize;
    float gridX = step(1.0 - lineThickness, mod(vUv.y * gridSpacing, 1.0));
    float gridY = step(1.0 - lineThickness, mod(vUv.x * gridSpacing, 1.0));
    float grid = gridX;// + gridY;
    finalColor.rgb = mix(finalColor.rgb, finalColor.rgb * grid, gridIntensity);

    // apply the tint color 
    finalColor.rgb = mix(finalColor.rgb, finalColor.rgb * tintColor.rgb, retroFilterStr);   

    // add ambient light coloring to the whole canvas from the top right
    // this has kinda turned into a color fade effect
    float ambientLightIntensity = 0.8;
    float ambientLightX = pow(vUv.x / 1.0 - 0.2, 2.0);
    float ambientLightY = pow(vUv.y / 1.0 - 0.2, 2.0);
    float ambientLightShape = clamp(ambientLightX + ambientLightY, 0.0, 1.0);
    //color.rgb = color.rgb + color.rbg * ambientLightShape * ambientLightIntensity;  
    
    gl_FragColor = finalColor;
}