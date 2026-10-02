'use client';

import { useEffect, useRef, useState } from 'react';
import './styles.css'

export default function MindArViewer() {
    const sceneRef = useRef<HTMLElement | null>(null);

    const { ready, error } = useMindAR();

    useEffect(() => {
        const sceneEl = sceneRef.current;

        if (!sceneEl) return;

        const handleLoaded = () => {
            const arSystem = sceneEl?.systems['mindar-image-system'];

            if (!arSystem) {
                console.error('MindAR system not found');
                return;
            }

            arSystem.start();
        };

        sceneEl.addEventListener('loaded', handleLoaded);

        return () => {
            sceneEl.removeEventListener('loaded', handleLoaded);
        };
    }, [ready]);


    if (error) {
        return (
            <div>
                <p>Failed to initialize AR.</p>
                <pre>{error.message}</pre>
            </div>
        );
    }

    if (!ready) {
        return <div>Loading AR...</div>;
    }

    return (
        <a-scene ref={sceneRef} mindar-image="imageTargetSrc: https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.0/examples/image-tracking/assets/card-example/card.mind; autoStart: true; uiLoading: no; uiError: no; uiScanning: yes;" color-space="sRGB" embedded renderer="colorManagement: true, physicallyCorrectLights" vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false">
            <a-assets>
                <img id="card" src="https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.0/examples/image-tracking/assets/card-example/card.png" />
                <a-asset-item id="avatarModel" src="https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.0/examples/image-tracking/assets/card-example/softmind/scene.gltf"></a-asset-item>
            </a-assets>

            <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

            <a-entity mindar-image-target="targetIndex: 0">
                <a-plane src="#card" position="0 0 0" height="0.552" width="1" rotation="0 0 0"></a-plane>
                <a-gltf-model rotation="0 0 0 " position="0 0 0.1" scale="0.005 0.005 0.005" src="#avatarModel" animation="property: position; to: 0 0.1 0.1; dur: 1000; easing: easeInOutQuad; loop: true; dir: alternate"></a-gltf-model>
            </a-entity>
        </a-scene>
    )
}

interface UseMindARResult {
    ready: boolean;
    error: Error | null;
}

export function useMindAR(): UseMindARResult {
    const [ready, setReady] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let mounted = true;

        async function init() {
            try {
                console.log('1. Loading A-Frame...');

                await import('aframe');

                console.log('2. A-Frame loaded');

                await import(
                    'mind-ar/dist/mindar-image-aframe.prod.js'
                );

                console.log('3. MindAR loaded');

                if (mounted) {
                    setReady(true);
                }
            } catch (error) {
                console.error('❌ AR initialization failed:', error);

                if (mounted) {
                    setError(
                        error instanceof Error
                            ? error
                            : new Error('Failed to initialize MindAR')
                    );
                }
            }
        }

        init();

        return () => {
            mounted = false;
        };
    }, []);

    return {
        ready,
        error,
    };
}