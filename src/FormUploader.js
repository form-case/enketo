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

      if (!db.objectStoreNames.contains('surveys')) {
        const surveysStore = db.createObjectStore('surveys', { keyPath: 'enketoId' });
        surveysStore.createIndex('enketoId', 'enketoId', { unique: true });
      }

      if (!db.objectStoreNames.contains('data')) {
        const dataStore = db.createObjectStore('data', { keyPath: 'enketoId' });
        dataStore.createIndex('enketoId', 'enketoId', { unique: true });
      }

      // Crear el objectStore 'records' con las estructuras internas
      if (!db.objectStoreNames.contains('records')) {
        const recordsStore = db.createObjectStore('records', { keyPath: 'instanceId' });

        recordsStore.createIndex('recordName', ['enketoId', 'name'], { unique: false });
        recordsStore.createIndex('instanceId', 'instanceId', { unique: true });
        recordsStore.createIndex('enketoId', 'enketoId', { unique: false });
      }

      // Crear el objectStore 'files' con los índices mostrados en las imágenes
      if (!db.objectStoreNames.contains('files')) {
        const filesStore = db.createObjectStore('files', { keyPath: 'key' });
      }

      // Crear el objectStore 'properties' con los índices mostrados en las imágenes
      if (!db.objectStoreNames.contains('properties')) {
        const propertiesStore = db.createObjectStore('properties', { keyPath: 'name' });
        propertiesStore.createIndex('key', 'key', { unique: true });
      }

      // Crear el objectStore 'resources' con los índices mostrados en las imágenes
      if (!db.objectStoreNames.contains('resources')) {
        const resourcesStore = db.createObjectStore('resources', { keyPath: 'key' });
      }

      // Crear el objectStore 'lastSavedRecords' con el índice 'key'
      if (!db.objectStoreNames.contains('lastSavedRecords')) {
        const lastSavedRecordsStore = db.createObjectStore('lastSavedRecords', { keyPath: 'key' });
      }
    };

    request.onsuccess = function(event) {
      const db = event.target.result;
      const transaction = db.transaction(['surveys', 'data', 'records', 'files', 'properties', 'resources', 'lastSavedRecords'], 'readwrite');
      const store = transaction.objectStore('surveys');
      const dataStore = transaction.objectStore('data');
      const recordsStore = transaction.objectStore('records');
      const filesStore = transaction.objectStore('files');
      const propertiesStore = transaction.objectStore('properties');
      const resourcesStore = transaction.objectStore('resources');
      const lastSavedRecordsStore = transaction.objectStore('lastSavedRecords');

      const survey = {
        form: formString,
        enketoId: '6lmeBOLX',
        model: modelString,
        hash: 'md5:6d6aa1f222a19a2bc673673c4a03cb61--1d19c3ef44a52ee3ec46de2544237d9b---1',
        languageMap: {},
        maxSize: 10000000,
        media: {}
      };

      const record = {
        instanceId: '123456',
        recordName: 'Example Record',
        enketoId: '6lmeBOLX'
      };

      const file = {
        key: 'someFileKey',
        value: 'fileContent'
      };

      const property = {
        name: 'propertyName',
        key: 'propertyKey',
        value: 'propertyValue'
      };

      const resource = {
        key: 'resourceKey',
        value: 'resourceValue'
      };

      const lastSavedRecord = {
        key: 'lastSavedRecordKey',
        value: 'lastSavedRecordValue'
      };

      const storeRequest = store.put(survey);
      const dataRequest = dataStore.put({ enketoId: '6lmeBOLX' });
      const recordsRequest = recordsStore.put(record);
      const filesRequest = filesStore.put(file);
      const propertiesRequest = propertiesStore.put(property);
      const resourcesRequest = resourcesStore.put(resource);
      const lastSavedRecordsRequest = lastSavedRecordsStore.put(lastSavedRecord);

      storeRequest.onsuccess = function() {
        console.log('Formulario y modelo almacenados en IndexedDB correctamente');
      };

      storeRequest.onerror = function(event) {
        console.error('Error al almacenar el formulario en IndexedDB:', event.target.error);
      };

      dataRequest.onsuccess = function() {
        console.log('Datos adicionales almacenados en IndexedDB correctamente');
      };

      dataRequest.onerror = function(event) {
        console.error('Error al almacenar los datos adicionales en IndexedDB:', event.target.error);
      };

      recordsRequest.onsuccess = function() {
        console.log('Record almacenado en IndexedDB correctamente');
      };

      recordsRequest.onerror = function(event) {
        console.error('Error al almacenar el record en IndexedDB:', event.target.error);
      };

      filesRequest.onsuccess = function() {
        console.log('Archivo almacenado en IndexedDB correctamente');
      };

      filesRequest.onerror = function(event) {
        console.error('Error al almacenar el archivo en IndexedDB:', event.target.error);
      };

      propertiesRequest.onsuccess = function() {
        console.log('Propiedad almacenada en IndexedDB correctamente');
      };

      propertiesRequest.onerror = function(event) {
        console.error('Error al almacenar la propiedad en IndexedDB:', event.target.error);
      };

      resourcesRequest.onsuccess = function() {
        console.log('Recurso almacenado en IndexedDB correctamente');
      };

      resourcesRequest.onerror = function(event) {
        console.error('Error al almacenar el recurso en IndexedDB:', event.target.error);
      };

      lastSavedRecordsRequest.onsuccess = function() {
        console.log('Último registro guardado almacenado en IndexedDB correctamente');
      };

      lastSavedRecordsRequest.onerror = function(event) {
        console.error('Error al almacenar el último registro guardado en IndexedDB:', event.target.error);
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
