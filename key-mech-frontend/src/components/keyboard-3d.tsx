import { memo, useRef, useState } from 'react';
import { motion, type MotionValue, useMotionValue, useTransform } from 'motion/react';
import { ROWS } from '@/lib/constants';

interface Keyboard3DProps {
  popTrigger?: number;
  baseRotateX?: MotionValue<number> | number;
  baseRotateY?: MotionValue<number> | number;
  baseRotateZ?: MotionValue<number> | number;
  isInteractive?: boolean;
}

function Keyboard3D({
  popTrigger = 0,
  baseRotateX = 28,
  baseRotateY = -8,
  baseRotateZ = 0,
  isInteractive = true,
}: Keyboard3DProps) {
  // Only isDragging needs to be React state — it's the only value that drives a re-render (cursor)
  const [isDragging, setIsDragging] = useState(false);
  // Ref mirrors state so pointermove handler always sees the latest value without stale closure
  const isDraggingRef = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, rx: 0, ry: 0 });
  const stageRef = useRef<HTMLDivElement>(null);

  // MotionValues for drag offsets — pointermove drives these directly, zero re-renders
  const dragRx = useMotionValue(0);
  const dragRy = useMotionValue(0);

  // Stable fallback MotionValues for when number defaults are passed instead of MotionValues.
  // These are created unconditionally (rules of hooks) and only wired when needed.
  const fallbackRx = useMotionValue(typeof baseRotateX === 'number' ? baseRotateX : 0);
  const fallbackRy = useMotionValue(typeof baseRotateY === 'number' ? baseRotateY : 0);
  const fallbackRz = useMotionValue(typeof baseRotateZ === 'number' ? baseRotateZ : 0);

  const mvRx = typeof baseRotateX === 'number' ? fallbackRx : baseRotateX;
  const mvRy = typeof baseRotateY === 'number' ? fallbackRy : baseRotateY;
  const mvRz = typeof baseRotateZ === 'number' ? fallbackRz : baseRotateZ;

  // Combine scroll-driven base rotation with interactive drag offset
  const finalRotateX = useTransform([mvRx, dragRx], ([base, drag]: number[]) => base + drag);
  const finalRotateY = useTransform([mvRy, dragRy], ([base, drag]: number[]) => base + drag);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isInteractive) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      rx: dragRx.get(),
      ry: dragRy.get(),
    };
    stageRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !isInteractive) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    dragRx.set(Math.max(-60, Math.min(60, dragStart.current.rx - dy * 0.4)));
    dragRy.set(dragStart.current.ry + dx * 0.4);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isInteractive) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    stageRef.current?.releasePointerCapture(e.pointerId);
  };

  return (
    <div
      className="kb-stage"
      ref={stageRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        cursor: isInteractive ? (isDragging ? 'grabbing' : 'grab') : 'default',
        pointerEvents: 'auto',
      }}
    >
      {/* CSS transition removed — Motion's spring (from use-hero) handles all smoothing */}
      <motion.div
        className="kb-scene"
        style={{
          rotateX: finalRotateX,
          rotateY: finalRotateY,
          rotateZ: mvRz,
          willChange: 'transform',
        }}
      >
        <div className="keyboard-case">
          <div className="case-bezel bezel-top" aria-hidden={true} />
          <div className="case-bezel bezel-bottom" aria-hidden={true} />
          <div className="case-bezel bezel-left" aria-hidden={true} />
          <div className="case-bezel bezel-right" aria-hidden={true} />

          <div className="case-wall outer-front" aria-hidden={true} />
          <div className="case-wall outer-back" aria-hidden={true} />
          <div className="case-wall outer-left" aria-hidden={true} />
          <div className="case-wall outer-right" aria-hidden={true} />
          <div className="case-wall outer-bottom" aria-hidden={true} />

          <div className="case-wall inner-front" aria-hidden={true} />
          <div className="case-wall inner-back" aria-hidden={true} />
          <div className="case-wall inner-left" aria-hidden={true} />
          <div className="case-wall inner-right" aria-hidden={true} />

          <div className="case-plate">
            <div className="kb-rows">
              {ROWS.map((row, ri) => (
                <div key={ri} className="kb-row">
                  {row.map(([label, cls, wCls], ci) => {
                    if (cls === 'sp') {
                      const spW = wCls ? parseInt(wCls.replace('w', '')) : 10;
                      return <div key={`${ri}-${ci}`} style={{ minWidth: `${spW}px` }} />;
                    }
                    if (label === '' && !wCls) {
                      return <div key={`${ri}-${ci}`} style={{ minWidth: '10px' }} />;
                    }
                    const mainCls = (cls || 'base').split(' ')[0];
                    const extraCls = wCls ? wCls.split(' ').join(' ') : '';

                    return (
                      <div
                        key={`${ri}-${ci}`}
                        className={`key ${mainCls} ${extraCls}`}
                        style={
                          popTrigger > 0
                            ? { animation: `keyPop 0.2s ease ${ri * 0.02 + ci * 0.01}s both` }
                            : undefined
                        }
                      >
                        <div className="switch" aria-hidden={true}>
                          <div className="switch-base" />
                          <div className="switch-stem">
                            <div className="switch-stem-top" />
                          </div>
                        </div>
                        <div className="keycap">
                          <div className="key-top">
                            <span className="key-label">{label}</span>
                          </div>
                          <div className="key-front" aria-hidden={true} />
                          <div className="key-back" aria-hidden={true} />
                          <div className="key-left" aria-hidden={true} />
                          <div className="key-right" aria-hidden={true} />
                          <div className="key-bottom" aria-hidden={true} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default memo(Keyboard3D);
