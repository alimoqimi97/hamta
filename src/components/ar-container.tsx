'use client';

import { useState } from 'react';
import MindARViewer from './mindar-viewer';
import ArVideoViewer from './ar-video-viewer';
// import MindARThreeViewer from './mindar-three-viewer';

function ARContainer() {
    const [started, setStarted] = useState("");

    return (
        <div >
            <h1>Example React component with <a href="https://github.com/hiukim/mind-ar-js" target="_blank">MindAR</a></h1>

            <div className="control-buttons">
                {started === "" && <button className='bg-gray-500' onClick={() => { setStarted("aframe") }}>Start AFRAME version</button>}
                {/* {started === "" && <button onClick={() => {setStarted('three')}}>Start ThreeJS version</button>} */}
                {started !== "" && <button onClick={() => { setStarted("") }}>Stop</button>}
            </div>

            {started === 'aframe' && (
                <div className="container">
                    {/* <MindARViewer /> */}
                    <ArVideoViewer />
                    <video></video>
                </div>
            )}

            {/* {started === 'three' && (
                <div className="container">
                    <MindARThreeViewer />
                </div>
            )} */}
        </div>
    );
}

export default ARContainer;