import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import PortalNotFound from '@/app/pages/errors/PortalNotFound';
import { useTenant } from '@/features/tenant';

import { getRecaptchaToken } from '../api/recaptcha.service';
import { useAuth } from '../context/AuthContext';
import { normalizeAuthError, validateLoginForm } from '../utils/authValidation';
import './login.css';

/* ------------------------------------------------------------------------- */
/* Configuration                                                             */
/* ------------------------------------------------------------------------- */

/**
 * Originkit Ribbon Glow "Base" preset controls.
 *
 * BLOCKER (documented): the official Originkit source is not publicly
 * obtainable — https://www.originkit.dev/components/ribbon-glow only exposes a
 * paid "Get this Component" action plus the prop reference below. This is
 * therefore a documented local WebGL2 approximation driven by the exact Base
 * values, with a static gradient fallback when WebGL2 is unavailable.
 */
const RIBBON_PRESET = {
  background: '#0B0A10',
  color1: '#2FD3F2',
  color2: '#7B61FF',
  speed: 50,
  size: 100,
  angle: -180,
  hover: 100,
  reach: 240,
};

/**
 * Real destinations only. Empty values mean the control is not rendered at all
 * (no `href="#"` placeholders, no dead links).
 */
const LEGAL_LINKS = [];
const DEMO_URL = '';
const SUPPORT_URL = '';

const REMEMBER_EMAIL_KEY = 'login_email';
const FALLBACK_ACCENT = '#7B61FF';
const ACCENT_INK_LIGHT = '#FFFFFF';
const ACCENT_INK_DARK = '#0B0A10';

/* --- Left brand panel copy (static design tokens) -------------------------
   The headline is two block spans of ONE heading so a long institution name
   can never break the line rhythm, and so screen readers announce a single
   coherent sentence. */

const BRAND_HEADLINE_LINE_ONE = 'Your campus.';
const BRAND_HEADLINE_LINE_TWO = 'Connected.';

/** `{portal}` is replaced with the resolved, display-only portal label. */
const BRAND_SUPPORTING_TEMPLATE = 'Access your {portal} workspace.';
const BRAND_SUPPORTING_FALLBACK = 'Access your campus workspace.';

/**
 * Rotating placeholder hints, following the Aceternity "Placeholders and
 * Vanish Input" pattern.
 *
 * Deliberately `.example` rather than `.edu`: these inputs are
 * `type="email"`, and a real-looking campus TLD in the hint would be read as a
 * validity rule or mistaken for a label. The real, accessible name stays in the
 * associated <label for="…">, and native validation is unchanged.
 */
const EMAIL_PLACEHOLDERS = [
  'campus email address',
  'your.name@institution.example',
  'email registered with your institution',
];

const PASSWORD_PLACEHOLDERS = [
  'your password',
  'campus account password',
  'password for this portal',
];

/** Backend `PortalType` values: student | faculty | admin | parent. */
const PORTAL_LABELS = {
  student: 'Student',
  faculty: 'Faculty',
  teacher: 'Faculty', // legacy alias only — the API sends `faculty`
  admin: 'Admin',
  parent: 'Parent',
};

/* ------------------------------------------------------------------------- */
/* Colour + contrast helpers                                                 */
/* ------------------------------------------------------------------------- */

function normalizeHex(value) {
  if (typeof value !== 'string') return null;
  const hex = value.trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(hex)) {
    return `#${hex
      .split('')
      .map((char) => char + char)
      .join('')}`.toLowerCase();
  }
  if (/^[0-9a-f]{6}$/i.test(hex)) return `#${hex.toLowerCase()}`;
  return null;
}

