/**
 * The colour seen at each cell when nothing moves: walks every path in paint
 * order, skipping groups hidden at rest, and keys each subpath by where it
 * starts, so a later cell drawn on top wins.
 */
export function stillFrame(svg: string): Map<string, string> {
  const seen = new Map<string, string>();
  const visible = svg.replace(/<g class="[^"]+" opacity="0">.*?<\/g>/g, '');
  for (const [, colour, d] of visible.matchAll(/<path (?:fill|stroke)="([^"]+)"[^>]* d="([^"]+)"/g)) {
    let [x, y, sx, sy] = [0, 0, 0, 0];
    let cmd = '';
    let args: number[] = [];
    const run = (): void => {
      if (cmd === 'm')
        [x, y, sx, sy] = [x + (args[0] ?? 0), y + (args[1] ?? 0), x + (args[0] ?? 0), y + (args[1] ?? 0)];
      if (cmd === 'm') seen.set(`${Math.round(x * 1000)},${Math.round(y * 1000)}`, colour as string);
      if (cmd === 'h') x += args[0] ?? 0;
      if (cmd === 'v') y += args[0] ?? 0;
      if (cmd === 'l') [x, y] = [x + (args[0] ?? 0), y + (args[1] ?? 0)];
      if (cmd === 'z') [x, y] = [sx, sy];
    };
    for (const [token] of (d as string).matchAll(/[mhvlz]|-?(?:\d+\.?\d*|\.\d+)/g)) {
      if (/[mhvlz]/.test(token)) {
        cmd = token;
        args = [];
        if (cmd === 'z') run();
        continue;
      }
      args.push(Number(token));
      const need = cmd === 'h' || cmd === 'v' ? 1 : 2;
      if (args.length === need) {
        run();
        args = [];
        // Bare pairs after a move are line-tos.
        if (cmd === 'm') cmd = 'l';
      }
    }
  }
  return seen;
}
