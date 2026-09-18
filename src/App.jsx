import { useMemo, useState } from 'react';
import GhostLeg from './GhostLeg';
import { generateGameData } from './gameLogic';

const DARE_TASKS = [
  '伏地挺身 10 下', '唱一首歌', '學貓叫三聲', '說一個小秘密', '請大家喝飲料',
  '模仿一種動物', '對左邊的人說句好話', '跳一支舞', '講一個笑話', '深蹲 20 下',
  '誇獎在場每個人', '做鬼臉拍照', '用屁股寫字', '原地轉 10 圈', '喝一杯水',
  '大喊今天真好玩', '被彈額頭一下', '仰臥起坐 10 下', '模仿海綿寶寶', '這局安全下莊',
];
const DEFAULT_PLAYERS = ['Alice', 'Bob', 'Charlie', 'Dave'];
const getRandomPrize = () => DARE_TASKS[Math.floor(Math.random() * DARE_TASKS.length)];

function App() {
  const [step, setStep] = useState('setup');
  const [playerCount, setPlayerCount] = useState(4);
  const [players, setPlayers] = useState(DEFAULT_PLAYERS);
  const [prizes, setPrizes] = useState(() => Array.from({ length: 4 }, getRandomPrize));
  const [gameData, setGameData] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [assignments, setAssignments] = useState({});
  const [playerQueue, setPlayerQueue] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [formError, setFormError] = useState('');

  const completedCount = Object.keys(assignments).length;
  const progressLabel = useMemo(() => `${completedCount} / ${playerCount} 已選路`, [completedCount, playerCount]);

  const changePlayerCount = (nextCount) => {
    const count = Math.min(20, Math.max(2, Number(nextCount) || 2));
    setPlayerCount(count);
    setPlayers((current) => Array.from({ length: count }, (_, index) => current[index] ?? `玩家 ${index + 1}`));
    setPrizes((current) => Array.from({ length: count }, (_, index) => current[index] ?? getRandomPrize()));
  };

  const updateItem = (setter, index, value) => {
    setter((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
    setFormError('');
  };

  const startGame = (event) => {
    event.preventDefault();
    const firstEmptyPlayer = players.findIndex((player) => !player.trim());
    if (firstEmptyPlayer >= 0) {
      setFormError(`請輸入第 ${firstEmptyPlayer + 1} 位玩家的名稱。`);
      document.querySelector(`#player-${firstEmptyPlayer}`)?.focus();
      return;
    }

    setGameData(generateGameData(playerCount));
    setPlayerQueue(players.map((player) => player.trim()));
    setAssignments({});
    setLastResult(null);
    setIsAnimating(false);
    setStep('game');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetGame = () => {
    setStep('setup');
    setGameData(null);
    setLastResult(null);
    setAssignments({});
    setPlayerQueue([]);
    setIsAnimating(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaneSelect = (columnIndex) => {
    if (isAnimating || assignments[columnIndex] || playerQueue.length === 0) return;
    setAssignments((current) => ({ ...current, [columnIndex]: playerQueue[0] }));
    setPlayerQueue((current) => current.slice(1));
  };

  const handleFinish = (player, prize, endColumn) => {
    setLastResult({ player, prize, endColumn });
    setIsAnimating(false);
  };

  return (
    <main className="site-shell" id="top">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Footprint 首頁">
          <span className="brand-mark" aria-hidden="true">↳</span><span>Footprint</span>
        </a>
        <a className="coffee-link" href="https://buymeacoffee.com/tankhuang" target="_blank" rel="noreferrer">
          <span aria-hidden="true">☕</span> 支持這個小遊戲
        </a>
      </header>

      {step === 'setup' ? (
        <section className="setup-layout" aria-labelledby="setup-title">
          <div className="intro-block">
            <p className="eyebrow">聚會抽籤小工具</p>
            <h1 id="setup-title">每一步，<br /><span>都有驚喜。</span></h1>
            <p className="lede">輸入名字和任務，讓每個人選一條路。答案只有走到底才知道。</p>
            <ol className="how-it-works" aria-label="遊戲步驟">
              <li><span>01</span><div><strong>填好名單</strong><small>玩家和任務一列一組</small></div></li>
              <li><span>02</span><div><strong>輪流選路</strong><small>別急著偷看終點</small></div></li>
              <li><span>03</span><div><strong>揭曉任務</strong><small>沿著螢光路徑看答案</small></div></li>
            </ol>
          </div>

          <form className="paper-panel setup-panel" onSubmit={startGame} noValidate>
            <div className="panel-heading">
              <div><p className="eyebrow">建立這一局</p><h2>誰要一起玩？</h2></div>
              <div className="count-stepper" aria-label="玩家人數">
                <button type="button" onClick={() => changePlayerCount(playerCount - 1)} disabled={playerCount <= 2} aria-label="減少玩家">−</button>
                <label><span>人數</span><input type="number" min="2" max="20" value={playerCount} onChange={(event) => changePlayerCount(event.target.value)} /></label>
                <button type="button" onClick={() => changePlayerCount(playerCount + 1)} disabled={playerCount >= 20} aria-label="增加玩家">＋</button>
              </div>
            </div>

            <div className="roster-header" aria-hidden="true"><span>玩家</span><span>抽中的任務</span></div>
            <div className="roster-list">
              {players.map((player, index) => (
                <div className="roster-row" key={`row-${index}`}>
                  <span className="row-number">{String(index + 1).padStart(2, '0')}</span>
                  <label><span className="mobile-label">玩家</span><input id={`player-${index}`} value={player} onChange={(event) => updateItem(setPlayers, index, event.target.value)} placeholder={`玩家 ${index + 1}`} aria-label={`第 ${index + 1} 位玩家`} /></label>
                  <label><span className="mobile-label">任務</span><input value={prizes[index]} onChange={(event) => updateItem(setPrizes, index, event.target.value)} placeholder={`任務 ${index + 1}`} aria-label={`第 ${index + 1} 個任務`} /></label>
                </div>
              ))}
            </div>

            {formError && <p className="form-error" role="alert">{formError}</p>}
            <button className="primary-button" type="submit">開始抽籤 <span aria-hidden="true">→</span></button>
          </form>
        </section>
      ) : gameData && (
        <section className="game-surface" aria-labelledby="game-title">
          <div className="game-heading">
            <div>
              <p className="eyebrow">{progressLabel}</p>
              <h1 id="game-title">{playerQueue.length > 0 ? <>輪到 <span>{playerQueue[0]}</span> 選一條路</> : '大家都選好了！'}</h1>
              <p>{playerQueue.length > 0 ? '從上方挑一個還沒有人選的起點。' : '點任何已完成的名字，可以再看一次路徑。'}</p>
            </div>
            <button className="secondary-button" type="button" onClick={resetGame}>開新一局</button>
          </div>

          <div className="paper-panel game-panel">
            <GhostLeg gameData={gameData} prizes={prizes} assignments={assignments} isAnimating={isAnimating} onAnimationChange={setIsAnimating} onLaneSelect={handleLaneSelect} onFinish={handleFinish} />
          </div>

          <div className={`result-ticket ${lastResult ? 'is-visible' : ''}`} aria-live="polite" aria-atomic="true">
            {lastResult ? <><span className="result-kicker">路徑 {lastResult.endColumn + 1} 的結果</span><strong>{lastResult.player} 抽到：</strong><b>{lastResult.prize}</b></> : <span>第一個結果會出現在這裡。</span>}
          </div>
        </section>
      )}

      <footer><span>Made for good company.</span><span>Ghost Leg / Amidakuji</span></footer>
    </main>
  );
}

export default App;
