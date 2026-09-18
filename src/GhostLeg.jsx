import { useEffect, useMemo, useRef, useState } from 'react';
import { calculatePath, getPlayerColor, getPointAlongPath, hasBridgeConflict } from './gameLogic';

const CANVAS_HEIGHT = 430;
const MIN_WIDTH = 600;
const LANE_WIDTH = 96;

const truncateLabel = (value, maxLength) => {
  const characters = Array.from(value);
  return characters.length > maxLength ? `${characters.slice(0, maxLength - 1).join('')}…` : value;
};

function GhostLeg({ gameData, prizes, assignments, isAnimating, onAnimationChange, onLaneSelect, onFinish }) {
  const { playerCount, bridges, height } = gameData;
  const width = Math.max(MIN_WIDTH, (playerCount + 1) * LANE_WIDTH);
  const colWidth = width / (playerCount + 1);
  const rowHeight = CANVAS_HEIGHT / height;
  const [userBridges, setUserBridges] = useState([]);
  const [activePlayer, setActivePlayer] = useState(null);
  const [path, setPath] = useState([]);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [completedPaths, setCompletedPaths] = useState({});
  const requestRef = useRef(null);
  const previousAssignmentsRef = useRef({});
  const svgRef = useRef(null);

  const allBridges = useMemo(() => [...bridges, ...userBridges].sort((a, b) => a.row - b.row), [bridges, userBridges]);

  useEffect(() => {
    setUserBridges([]);
    setCompletedPaths({});
    previousAssignmentsRef.current = {};
    return () => cancelAnimationFrame(requestRef.current);
  }, [bridges]);

  const finishPath = (columnIndex, points, endCol) => {
    setAnimationProgress(1);
    setCompletedPaths((current) => ({ ...current, [columnIndex]: { points, endCol } }));
    setActivePlayer(null);
    onFinish(assignments[columnIndex], prizes[endCol], endCol);
  };

  const startAnimation = (columnIndex) => {
    if (isAnimating) return;
    cancelAnimationFrame(requestRef.current);
    const result = calculatePath({ startCol: columnIndex, bridges: allBridges, colWidth, rowHeight, canvasHeight: CANVAS_HEIGHT });
    setCompletedPaths((current) => {
      const next = { ...current };
      delete next[columnIndex];
      return next;
    });
    setPath(result.points);
    setActivePlayer(columnIndex);
    setAnimationProgress(0);
    onAnimationChange(true);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finishPath(columnIndex, result.points, result.endCol);
      return;
    }

    const startTime = performance.now();
    const animate = (time) => {
      const progress = Math.min((time - startTime) / 1900, 1);
      setAnimationProgress(progress);
      if (progress < 1) requestRef.current = requestAnimationFrame(animate);
      else finishPath(columnIndex, result.points, result.endCol);
    };
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const previous = previousAssignmentsRef.current;
    const newColumn = Object.keys(assignments).find((key) => !previous[key]);
    previousAssignmentsRef.current = assignments;
    if (newColumn !== undefined) startAnimation(Number(newColumn));
    // Animation intentionally starts only when a new assignment arrives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignments]);

  const handleLaneClick = (columnIndex) => {
    if (assignments[columnIndex]) startAnimation(columnIndex);
    else onLaneSelect(columnIndex);
  };

  const handleStageClick = (event) => {
    if (isAnimating || !svgRef.current) return;
    const point = svgRef.current.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const matrix = svgRef.current.getScreenCTM();
    if (!matrix) return;
    const svgPoint = point.matrixTransform(matrix.inverse());
    if (svgPoint.y <= 0 || svgPoint.y >= CANVAS_HEIGHT) return;

    const column = Math.floor(svgPoint.x / colWidth) - 1;
    if (column < 0 || column >= playerCount - 1) return;
    const lineX = (column + 1) * colWidth;
    if (svgPoint.x - lineX < 12 || svgPoint.x - lineX > colWidth - 12) return;

    const candidate = { col: column, row: Math.round(svgPoint.y / rowHeight) };
    if (!hasBridgeConflict(allBridges, candidate, 0)) setUserBridges((current) => [...current, candidate]);
  };

  const { position, trail } = activePlayer === null
    ? { position: { x: 0, y: 0 }, trail: [] }
    : getPointAlongPath(path, animationProgress);

  return (
    <div className="ghost-leg">
      <div className="board-toolbar">
        <div><span className="toolbar-dot" aria-hidden="true" />點兩條直線之間，可以加一條自訂橫線。</div>
        {userBridges.length > 0 && <button type="button" className="text-button" onClick={() => setUserBridges([])} disabled={isAnimating}>清除自訂線 ({userBridges.length})</button>}
      </div>

      <div className="board-scroll" role="region" tabIndex="0" aria-label="鬼腳圖遊戲區，可左右捲動">
        <div className="lane-buttons" style={{ width }}>
          {Array.from({ length: playerCount }, (_, index) => {
            const assigned = assignments[index];
            const completed = completedPaths[index];
            return (
              <button
                type="button"
                className={`lane-button ${assigned ? 'is-assigned' : ''} ${completed ? 'is-complete' : ''}`}
                style={{ '--lane-color': getPlayerColor(index), '--lane-width': `${Math.min(88, colWidth - 8)}px`, left: (index + 1) * colWidth }}
                onClick={() => handleLaneClick(index)}
                disabled={isAnimating && activePlayer !== index}
                aria-label={assigned ? `${assigned} 的路徑${completed ? '，已完成，可重播' : '，進行中'}` : `選擇第 ${index + 1} 條路`}
                title={assigned || `第 ${index + 1} 條路`}
                key={`lane-${index}`}
              >
                <span>{index + 1}</span>{assigned && <b>{assigned}</b>}
              </button>
            );
          })}
        </div>

        <svg ref={svgRef} className="ladder-svg" width={width} height={CANVAS_HEIGHT + 150} viewBox={`0 0 ${width} ${CANVAS_HEIGHT + 150}`} onClick={handleStageClick} role="img" aria-label={`${playerCount} 條路徑的鬼腳圖`}>
          <g className="base-lines" aria-hidden="true">
            {Array.from({ length: playerCount }, (_, index) => <line key={`vertical-${index}`} x1={(index + 1) * colWidth} y1="0" x2={(index + 1) * colWidth} y2={CANVAS_HEIGHT} />)}
            {bridges.map((bridge, index) => <line key={`bridge-${index}`} x1={(bridge.col + 1) * colWidth} y1={bridge.row * rowHeight} x2={(bridge.col + 2) * colWidth} y2={bridge.row * rowHeight} />)}
          </g>

          <g className="custom-lines" aria-hidden="true">
            {userBridges.map((bridge, index) => <line key={`custom-${index}`} x1={(bridge.col + 1) * colWidth} y1={bridge.row * rowHeight} x2={(bridge.col + 2) * colWidth} y2={bridge.row * rowHeight} />)}
          </g>

          <g className="completed-lines" aria-hidden="true">
            {Object.entries(completedPaths).map(([index, result]) => <polyline key={`done-${index}`} points={result.points.map((point) => `${point.x},${point.y}`).join(' ')} style={{ stroke: getPlayerColor(Number(index)) }} />)}
          </g>

          {activePlayer !== null && (
            <g className="active-line" aria-hidden="true" style={{ color: getPlayerColor(activePlayer) }}>
              <polyline points={trail.map((point) => `${point.x},${point.y}`).join(' ')} />
              <circle cx={position.x} cy={position.y} r="8" />
            </g>
          )}

          <g className="prize-labels" aria-hidden="true">
            {prizes.map((prize, index) => {
              const winnerEntry = Object.entries(completedPaths).find(([, result]) => result.endCol === index);
              const winnerName = winnerEntry ? assignments[winnerEntry[0]] : '';
              return (
                <g key={`prize-${index}`} transform={`translate(${(index + 1) * colWidth}, ${CANVAS_HEIGHT + 30})`}>
                  <title>{winnerName ? `${winnerName}：${prize}` : prize}</title>
                  <circle r="15" /><text y="5" textAnchor="middle" className="prize-number">{index + 1}</text>
                  <text y="43" textAnchor="middle" className="prize-name">{truncateLabel(prize, 7)}</text>
                  {winnerName && <text y="65" textAnchor="middle" className="winner-name">{truncateLabel(winnerName, 7)}</text>}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}

export default GhostLeg;
