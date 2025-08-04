import { Asset } from 'expo-asset';
import React, { useEffect, useState } from 'react';
import { Animated, Image, PanResponder, View } from 'react-native';

interface Badge3DProps {
  badgeImage: any;
  courtName: string;
  onPress?: () => void;
  isModal?: boolean;
}

export default function Badge3D({ badgeImage, courtName, onPress, isModal = false }: Badge3DProps) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const spinValue = new Animated.Value(0);
  const scaleValue = new Animated.Value(1);
  const translateY = new Animated.Value(0);

  useEffect(() => {
    loadImage();
  }, [badgeImage]);

  const loadImage = async () => {
    const [{ localUri }] = await Asset.loadAsync(badgeImage);
    setImageUri(localUri!);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > 2;
    },
    onPanResponderGrant: () => {
      spinValue.setValue(0);
    },
    onPanResponderMove: (evt, gestureState) => {
      const rotation = gestureState.dx * 0.5;
      spinValue.setValue(rotation);
    },
    onPanResponderRelease: (evt, gestureState) => {
      const velocity = gestureState.vx * 0.1;
      let currentValue = 0;
      spinValue.addListener(({ value }) => {
        currentValue = value;
      });
      const finalRotation = currentValue + velocity * 100;
      spinValue.removeAllListeners();

      Animated.spring(spinValue, {
        toValue: finalRotation,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    },
  });

  useEffect(() => {
    if (isModal) {
      // Breathing animation for modal
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Floating animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: -10,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isModal]);

  if (!imageUri) {
    return <View style={{ width: 200, height: 200, backgroundColor: '#f0f0f0' }} />;
  }

  return (
    <View style={{ width: 200, height: 200 }} {...panResponder.panHandlers}>
      <Animated.View
        style={{
          flex: 1,
          transform: [
            {
              rotate: spinValue.interpolate({
                inputRange: [-360, 360],
                outputRange: ['-360deg', '360deg'],
              }),
            },
            { scale: scaleValue },
            { translateY },
          ],
        }}>
        <Image
          source={{ uri: imageUri }}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 100,
          }}
          resizeMode="cover"
        />
      </Animated.View>
    </View>
  );
}

/*
// ORIGINAL 3D IMPLEMENTATION - UNCOMMENT WHEN SWITCHING TO BARE WORKFLOW
// Requires: expo-three, expo-gl, expo-gl-cpp, three

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
  // State / refs
  const [gl, setGL] = useState<ExpoWebGLRenderingContext | null>(null);
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [camera, setCamera] = useState<THREE.PerspectiveCamera | null>(null);
  const [renderer, setRenderer] = useState<Renderer | null>(null);
  const [medal, setMedal] = useState<THREE.Group | null>(null);

  const autoRotation = useRef(0);
  const isInteracting = useRef(false);
  const spinVelocity = useRef(0);
  const medalRotation = useRef(0);

  // Touch / mouse handler
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > 2;
    },
    onPanResponderGrant: (evt) => {
      isInteracting.current = true;
      spinVelocity.current = 0;
    },
    onPanResponderMove: (evt, gestureState) => {
      const sensitivity = 0.02;
      spinVelocity.current = gestureState.vx * sensitivity;
      medalRotation.current += gestureState.dx * 0.0055;
    },
    onPanResponderRelease: (evt, gestureState) => {
      isInteracting.current = false;
      const maxVelocity = 0.2;
      spinVelocity.current = Math.max(-maxVelocity, Math.min(maxVelocity, gestureState.vx * 0.005));
    },
    onPanResponderTerminate: () => {
      isInteracting.current = false;
      spinVelocity.current = 0;
    },
  });

  // GL context setup
  const onContextCreate = async (glCtx: ExpoWebGLRenderingContext) => {
    const renderer = new Renderer({ gl: glCtx });
    renderer.setSize(glCtx.drawingBufferWidth, glCtx.drawingBufferHeight);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      glCtx.drawingBufferWidth / glCtx.drawingBufferHeight,
      0.1,
      1000
    );
    camera.position.z = 4;

    // Medal geometry
    const medalGeo = new THREE.CylinderGeometry(1.3, 1.3, 0.15, 32);
    const edgeMat = new THREE.MeshBasicMaterial({ color: 0xb8860b });
    const backMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const frontMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const medalMesh = new THREE.Mesh(medalGeo, [edgeMat, backMat, frontMat]);
    medalMesh.rotation.x = -Math.PI / 2;

    const medalGroup = new THREE.Group();
    medalGroup.add(medalMesh);

    // Rim
    const rimGeo = new THREE.TorusGeometry(1.3, 0.04, 8, 24);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.position.y = 0.08;
    medalGroup.add(rim);

    scene.add(medalGroup);

    // Lighting
    scene.add(new THREE.AmbientLight(0x404040, 0.3));
    const dir = new THREE.DirectionalLight(0xffffff, 0.2);
    dir.position.set(2, 2, 2);
    scene.add(dir);

    setGL(glCtx);
    setScene(scene);
    setCamera(camera);
    setRenderer(renderer);
    setMedal(medalGroup);

    await loadTexture(badgeImage, frontMat);
  };

  // Texture loader
  const loadTexture = async (badgeImg: any, mat: THREE.MeshBasicMaterial) => {
    const [{ localUri }] = await Asset.loadAsync(badgeImg);
    const tex = new TextureLoader().load(localUri!);

    tex.center.set(0.5, 0.5);
    tex.rotation = Math.PI / 2;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(-1, 1);
    tex.offset.set(0, 0);
    tex.flipY = false;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;

    mat.map = tex;
    mat.needsUpdate = true;
  };

  // Animation loop
  useEffect(() => {
    if (!gl || !scene || !camera || !renderer || !medal) return;

    let animationId: number;
    let lastTime = 0;
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;

    const animate = (currentTime: number) => {
      if (currentTime - lastTime < frameInterval) {
        animationId = requestAnimationFrame(animate);
        return;
      }
      lastTime = currentTime;

      if (!isInteracting.current) {
        if (Math.abs(spinVelocity.current) > 0.001) {
          medalRotation.current += spinVelocity.current;
          medal.rotation.y = medalRotation.current;
          spinVelocity.current *= 0.99;
          medal.rotation.z = Math.sin(medalRotation.current * 3) * 0.02;
        } else {
          spinVelocity.current = 0;
          autoRotation.current += 0.005;
          const targetRotation = autoRotation.current;
          medalRotation.current += (targetRotation - medalRotation.current) * 0.05;
          medal.rotation.y = medalRotation.current;
          medal.rotation.z = Math.sin(autoRotation.current * 0.3) * 0.05;
        }

        if (isModal) {
          medal.position.y = Math.sin(currentTime * 0.0008) * 0.08;
          const breathingScale = 1 + Math.sin(currentTime * 0.001) * 0.015;
          medal.scale.setScalar(breathingScale);
        }
      } else {
        medal.rotation.y = medalRotation.current;
        medal.rotation.z = 0;
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

  return (
    <View style={{ width: 200, height: 200 }} {...panResponder.panHandlers}>
      <GLView style={{ flex: 1 }} onContextCreate={onContextCreate} />
    </View>
  );
}
*/