function hexToRgb(hex) {
  const normalized = normalizeHex(hex) || FALLBACK_ACCENT;
  const int = Number.parseInt(normalized.slice(1), 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

function rgbToHex({ r, g, b }) {
  const channel = (value) =>
    Math.max(0, Math.min(255, Math.round(value)))
      .toString(16)
      .padStart(2, '0');
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

function mixHex(from, to, amount) {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  return rgbToHex({
    r: a.r + (b.r - a.r) * amount,
    g: a.g + (b.g - a.g) * amount,
    b: a.b + (b.b - a.b) * amount,
  });
}

function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const channel = (value) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

function getRgbChannels(hex) {
  const { r, g, b } = hexToRgb(hex);
  return [r / 255, g / 255, b / 255];
}

/**
 * Derive a contrast-safe CTA palette from a tenant primary colour. Bright
 * tenant colours (e.g. yellow) get dark ink instead of failing white-on-light,
 * satisfying the design-system contrast rule.
 */
function resolveAccentTheme(rawAccent) {
  const accent = normalizeHex(rawAccent) || FALLBACK_ACCENT;
  const deep = mixHex(accent, '#000000', 0.3);
  const whiteWorst = Math.min(
    contrastRatio(ACCENT_INK_LIGHT, accent),
    contrastRatio(ACCENT_INK_LIGHT, deep)
  );
  const darkWorst = Math.min(
    contrastRatio(ACCENT_INK_DARK, accent),
    contrastRatio(ACCENT_INK_DARK, deep)
  );
  return {
    accent,
    deep,
    ink: whiteWorst >= darkWorst ? ACCENT_INK_LIGHT : ACCENT_INK_DARK,
  };
}

/* ------------------------------------------------------------------------- */
/* Tenant field helpers                                                      */
/* ------------------------------------------------------------------------- */

/** Only allow http(s), data-image and same-origin asset URLs from the tenant. */
function resolveAssetUrl(value) {
  if (typeof value !== 'string') return '';
  const url = value.trim();
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || url.startsWith('data:image/') || url.startsWith('/')) {
    return url;
  }
  return '';
}

function getTenantName(tenant) {
  return (
    tenant?.university_name ||
    tenant?.university?.name ||
    tenant?.university?.label ||
    tenant?.name ||
    'Your institution'
  );
}

function getPortalLabel(tenant) {
  const portal = String(tenant?.portal_name || tenant?.portal || '')
    .trim()
    .toLowerCase();
  if (!portal) return 'Campus';
  const label = PORTAL_LABELS[portal] || portal.replace(/[-_]/g, ' ');
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * Supporting sentence for the left panel.
 *
 * `page_asset.metadata.tagline` is the app's existing, supported login-copy
 * override, so that ability is preserved and simply gains a new default. It is
 * rendered as plain text (React escapes it — never `dangerouslySetInnerHTML`),
 * and it is deliberately NOT truncated: long override copy wraps under the
 * 36ch measure instead of being cut. The override never supplies the headline.
 */
function getSupportingSentence(tenant, portalDisplayLabel) {
  const label = String(portalDisplayLabel || '').trim();
  const override = tenant?.page_asset?.metadata?.tagline;

  if (typeof override === 'string' && override.trim()) return override.trim();

  if (!label) return BRAND_SUPPORTING_FALLBACK;
  return BRAND_SUPPORTING_TEMPLATE.replace('{portal}', label.toLowerCase());
}

/**
 * Verified discovery data only. Requires a real name AND an https portal_url
 * before the selector is allowed to offer a switch — the tenant host stays the
 * source of truth and credentials are never sent anywhere else.
 */
function getDiscoveryOptions(tenant) {
  const source = tenant?.available_institutions || tenant?.institutions;
  if (!Array.isArray(source)) return [];
  return source
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const name = item.name || item.label || item.university_name;
      const portalUrl = item.portal_url || item.portalUrl;
      if (!name || typeof portalUrl !== 'string') return null;
      const url = portalUrl.trim();
      if (!/^https:\/\//i.test(url)) return null;
      return { name: String(name).trim(), portalUrl: url };
    })
    .filter(Boolean);
}

function readRememberedEmail() {
  try {
    return window.localStorage.getItem(REMEMBER_EMAIL_KEY) || '';
  } catch {
    return '';
  }
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  return reduced;
}
/* ------------------------------------------------------------------------- */
/* WebGL2 ribbon field                                                       */
/* ------------------------------------------------------------------------- */

const RIBBON_VERTEX_SHADER = `#version 300 es
in vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const RIBBON_FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_pointer;
uniform vec2 u_velocity;
uniform float u_hover;
uniform float u_reach;
uniform float u_size;
uniform float u_angle;
uniform float u_speed;
uniform vec3 u_bg;
uniform vec3 u_color1;
uniform vec3 u_color2;

out vec4 fragColor;

/* Measured resting value of the accumulated glow, and the measured spread from
   there to a bright ribbon core. See the visibility note in main(). */
const float RIBBON_FLOOR = 1.45;
const float RIBBON_RANGE = 2.0;
/* Upper bound on how far the ribbon is mixed over the dark base colour. The base
   stays #0B0A10, so this is the direct "how bright does the aurora read" dial.
   Tuned by measurement, not by feel: 0.5 was invisible, 0.82 turned the whole
   page into a saturated blue field that washed out the headline and the top
   corner. 0.6 keeps the ribbon cores genuinely bright while the quiet regions
   fall back to near-black, which is the dark-glass look the design calls for. */
const float RIBBON_MIX_MAX = 0.6;
/* Pointer halo strength. Was 0.07, which was so faint that the cursor response
   read as broken rather than subtle. */
const float HALO_STRENGTH = 0.17;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * valueNoise(p);
    p = p * 2.03 + 11.7;
    amplitude *= 0.5;
  }
  return value;
}

mat2 rotate2d(float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat2(c, -s, s, c);
}

void main() {
  float minSide = min(u_resolution.x, u_resolution.y);
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / minSide;

  /* The u_angle uniform is -180 degrees, so this rotation is a pure negation: it
     maps uv -> -uv. The pointer and the pointer velocity MUST be put through the
     same transform, otherwise the delta is measured against a mirrored pointer
     and the halo/warp lands at the diametrically opposite position to the real
     cursor. That was the cause of the "cursor handling is inaccurate" report.
     Rotating the two inputs rather than removing the rotation keeps the preset's
     documented angle meaningful. */
  mat2 frame = rotate2d(radians(u_angle));
  uv = frame * uv;

  vec2 aspect = u_resolution / minSide;
  vec2 pointer = frame * ((u_pointer - 0.5) * aspect);
  vec2 pointerVelocity = frame * u_velocity;
  vec2 delta = uv - pointer;
  float dist = length(delta);

  float reach = max(u_reach, 1.0) / minSide;
  float influence = u_hover * exp(-(dist * dist) / max(reach * reach, 1e-4));
  vec2 warp = delta * influence * 1.6 + pointerVelocity * influence * 2.2;

  /* uv is normalised by the SHORT side, so on a portrait phone the field is
     tall and thin: the same size produced one broad, slow sweep with almost no
     ribbon structure, which is why the aurora looked absent behind the stacked
     card. Scaling by the long side keeps the number of visible ribbon folds
     roughly constant from desktop down to phone width. */
  float zoom = max(u_size, 20.0) / 100.0;
  zoom *= clamp(aspect.y, 1.0, 1.85);
  vec2 base = uv * zoom;
  float time = u_time * (u_speed / 50.0) * 0.25;

  vec3 accum = vec3(0.0);
  float total = 0.0;

  for (int i = 0; i < 10; i++) {
    float fi = float(i);
    float layer = fi / 9.0;
    vec2 p = base + warp * (0.65 + layer * 0.9);
    float waveA = sin(p.x * (1.35 + layer * 2.3) + time * (0.75 + layer * 0.5) + layer * 4.1);
    float waveB = sin(p.y * (1.15 + layer * 1.8) - time * (0.55 + layer * 0.35) + layer * 2.6);
    float fold = fbm(p * (1.05 + layer * 0.55) + vec2(time * 0.2, -time * 0.14));
    float ribbon = abs(waveA * 0.55 + waveB * 0.45 + (fold - 0.5) * 1.15);
    float glow = 0.04 / (ribbon + 0.05);
    vec3 tint = mix(u_color1, u_color2, clamp(layer * 0.8 + fold * 0.4, 0.0, 1.0));
    accum += tint * glow;
    total += glow;
  }

  vec3 ribbonColor = accum / max(total, 1e-3);

  // VISIBILITY / BRIGHTNESS TUNING (measured, not guessed).
  //
  // The original mapping was clamp((total - 1.9) * 0.34, 0.0, 0.55). Sampling
  // total across a 1440x900 viewport showed a resting mean of ~1.5 and a peak
  // of only ~3.1, so that formula produced a *mean* mix of 0.013 - the canvas
  // painted a near-flat field of u_bg and the ribbon was invisible. The 1.9
  // floor sat above most of the signal.
  //
  // RIBBON_FLOOR/RIBBON_RANGE map the measured distribution onto 0..1, and
  // RIBBON_MIX_MAX is how far that may lift the #0B0A10 base. The base is
  // untouched, so quiet regions still fall back to near-black and the result
  // reads as a bright aurora over black rather than a flat blue wash.
  float ribbonMix = clamp((total - RIBBON_FLOOR) / RIBBON_RANGE, 0.0, 1.0);
  ribbonMix = smoothstep(0.0, 1.0, ribbonMix) * RIBBON_MIX_MAX;
  ribbonColor *= 0.95;

  // Keep the falloff gentle but bounded, so the corners settle back toward the
  // base colour instead of carrying a bright wash into the top-right of the page.
  ribbonColor *= smoothstep(2.4, 0.12, length(uv) / max(1.0, aspect.x * 0.75));

  vec3 color = mix(u_bg, ribbonColor, ribbonMix);

  // Pointer halo: a local lift centred exactly under the cursor.
  float halo = exp(-dist * dist * 3.5) * HALO_STRENGTH * (0.35 + u_hover);
  color += mix(u_color2, u_color1, 0.35) * halo;

  float dither = (hash(gl_FragCoord.xy) - 0.5) / 255.0;
  fragColor = vec4(max(color + dither, 0.0), 1.0);
}`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * Full-bleed pointer-responsive ribbon field.
 *
 * - Renders once behind the whole page (`position: fixed`, `aria-hidden`,
 *   `z-index: 0` inside the isolated page root, `pointer-events: none`).
 * - Listener target is `window`, so stacked page content never blocks it.
 * - Pauses on hidden tabs, renders a single static frame under reduced motion,
 *   and swaps to a CSS gradient (in React state) whenever WebGL2, the shader or
 *   the context itself is unusable — a broken canvas is never left mounted,
 *   because an opaque WebGL surface composites as solid white.
 * - Cleans up RAF, listeners and GL objects on unmount. The context is never
 *   force-lost: StrictMode replays effects and `getContext` would hand the same
 *   dead context back on the replay.
 */
function RibbonGlow({ reducedMotion }) {
  const canvasRef = useRef(null);
  const [useStaticFallback, setUseStaticFallback] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let gl = null;
    try {
      gl = canvas.getContext('webgl2', {
        // Transparent surface on purpose: if the GPU never produces a frame the
        // canvas stays see-through instead of compositing as opaque white.
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: 'high-performance',
      });
    } catch {
      gl = null;
    }

    // A missing, lost or broken context must never stay in the DOM: an opaque
    // WebGL surface composites as white and would hide the dark page surface.
    if (!gl || gl.isContextLost()) {
      setUseStaticFallback(true);
      return undefined;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, RIBBON_VERTEX_SHADER);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, RIBBON_FRAGMENT_SHADER);
    const program = gl.createProgram();

    if (!vertexShader || !fragmentShader || !program) {
      if (vertexShader) gl.deleteShader(vertexShader);
      if (fragmentShader) gl.deleteShader(fragmentShader);
      if (program) gl.deleteProgram(program);
      setUseStaticFallback(true);
      return undefined;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      setUseStaticFallback(true);
      return undefined;
    }

    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const uniformNames = [
      'u_resolution',
      'u_time',
      'u_pointer',
      'u_velocity',
      'u_hover',
      'u_reach',
      'u_size',
      'u_angle',
      'u_speed',
      'u_bg',
      'u_color1',
      'u_color2',
    ];
    const uniforms = {};
    uniformNames.forEach((name) => {
      uniforms[name] = gl.getUniformLocation(program, name);
    });

    gl.uniform3fv(uniforms.u_bg, getRgbChannels(RIBBON_PRESET.background));
    gl.uniform3fv(uniforms.u_color1, getRgbChannels(RIBBON_PRESET.color1));
    // The decorative layer keeps the Base preset's own cyan/violet direction.
    // It is intentionally NOT bound to the tenant accent: a dark tenant primary
    // would recolour the ribbon to near-black, and the tenant brand already owns
    // the logo and the sign-in button.
    gl.uniform3fv(uniforms.u_color2, getRgbChannels(RIBBON_PRESET.color2));
    gl.uniform1f(uniforms.u_reach, RIBBON_PRESET.reach);
    gl.uniform1f(uniforms.u_size, RIBBON_PRESET.size);
    gl.uniform1f(uniforms.u_angle, RIBBON_PRESET.angle);
    gl.uniform1f(uniforms.u_speed, RIBBON_PRESET.speed);
    gl.uniform1f(uniforms.u_hover, reducedMotion ? 0 : RIBBON_PRESET.hover / 100);

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.75);
      const width = Math.max(window.innerWidth, 1);
      const height = Math.max(window.innerHeight, 1);
      const nextWidth = Math.floor(width * ratio);
      const nextHeight = Math.floor(height * ratio);

      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
        gl.viewport(0, 0, nextWidth, nextHeight);
      }

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      gl.uniform2f(uniforms.u_resolution, width, height);
    };

    let pointerX = 0.68;
    let pointerY = 0.46;
    let targetX = pointerX;
    let targetY = pointerY;
    let velocityX = 0;
    let velocityY = 0;

    const handlePointerMove = (event) => {
      targetX = event.clientX / Math.max(window.innerWidth, 1);
      targetY = event.clientY / Math.max(window.innerHeight, 1);
    };

    const resetPointer = () => {
      targetX = 0.68;
      targetY = 0.46;
    };

    const startedAt = performance.now();
    let frameId = 0;
    let running = false;
    let lastFrameAt = startedAt;

    const render = (now) => {
      // Clamp the delta so a backgrounded tab or a long GC pause cannot make the
      // easing coefficient jump past 1 and overshoot the target.
      const deltaSeconds = Math.min((now - lastFrameAt) / 1000, 0.1);
      lastFrameAt = now;

      const previousX = pointerX;
      const previousY = pointerY;

      /* Frame-rate independent smoothing. The old fixed 0.055-per-frame lerp took
         ~300ms to settle at 60fps, so the aurora visibly trailed the cursor and
         read as "not accurate". This converges in ~50ms while staying smooth. */
      const ease = 1 - Math.exp(-deltaSeconds * 16);

      pointerX += (targetX - pointerX) * ease;
      pointerY += (targetY - pointerY) * ease;
      velocityX += ((pointerX - previousX) * 12 - velocityX) * ease;
      velocityY += ((pointerY - previousY) * 12 - velocityY) * ease;

      gl.uniform2f(uniforms.u_pointer, pointerX, 1 - pointerY);
      gl.uniform2f(uniforms.u_velocity, velocityX, -velocityY);
      gl.uniform1f(uniforms.u_time, (now - startedAt) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const stop = () => {
      running = false;
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = 0;
    };

    const start = () => {
      if (running || document.hidden) return;
      running = true;
      const loop = (now) => {
        if (!running) return;
        render(now);
        frameId = window.requestAnimationFrame(loop);
      };
      frameId = window.requestAnimationFrame(loop);
    };

    const handleVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    resize();
    render(startedAt);

    const handleContextLost = (event) => {
      // Never leave a broken opaque surface behind — swap to the CSS gradient.
      event.preventDefault();
      stop();
      setUseStaticFallback(true);
    };

    canvas.addEventListener('webglcontextlost', handleContextLost);
    window.addEventListener('resize', resize);

    if (!reducedMotion) {
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      window.addEventListener('pointerleave', resetPointer);
      window.addEventListener('blur', resetPointer);
      document.addEventListener('visibilitychange', handleVisibility);
      start();
    }

    return () => {
      stop();
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', resetPointer);
      window.removeEventListener('blur', resetPointer);
      document.removeEventListener('visibilitychange', handleVisibility);

      if (!gl.isContextLost()) {
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
      }

      // Deliberately NOT calling WEBGL_lose_context.loseContext(): React
      // StrictMode replays effects, and `getContext` would hand this same dead
      // context back on the second run, leaving an opaque blank canvas.
    };
  }, [reducedMotion]);

  if (useStaticFallback) {
    return <div className="login-ribbon login-ribbon-static" aria-hidden="true" />;
  }

  return <canvas ref={canvasRef} className="login-ribbon" aria-hidden="true" />;
}

