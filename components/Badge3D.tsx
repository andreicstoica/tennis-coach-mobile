import { Asset } from 'expo-asset';
import { ExpoWebGLRenderingContext, GLView } from 'expo-gl';
import { Renderer, TextureLoader } from 'expo-three';
import React, { useEffect, useRef, useState } from 'react';
import { PanResponder, View } from 'react-native';
import * as THREE from 'three';

interface Badge3DProps {
  badgeImage: any;
  courtName: string;
  onPress?: () => void;
  isModal?: boolean;
}

export default function Badge3D({ badgeImage, courtName, onPress, isModal = false }: Badge3DProps) {
  /* ------------------------------------------------------------------ */
  /*  State / refs                                                      */
  /* ------------------------------------------------------------------ */
  const [gl, setGL] = useState<ExpoWebGLRenderingContext | null>(null);
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [camera, setCamera] = useState<THREE.PerspectiveCamera | null>(null);
  const [renderer, setRenderer] = useState<Renderer | null>(null);
  const [medal, setMedal] = useState<THREE.Group | null>(null);

  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const autoRotation = useRef(0);
  const isInteracting = useRef(false);
  const spinVelocity = useRef(0);
  const medalRotation = useRef(0);

  /* ------------------------------------------------------------------ */
  /*  Touch / mouse handler                                             */
  /* ------------------------------------------------------------------ */
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // More lenient - respond to any horizontal movement
      return Math.abs(gestureState.dx) > 2;
    },
    onPanResponderGrant: (evt) => {
      isInteracting.current = true;
      // Reset any existing momentum
      spinVelocity.current = 0;
    },
    onPanResponderMove: (evt, gestureState) => {
      // Reduced sensitivity for gentler spinning
      const sensitivity = 0.02; // Reduced from 0.05
      spinVelocity.current = gestureState.vx * sensitivity;

      // Much more gentle immediate movement feedback
      medalRotation.current += gestureState.dx * 0.0055; // Reduced from 0.02
    },
    onPanResponderRelease: (evt, gestureState) => {
      // Start momentum-based spinning
      isInteracting.current = false;

      // Reduced max velocity for gentler momentum
      const maxVelocity = 0.2; // Reduced from 0.5
      spinVelocity.current = Math.max(-maxVelocity, Math.min(maxVelocity, gestureState.vx * 0.005)); // Reduced multiplier

      console.log('Released with velocity:', spinVelocity.current);
    },
    onPanResponderTerminate: () => {
      isInteracting.current = false;
      spinVelocity.current = 0;
    },
  });

  /* ------------------------------------------------------------------ */
  /*  GL context setup                                                  */
  /* ------------------------------------------------------------------ */
  const onContextCreate = async (glCtx: ExpoWebGLRenderingContext) => {
    /* renderer */
    const renderer = new Renderer({ gl: glCtx });
    renderer.setSize(glCtx.drawingBufferWidth, glCtx.drawingBufferHeight);
    renderer.setClearColor(0x000000, 0);

    /* scene & camera */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      glCtx.drawingBufferWidth / glCtx.drawingBufferHeight,
      0.1,
      1000
    );
    camera.position.z = 4;

    /* medal geometry -------------------------------------------------- */
    const medalGeo = new THREE.CylinderGeometry(1.3, 1.3, 0.15, 32);

    const edgeMat = new THREE.MeshBasicMaterial({ color: 0xb8860b });
    const backMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const frontMat = new THREE.MeshBasicMaterial({ color: 0xffffff }); // texture later

    /* IMPORTANT: index 2 = “bottom” cap = faces the camera after X-rotation */
    const medalMesh = new THREE.Mesh(medalGeo, [edgeMat, backMat, frontMat]);
    medalMesh.rotation.x = -Math.PI / 2; // lay the coin flat

    const medalGroup = new THREE.Group();
    medalGroup.add(medalMesh);

    /* rim */
    const rimGeo = new THREE.TorusGeometry(1.3, 0.04, 8, 24);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.position.y = 0.08;
    medalGroup.add(rim);

    scene.add(medalGroup);

    /* lighting */
    scene.add(new THREE.AmbientLight(0x404040, 0.3));
    const dir = new THREE.DirectionalLight(0xffffff, 0.2);
    dir.position.set(2, 2, 2);
    scene.add(dir);

    /* save objects in state */
    setGL(glCtx);
    setScene(scene);
    setCamera(camera);
    setRenderer(renderer);
    setMedal(medalGroup);

    /* load badge texture onto the frontMat */
    await loadTexture(badgeImage, frontMat);
  };

  /* ------------------------------------------------------------------ */
  /*  Texture loader                                                    */
  /* ------------------------------------------------------------------ */
  const loadTexture = async (badgeImg: any, mat: THREE.MeshBasicMaterial) => {
    const [{ localUri }] = await Asset.loadAsync(badgeImg);
    const tex = new TextureLoader().load(localUri!);

    tex.center.set(0.5, 0.5); // rotate around center
    tex.rotation = Math.PI / 2; // 90°

    tex.wrapS = tex.wrapT = THREE.RepeatWrapping; // allow mirroring on U
    tex.repeat.set(-1, 1); // mirror once on U
    tex.offset.set(0, 0); // shift mirror back into view

    tex.flipY = false; // Expo/React-Native images are already right-side-up
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;

    mat.map = tex;
    mat.needsUpdate = true;
  };

  /* ------------------------------------------------------------------ */
  /*  Animation loop                                                    */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!gl || !scene || !camera || !renderer || !medal) return;

    let animationId: number;
    let lastTime = 0;
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;

    const animate = (currentTime: number) => {
      // Throttle to target FPS
      if (currentTime - lastTime < frameInterval) {
        animationId = requestAnimationFrame(animate);
        return;
      }
      lastTime = currentTime;

      if (!isInteracting.current) {
        // Apply momentum spinning
        if (Math.abs(spinVelocity.current) > 0.001) {
          // Spin with momentum
          medalRotation.current += spinVelocity.current;
          medal.rotation.y = medalRotation.current;

          // Apply friction to slow down
          spinVelocity.current *= 0.99; // More friction for quicker stops

          // Small wobble during momentum spin
          medal.rotation.z = Math.sin(medalRotation.current * 3) * 0.02;
        } else {
          // Return to auto-rotation when momentum is very low
          spinVelocity.current = 0;
          autoRotation.current += 0.005;

          // Smoothly transition back to auto-rotation
          const targetRotation = autoRotation.current;
          medalRotation.current += (targetRotation - medalRotation.current) * 0.05; // Faster transition
          medal.rotation.y = medalRotation.current;
          medal.rotation.z = Math.sin(autoRotation.current * 0.3) * 0.05;
        }

        if (isModal) {
          medal.position.y = Math.sin(currentTime * 0.0008) * 0.08;
          const breathingScale = 1 + Math.sin(currentTime * 0.001) * 0.015;
          medal.scale.setScalar(breathingScale);
        }
      } else {
        // During interaction, show immediate response
        medal.rotation.y = medalRotation.current;
        medal.rotation.z = 0; // Keep stable while interacting
      }

      renderer.render(scene, camera);
      gl.endFrameEXP();
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [gl, scene, camera, renderer, medal, isModal]);

  /* ------------------------------------------------------------------ */
  /*  JSX                                                               */
  /* ------------------------------------------------------------------ */
  return (
    <View style={{ width: 200, height: 200 }} {...panResponder.panHandlers}>
      <GLView style={{ flex: 1 }} onContextCreate={onContextCreate} />
    </View>
  );
}
