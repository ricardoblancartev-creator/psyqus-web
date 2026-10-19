"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";

type Props = {
  avatar: "mujer" | "hombre";
  hablando: boolean;
  /** Optional real media element. When supplied, mouth opening follows RMS amplitude. */
  audioElement?: HTMLMediaElement | null;
};

export default function Avatar3D({ avatar, hablando, audioElement = null }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const hablandoRef = useRef(hablando);
  const audioElementRef = useRef<HTMLMediaElement | null>(audioElement);
  const [estado, setEstado] = useState("Cargando personaje…");
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);

  useEffect(() => { hablandoRef.current = hablando; }, [hablando]);
  useEffect(() => { audioElementRef.current = audioElement; }, [audioElement]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let vrm: VRM | undefined;
    let renderer: THREE.WebGLRenderer;
    let frame = 0;
    let audioContext: AudioContext | undefined;
    let analyser: AnalyserNode | undefined;
    let audioSource: MediaElementAudioSourceNode | undefined;
    let amplitudeData: Uint8Array | undefined;
    let headBone: THREE.Object3D | undefined;
    let chestBone: THREE.Object3D | undefined;
    let spineBone: THREE.Object3D | undefined;
    let upperChestBone: THREE.Object3D | undefined;
    let baseRotations = new Map<THREE.Object3D, THREE.Euler>();
    const scene = new THREE.Scene();

    setEstado("Cargando personaje…");
    setError(false);

    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      setError(true);
      setEstado("No fue posible iniciar los gráficos 3D. Activa la aceleración gráfica del navegador.");
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x64748b, 0.85));
    const light = new THREE.DirectionalLight(0xffffff, 0.9);
    light.position.set(1, 2, 3);
    scene.add(light);
    const rim = new THREE.DirectionalLight(0x67e8f9, 0.35);
    rim.position.set(-2, 1, -1);
    scene.add(rim);

    let headY = 1.5;
    function resize() {
      const width = Math.max(host?.clientWidth ?? 1, 1);
      const height = Math.max(host?.clientHeight ?? 1, 1);
      camera.aspect = width / height;
      camera.position.set(0, headY - 0.12, 1.2);
      camera.lookAt(0, headY - 0.12, 0);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    }
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    loader.load(`/avatars/${avatar}.vrm`, (gltf) => {
      const model = gltf.userData.vrm as VRM | undefined;
      if (!model) {
        VRMUtils.deepDispose(gltf.scene);
        if (!disposed) {
          setError(true);
          setEstado("El archivo no contiene un personaje VRM válido.");
        }
        return;
      }
      if (disposed) {
        VRMUtils.deepDispose(model.scene);
        return;
      }

      vrm = model;
      VRMUtils.rotateVRM0(vrm);
      scene.add(vrm.scene);
      vrm.humanoid.getNormalizedBoneNode("leftUpperArm")?.rotation.set(0, 0, 1.2);
      vrm.humanoid.getNormalizedBoneNode("rightUpperArm")?.rotation.set(0, 0, -1.2);
      vrm.update(0);
      vrm.scene.updateMatrixWorld(true);

      const rawHead = vrm.humanoid.getRawBoneNode("head");
      if (rawHead) headY = rawHead.getWorldPosition(new THREE.Vector3()).y;
      resize();

      headBone = vrm.humanoid.getNormalizedBoneNode("head") ?? undefined;
      chestBone = vrm.humanoid.getNormalizedBoneNode("chest") ?? undefined;
      spineBone = vrm.humanoid.getNormalizedBoneNode("spine") ?? undefined;
      upperChestBone = vrm.humanoid.getNormalizedBoneNode("upperChest") ?? undefined;
      baseRotations = new Map<THREE.Object3D, THREE.Euler>();
      [headBone, chestBone, spineBone, upperChestBone].forEach((bone) => {
        if (bone) baseRotations.set(bone, bone.rotation.clone());
      });

      const media = audioElementRef.current;
      if (media) {
        try {
          audioContext = new AudioContext();
          analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          audioSource = audioContext.createMediaElementSource(media);
          audioSource.connect(analyser);
          analyser.connect(audioContext.destination);
          amplitudeData = new Uint8Array(new ArrayBuffer(analyser.fftSize));
        } catch {
          void audioContext?.close();
          audioContext = undefined;
          analyser = undefined;
        }
      }
      setEstado("");
    }, undefined, () => {
      if (!disposed) {
        setError(true);
        setEstado("No pude cargar el personaje. Revisa public/avatars y vuelve a intentar.");
      }
    });

    const clock = new THREE.Clock();
    let t = 0;
    let blinkAt = 2 + Math.random() * 2;

    function animate() {
      if (disposed) return;
      frame = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);
      if (document.hidden) return;
      t += delta;

      if (vrm) {
        const blinkTime = t - blinkAt;
        let blink = 0;
        if (blinkTime >= 0 && blinkTime < 0.18) {
          blink = Math.sin((blinkTime / 0.18) * Math.PI);
        } else if (blinkTime >= 0.18) {
          blinkAt = t + 2.5 + Math.random() * 3;
        }

        const expressions = vrm.expressionManager;
        expressions?.setValue("blink", blink);
        expressions?.setValue("happy", 0.12);

        const media = audioElementRef.current;
        const mediaPlaying = Boolean(media && !media.paused && !media.ended);
        let amplitude = 0;
        if (analyser && amplitudeData && mediaPlaying) {
          analyser.getByteTimeDomainData(amplitudeData);
          let sum = 0;
          for (const sample of amplitudeData) {
            const normalized = (sample - 128) / 128;
            sum += normalized * normalized;
          }
          amplitude = Math.min(Math.sqrt(sum / amplitudeData.length) * 4.5, 1);
        }

        const speaking = hablandoRef.current || mediaPlaying;
        const mouth = speaking ? Math.max(amplitude, 0.08 + 0.22 * Math.abs(Math.sin(t * 11))) : 0;
        ["aa", "ih", "ou", "ee", "oh"].forEach((name, index) => {
          const value = speaking ? mouth * (0.35 + 0.3 * Math.abs(Math.sin(t * (5 + index)))) : 0;
          expressions?.setValue(name, value);
        });

        if (headBone) {
          const base = baseRotations.get(headBone);
          headBone.rotation.set(
            (base?.x ?? 0) + Math.sin(t * 0.9) * 0.025,
            (base?.y ?? 0) + Math.sin(t * 0.55) * 0.04,
            (base?.z ?? 0) + Math.sin(t * 0.7) * 0.018,
          );
        }
        if (chestBone) {
          const base = baseRotations.get(chestBone);
          chestBone.rotation.x = (base?.x ?? 0) + Math.sin(t * 1.6) * 0.018;
          chestBone.rotation.y = (base?.y ?? 0) + Math.sin(t * 0.8) * 0.008;
        }
        if (spineBone) {
          const base = baseRotations.get(spineBone);
          spineBone.rotation.x = (base?.x ?? 0) + Math.sin(t * 1.6 + 0.4) * 0.009;
        }
        if (upperChestBone) {
          const base = baseRotations.get(upperChestBone);
          upperChestBone.rotation.y = (base?.y ?? 0) + Math.sin(t * 0.7) * 0.006;
        }
        vrm.update(delta);
      }
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      if (vrm) VRMUtils.deepDispose(vrm.scene);
      audioSource?.disconnect();
      analyser?.disconnect();
      void audioContext?.close();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [avatar, intento, audioElement]);

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-3xl bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.12),transparent_70%)]">
      <div ref={hostRef} className="h-full w-full" role="img" aria-label={`Acompañante 3D ${avatar}`} />
      {estado && (
        <div role={error ? "alert" : "status"} className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950/80 p-8 text-center">
          <p className="text-sm text-slate-300">{estado}</p>
          {error && <button type="button" onClick={() => setIntento((value) => value + 1)} className="rounded-xl bg-cyan-400 px-4 py-2 font-semibold text-slate-950">Reintentar</button>}
        </div>
      )}
    </div>
  );
}