/* ------------------------------------------------------------------------- */
/* Presentational pieces                                                     */
/* ------------------------------------------------------------------------- */

/**
 * Static two-line brand heading.
 *
 * The looping typewriter, its blinking cursor and the rotating headline words
 * were removed on purpose: the heading must be fully readable and stable, and
 * assistive tech should never announce a half-typed sentence. Both lines are
 * block spans of ONE <h1>, so the panel exposes a single heading node (no
 * duplicate heading IDs) and the copy cannot reflow while it animates in.
 */
function BrandHeadline({ lineOne, lineTwo }) {
  return (
    <h1 className="login-brand-heading" id="login-brand-heading">
      <span className="login-brand-heading-line login-brand-heading-line--primary">
        {lineOne}
      </span>
      <span className="login-brand-heading-line login-brand-heading-line--muted">
        {lineTwo}
      </span>
    </h1>
  );
}

/**
 * Eyes that follow the pointer.
 *
 * Documented substitution: "Eyes Follow Cursor" is a Framer-only component and
 * cannot be installed here, so the behaviour is implemented natively. Pupil
 * offsets are written to CSS variables on the mascot element (both eyes track
 * together) and clamped inside the white of the eye. The easing loop stops when
 * the pupils settle, so there is no perpetual RAF.
 */
