import {
  BufferAttribute,
  BufferGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  TorusKnotGeometry,
  WebGLRenderer,
} from 'three'

export function createThreeScene(canvas: HTMLCanvasElement) {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8))
  renderer.setSize(window.innerWidth, window.innerHeight)

  const scene = new Scene()
  const camera = new PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.z = 7

  const group = new Group()
  scene.add(group)

  const torus = new Mesh(
    new TorusKnotGeometry(1.25, 0.12, 180, 12),
    new MeshBasicMaterial({ color: 0x8b5cf6, wireframe: true, transparent: true, opacity: 0.28 }),
  )
  torus.position.set(2.4, 0.7, -1.5)
  group.add(torus)

  const particleCount = 720
  const positions = new Float32Array(particleCount * 3)

  for (let index = 0; index < particleCount; index += 1) {
    const offset = index * 3
    positions[offset] = (Math.random() - 0.5) * 13
    positions[offset + 1] = (Math.random() - 0.5) * 9
    positions[offset + 2] = (Math.random() - 0.5) * 9
  }

  const particleGeometry = new BufferGeometry()
  particleGeometry.setAttribute('position', new BufferAttribute(positions, 3))

  const particles = new Points(
    particleGeometry,
    new PointsMaterial({ color: 0x22d3ee, size: 0.015, transparent: true, opacity: 0.62 }),
  )
  group.add(particles)

  let frameId = 0

  const animate = () => {
    frameId = window.requestAnimationFrame(animate)
    group.rotation.y += 0.0018
    group.rotation.x = Math.sin(Date.now() * 0.00025) * 0.08
    torus.rotation.x += 0.003
    torus.rotation.y += 0.004
    renderer.render(scene, camera)
  }

  const resize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  window.addEventListener('resize', resize)
  animate()

  return () => {
    window.cancelAnimationFrame(frameId)
    window.removeEventListener('resize', resize)
    particleGeometry.dispose()
    torus.geometry.dispose()
    torus.material.dispose()
    renderer.dispose()
  }
}
