import React, { useState } from 'react';

const FormUploader = () => {
  const [formFile, setFormFile] = useState(null);
  const [modelFile, setModelFile] = useState(null);

  const handleFormChange = (event) => {
    setFormFile(event.target.files[0]);
  };

  const handleModelChange = (event) => {
    setModelFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (!formFile || !modelFile) {
      alert("Por favor selecciona ambos archivos");
      return;
    }

    // Leer los archivos seleccionados y almacenarlos en IndexedDB
    Promise.all([
      readFileContent(formFile),
      readFileContent(modelFile)
    ])
    .then(([formContent, modelContent]) => {
      // Limpiar los contenidos de los archivos
      const cleanFormString = cleanString(formContent);
      const cleanModelString = cleanString(modelContent);

      // Almacenar en IndexedDB
      storeInIndexedDB(cleanFormString, cleanModelString);
    })
    .catch(error => console.error('Error al cargar los archivos:', error));
  };

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  function cleanString(input) {
    // Eliminar caracteres de escape adicionales
    return input.replace(/\\\\/g, '\\')
                .replace(/\\\"/g, '"')
                .replace(/\\n/g, '\n')
                .replace(/\\t/g, '\t');
  }

  function storeInIndexedDB(formString, modelString) {
    const request = indexedDB.open('enketo', 4);

    request.onupgradeneeded = function(event) {
      const db = event.target.result;

      // Mantén la creación del object store "surveys" como estaba
      if (!db.objectStoreNames.contains('surveys')) {
        const surveysStore = db.createObjectStore('surveys', { keyPath: 'enketoId' });
        surveysStore.createIndex('enketoId', 'enketoId', { unique: true });
      }

      // Agrega nuevos object stores aquí
      if (!db.objectStoreNames.contains('data')) {
        const dataStore = db.createObjectStore('data', { keyPath: 'enketoId' });
      }

      if (!db.objectStoreNames.contains('files')) {
        const filesStore = db.createObjectStore('files', { keyPath: 'key' });
      }

      if (!db.objectStoreNames.contains('properties')) {
        const propertiesStore = db.createObjectStore('properties', { keyPath: 'key' });
      }

      if (!db.objectStoreNames.contains('records')) {
        const recordsStore = db.createObjectStore('records', { keyPath: ['enketoId', 'recordName'] });
        recordsStore.createIndex('instanceId', 'instanceId', { unique: false });
      }

      if (!db.objectStoreNames.contains('resources')) {
        const resourcesStore = db.createObjectStore('resources', { keyPath: 'key' });
      }
    };

    request.onsuccess = function(event) {
      const db = event.target.result;

      // Mantén la transacción y almacenamiento en "surveys" como estaba
      const transaction = db.transaction(['surveys', 'data', 'files', 'properties', 'records', 'resources'], 'readwrite');

      const surveysStore = transaction.objectStore('surveys');
      const dataStore = transaction.objectStore('data');
      const filesStore = transaction.objectStore('files');
      const propertiesStore = transaction.objectStore('properties');
      const recordsStore = transaction.objectStore('records');
      const resourcesStore = transaction.objectStore('resources');

      const survey = {
        form: formString,
        enketoId: 'fC6DX8UU',
        model: modelString,
        hash: 'md5:10eb5501a1cda4ff85022fcd31acd51c--7249d3de7986e03785f084296e62ab0e---1',
        languageMap: {},
        maxSize: 10000000,
        media: {}
      };

      surveysStore.put(survey);

      // Nuevos registros en los nuevos object stores
      dataStore.put({ enketoId: 'fC6DX8UU' }); // Asegurando que solo enketoId esté en "data"

      filesStore.put({ key: 'key'});

      propertiesStore.put({ key: 'testBlobWrite', value: {} });
      propertiesStore.put({ key: 'testWrite', value: 1725245664404 });

      recordsStore.put({ enketoId: 'fC6DX8UU', recordName: 'record1', instanceId: 'instance123' });

      resourcesStore.put({ key: 'resource1', content: 'Resource Content' });

      transaction.oncomplete = function() {
        console.log('Todos los datos fueron almacenados correctamente en IndexedDB');
      };

      transaction.onerror = function(event) {
        console.error('Error al almacenar los datos en IndexedDB:', event.target.error);
      };
    };

    request.onerror = function(event) {
      console.error('Error al abrir la base de datos IndexedDB:', event.target.error);
    };
  }

  return (
    <div>
      <input type="file" accept=".xml" onChange={handleFormChange} />
      <input type="file" accept=".xml" onChange={handleModelChange} />
      <button onClick={handleUpload}>Subir Form y Model a IndexDB</button>
    </div>
  );
};

export default FormUploader;