function EyesFollowCursor() {
  const mascotRef = useRef(null);

  useEffect(() => {
    const node = mascotRef.current;
    if (!node) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const MAX_X = 3;
    const MAX_Y = 3.4;
    const clamp = (value, max) => Math.max(-max, Math.min(max, value));

    let rect = node.getBoundingClientRect();
    let frameId = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const measure = () => {
      rect = node.getBoundingClientRect();
    };

    const handlePointerMove = (event) => {
      if (!rect.width || !rect.height) measure();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      targetX = clamp(((event.clientX - centerX) / Math.max(window.innerWidth / 2, 1)) * 12, MAX_X);
      targetY = clamp(
        ((event.clientY - centerY) / Math.max(window.innerHeight / 2, 1)) * 12,
        MAX_Y
      );
      if (!frameId) frameId = window.requestAnimationFrame(tick);
    };

    const reset = () => {
      targetX = 0;
      targetY = 0;
      if (!frameId) frameId = window.requestAnimationFrame(tick);
    };

    function tick() {
      frameId = 0;
      currentX += (targetX - currentX) * 0.14;
      currentY += (targetY - currentY) * 0.14;
      node.style.setProperty('--eye-x', `${currentX.toFixed(2)}px`);
      node.style.setProperty('--eye-y', `${currentY.toFixed(2)}px`);

      const settled =
        Math.abs(targetX - currentX) < 0.05 && Math.abs(targetY - currentY) < 0.05;
      if (!settled) frameId = window.requestAnimationFrame(tick);
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', reset);
    window.addEventListener('blur', reset);
    window.addEventListener('resize', measure);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', reset);
      window.removeEventListener('blur', reset);
      window.removeEventListener('resize', measure);
      node.style.removeProperty('--eye-x');
      node.style.removeProperty('--eye-y');
    };
  }, []);

  return (
    <span ref={mascotRef} className="eyes-mascot" aria-hidden="true">
      <span className="login-eye">
        <span className="login-eye-pupil" />
      </span>
      <span className="login-eye">
        <span className="login-eye-pupil" />
      </span>
    </span>
  );
}

