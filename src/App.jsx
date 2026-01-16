import React, { useState } from 'react';

import GhostLeg from './GhostLeg';
import './App.css';

const DARE_TASKS = [
  "伏地挺身 10 下", "唱一首歌", "學貓叫三聲", "真心話大冒險",
  "請大家喝飲料", "模仿一種動物", "對左邊的人告白", "跳一支舞",
  "講一個笑話", "深蹲 20 下", "誇獎在場每個人", "做鬼臉拍照",
  "用屁股寫字", "原地轉 10 圈", "喝一杯水", "大喊我是笨蛋",
  "被彈額頭一下", "仰臥起坐 10 下", "模仿海綿寶寶", "這局不算重來"
];

const getRandomPrize = () => DARE_TASKS[Math.floor(Math.random() * DARE_TASKS.length)];

function App() {
  const [step, setStep] = useState('setup'); // setup, game
  const [playerCount, setPlayerCount] = useState(4);
  const [players, setPlayers] = useState(['Alice', 'Bob', 'Charlie', 'Dave']);

  // Initialize prizes with random tasks
  const [prizes, setPrizes] = useState(() => Array.from({ length: 4 }, getRandomPrize));

  const [gameData, setGameData] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  // New state for "Choose your path"
  const [assignments, setAssignments] = useState({}); // { colIndex: playerName }
  const [playerQueue, setPlayerQueue] = useState([]); // List of names waiting to play

  const handlePlayerCountChange = (e) => {
    const count = parseInt(e.target.value) || 2;
    setPlayerCount(count);
    // Resize arrays
    setPlayers(prev => {
      const newArr = [...prev];
      if (count > prev.length) {
        for (let i = prev.length; i < count; i++) newArr.push(`P${i + 1}`);
      } else {
        newArr.length = count;
      }
      return newArr;
    });
    setPrizes(prev => {
      const newArr = [...prev];
      if (count > prev.length) {
        for (let i = prev.length; i < count; i++) newArr.push(getRandomPrize());
      } else {
        newArr.length = count;
      }
      return newArr;
    });
  };

  const updatePlayer = (idx, val) => {
    const newArr = [...players];
    newArr[idx] = val;
    setPlayers(newArr);
  };

  const updatePrize = (idx, val) => {
    const newArr = [...prizes];
    newArr[idx] = val;
    setPrizes(newArr);
  };

  // function App... (keeping component structure, just replacing the axios call with local logic)

  const generateGameData = (count) => {
    const height = 100;
    const minBridges = count * 3;
    const maxBridges = count * 6;
    const numBridges = Math.floor(Math.random() * (maxBridges - minBridges + 1)) + minBridges;

    const bridges = [];

    for (let i = 0; i < numBridges; i++) {
      const col = Math.floor(Math.random() * (count - 1));
      const row = Math.floor(Math.random() * (height - 10)) + 5;

      const isTooClose = bridges.some(b =>
        Math.abs(b.row - row) < 3 &&
        (b.col === col || b.col === col - 1 || b.col === col + 1)
      );

      if (!isTooClose) {
        bridges.push({ col, row });
      }
    }

    bridges.sort((a, b) => a.row - b.row);

    return {
      playerCount: count,
      height,
      bridges
    };
  };

  const startGame = () => {
    const data = generateGameData(playerCount);
    setGameData(data);
    setStep('game');
    setLastResult(null);

    // Initialize game state
    setAssignments({});
    setPlayerQueue([...players]);
  };

  const resetGame = () => {
    setStep('setup');
    setGameData(null);
    setLastResult(null);
    setAssignments({});
    setPlayerQueue([]);
  };

  const handleFinish = (player, prize) => {
    setLastResult(`${player} gets ${prize}!`);
  };

  const handleLaneSelect = (colIndex) => {
    // If lane is already assigned, ignore (or maybe we could allow re-running?)
    if (assignments[colIndex]) return;

    // If no players left in queue, ignore
    if (playerQueue.length === 0) return;

    const currentPlayer = playerQueue[0];

    setAssignments(prev => ({
      ...prev,
      [colIndex]: currentPlayer
    }));

    setPlayerQueue(prev => prev.slice(1));
  };

  return (
    <main className="container">
      <header>
        <h1>Ghost Leg (Amidakuji)</h1>
      </header>

      {step === 'setup' && (
        <section className="setup-panel">
          <div style={{ gridColumn: '1 / -1', marginBottom: '20px' }}>
            <label>Number of Players: </label>
            <input
              type="number"
              min="2"
              max="20"
              value={playerCount}
              onChange={handlePlayerCountChange}
            />
          </div>

          <div className="column-inputs">
            <h3>Players</h3>
            {players.map((p, i) => (
              <input
                key={`p-${i}`}
                value={p}
                onChange={(e) => updatePlayer(i, e.target.value)}
                placeholder={`Player ${i + 1}`}
              />
            ))}
          </div>

          <div className="column-inputs">
            <h3>Prizes</h3>
            {prizes.map((p, i) => (
              <input
                key={`z-${i}`}
                value={p}
                onChange={(e) => updatePrize(i, e.target.value)}
                placeholder={`Prize ${i + 1}`}
              />
            ))}
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
            <button onClick={startGame}>Generate Game</button>
          </div>
        </section>
      )}

      {step === 'game' && gameData && (
        <section className="game-board">
          <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              {playerQueue.length > 0 ? (
                <span style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#646cff' }}>
                  Current Turn: {playerQueue[0]}
                </span>
              ) : (
                <span>All players have chosen!</span>
              )}
              <span style={{ fontSize: '0.9em', color: '#888' }}>
                {playerQueue.length > 0 ? "Choose a starting point to begin." : "Click any player to replay."}
              </span>
            </div>
            <button onClick={resetGame} style={{ fontSize: '0.8em', padding: '4px 8px' }}>New Game</button>
          </div>

          <GhostLeg
            playerCount={gameData.playerCount}
            bridges={gameData.bridges}
            height={gameData.height}
            prizes={prizes}
            assignments={assignments}
            onLaneSelect={handleLaneSelect}
            onFinish={handleFinish}
          />

          <div className="result-display">
            {lastResult}
          </div>
        </section>
      )}
    </main>
  );
}

export default App;
