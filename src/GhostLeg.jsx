
import React, { useEffect, useState, useRef } from 'react';

const GhostLeg = ({ playerCount, bridges, height, prizes, assignments, onLaneSelect, onFinish }) => {
    const [activePlayer, setActivePlayer] = useState(null);
    const [path, setPath] = useState([]);
    const [animationProgress, setAnimationProgress] = useState(0);
    const [completedPaths, setCompletedPaths] = useState({}); // Store { colIndex: path }
    const requestRef = useRef();
    const prevAssignmentsRef = useRef({});

    const [userBridges, setUserBridges] = useState([]);

    // Reset user bridges when game data changes
    useEffect(() => {
        setUserBridges([]);
    }, [bridges]);

    // Merge and sort all bridges
    const allBridges = [...bridges, ...userBridges].sort((a, b) => a.row - b.row);

    // Dynamic width calculation
    const minWidth = 600;
    const width = Math.max(minWidth, playerCount * 50);

    const canvasHeight = 400;
    const colWidth = width / (playerCount + 1);
    const rowHeight = canvasHeight / height;

    // Distinct colors for players
    const getPlayerColor = (index) => {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
            '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB',
            '#E74C3C', '#2ECC71', '#F1C40F', '#E67E22'
        ];
        return colors[index % colors.length];
    };

    // Watch for new assignments to trigger animation
    useEffect(() => {
        const prev = prevAssignmentsRef.current;
        Object.keys(assignments).forEach(colKey => {
            const colIdx = parseInt(colKey);
            if (!prev[colKey]) {
                // New assignment! Start animation
                startAnimation(colIdx);
            }
        });
        prevAssignmentsRef.current = assignments;
    }, [assignments]);

    // Calculate path for a specific start column
    const calculatePath = (startCol) => {
        let currentCol = startCol;
        const pathPoints = [{ x: (currentCol + 1) * colWidth, y: 0 }];

        let currentY = 0;

        for (let b of allBridges) {
            if (b.row > currentY) {
                if (b.col === currentCol) {
                    // Bridge to the right
                    pathPoints.push({ x: (currentCol + 1) * colWidth, y: b.row * rowHeight });
                    pathPoints.push({ x: (currentCol + 2) * colWidth, y: b.row * rowHeight });
                    currentCol++;
                    currentY = b.row;
                } else if (b.col === currentCol - 1) {
                    // Bridge to the left
                    pathPoints.push({ x: (currentCol + 1) * colWidth, y: b.row * rowHeight });
                    pathPoints.push({ x: currentCol * colWidth, y: b.row * rowHeight });
                    currentCol--;
                    currentY = b.row;
                }
            }
        }

        pathPoints.push({ x: (currentCol + 1) * colWidth, y: canvasHeight });

        return { points: pathPoints, endCol: currentCol };
    };

    const startAnimation = (colIndex) => {
        // If already animating this specific column, ignore?
        // Actually activePlayer is single, so we can only animate one at a time.
        // But if multiple assignments come in at once, we might have an issue.
        // For now assume sequential or just override.

        // Clear existing path for this column if re-running
        setCompletedPaths(prev => {
            const next = { ...prev };
            delete next[colIndex];
            return next;
        });

        const { points, endCol } = calculatePath(colIndex);
        setPath(points);
        setActivePlayer(colIndex);
        setAnimationProgress(0);

        const duration = 2000; // 2 seconds
        const startTime = performance.now();

        const animate = (time) => {
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / duration, 1);
            setAnimationProgress(progress);

            if (progress < 1) {
                requestRef.current = requestAnimationFrame(animate);
            } else {
                // Animation finished
                setCompletedPaths(prev => ({
                    ...prev,
                    [colIndex]: { points, endCol }
                }));
                setActivePlayer(null);
                if (onFinish) onFinish(assignments[colIndex], prizes[endCol]);
            }
        };

        requestRef.current = requestAnimationFrame(animate);
    };

    const handleColumnClick = (i) => {
        if (assignments[i]) {
            // Replay
            startAnimation(i);
        } else {
            // Select
            if (onLaneSelect) onLaneSelect(i);
        }
    };

    const handleAddBridge = (col, y) => {
        // Calculate row index
        const row = Math.round(y / rowHeight);

        // Validation: Check bounds
        if (row <= 0 || row >= height) return;

        // Validation: Check conflicts
        // Cannot have bridge at same row/col
        // Cannot have bridge at same row/col-1 (left neighbor overlap)
        // Cannot have bridge at same row/col+1 (right neighbor overlap)
        const conflict = allBridges.some(b =>
            b.row === row && (b.col === col || b.col === col - 1 || b.col === col + 1)
        );

        if (!conflict) {
            setUserBridges(prev => [...prev, { col, row }]);
        }
    };

    // Helper to get current position and trail
    const getCurrentState = () => {
        if (!path.length) return { pos: { x: 0, y: 0 }, trail: [] };

        const totalDist = path.reduce((acc, pt, i) => {
            if (i === 0) return 0;
            const prev = path[i - 1];
            return acc + Math.hypot(pt.x - prev.x, pt.y - prev.y);
        }, 0);

        const targetDist = totalDist * animationProgress;
        let currentDist = 0;
        const trail = [path[0]]; // Start with first point

        for (let i = 1; i < path.length; i++) {
            const prev = path[i - 1];
            const pt = path[i];
            const segDist = Math.hypot(pt.x - prev.x, pt.y - prev.y);

            if (currentDist + segDist >= targetDist) {
                // We are in this segment
                const segProgress = (targetDist - currentDist) / segDist;
                const currentPos = {
                    x: prev.x + (pt.x - prev.x) * segProgress,
                    y: prev.y + (pt.y - prev.y) * segProgress
                };
                trail.push(currentPos);
                return { pos: currentPos, trail };
            }

            trail.push(pt); // Add full segment point
            currentDist += segDist;
        }
        return { pos: path[path.length - 1], trail: path };
    };

    const { pos: currentPos, trail: currentTrail } = activePlayer !== null ? getCurrentState() : { pos: { x: 0, y: 0 }, trail: [] };

    return (
        <div className="ghost-leg-container" style={{ overflowX: 'auto', maxWidth: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '10px', color: '#666', fontSize: '0.9em' }}>
                <small>💡 Click between lines to add custom bridges!</small>
                {userBridges.length > 0 && (
                    <button
                        onClick={() => setUserBridges([])}
                        style={{ marginLeft: '10px', padding: '2px 6px', fontSize: '0.8em' }}
                    >
                        Reset Custom Lines
                    </button>
                )}
            </div>
            <svg
                width={width}
                height={canvasHeight + 250}
                viewBox={`0 -40 ${width} ${canvasHeight + 250}`}
                style={{ overflow: 'visible' }}
            >
                {/* Click Zones for Adding Bridges */}
                {Array.from({ length: playerCount - 1 }).map((_, i) => (
                    <rect
                        key={`zone-${i}`}
                        x={(i + 1) * colWidth + 10} // Offset slightly to avoid clicking the line itself
                        y={0}
                        width={colWidth - 20}
                        height={canvasHeight}
                        fill="transparent"
                        style={{ cursor: 'crosshair' }}
                        onClick={(e) => {
                            const rect = e.target.getBoundingClientRect();
                            const y = e.clientY - rect.top;
                            // Adjust y for viewBox scaling if necessary, but here 1:1 mostly
                            // Actually SVG scaling might apply.
                            // Better to use nativeEvent.offsetY if possible or relative calc.
                            // Since SVG might be scaled, let's use the SVG coordinate system.
                            // But for simplicity, let's assume no zoom for now or use relative.
                            // e.nativeEvent.offsetY gives coord relative to target element.
                            handleAddBridge(i, y);
                        }}
                    />
                ))}

                {/* Vertical Lines */}
                {Array.from({ length: playerCount }).map((_, i) => {
                    const isCompleted = !!completedPaths[i];
                    const winnerStartCol = Object.keys(completedPaths).find(key => completedPaths[key].endCol === i);
                    const winnerColor = winnerStartCol ? getPlayerColor(parseInt(winnerStartCol)) : "#aaa";

                    return (
                        <g key={`line-${i}`}>
                            <line
                                x1={(i + 1) * colWidth}
                                y1={0}
                                x2={(i + 1) * colWidth}
                                y2={canvasHeight}
                                stroke="#444"
                                strokeWidth="2"
                                style={{ pointerEvents: 'none' }} // Let clicks pass through to zones if needed
                            />
                            {/* Player Name or Number */}
                            <text
                                x={(i + 1) * colWidth}
                                y={-20}
                                textAnchor="middle"
                                fill={assignments[i] ? getPlayerColor(i) : "#aaa"}
                                style={{ cursor: 'pointer', fontWeight: assignments[i] ? 'bold' : 'normal' }}
                                fontSize="14"
                                onClick={() => handleColumnClick(i)}
                            >
                                {assignments[i] ? (isCompleted ? `✓ ${i + 1}.${assignments[i]}` : `${i + 1}.${assignments[i]}`) : `${i + 1}`}
                            </text>
                            {/* Start Button (Circle) */}
                            <circle
                                cx={(i + 1) * colWidth}
                                cy={0}
                                r={6}
                                fill={activePlayer === i ? getPlayerColor(i) : (assignments[i] ? getPlayerColor(i) : "#888")}
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleColumnClick(i)}
                            />
                            {/* Prize Name */}
                            <text
                                x={(i + 1) * colWidth}
                                y={canvasHeight + 20}
                                transform={`rotate(90, ${(i + 1) * colWidth}, ${canvasHeight + 20})`}
                                textAnchor="start"
                                dy="0.35em"
                                fill={winnerColor}
                                fontWeight={winnerStartCol ? "bold" : "normal"}
                                fontSize="14"
                            >
                                {prizes[i] || `Prize ${i + 1}`}
                                {winnerStartCol && assignments[winnerStartCol] ? ` (${assignments[winnerStartCol]})` : ''}
                            </text>
                        </g>
                    );
                })}

                {/* Bridges (Original) */}
                {bridges.map((b, i) => (
                    <line
                        key={`bridge-${i}`}
                        x1={(b.col + 1) * colWidth}
                        y1={b.row * rowHeight}
                        x2={(b.col + 2) * colWidth}
                        y2={b.row * rowHeight}
                        stroke="#444"
                        strokeWidth="2"
                        style={{ pointerEvents: 'none' }}
                    />
                ))}

                {/* User Added Bridges */}
                {userBridges.map((b, i) => (
                    <line
                        key={`user-bridge-${i}`}
                        x1={(b.col + 1) * colWidth}
                        y1={b.row * rowHeight}
                        x2={(b.col + 2) * colWidth}
                        y2={b.row * rowHeight}
                        stroke="#4ECDC4" // Distinct color (Teal)
                        strokeWidth="3"
                        strokeDasharray="5,5" // Dashed style
                        style={{ pointerEvents: 'none' }}
                    />
                ))}

                {/* Completed Paths (Traces) */}
                {Object.entries(completedPaths).map(([idx, { points }]) => (
                    <polyline
                        key={`completed-${idx}`}
                        points={points.map(p => `${p.x},${p.y}`).join(' ')}
                        fill="none"
                        stroke={getPlayerColor(parseInt(idx))}
                        strokeWidth="3"
                        strokeOpacity="0.8"
                    />
                ))}

                {/* Active Path Animation */}
                {activePlayer !== null && (
                    <>
                        {/* Dynamic Trail */}
                        <polyline
                            points={currentTrail.map(p => `${p.x},${p.y} `).join(' ')}
                            fill="none"
                            stroke={getPlayerColor(activePlayer)}
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        {/* Head */}
                        <circle
                            cx={currentPos.x}
                            cy={currentPos.y}
                            r={8}
                            fill={getPlayerColor(activePlayer)}
                            filter={`drop - shadow(0 0 8px ${getPlayerColor(activePlayer)})`}
                        />
                    </>
                )}
            </svg>
        </div>
    );
};

export default GhostLeg;