/**
 * Labelled native input with rotating hints and a submit-time vanish.
 *
 * Reference: Aceternity "Placeholders and Vanish Input"
 * (https://ui.aceternity.com/components/placeholders-and-vanish-input).
 *
 * Documented deviation, not a claim of an exact port: the official component
 * REPLACES the native input with a canvas/DOM overlay, which would break
 * `type="password"`, `autocomplete`, password managers and the native
 * label/error wiring. Only the compatible parts are adopted here —
 *
 *   1. rotating placeholder hints while the field is empty (its `placeholders`
 *      prop), and
 *   2. a "vanish" pass over the placeholder layer.
 *
 * Safety rules this component enforces:
 *   - The inputs stay real, controlled, labelled, `required` native elements
 *     with stable ids/names, so autofill, password managers and native
 *     validation are untouched.
 *   - The vanish is driven by `vanish`, which the page only sets AFTER a valid
 *     submission has begun. It is a visual dissolve of the placeholder layer
 *     only: it never writes to `email`/`password`, so a rejected sign-in always
 *     leaves the entered credentials present and usable.
 *   - Under `prefers-reduced-motion` the rotation is disabled and a single
 *     static hint is shown, and the CSS neutralises the vanish transition.
 */
function LoginField({
  id,
  label,
  type,
  value,
  onChange,
  error,
  placeholderList,
  autoComplete,
  inputRef,
  icon,
  reveal,
  onToggleReveal,
  vanish,
  reducedMotion,
}) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const resolvedType = type === 'password' && reveal ? 'text' : type;
  const hasValue = value.length > 0;

  // Rotate hints only while the field is empty: a hint that changes under a
  // half-typed value is noise, and the reference hides placeholders once there
  // is content.
  useEffect(() => {
    if (reducedMotion || hasValue || placeholderList.length < 2) return undefined;
    const timer = window.setInterval(
      () => setPlaceholderIndex((index) => (index + 1) % placeholderList.length),
      3600
    );
    return () => window.clearInterval(timer);
  }, [hasValue, placeholderList, reducedMotion]);

  const rotatingHint = reducedMotion ? placeholderList[0] : placeholderList[placeholderIndex];
  // A field holding a value (or mid-vanish) shows a neutral static hint.
  const activeHint = hasValue || vanish ? placeholderList[0] : rotatingHint;

  return (
    <div className="field-group">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <div
        className={`field-shell${error ? ' field-shell-error' : ''}${
          vanish ? ' login-field-vanish' : ''
        }`}
      >
        {icon}
        <input
          id={id}
          ref={inputRef}
          name={id}
          type={resolvedType}
          value={value}
          onChange={onChange}
          placeholder={activeHint}
          className="login-input"
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          spellCheck="false"
          required
        />
        {type === 'password' && (
          <button
            type="button"
            className="icon-button"
            onClick={onToggleReveal}
            aria-label={reveal ? 'Hide password' : 'Show password'}
            aria-pressed={reveal}
          >
            {reveal ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        )}
      </div>
      {error && (
        <p className="field-error" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Searchable, keyboard-operable institution combobox.
 *
 * Only rendered when the branding payload supplies verified discovery entries
 * (name + https portal_url). Selecting one navigates to that institution's own
 * portal host first — credentials are never sent to a different tenant based on
 * untrusted text.
 */
function InstitutionCombobox({ options, onNavigate }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const listboxId = 'institution-options';

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((option) => option.name.toLowerCase().includes(needle));
  }, [options, query]);

  const safeIndex = Math.min(activeIndex, Math.max(filtered.length - 1, 0));

  const openMenu = () => {
    setOpen(true);
    setQuery('');
    setActiveIndex(0);
  };

  const closeMenu = () => {
    setOpen(false);
    setQuery('');
    setActiveIndex(0);
  };

  const handleKeyDown = (event) => {
    if (!open && (event.key === 'ArrowDown' || event.key === 'Enter')) {
      event.preventDefault();
      openMenu();
      return;
    }
    if (!open) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
      return;
    }
    if (event.key === 'Tab') {
      closeMenu();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, Math.max(filtered.length - 1, 0)));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const option = filtered[safeIndex];
      if (option) {
        closeMenu();
        onNavigate(option);
      }
    }
  };

  return (
    <div className="field-group institution-group">
      <label className="field-label" htmlFor="institution-search">
        Institution
      </label>
      <div className="institution-control">
        <Building2 className="field-icon" aria-hidden="true" />
        <input
          id="institution-search"
          className="login-input institution-input"
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            open && filtered[safeIndex] ? `institution-option-${safeIndex}` : undefined
          }
          autoComplete="off"
          value={open ? query : ''}
          placeholder="Search institutions"
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
            setOpen(true);
          }}
          onFocus={openMenu}
          onKeyDown={handleKeyDown}
        />
        <ChevronDown
          className={`selector-chevron${open ? ' selector-chevron-open' : ''}`}
          size={17}
          aria-hidden="true"
        />
        {open && (
          <div className="institution-options" id={listboxId} role="listbox" aria-label="Institutions">
            {filtered.length ? (
              filtered.map((option, index) => (
                <button
                  key={option.portalUrl}
                  id={`institution-option-${index}`}
                  type="button"
                  role="option"
                  aria-selected={index === safeIndex}
                  className={`institution-option${
                    index === safeIndex ? ' institution-option-active' : ''
                  }`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    closeMenu();
                    onNavigate(option);
                  }}
                >
                  <span>{option.name}</span>
                  {index === safeIndex && <Check size={15} aria-hidden="true" />}
                </button>
              ))
            ) : (
              <p className="institution-empty">No matching institution</p>
            )}
            <p className="institution-hint">
              You will be taken to that institution&rsquo;s own portal before signing in.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Institution identity control.
 *
 * The portal URL is the source of truth for the tenant. Until a verified public
 * discovery endpoint exists this renders a non-editable pill explaining that,
 * instead of a fake dropdown that would leave the user on the same tenant.
 */
function InstitutionControl({ institutionName, portalLabel, options }) {
  const navigateToPortal = useCallback((option) => {
    window.location.assign(option.portalUrl);
  }, []);

  if (options.length > 0) {
    return <InstitutionCombobox options={options} onNavigate={navigateToPortal} />;
  }

  return (
    <div className="field-group">
      <span className="field-label" id="institution-label">
        Institution
      </span>
      <div className="institution-control" role="group" aria-labelledby="institution-label">
        <Building2 className="field-icon" aria-hidden="true" />
        <p className="institution-pill">
          <strong>{institutionName}</strong>
          <span className="institution-pill-portal">{portalLabel} portal</span>
        </p>
      </div>
      <p className="institution-static-hint">
        Your institution is set by this portal address. To switch, open that institution&rsquo;s
        portal URL.
      </p>
    </div>
  );
}

/**
 * Primary CTA — React-native liquid-glass interpretation.
 *
 * Reference: Framer "Liquid Glass Buttons"
 * (https://www.framer.com/marketplace/components/liquid-glass-buttons/).
 *
 * That is a Framer code component driven by Framer property controls, not a
 * drop-in React package, and it is not installed here. This is a native CSS
 * interpretation of the *restrained* parts of the look — frosted body, cool
 * edge highlight, top-edge sheen, a small clipped pointer-follow reflection and
 * a 1-2px press compression. No SVG displacement filter, no WebGL layer, no
 * blur cloud, no continuous animation loop, and no Framer runtime.
 *
 * What is deliberately preserved:
 *   - ONE real `<button type="submit">`. There is no wrapper that could swallow
 *     submission, so Enter-key submit, the form's onSubmit and the disabled /
 *     loading semantics are unchanged.
 *   - The institution's primary brand colour is applied only as a small tint
 *     (`--login-accent` feeds the glass tint and the sheen), never as a
 *     transparent low-contrast outline: the body is a dark translucent
 *     navy/violet glass so white label ink keeps its contrast.
 *
 * The pointer position is written to two CSS custom properties that the
 * reflection pseudo-element consumes. The pseudo-element is `aria-hidden`,
 * clipped by `overflow: hidden` on the button and painted *behind* the label, so
 * it can never cover the text. Pointer tracking is skipped for coarse pointers
 * and under `prefers-reduced-motion`, where CSS also drops the transitions.
 */
function SubmitButton({ children, disabled, reducedMotion }) {
  const buttonRef = useRef(null);
  const frameRef = useRef(0);

  const stopTracking = () => {
    window.cancelAnimationFrame(frameRef.current);
    frameRef.current = 0;
    if (!buttonRef.current) return;
    buttonRef.current.style.setProperty('--login-glass-x', '50%');
    buttonRef.current.style.setProperty('--login-glass-y', '0%');
  };

  const handlePointerMove = (event) => {
    const node = buttonRef.current;
    if (!node || disabled || reducedMotion) return;
    // Coarse pointers (touch/pen) have no hover position to follow.
    if (event.pointerType && event.pointerType !== 'mouse') return;

    const rect = node.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    window.cancelAnimationFrame(frameRef.current);
    frameRef.current = window.requestAnimationFrame(() => {
      if (!buttonRef.current) return;
      buttonRef.current.style.setProperty('--login-glass-x', `${x.toFixed(1)}%`);
      buttonRef.current.style.setProperty('--login-glass-y', `${y.toFixed(1)}%`);
    });
  };

  useEffect(
    () => () => {
      window.cancelAnimationFrame(frameRef.current);
    },
    []
  );

  return (
    <button
      ref={buttonRef}
      type="submit"
      className="primary-button login-glass-button"
      disabled={disabled}
      onPointerMove={handlePointerMove}
      onPointerLeave={stopTracking}
      onPointerCancel={stopTracking}
      onBlur={stopTracking}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------------- */
/* Page                                                                      */
/* ------------------------------------------------------------------------- */

export default function LoginPage() {
  const { tenant, isTenantLoading, error: tenantError } = useTenant();
  const { login, isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();

  const [email, setEmail] = useState(readRememberedEmail);
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(() => Boolean(readRememberedEmail()));
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isVanishing, setIsVanishing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const vanishArmTimerRef = useRef(0);
  const vanishClearTimerRef = useRef(0);

  const institutionName = getTenantName(tenant);
  const portalLabel = getPortalLabel(tenant);
  const supportingSentence = getSupportingSentence(tenant, portalLabel);
  const logoUrl = resolveAssetUrl(tenant?.logo_dark_url || tenant?.logo_url);
  const discoveryOptions = useMemo(() => getDiscoveryOptions(tenant), [tenant]);
  const accentTheme = useMemo(
    () => resolveAccentTheme(tenant?.theme_config?.colors?.primary),
    [tenant]
  );

  const isBusy = isAuthLoading || isSubmitting;
  const hasFooterLinks =
    LEGAL_LINKS.length > 0 || Boolean(DEMO_URL) || Boolean(SUPPORT_URL);

  const triggerVanish = useCallback(() => {
    // Two macrotasks rather than requestAnimationFrame: the "off" render is
    // guaranteed to commit before the "on" render, so the CSS animation reliably
    // replays on a repeat submit even when the frame rate is poor. An rAF here
    // can land AFTER the removal timer on a throttled tab and silently skip the
    // animation.
    window.clearTimeout(vanishArmTimerRef.current);
    window.clearTimeout(vanishClearTimerRef.current);
    setIsVanishing(false);
    vanishArmTimerRef.current = window.setTimeout(() => setIsVanishing(true), 20);
    // Held longer than the 260ms CSS animation so the full pass is rendered.
    vanishClearTimerRef.current = window.setTimeout(() => setIsVanishing(false), 420);
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(vanishArmTimerRef.current);
      window.clearTimeout(vanishClearTimerRef.current);
    },
    []
  );

  const handleEmailChange = useCallback((event) => {
    const { value } = event.target;
    setEmail(value);
    setFieldErrors((previous) => (previous.email ? { ...previous, email: '' } : previous));
  }, []);

  const handlePasswordChange = useCallback((event) => {
    const { value } = event.target;
    setPassword(value);
    setFieldErrors((previous) =>
      previous.password ? { ...previous, password: '' } : previous
    );
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (isBusy) return;

      setFormError('');

      const { valid, errors } = validateLoginForm({ email, password });
      setFieldErrors(errors);

      if (!valid) {
        // No vanish here. The Aceternity vanish may only run once a VALID
        // submission has begun, so an invalid form just focuses the offending
        // field and leaves the typed value completely untouched.
        if (errors.email) emailRef.current?.focus();
        else passwordRef.current?.focus();
        return;
      }

      const trimmedEmail = email.trim();

      try {
        if (remember) window.localStorage.setItem(REMEMBER_EMAIL_KEY, trimmedEmail);
        else window.localStorage.removeItem(REMEMBER_EMAIL_KEY);
      } catch {
        // Storage can be unavailable (private mode); never block sign-in.
      }

      setIsSubmitting(true);
      // Only now — after validation passed and the request is starting — is it
      // safe to play the vanish. It never writes to email/password, so a
      // rejected sign-in still leaves the credentials present and reusable.
      triggerVanish();

      try {
        const recaptchaToken = await getRecaptchaToken('login');
        await login({ email: trimmedEmail, password, recaptcha_token: recaptchaToken });
        navigate('/dashboard', { replace: true });
      } catch (loginError) {
        // login() always rejects on failure, so a redirect can never run here.
        setFormError(normalizeAuthError(loginError));
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, isBusy, login, navigate, password, remember, triggerVanish]
  );

  if (isTenantLoading) {
    return (
      <main className="login-page">
        <div className="login-loading">
          <span className="login-spinner" aria-hidden="true" />
          <span>Loading your portal&hellip;</span>
        </div>
      </main>
    );
  }

  if (tenantError) return <PortalNotFound />;

  const pageStyle = {
    '--login-accent': accentTheme.accent,
    '--login-accent-deep': accentTheme.deep,
    '--login-accent-ink': accentTheme.ink,
  };

  return (
    <main className="login-page" style={pageStyle}>
      <RibbonGlow reducedMotion={reducedMotion} />
      <div className="login-noise" aria-hidden="true" />

      <div className="login-layout">
        {/* Left brand section: identity, one short headline, one supporting
            sentence. The product eyebrow, feature rows, campus silhouette and
            bottom reassurance line were removed from the markup entirely — they
            are not hidden with CSS, so they are gone from the accessibility
            tree too. Tenant metadata itself is untouched and still available to
            the rest of the app. */}
        <section className="login-brand-panel" aria-labelledby="login-brand-heading">
          <div className="login-brand-identity">
            <span className="login-brand-mark">
              {logoUrl ? (
                <img src={logoUrl} alt={`${institutionName} logo`} />
              ) : (
                <GraduationCap size={22} aria-hidden="true" />
              )}
            </span>
            <span className="login-brand-identity-text">
              <span className="login-brand-name">{institutionName}</span>
              <span className="login-brand-portal">{portalLabel} portal</span>
            </span>
          </div>

          <div className="login-brand-copy">
            <BrandHeadline
              lineOne={BRAND_HEADLINE_LINE_ONE}
              lineTwo={BRAND_HEADLINE_LINE_TWO}
            />
            <p className="login-brand-supporting">{supportingSentence}</p>
          </div>
        </section>

        <section className="login-card" aria-labelledby="login-title">
          <div className="login-card-inner">
            <header className="login-header">
              <EyesFollowCursor />
              <div>
                <p className="login-kicker">{portalLabel} access</p>
                <h2 id="login-title">Welcome back</h2>
                <p className="login-subtitle">Sign in to continue to your campus workspace.</p>
              </div>
            </header>

            <form onSubmit={handleSubmit} noValidate>
              <InstitutionControl
                institutionName={institutionName}
                portalLabel={portalLabel}
                options={discoveryOptions}
              />

              <LoginField
                id="email"
                label="Email address"
                type="email"
                icon={<Mail className="field-icon" aria-hidden="true" />}
                value={email}
                onChange={handleEmailChange}
                error={fieldErrors.email || ''}
                placeholderList={EMAIL_PLACEHOLDERS}
                autoComplete="username"
                inputRef={emailRef}
                vanish={isVanishing}
                reducedMotion={reducedMotion}
              />

              <LoginField
                id="password"
                label="Password"
                type="password"
                icon={<Lock className="field-icon" aria-hidden="true" />}
                value={password}
                onChange={handlePasswordChange}
                error={fieldErrors.password || ''}
                placeholderList={PASSWORD_PLACEHOLDERS}
                autoComplete="current-password"
                inputRef={passwordRef}
                reveal={showPassword}
                onToggleReveal={() => setShowPassword((visible) => !visible)}
                vanish={isVanishing}
                reducedMotion={reducedMotion}
              />

              <div className="form-meta">
                <label className="remember-label" htmlFor="remember-email">
                  <input
                    id="remember-email"
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                  />
                  {/* Visual indicator only — `aria-hidden` and driven entirely by the
                      real input's :checked state through the adjacent-sibling
                      selector, so it can never fall out of sync. The check path is an
                      inline SVG drawn on by `stroke-dashoffset`, which gives the
                      Motion/Radix reference its deliberate checked-state transition
                      with no bounce, overshoot or layout movement. */}
                  <span className="custom-checkbox" aria-hidden="true">
                    <svg viewBox="0 0 16 16" focusable="false">
                      <path
                        className="custom-checkbox-path"
                        d="M3.4 8.4 L6.5 11.4 L12.6 4.8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span>Remember my email</span>
                </label>
                <Link to="/forgot-password" className="text-link">
                  Forgot password?
                </Link>
              </div>

              {formError && (
                <div className="login-alert" role="alert">
                  {formError}
                </div>
              )}

              <SubmitButton disabled={isBusy} reducedMotion={reducedMotion}>
                {isBusy ? (
                  <>
                    <span className="button-spinner" aria-hidden="true" />
                    Signing in&hellip;
                  </>
                ) : (
                  <>
                    Sign in <ArrowRight size={17} aria-hidden="true" />
                  </>
                )}
              </SubmitButton>
            </form>

            {/* Google/Microsoft sign-in, the "or continue with" divider and the
                SSO-only notice were removed on request. The form and the card
                footer close up naturally below — no empty spacer is reserved. */}

            {hasFooterLinks ? (
              <footer className="login-footer">
                <div className="footer-links">
                  {LEGAL_LINKS.map((link) => (
                    <a key={link.href} href={link.href}>
                      {link.label}
                    </a>
                  ))}
                  {SUPPORT_URL && <a href={SUPPORT_URL}>Help</a>}
                </div>
                {DEMO_URL && (
                  <a className="demo-link" href={DEMO_URL}>
                    Request demo
                  </a>
                )}
              </footer>
            ) : (
              <p className="login-support-note">
                Trouble signing in? Contact your institution&rsquo;s IT support.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}









