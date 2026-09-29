'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import gsap from 'gsap';
import { useEffect, useRef, useMemo, useState, useCallback, type RefObject } from 'react';
import { Vector3, type Group, type Mesh } from 'three';
import { Device } from './device';
import { profile } from '@/data/portfolio';
import { WideDevice } from './wide-device';
import { deviceLayouts, type DeviceMode } from '@/lib/device-layout';
import { Screen, type ScreenProps } from '@/components/portfolio/screen';
import { Controls } from '@/components/portfolio/controls';
function World(props: ScreenProps & { mode: DeviceMode; requestedMode: DeviceMode; onSwap: (mode: DeviceMode) => void; overlay: RefObject<HTMLDivElement | null> }) {
  const { requestedMode, onSwap } = props;
  const { size, camera, invalidate, gl } = useThree();
  const device = useRef<Group>(null);
  const ring = useRef<Mesh>(null);
  const transport = useRef<Group>(null);
  const layout = deviceLayouts[props.mode];
  const projected = useMemo(() => [new Vector3(), new Vector3(), new Vector3()], []);
  const desktop = size.width > 900;
  // Fit the entire hardware and its projected HTML plane to the same bounds.
  const scale = desktop ? Math.min(size.height / 720, size.width / 1350, 1.12)
    : Math.min((size.width - 24) / (layout.width * 0.8), (size.height - 48) / (layout.height * 0.8), 1.12);
  const deviceScale = props.mode === 'wide' && desktop ? Math.min(1, (size.width * 0.53) / (layout.width / 100 * 80 * scale)) : 1;
  const x = desktop ? size.width / 80 * 0.20 : 0;
  useEffect(() => {
    const tween = gsap.fromTo(camera, { zoom: props.reduced ? 80 : 74 }, { zoom: 80, duration: props.reduced ? 0 : 1.8, ease: 'power3.out', onUpdate: () => { camera.updateProjectionMatrix(); invalidate(); } });
    return () => { tween.kill(); };
  }, [camera, invalidate, props.reduced]);
  useEffect(() => {
    if (!device.current) return;
    const tween = gsap.to(device.current.rotation, { y: !desktop || props.navigation.state.open ? 0 : -0.055, z: !desktop || props.navigation.state.open ? 0 : -0.025, duration: props.reduced ? 0 : 0.8, ease: 'power2.out', onUpdate: invalidate });
    return () => { tween.kill(); };
  }, [props.navigation.state.open, props.reduced, desktop, invalidate]);
  useEffect(() => {
    const group = transport.current;
    if (!group) return;
    if (props.reduced) {
      group.scale.setScalar(1);
      group.position.y = 0;
      // Defer the React update until the external animation callback.
      const instant = gsap.delayedCall(0, () => onSwap(requestedMode));
      invalidate();
      return () => { instant.kill(); };
    }
    const timeline = gsap.timeline({ onUpdate: invalidate });
    timeline.to(group.scale, { x: 0.015, y: 0.015, z: 0.015, duration: 0.24, ease: 'power2.in' })
      .call(() => onSwap(requestedMode))
      .to(group.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: 'power3.out' });
    return () => { timeline.kill(); };
  }, [requestedMode, props.reduced, onSwap, invalidate]);
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => { event.preventDefault(); canvas.dispatchEvent(new CustomEvent('portfolio-context-lost', { bubbles: true })); };
    canvas.addEventListener('webglcontextlost', lost);
    return () => canvas.removeEventListener('webglcontextlost', lost);
  }, [gl]);
  useFrame((_, delta) => {
    if (!props.reduced && ring.current) ring.current.rotation.z += Math.min(delta, 0.05) * 0.025;
    if (!device.current || !props.overlay.current) return;
    device.current.updateWorldMatrix(true, false);
    camera.updateMatrixWorld();
    const [origin, right, down] = projected;
    origin.set(-layout.width / 200, layout.height / 200, layout.depth);
    right.set(origin.x + 0.01, origin.y, origin.z);
    down.set(origin.x, origin.y - 0.01, origin.z);
    for (const point of projected) {
      point.applyMatrix4(device.current.matrixWorld).project(camera);
      point.set((point.x + 1) * size.width / 2, (1 - point.y) * size.height / 2, 0);
    }
    props.overlay.current.style.setProperty('transform', `matrix(${right.x - origin.x},${right.y - origin.y},${down.x - origin.x},${down.y - origin.y},${origin.x},${origin.y})`);
    props.overlay.current.style.setProperty('--screen-unit', String(1 / Math.max(0.1, scale * deviceScale * 0.8)));
    props.overlay.current.style.setProperty('visibility', 'visible');
  });
  return <>
    <color attach="background" args={['#10251f']} />
    <fog attach="fog" args={['#10251f', 20, 45]} />
    <ambientLight intensity={0.8} />
    <directionalLight position={[-4, 7, 9]} intensity={3} color="#f4ecd4" />
    <pointLight position={[5, 1, 4]} intensity={38} color="#adfbd4" distance={15} />
    <pointLight position={[-5, -2, 2]} intensity={15} color="#99b5ff" distance={12} />
    <group position={[x, 0.12, 0]} scale={scale}>
      <group ref={transport}><group scale={deviceScale}><group ref={device}>{props.mode === 'wide' ? <WideDevice /> : <Device />}</group></group></group>
      {(desktop || props.mode === 'classic') && <group><mesh position={[0, -4.1, -0.7]}><cylinderGeometry args={[3.7, 4, 0.42, 64]} /><meshStandardMaterial color="#283d34" roughness={0.3} metalness={0.5} /></mesh>
      <mesh position={[0, -3.87, -0.7]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[3.15, 3.18, 80]} /><meshBasicMaterial color="#95d6a9" transparent opacity={0.5} /></mesh></group>}
      <mesh ref={ring} position={[0.4, 0.4, -3]} rotation={[0.18, 0.1, 0]}><torusGeometry args={[5.1, 0.018, 8, 120, Math.PI * 1.7]} /><meshBasicMaterial color="#629d7d" transparent opacity={0.35} /></mesh>
      <mesh position={[0.4, 0.4, -3.1]}><torusGeometry args={[5.7, 0.012, 8, 120]} /><meshBasicMaterial color="#629d7d" transparent opacity={0.18} /></mesh>
      {Array.from({ length: 16 }, (_, i) => <RoundedBox key={i} args={[0.06, 0.06, 0.06]} radius={0.01} position={[Math.sin(i * 2.4) * 6, Math.cos(i * 1.8) * 4.8, -2 - i % 3]}><meshBasicMaterial color="#9ccab1" transparent opacity={0.3} /></RoundedBox>)}
      {[0, 1, 2].map(i => <RoundedBox key={i} args={[0.8, 3.5 + i, 0.8]} radius={0.05} position={[4.4 + i * 1.1, -3, -4 - i]} rotation={[0, -0.3, 0]}><meshStandardMaterial color="#203d31" roughness={0.6} /></RoundedBox>)}
    </group>
  </>;
}
export default function PortfolioScene(props: ScreenProps & { mode: DeviceMode; onReady: () => void }) {
  const overlay = useRef<HTMLDivElement>(null);
  const [displayedMode, setDisplayedMode] = useState<DeviceMode>(props.mode);
  const onSwap = useCallback((mode: DeviceMode) => setDisplayedMode(mode), []);
  const layout = deviceLayouts[displayedMode];
  return <>
    <Canvas orthographic camera={{ position: [0, 0, 16], zoom: 80, near: 0.1, far: 60 }} dpr={[1, 1.5]} frameloop={props.reduced ? 'demand' : 'always'} gl={{ antialias: true, alpha: false, powerPreference: 'low-power' }} onCreated={props.onReady}><World {...props} mode={displayedMode} requestedMode={props.mode} onSwap={onSwap} overlay={overlay} /></Canvas>
    <div ref={overlay} className={`scene-device-overlay device-${displayedMode}`} style={{ width: layout.width, height: layout.height }}>
      <div className="overlay-brand device-brand">{profile.name}<i /></div>
      <div className="overlay-screen" style={{ left: layout.screen.left, top: layout.screen.top }}><Screen {...props} mode={displayedMode} /></div>
      <div className="overlay-controls" style={{ left: layout.controls.left, top: layout.controls.top }}><Controls navigation={props.navigation} mode={displayedMode} /></div>
    </div>
  </>;
}
