/**
 * 界面层 · 应用根组件。
 *
 * 结构：一块 16:9 的舞台上放低分辨率 Canvas，其余全是 React 写的像素风 HUD 与弹窗。
 */

import { useEffect, useRef, useState } from 'react';
import { GameSession } from '../game/session';
import { useSessionSnapshot } from './hooks/useSession';
import { GameOverOverlay } from './components/GameOverOverlay';
import { Hud } from './components/Hud';
import { PauseOverlay } from './components/PauseOverlay';
import { ResumeCountdown } from './components/ResumeCountdown';
import { SkillBar } from './components/SkillBar';
import { StartScreen } from './components/StartScreen';
import { Toast } from './components/Toast';
import { TopBar } from './components/TopBar';
import { UpgradeModal } from './components/UpgradeModal';
import { WaveClearPanel } from './components/WaveClearPanel';

export function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [session, setSession] = useState<GameSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let created: GameSession | null = null;
    try {
      created = new GameSession(canvas);
      created.start();
      setSession(created);
      (window as unknown as { __PIXEL_WARDEN_BOOTED__?: boolean }).__PIXEL_WARDEN_BOOTED__ = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
    return () => {
      created?.destroy();
    };
  }, []);

  const snapshot = useSessionSnapshot(session);
  const inMenu = snapshot ? snapshot.status === 'menu' : true;

  return (
    <div className="app">
      <div className="stage">
        <canvas ref={canvasRef} className="game-canvas" />

        {error && (
          <div className="overlay overlay-dim">
            <div className="modal">
              <h2 className="modal-title">启动失败</h2>
              <p className="modal-sub">{error}</p>
            </div>
          </div>
        )}

        {snapshot && !inMenu && (
          <>
            <Hud snapshot={snapshot} />
            <TopBar snapshot={snapshot} session={session!} />
            <SkillBar snapshot={snapshot} />
          </>
        )}

        {snapshot && inMenu && session && <StartScreen snapshot={snapshot} session={session} />}

        {snapshot && snapshot.status === 'running' && snapshot.phase === 'waveClear' && (
          <WaveClearPanel snapshot={snapshot} />
        )}

        {snapshot && snapshot.status === 'running' && snapshot.phase === 'levelUp' && session && (
          <UpgradeModal snapshot={snapshot} session={session} />
        )}

        {snapshot && snapshot.status === 'running' && snapshot.phase === 'paused' && (
          snapshot.resumeIn !== null ? (
            <ResumeCountdown snapshot={snapshot} />
          ) : (
            session && <PauseOverlay snapshot={snapshot} session={session} />
          )
        )}

        {snapshot && snapshot.status === 'running' && snapshot.phase === 'gameOver' && session && (
          <GameOverOverlay snapshot={snapshot} session={session} />
        )}

        {snapshot && <Toast toast={snapshot.toast} />}
      </div>
      <footer className="footer">
        <span>TypeScript + React + Canvas · 像素 3D 渲染</span>
        <span className="dim">进度自动保存在浏览器本地</span>
      </footer>
    </div>
  );
}
