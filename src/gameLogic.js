export const GAME_HEIGHT = 100;

export function getPlayerColor(index) {
  const colors = ['#E76F51', '#2A9D8F', '#4267AC', '#9C5FCE', '#D9901A', '#287271', '#C8553D', '#5B7C3A', '#7B5EA7', '#B34A6F'];
  return colors[index % colors.length];
}

export function hasBridgeConflict(bridges, candidate, minimumGap = 0) {
  return bridges.some((bridge) => Math.abs(bridge.row - candidate.row) <= minimumGap && Math.abs(bridge.col - candidate.col) <= 1);
}

export function generateGameData(playerCount, random = Math.random) {
  const minBridges = playerCount * 3;
  const maxBridges = playerCount * 6;
  const targetCount = Math.floor(random() * (maxBridges - minBridges + 1)) + minBridges;
  const bridges = [];

  for (let attempt = 0; attempt < targetCount * 12 && bridges.length < targetCount; attempt += 1) {
    const candidate = { col: Math.floor(random() * (playerCount - 1)), row: Math.floor(random() * (GAME_HEIGHT - 10)) + 5 };
    if (!hasBridgeConflict(bridges, candidate, 2)) bridges.push(candidate);
  }

  return { playerCount, height: GAME_HEIGHT, bridges: bridges.sort((a, b) => a.row - b.row) };
}

export function calculatePath({ startCol, bridges, colWidth, rowHeight, canvasHeight }) {
  let currentCol = startCol;
  let currentRow = -1;
  const points = [{ x: (currentCol + 1) * colWidth, y: 0 }];

  for (const bridge of [...bridges].sort((a, b) => a.row - b.row)) {
    if (bridge.row <= currentRow) continue;
    if (bridge.col === currentCol) {
      points.push({ x: (currentCol + 1) * colWidth, y: bridge.row * rowHeight });
      points.push({ x: (currentCol + 2) * colWidth, y: bridge.row * rowHeight });
      currentCol += 1;
      currentRow = bridge.row;
    } else if (bridge.col === currentCol - 1) {
      points.push({ x: (currentCol + 1) * colWidth, y: bridge.row * rowHeight });
      points.push({ x: currentCol * colWidth, y: bridge.row * rowHeight });
      currentCol -= 1;
      currentRow = bridge.row;
    }
  }

  points.push({ x: (currentCol + 1) * colWidth, y: canvasHeight });
  return { points, endCol: currentCol };
}

export function getPointAlongPath(points, progress) {
  if (!points.length) return { position: { x: 0, y: 0 }, trail: [] };
  const lengths = points.slice(1).map((point, index) => Math.hypot(point.x - points[index].x, point.y - points[index].y));
  const targetDistance = lengths.reduce((sum, length) => sum + length, 0) * progress;
  let traveled = 0;
  const trail = [points[0]];

  for (let index = 1; index < points.length; index += 1) {
    const segmentLength = lengths[index - 1];
    if (traveled + segmentLength >= targetDistance) {
      const ratio = segmentLength === 0 ? 0 : (targetDistance - traveled) / segmentLength;
      const previous = points[index - 1];
      const position = { x: previous.x + (points[index].x - previous.x) * ratio, y: previous.y + (points[index].y - previous.y) * ratio };
      trail.push(position);
      return { position, trail };
    }
    trail.push(points[index]);
    traveled += segmentLength;
  }

  return { position: points.at(-1), trail: points };
}
