// import React, { useEffect } from 'react';
// //  import 'aframe';
// // import 'mind-ar/dist/mindar-image-aframe.prod.js';
// // установка npm install mind-ar  
// const ARComponent = () => {
//   useEffect(() => {
//     const sceneEl = document.querySelector('a-scene');
//     if (sceneEl) {
//       sceneEl.addEventListener('loaded', () => {
//         console.log('Сцена загружена');
//       });
//     }
//   }, []);

//   return (
//     <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
//       <a-scene
//         mindar-image="imageTargetSrc: ./targets.mind; autoStart: true;"
//         embedded
//         vr-mode-ui="enabled: false"
//         device-orientation-permission-ui="enabled: false"
//       >
//         <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>
//         <a-entity mindar-image-target="targetIndex: 0">
//           <a-text
//             value="Привет, это AR текст!"
//             color="white"
//             align="center"
//             position="0 0 0"
//             scale="0.5 0.5 0.5"
//           ></a-text>
//         </a-entity>
//       </a-scene>
//     </div>
//   );
// };

// export default ARComponent;


import { useEffect } from 'react';

function ARComponent() {
  useEffect(() => {
    window.open('/test.html', '_blank');
  }, []);
  

  return null; // Ничего не отображаем
}

export default ARComponent;