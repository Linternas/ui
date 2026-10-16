"use client";
import { useEffect, useRef } from "react";
import { useCanvasFrame } from "./shared";

const fragment = `precision mediump float;
uniform vec2 resolution; uniform float time; uniform vec3 tint;
void main(){
 vec2 p=(gl_FragCoord.xy/resolution-.5)*2.; float r=length(p); if(r>1.) discard;
 float z=sqrt(max(0.,1.-dot(p,p))); vec3 n=vec3(p,z);
 float warp=sin(p.x*3.7+sin(p.y*4.1+time*.43)+time*.31)*.18;
 float band=sin(p.y*3.1+p.x*1.8+warp*5.+time*.27)*.5+.5;
 float ripple=sin(p.x*5.-p.y*2.+time*.36)*.08;
 vec3 pale=mix(tint,vec3(1.),.84); vec3 deep=tint*.65;
 vec3 col=mix(deep,pale,smoothstep(.08,.9,band+ripple));
 col=mix(col,vec3(.98),smoothstep(.16,.83,p.y+warp)*.95);
 float light=.68+.32*max(0.,dot(n,normalize(vec3(-.4,.5,1.))));
 col*=light; col+=pow(max(0.,dot(n,normalize(vec3(-.6,.7,1.)))),22.)*.2;
 gl_FragColor=vec4(col,smoothstep(1.,.985,r));
}`;
interface Renderer {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  buffer: WebGLBuffer;
}
function createRenderer(canvas: HTMLCanvasElement): Renderer | null {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: true,
    premultipliedAlpha: false,
  });
  if (!gl) return null;
  const shader = (type: number, source: string) => {
    const result = gl.createShader(type);
    if (!result) return null;
    gl.shaderSource(result, source);
    gl.compileShader(result);
    if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) {
      gl.deleteShader(result);
      return null;
    }
    return result;
  };
  const vertex = shader(
      gl.VERTEX_SHADER,
      "attribute vec2 position; void main(){gl_Position=vec4(position,0.,1.);}",
    ),
    pixel = shader(gl.FRAGMENT_SHADER, fragment);
  if (!vertex || !pixel) return null;
  const program = gl.createProgram(),
    buffer = gl.createBuffer();
  if (!program || !buffer) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, pixel);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(pixel);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    gl.deleteBuffer(buffer);
    return null;
  }
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const attribute = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(attribute);
  gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
  return { gl, program, buffer };
}
export function FluidOrb({
  size = 230,
  color = "#418cf1",
}: {
  size?: number;
  color?: string;
}) {
  const renderer = useRef<Renderer | null>(null),
    attempted = useRef(false);
  const ref = useCanvasFrame((time, _delta, canvas) => {
    if (!attempted.current) {
      attempted.current = true;
      renderer.current = createRenderer(canvas);
    }
    const setup = renderer.current;
    if (!setup) return;
    const { gl, program } = setup;
    if (gl.isContextLost()) return;
    const hex = /^#[a-f\d]{6}$/i.test(color) ? color.slice(1) : "418cf1";
    const rgb = [0, 2, 4].map(
      (index) => parseInt(hex.slice(index, index + 2), 16) / 255,
    );
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(
      gl.getUniformLocation(program, "resolution"),
      canvas.width,
      canvas.height,
    );
    gl.uniform1f(gl.getUniformLocation(program, "time"), time);
    gl.uniform3f(
      gl.getUniformLocation(program, "tint"),
      rgb[0] ?? 0,
      rgb[1] ?? 0,
      rgb[2] ?? 0,
    );
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  });
  useEffect(() => {
    const canvas = ref.current;
    const restore = () => {
      attempted.current = false;
      renderer.current = null;
    };
    canvas?.addEventListener("webglcontextrestored", restore);
    const lost = (event: Event) => event.preventDefault();
    canvas?.addEventListener("webglcontextlost", lost);
    return () => {
      canvas?.removeEventListener("webglcontextrestored", restore);
      canvas?.removeEventListener("webglcontextlost", lost);
      const setup = renderer.current;
      if (setup) {
        setup.gl.deleteBuffer(setup.buffer);
        setup.gl.deleteProgram(setup.program);
      }
      renderer.current = null;
      attempted.current = false;
    };
  }, [ref]);
  return (
    <div
      className="mi-fluid-orb"
      role="img"
      aria-label="Flowing ambient orb"
      style={
        {
          width: size,
          maxWidth: "100%",
          aspectRatio: "1",
          "--orb-color": color,
        } as React.CSSProperties
      }
    >
      <canvas ref={ref} aria-hidden="true" />
    </div>
  );
}
export type MatrixState = "idle" | "listening" | "thinking";
export function MatrixOrb({
  size = 230,
  color = "#8bb7f3",
  state = "idle",
}: {
  size?: number;
  color?: string;
  state?: MatrixState;
}) {
  const ref = useCanvasFrame((time, _delta, canvas) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const center = canvas.width / 2,
      radius = center * 0.82,
      speed = state === "thinking" ? 0.9 : 0.16;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    const dots = [];
    for (let i = 0; i < 720; i++) {
      const y = 1 - (i / 719) * 2,
        circle = Math.sqrt(1 - y * y),
        angle = i * 2.399963 + time * speed;
      const x = Math.cos(angle) * circle,
        z = Math.sin(angle) * circle;
      const wave =
        state === "listening"
          ? 1 + Math.sin(y * 8 + time * 5) * 0.12
          : 1 + Math.sin(time * 1.7) * 0.025;
      dots.push({
        x: center + x * radius * wave,
        y: center + y * radius * wave,
        z,
      });
    }
    dots.sort((a, b) => a.z - b.z);
    for (const point of dots) {
      ctx.globalAlpha = 0.12 + ((point.z + 1) / 2) * 0.88;
      ctx.beginPath();
      ctx.arc(
        point.x,
        point.y,
        ((1.2 + (point.z + 1) * 0.65) * canvas.width) / 230,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
  return (
    <canvas
      ref={ref}
      className="mi-matrix-orb"
      role="img"
      aria-label={`Dot matrix orb, ${state}`}
      style={{ width: size, maxWidth: "100%", aspectRatio: "1" }}
    />
  );
}
