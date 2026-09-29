'use client';
import { RoundedBox } from '@react-three/drei';
export function Device() {
  return <group>
    <RoundedBox args={[4.55, 6.95, 0.65]} radius={0.32} smoothness={5} castShadow><meshStandardMaterial color="#c6cabe" roughness={0.34} metalness={0.2} /></RoundedBox>
    <RoundedBox args={[4.39, 6.77, 0.15]} radius={0.28} smoothness={4} position={[0, 0.03, 0.36]}><meshStandardMaterial color="#deded0" roughness={0.48} metalness={0.1} /></RoundedBox>
    <RoundedBox args={[3.94, 3.73, 0.15]} radius={0.2} smoothness={4} position={[0, 1.06, 0.49]}><meshStandardMaterial color="#243731" roughness={0.6} /></RoundedBox>
    {[-1.93, 1.93].flatMap(x => [-3.08, 3.08].map(y => <mesh key={`${x}-${y}`} position={[x, y, 0.46]}><cylinderGeometry args={[0.045, 0.045, 0.018, 12]} /><meshStandardMaterial color="#828a7d" /></mesh>))}
  </group>;
}
