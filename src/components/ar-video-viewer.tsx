'use client';

import { useEffect, useRef, useState } from 'react';
import './styles.css'

export default function ArVideoViewer() {
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

    useMindARVideo({
        enabled: ready,
        videoSelector: '#myVideo',
    });


    // const handleFileChange = async (
    //     event: React.ChangeEvent<HTMLInputElement>
    // ) => {
    //     const file = event.target.files?.[0];

    //     if (!file) return;

    //     try {
    //         await compileMindTargetFromFile(
    //             file,
    //             "my-target.mind",
    //             (progress) => {
    //                 console.log(`Progress: ${Math.round(progress * 100)}%`);
    //             }
    //         );

    //         console.log("Successfully generated .mind file");
    //     } catch (error) {
    //         console.error("Failed to compile target:", error);
    //     }
    // };

    // useEffect(() => {
    //     if (!window || !ready) return;

    //    handleFileChange()



    // }, [ready]);

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
        <a-scene
            ref={sceneRef}
            embedded
            mindar-image="imageTargetSrc: /ar/targets.mind; autoStart: true; uiLoading: yes; uiError: yes; uiScanning: yes;"
        >
            <a-assets>
                <video
                    id="myVideo"
                    src="/ar/compressed-envelope-film.mp4"
                    preload="auto"
                    loop
                    muted
                    playsInline
                />
            </a-assets>

            <a-camera
                position="0 0 0"
                look-controls="enabled: false"
            />

            <a-entity mindar-image-target="targetIndex: 0">
                <a-video
                    src="#myVideo"
                    position="0 0 0"
                    width="1"
                    // height="0.5625" // ratio --> 16:9
                    height="0.75"  // ratio --> 4:3
                />
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

interface UseMindARVideoOptions {
    targetSelector?: string;
    videoSelector?: string;
    enabled?: boolean;
}

export function useMindARVideo({
    targetSelector = '[mindar-image-target]',
    videoSelector = '#myVideo',
    enabled = true,
}: UseMindARVideoOptions = {}) {
    useEffect(() => {
        if (!enabled) return;

        const target = document.querySelector(targetSelector);

        const video = document.querySelector(
            videoSelector
        ) as HTMLVideoElement | null;

        if (!target || !video) {
            console.warn('MindAR target or video not found');
            return;
        }

        const handleFound = async () => {
            console.log('🎯 Target found');

            try {
                await video.play();
            } catch (error) {
                console.error('❌ Video playback failed:', error);
            }
        };

        const handleLost = () => {
            console.log('❌ Target lost');

            video.pause();
        };

        target.addEventListener('targetFound', handleFound);
        target.addEventListener('targetLost', handleLost);

        return () => {
            target.removeEventListener('targetFound', handleFound);
            target.removeEventListener('targetLost', handleLost);

            video.pause();
        };
    }, [targetSelector, videoSelector, enabled]);
}

export async function compileMindTargetFromFile(
    file: File,
    fileName = "targets.mind",
    onProgress?: (progress: number) => void
): Promise<void> {
    if (!window.MINDAR.IMAGE.Compiler) {
        throw new Error("MindAR Compiler is not loaded.");
    }

    const imageElement = new Image();
    const imageUrl = URL.createObjectURL(file);

    try {
        // Load the uploaded image
        await new Promise<void>((resolve, reject) => {
            imageElement.onload = () => resolve();

            imageElement.onerror = () => {
                reject(new Error("Failed to load image."));
            };

            imageElement.src = imageUrl;
        });

        // Create compiler
        const compiler = new window.MINDAR.IMAGE.Compiler();

        // Compile image target
        await compiler.compileImageTargets(
            [imageElement],
            (progress: number) => {
                onProgress?.(progress);
            }
        );

        // Export compiled target
        const exportedBuffer = await compiler.exportData();

        // Convert ArrayBuffer to .mind file
        const blob = new Blob([exportedBuffer], {
            type: "application/octet-stream",
        });

        // Download/save the .mind file
        const downloadUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = fileName;

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(downloadUrl);
    } finally {
        URL.revokeObjectURL(imageUrl);
    }
}