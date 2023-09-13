import { shaderMaterial } from '@react-three/drei'
import glsl from 'babel-plugin-glsl/macro'
import { Texture } from 'three'

export const MonopoShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0.0,
    uImage: new Texture(),
    uDisplacement: new Texture()
  },
  glsl`
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      vUv = uv;
      vPosition = position;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  glsl`
    precision mediump float;

    varying vec2 vUv;
    varying vec3 vPosition;

    uniform float uTime;
    uniform float uProgress;
    uniform sampler2D uDisplacement;
    uniform sampler2D uImage;

    float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
    vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
    vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

    float noise(vec3 p){
      vec3 a = floor(p);
      vec3 d = p - a;
      d = d * d * (3.0 - 2.0 * d);

      vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
      vec4 k1 = perm(b.xyxy);
      vec4 k2 = perm(k1.xyxy + b.zzww);

      vec4 c = k2 + a.zzzz;
      vec4 k3 = perm(c);
      vec4 k4 = perm(c + 1.0);

      vec4 o1 = fract(k3 * (1.0 / 41.0));
      vec4 o2 = fract(k4 * (1.0 / 41.0));

      vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
      vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

      return o4.y * d.y + o4.x * (1.0 - d.y);
    }

    float lines(vec2 uv, float offset) {
      return smoothstep(
        0., 0.5 + offset*0.5,
        abs(0.5*(sin(uv.x*30.)+offset*2.))
      );
    }

    mat2 rotate2D(float angle) {
      return mat2(
        cos(angle), -sin(angle),
        sin(angle), cos(angle)
      );
    }

    void main() {
      float n = noise(vPosition + uTime*0.2);

      vec3 baseFirst = vec3(120./255., 158./255., 113./255.);
      vec3 accent = vec3(0., 0., 0.);
      vec3 baseSecond = vec3(224./255., 148./255., 66./255.);

      vec2 baseUV = rotate2D(n)*vPosition.xy*0.1;
      float basePattern = lines(baseUV, 0.5);
      float secondPattern = lines(baseUV, 0.1);

      vec3 baseColor = mix(baseSecond, baseFirst, basePattern);
      vec3 secondBaseColor = mix(baseColor, accent, secondPattern);

      gl_FragColor = vec4(vec3(secondBaseColor), 1.);
    }  
  `
)

export const SphereShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0.0,
    uImage: new Texture(),
    uDisplacement: new Texture(),
    uCube: 0
  },
  glsl`
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vReflect;
    varying vec3 vRefract[3];
    varying float vReflectionFactor;

    void main() {
      vUv = uv;
      float mRefractionRatio = 1.02;
      float mFresnelBias = 0.1;
      float mFresnelScale = 2.;
      float mFresnelPower = 1.;

      vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
      vec4 worldPosition = modelMatrix * vec4( position, 1.0 );

      vec3 worldNormal = normalize(mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz) * normal);

      vec3 I = worldPosition.xyz - cameraPosition;

      vReflect = reflect(I, worldNormal);
      vRefract[0] = refract(normalize(I), worldNormal, mRefractionRatio);
      vRefract[1] = refract(normalize(I), worldNormal, mRefractionRatio * 0.99);
      vRefract[2] = refract(normalize(I), worldNormal, mRefractionRatio * 0.98);
      vReflectionFactor = mFresnelBias + mFresnelScale + pow(1.0 + dot(normalize(I), worldNormal), mFresnelPower);

		  gl_Position = projectionMatrix * mvPosition;
    }
  `,
  glsl`
    precision mediump float;

    varying vec2 vUv;
    varying vec3 vPosition;
    varying float vReflectionFactor;
    varying vec3 vRefract[3];
    varying vec3 vReflect;

    uniform samplerCube uCube;

    void main() {
      vec4 reflectedColor = textureCube(uCube, vec3(-vReflect.x, vReflect.yz));
      vec4 refractedColor = vec4(1.0);
      vec4 color1 = textureCube(uCube, vec3(vUv.x, vUv.y, 0.));

      refractedColor.r = textureCube(uCube, vec3(vRefract[0].x, vRefract[0].yz)).r;
      refractedColor.g = textureCube(uCube, vec3(vRefract[1].x, vRefract[1].yz)).g;
      refractedColor.b = textureCube(uCube, vec3(vRefract[2].x, vRefract[2].yz)).b;

			gl_FragColor = mix(refractedColor, reflectedColor, clamp(vReflectionFactor, 0.0, 1.0));
    }  
  `
)
