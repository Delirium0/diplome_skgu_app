import React, { useEffect } from 'react';

const Test = () => {
  useEffect(() => {
    // Загружаем A-Frame и mindar-image после монтирования компонента
    const loadScripts = async () => {
      // Проверяем, загружены ли скрипты, чтобы избежать повторной загрузки
      if (!window.AFRAME) {
        const aframeScript = document.createElement('script');
        aframeScript.src = 'https://aframe.io/releases/1.6.0/aframe.min.js';
        aframeScript.async = true; // чтобы не блокировать парсинг
        document.head.appendChild(aframeScript);

        aframeScript.onload = () => { // Ждем загрузки A-Frame перед загрузкой MindAR
          const mindarScript = document.createElement('script');
          mindarScript.src = 'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js';
          mindarScript.async = true;
          document.head.appendChild(mindarScript);
        };
      }
      else {
          const mindarScript = document.createElement('script');
          mindarScript.src = 'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js';
          mindarScript.async = true;
          document.head.appendChild(mindarScript);
      }
    };

    loadScripts();

    // Этот код будет выполнен при размонтировании компонента
    return () => {
      // Здесь можно добавить код для очистки, если это необходимо
      // Например, удаление созданных элементов A-Frame (если они создаются динамически)
    };
  }, []);

  return (
    <a-scene
      mindar-image="imageTargetSrc: /office_207.mind;"

      color-space="sRGB"
      renderer="colorManagement: true, physicallyCorrectLights"
      vr-mode-ui="enabled: false"
      device-orientation-permission-ui="enabled: false"
    >
      <a-assets>
        <a-asset-item
          id="avatarModel"
          src="https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/softmind/scene.gltf"
        ></a-asset-item>
      </a-assets>

      <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>
      <a-entity mindar-image-target="targetIndex: 0">
        <a-entity
          text="value: Room 207\nInformation Systems Department; align: center; color: white; width: 2"
          position="0 -0.3 0.01"
          geometry="primitive: plane; width: 2.1; height: auto"
          material="color: rgba(0, 0, 0, 0.7)"
        ></a-entity>
      </a-entity>
    </a-scene>
  );
};

export default Test;