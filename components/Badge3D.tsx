import { Asset } from 'expo-asset';
import { ExpoWebGLRenderingContext, GLView } from 'expo-gl';
import { Renderer, TextureLoader } from 'expo-three'; // Use expo-three TextureLoader
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
  const [gl, setGL] = useState<ExpoWebGLRenderingContext | null>(null);
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [camera, setCamera] = useState<THREE.PerspectiveCamera | null>(null);
  const [renderer, setRenderer] = useState<Renderer | null>(null);
  const [medal, setMedal] = useState<THREE.Group | null>(null);

  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const autoRotation = useRef(0);
  const isInteracting = useRef(false);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      isInteracting.current = true;
      if (onPress) onPress();
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

  const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    try {
      setGL(gl);

      // Setup renderer
      const renderer = new Renderer({ gl });
      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
      renderer.setClearColor(0x000000, 0);
      setRenderer(renderer);

      // Setup scene
      const scene = new THREE.Scene();
      setScene(scene);

      // Setup camera
      const camera = new THREE.PerspectiveCamera(
        50,
        gl.drawingBufferWidth / gl.drawingBufferHeight,
        0.1,
        1000
      );
      camera.position.z = 4;
      setCamera(camera);

      // Create medal group
      const medalGroup = new THREE.Group();

      // Create medal geometry
      const medalGeometry = new THREE.CylinderGeometry(1.3, 1.3, 0.15, 32);

      // Create materials (start with placeholder)
      const frontMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00, // Green placeholder
        transparent: true,
        side: THREE.DoubleSide,
      });

      const backMaterial = new THREE.MeshBasicMaterial({
        color: 0xffd700,
      });

      const edgeMaterial = new THREE.MeshBasicMaterial({
        color: 0xb8860b,
      });

      // Create medal with materials
      const medalMesh = new THREE.Mesh(medalGeometry, [
        edgeMaterial, // Side (0)
        frontMaterial, // Top (1)
        backMaterial, // Bottom (2)
      ]);

      // Rotate medal to show front face
      medalMesh.rotation.x = -(Math.PI / 2);
      medalGroup.add(medalMesh);

      // Add rim
      const rimGeometry = new THREE.TorusGeometry(1.3, 0.04, 8, 24);
      const rimMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 });
      const rimMesh = new THREE.Mesh(rimGeometry, rimMaterial);
      rimMesh.position.y = 0.08;
      medalGroup.add(rimMesh);

      // Add chain
      const chainGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8);
      const chainMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });
      const chainMesh = new THREE.Mesh(chainGeometry, chainMaterial);
      chainMesh.position.y = 1.6;
      chainMesh.rotation.x = Math.PI / 2;
      medalGroup.add(chainMesh);

      setMedal(medalGroup);
      scene.add(medalGroup);

      // Simple lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
      directionalLight.position.set(2, 2, 2);
      scene.add(directionalLight);

      console.log('✅ Medal setup complete with placeholder');

      // Now load texture using expo-three TextureLoader
      loadTextureExpo(badgeImage, frontMaterial);
    } catch (error) {
      console.error('❌ 3D setup failed:', error);
    }
  };

  const loadTextureExpo = async (badgeImage: any, material: THREE.MeshBasicMaterial) => {
    try {
      console.log('🔄 Starting expo-three texture load...');
      console.log('Badge image asset ID:', badgeImage);

      // Use expo-three TextureLoader which handles Expo assets better
      const [{ localUri }] = await Asset.loadAsync(badgeImage);
      const texture = new TextureLoader().load(localUri!);

      console.log('✅ Expo-three texture loaded successfully!');
      console.log('Texture details:', {
        width: texture.image?.width,
        height: texture.image?.height,
      });

      // Configure texture
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.flipY = false;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      // Rotate texture 90 degrees to the right (clockwise)
      texture.rotation = Math.PI / 2;

      // Center the texture rotation
      texture.center.set(0.5, 0.5);

      // Adjust texture offset and repeat for better alignment
      texture.offset.set(0, 0);
      texture.repeat.set(1, 1);

      // Update material
      material.map = texture;
      material.color.setHex(0xffffff);
      material.needsUpdate = true;

      console.log('✅ Material updated with expo-three texture');
    } catch (error) {
      console.error('❌ Expo-three texture loading failed:', error);
      // Change to red to indicate error
      material.color.setHex(0xff0000);
      material.needsUpdate = true;
    }
  };

  // Animation loop
  useEffect(() => {
    if (!gl || !scene || !camera || !renderer || !medal) return;

    let animationId: number;
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
      animationId = requestAnimationFrame(animate);
    };

    animate();

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
