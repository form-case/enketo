import logo from './logo.svg';
import './App.css';
import FolderUploader from './FolderUploader';
import UploadComponent from './UploadComponent';
import FormUploader from './FormUploader';  // Importa el nuevo componente
import ExportIndexedDB from './ExportIndexedDB.js';

function App() {
  return (
    <div className="App">
      <h1>Aplicación de Subida de Archivos</h1>
      <FolderUploader />
      <h1>Subida de Form y Model a IndexDB</h1>
      <FormUploader />  {/* Aquí se utiliza el nuevo componente */}
      <h1>Export IndexDB</h1>
      <ExportIndexedDB />  {/* Aquí se utiliza el nuevo componente */}
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
