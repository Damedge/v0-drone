'use client'

import { Float, Line, Sparkles } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"

const TEAL = "#44d7c4"
const GOLD = "#c9a968"
const VIOLET = "#7667c9"
const DARK = "#090b12"

function WireMountain({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const geometry = useMemo(() => {
    const geo = new THREE.ConeGeometry(1.5, 2.4, 6, 8)
    const positionAttribute = geo.getAttribute("position")
    for (let i = 0; i < positionAttribute.count; i += 1) {
      const x = positionAttribute.getX(i)
      const y = positionAttribute.getY(i)
      const z = positionAttribute.getZ(i)
      const jitter = Math.sin(x * 5.1 + z * 3.7 + y) * 0.08
      positionAttribute.setXYZ(i, x + jitter, y, z + jitter)
    }
    geo.computeVertexNormals()
    return geo
  }, [])

  return (
    <mesh position={position} scale={scale} geometry={geometry} rotation={[0, 0.16, 0]}>
      <meshBasicMaterial color={TEAL} wireframe transparent opacity={0.23} />
    </mesh>
  )
}

function City() {
  const buildings = useMemo(
    () =>
      Array.from({ length: 26 }, (_, index) => {
        const col = index % 6
        const row = Math.floor(index / 6)
        const height = 0.35 + ((index * 17) % 10) * 0.11
        return {
          position: [col * 0.42 - 1.05, height / 2, row * 0.42 - 0.8] as [number, number, number],
          height,
          width: 0.22 + ((index * 7) % 3) * 0.04,
        }
      }),
    [],
  )

  return (
    <group position={[1.25, -0.68, 0.1]} rotation={[0, -0.34, 0]}>
      {buildings.map((building, index) => (
        <group key={`${building.position.join("-")}-${index}`}>
          <mesh position={building.position}>
            <boxGeometry args={[building.width, building.height, building.width]} />
            <meshStandardMaterial
              color={index % 4 === 0 ? VIOLET : "#172a38"}
              emissive={index % 4 === 0 ? VIOLET : TEAL}
              emissiveIntensity={index % 4 === 0 ? 0.24 : 0.08}
              metalness={0.85}
              roughness={0.26}
            />
          </mesh>
          {index % 3 === 0 && (
            <mesh position={[building.position[0], building.height + 0.05, building.position[2]]}>
              <sphereGeometry args={[0.025, 8, 8]} />
              <meshBasicMaterial color={GOLD} />
            </mesh>
          )}
        </group>
      ))}
      <gridHelper args={[3.2, 10, TEAL, "#243044"]} position={[0, 0.01, 0]} />
    </group>
  )
}

function DataMap() {
  const paths: [number, number, number][][] = [
    [[-1.6, 0, 0], [-1.1, 0.16, 0.08], [-0.55, 0.04, -0.06], [0.05, 0.18, 0.02], [0.75, 0.08, -0.04], [1.55, 0.2, 0.06]],
    [[-1.4, 0, -0.38], [-0.72, 0.2, -0.3], [-0.05, 0.08, -0.42], [0.62, 0.24, -0.3], [1.35, 0.02, -0.4]],
    [[-1.32, 0, 0.4], [-0.7, 0.22, 0.34], [0, 0.05, 0.44], [0.7, 0.18, 0.32], [1.38, 0.04, 0.42]],
  ]

  return (
    <group position={[0.1, -1.02, 1.05]} rotation={[-0.22, 0.12, 0]}>
      <mesh>
        <boxGeometry args={[3.8, 0.035, 1.25]} />
        <meshStandardMaterial color="#101627" metalness={0.8} roughness={0.42} transparent opacity={0.72} />
      </mesh>
      {paths.map((points, index) => (
        <Line key={index} points={points} color={index === 1 ? GOLD : TEAL} lineWidth={0.8} transparent opacity={0.54} />
      ))}
      {[-1.1, -0.4, 0.3, 1].map((x, index) => (
        <mesh key={x} position={[x, 0.08, index % 2 === 0 ? 0.28 : -0.24]}>
          <cylinderGeometry args={[0.035, 0.035, 0.12, 12]} />
          <meshBasicMaterial color={index === 2 ? GOLD : TEAL} />
        </mesh>
      ))}
    </group>
  )
}

function Core() {
  const group = useRef<THREE.Group>(null)
  const orbit = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.12
    if (orbit.current) orbit.current.rotation.z -= delta * 0.23
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.8) * 0.05
    if (orbit.current) orbit.current.scale.setScalar(pulse)
  })

  return (
    <group ref={group} position={[0, 0.1, 0]}>
      <pointLight color={TEAL} intensity={30} distance={8} decay={2} />
      <pointLight color={GOLD} intensity={9} distance={4} position={[0, 0.6, 0]} />
      <mesh>
        <icosahedronGeometry args={[0.27, 3]} />
        <meshStandardMaterial color="#dcfff9" emissive={TEAL} emissiveIntensity={4} roughness={0.08} />
      </mesh>
      <mesh ref={orbit} rotation={[1.05, 0.2, 0]}>
        <torusGeometry args={[0.68, 0.008, 8, 120]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.78} />
      </mesh>
      <mesh rotation={[0.35, 0.9, 0.4]}>
        <torusGeometry args={[1.02, 0.006, 8, 120]} />
        <meshBasicMaterial color={TEAL} transparent opacity={0.32} />
      </mesh>
      <mesh rotation={[1.35, 0.1, -0.4]}>
        <torusGeometry args={[1.35, 0.004, 8, 120]} />
        <meshBasicMaterial color={VIOLET} transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

function OrbitalStreams() {
  const streams: [number, number, number][][] = [
    [[-3.2, -0.55, -0.2], [-2.2, 0.15, -0.5], [-1.1, 0.7, -0.1], [0, 0.15, 0]],
    [[3.2, 1.25, -0.8], [2.25, 0.95, -0.3], [1.25, 0.75, 0.2], [0, 0.15, 0]],
    [[-2.8, 1.8, 0.6], [-1.8, 1.3, 0.4], [-0.9, 0.7, 0.12], [0, 0.15, 0]],
    [[2.9, -0.7, 0.8], [2.1, -0.15, 0.65], [1.1, 0.35, 0.3], [0, 0.15, 0]],
  ]

  return (
    <group>
      {streams.map((points, index) => (
        <Line key={index} points={points} color={index === 2 ? GOLD : TEAL} lineWidth={1} transparent opacity={0.28} />
      ))}
    </group>
  )
}

function SceneContent() {
  const world = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!world.current) return
    const x = state.pointer.x * 0.08
    const y = state.pointer.y * 0.04
    world.current.rotation.y = THREE.MathUtils.lerp(world.current.rotation.y, x, 0.025)
    world.current.rotation.x = THREE.MathUtils.lerp(world.current.rotation.x, -y, 0.025)
  })

  return (
    <group ref={world} rotation={[-0.08, -0.12, 0]}>
      <ambientLight intensity={0.48} />
      <directionalLight color="#e8f5f2" intensity={1.4} position={[3, 5, 5]} />
      <Float speed={0.6} rotationIntensity={0.05} floatIntensity={0.18}>
        <WireMountain position={[-2.05, -0.82, -0.55]} scale={1.05} />
        <WireMountain position={[-1.25, -0.92, -0.8]} scale={0.72} />
        <WireMountain position={[-2.65, -0.96, 0.1]} scale={0.6} />
        <City />
        <DataMap />
        <Core />
        <OrbitalStreams />
      </Float>
      <Sparkles count={75} scale={[7, 4, 4]} size={1.2} speed={0.12} color={TEAL} opacity={0.45} />
    </group>
  )
}

export function KestrelScene() {
  return (
    <div className="h-full w-full" aria-hidden="true">
      <Canvas
        dpr={[1, 1.6]}
        camera={{ position: [0, 1.7, 7.4], fov: 43 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={[DARK]} />
        <fog attach="fog" args={[DARK, 6, 13]} />
        <SceneContent />
      </Canvas>
    </div>
  )
}
