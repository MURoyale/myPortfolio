'use client';
import { RoundedBox } from '@react-three/drei';

function ActionButton({ x, y, color }: { x: number; y: number; color: string }) {
  return <mesh position={[x, y, 0.58]} rotation={[Math.PI / 2, 0, 0]}>
    <cylinderGeometry args={[0.27, 0.3, 0.22, 32]} />
    <meshStandardMaterial color={color} roughness={0.3} metalness={0.35} />
  </mesh>;
}

export function WideDevice() {
  return <group>
    <RoundedBox args={[9.6, 5.2, 0.8]} radius={0.65} smoothness={6}>
      <meshStandardMaterial color="#353b43" metalness={0.6} roughness={0.32} />
    </RoundedBox>
    <RoundedBox args={[9.41, 5.02, 0.2]} radius={0.59} smoothness={5} position={[0, 0, 0.39]}>
      <meshStandardMaterial color="#202830" metalness={0.3} roughness={0.48} />
    </RoundedBox>
    <RoundedBox args={[6.12, 4.04, 0.13]} radius={0.18} smoothness={4} position={[0, 0.05, 0.54]}>
      <meshStandardMaterial color="#090f17" metalness={0.55} roughness={0.2} />
    </RoundedBox>
    {[-4.0, 4.0].map(x => <group key={x}>
      <RoundedBox args={[0.75, 3.4, 0.12]} radius={0.3} position={[x, -0.05, -0.43]}>
        <meshStandardMaterial color="#101820" roughness={0.9} />
      </RoundedBox>
    </group>)}
    {[-3.55, 3.55].map(x => <group key={`shoulder-${x}`} position={[x, 2.49, 0.12]}>
      <RoundedBox args={[1.5, 0.22, 0.6]} radius={0.075}>
        <meshStandardMaterial color="#111b23" roughness={0.65} />
      </RoundedBox>
      <RoundedBox args={[1.34, 0.18, 0.48]} radius={0.065} position={[0, 0.075, 0.045]}>
        <meshStandardMaterial color="#64717a" metalness={0.45} roughness={0.4} />
      </RoundedBox>
      {[-0.22, 0, 0.22].map(offset => <RoundedBox key={offset} args={[0.025, 0.065, 0.012]} radius={0.006} position={[offset, 0.075, 0.29]}>
        <meshStandardMaterial color="#37454f" roughness={0.7} />
      </RoundedBox>)}
    </group>)}
    <group position={[-3.96, 0.12, 0.56]}>
      <RoundedBox args={[1.32, 0.44, 0.16]} radius={0.06}><meshStandardMaterial color="#101820" roughness={0.65} /></RoundedBox>
      <RoundedBox args={[0.44, 1.32, 0.17]} radius={0.06}><meshStandardMaterial color="#101820" roughness={0.65} /></RoundedBox>
      <mesh position={[0, 0, 0.09]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.15, 0.15, 0.025, 24]} /><meshStandardMaterial color="#293640" /></mesh>
    </group>
    <ActionButton x={4.31} y={0.735} color="#c49158" />
    <ActionButton x={3.6} y={0.235} color="#697c89" />
    {[-4.35, 4.35].flatMap(x => [-2.1, 2.1].map(y => <mesh key={`${x}-${y}`} position={[x, y, 0.51]}><circleGeometry args={[0.04, 12]} /><meshStandardMaterial color="#83939e" metalness={0.8} roughness={0.3} /></mesh>))}
    {Array.from({ length: 6 }, (_, i) => <RoundedBox key={i} args={[0.045, 0.32, 0.02]} radius={0.015} position={[3.65 + i * 0.1, -2.12, 0.51]}><meshStandardMaterial color="#070e15" /></RoundedBox>)}
  </group>;
}
