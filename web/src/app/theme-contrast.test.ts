import { readFileSync } from 'node:fs';
import { join } from 'node:path';

type Rgba = { r: number; g: number; b: number; a: number };

const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');

function block(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  const body = css.slice(start, css.indexOf('}', start));
  return Object.fromEntries(
    [...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]),
  );
}

function toGamma(channel: number): number {
  const c = Math.min(1, Math.max(0, channel));
  return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
}

function toLinear(channel: number): number {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function parseOklch(value: string): Rgba {
  const match = /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+)%)?\s*\)/.exec(value);
  if (!match) throw new Error(`cor fora do formato oklch: ${value}`);
  const [l, c, h] = [Number(match[1]), Number(match[2]), (Number(match[3]) * Math.PI) / 180];
  const a = c * Math.cos(h);
  const b = c * Math.sin(h);
  const lp = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mp = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const sp = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return {
    r: toGamma(4.0767416621 * lp - 3.3077115913 * mp + 0.2309699292 * sp),
    g: toGamma(-1.2684380046 * lp + 2.6097574011 * mp - 0.3413193965 * sp),
    b: toGamma(-0.0041960863 * lp - 0.7034186147 * mp + 1.707614701 * sp),
    a: match[4] === undefined ? 1 : Number(match[4]) / 100,
  };
}

function over(top: Rgba, bottom: Rgba): Rgba {
  const mix = (x: number, y: number) => x * top.a + y * (1 - top.a);
  return { r: mix(top.r, bottom.r), g: mix(top.g, bottom.g), b: mix(top.b, bottom.b), a: 1 };
}

function luminance({ r, g, b }: Rgba): number {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrast(
  tokens: Record<string, string>,
  front: string,
  back: string,
  alpha = 1,
  surface = 'background',
): number {
  const background = parseOklch(tokens.background);
  const ground = over(parseOklch(tokens[surface]), background);
  const base = over({ ...parseOklch(tokens[back]), a: alpha }, ground);
  const ink = over(parseOklch(tokens[front]), base);
  const [high, low] = [luminance(ink), luminance(base)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
}

const TEXT_PAIRS: [string, string][] = [
  ['foreground', 'background'],
  ['card-foreground', 'card'],
  ['popover-foreground', 'popover'],
  ['primary-foreground', 'primary'],
  ['secondary-foreground', 'secondary'],
  ['muted-foreground', 'background'],
  ['muted-foreground', 'muted'],
  ['accent-foreground', 'accent'],
  ['destructive', 'background'],
  ['success', 'background'],
  ['success-foreground', 'success'],
  ['warning-foreground', 'warning'],
  ['sidebar-foreground', 'sidebar'],
  ['sidebar-primary-foreground', 'sidebar-primary'],
  ['sidebar-accent-foreground', 'sidebar-accent'],
];

const CONTROL_PAIRS: [string, string][] = [
  ['input', 'background'],
  ['ring', 'background'],
  ['primary', 'background'],
];

const STATE_PAIRS: Record<string, [string, string, number, string][]> = {
  ':root': [
    ['primary-foreground', 'primary', 0.9, 'background'],
    ['destructive', 'destructive', 0.1, 'background'],
    ['destructive', 'destructive', 0.2, 'background'],
    ['destructive', 'destructive', 0.1, 'card'],
    ['destructive', 'destructive', 0.2, 'card'],
    ['destructive', 'destructive', 0.1, 'muted'],
  ],
  '.dark': [
    ['primary-foreground', 'primary', 0.9, 'background'],
    ['destructive', 'destructive', 0.2, 'background'],
    ['destructive', 'destructive', 0.3, 'background'],
    ['destructive', 'destructive', 0.2, 'card'],
    ['destructive', 'destructive', 0.3, 'card'],
    ['destructive', 'destructive', 0.2, 'muted'],
  ],
};

const EXPOSED = ['success', 'success-foreground', 'warning', 'warning-foreground'];

it.each(EXPOSED)('expoe %s como cor do Tailwind', (nome) => {
  expect(css).toContain(`--color-${nome}: var(--${nome});`);
});

it('desenha o contorno de foco com o anel em opacidade total', () => {
  expect(css).toContain('@apply border-border outline-ring;');
});

describe.each([':root', '.dark'])('tema %s', (selector) => {
  const tokens = block(selector);

  it.each(TEXT_PAIRS)('%s sobre %s tem contraste de texto AA', (front, back) => {
    expect(contrast(tokens, front, back)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(STATE_PAIRS[selector])(
    '%s sobre %s a %s em %s tem contraste de texto AA',
    (front, back, alpha, surface) => {
      expect(contrast(tokens, front, back, alpha, surface)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it.each(CONTROL_PAIRS)('%s sobre %s tem contraste de componente AA', (front, back) => {
    expect(contrast(tokens, front, back)).toBeGreaterThanOrEqual(3);
  });
});
