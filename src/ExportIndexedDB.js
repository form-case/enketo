import React from 'react';

const ExportIndexedDB = () => {
  const exportDatabase = () => {
    const request = indexedDB.open('enketo', 4); // Asegúrate de que esta versión coincida con la de tu base de datos

    request.onsuccess = function(event) {
      const db = event.target.result;

      const objectStores = ['data', 'files', 'properties', 'records', 'resources', 'surveys'];
      const exportData = {};

      const transaction = db.transaction(objectStores, 'readonly');

      objectStores.forEach((storeName) => {
        const store = transaction.objectStore(storeName);
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = function(event) {
          exportData[storeName] = event.target.result;

          // Convertir Blobs a texto base64 para que puedan ser exportados
          if (storeName === 'files') {
            exportData[storeName] = exportData[storeName].map((item) => {
              if (item.value instanceof Blob) {
                return new Promise((resolve) => {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    resolve({
                      ...item,
                      value: reader.result
                    });
                  };
                  reader.readAsDataURL(item.value);
                });
              }
              return item;
            });
          }

          // Si se han procesado todos los object stores, se descarga el archivo JSON
          if (Object.keys(exportData).length === objectStores.length) {
            Promise.all(exportData.files).then((processedFiles) => {
              exportData.files = processedFiles;

              const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);

              const a = document.createElement('a');
              a.href = url;
              a.download = 'indexeddb-export.json';
              a.click();

              URL.revokeObjectURL(url);
            });
          }
        };

        getAllRequest.onerror = function(event) {
          console.error(`Error al leer el object store ${storeName}:`, event.target.error);
        };
      });
    };

    request.onerror = function(event) {
      console.error('Error al abrir la base de datos IndexedDB:', event.target.error);
    };
  };

  return (
    <button onClick={exportDatabase}>Exportar IndexedDB</button>
  );
};

export default ExportIndexedDB;
