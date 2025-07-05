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

  /* ------------------------------------------------------------------ */
  /*  Touch / mouse handler                                             */
  /* ------------------------------------------------------------------ */
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      isInteracting.current = true;
      onPress?.();
    },
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      mouseX.current = (locationX / 200) * 2 - 1;
      mouseY.current = -(locationY / 200) * 2 + 1;
    },
    onPanResponderRelease: () => {
      isInteracting.current = false;
      mouseX.current = 0;
      mouseY.current = 0;
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
    scene.add(new THREE.AmbientLight(0x404040, 0.8));
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
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

    let id: number;
    const animate = () => {
      if (!isInteracting.current) {
        autoRotation.current += 0.008;
        medal.rotation.y = autoRotation.current;
        medal.rotation.z = Math.sin(autoRotation.current * 0.3) * 0.08;

        if (isModal) {
          medal.position.y = Math.sin(Date.now() * 0.0015) * 0.1;
          medal.scale.setScalar(1 + Math.sin(Date.now() * 0.002) * 0.02);
        }
      } else {
        medal.rotation.y = mouseX.current * Math.PI * 0.8;
        medal.rotation.z = mouseY.current * Math.PI * 0.4;
      }

      renderer.render(scene, camera);
      gl.endFrameEXP();
      id = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(id);
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
