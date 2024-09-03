import encryptor from './encryptor';
import settings from './settings';
import { t } from './translator';
import utils from './utils';
import {
    getLastSavedRecord,
    populateLastSavedInstances,
    setLastSavedRecord,
} from './last-saved';
import { replaceMediaSources } from './media';

// Importamos PouchDB para la base de datos local
import PouchDB from 'pouchdb-browser';
import { XMLParser } from 'fast-xml-parser';

const pouchResponsesDB = new PouchDB('enketodb');

// Configuración del parser de fast-xml-parser
const xmlParserOptions = {
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
};
const xmlParser = new XMLParser(xmlParserOptions);

// Función para convertir XML a JSON usando fast-xml-parser
const convertXmlToJson = (xml) => {
    try {
        const result = xmlParser.parse(xml);
        return result;
    } catch (error) {
        console.error("Error convirtiendo XML a JSON:", error);
        throw error;
    }
};

// Función para guardar o actualizar un registro en PouchDB
const saveOrUpdateResponse = async (record, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            if (!record._id) {
                record._id = record.instanceId;
            }

            if (record._id.startsWith('_')) {
                record._id = `id_${record._id.slice(1)}`;
            }

            // Convertir el XML a JSON antes de guardarlo en PouchDB
            record.jsonData = convertXmlToJson(record.xml);
            delete record.xml;

            // Guardar los archivos (Blobs) asociados si existen
            if (record.files && Array.isArray(record.files)) {
                record.files = record.files.map(file => ({
                    name: file.name,
                    blob: file
                }));
            }

            // Verificar si ya existe un registro con el mismo _id
            const existingRecord = await pouchResponsesDB.get(record._id).catch(err => null);
            if (existingRecord) {
                record._rev = existingRecord._rev;
            }

            // Guardar el registro en PouchDB
            await pouchResponsesDB.put(record);
            console.log('Record guardado en PouchDB con blobs:', record);
            return record;
        } catch (error) {
            if (error.status === 409) {
                // Conflicto de versiones, intentar de nuevo con el _rev correcto
                const existingRecord = await pouchResponsesDB.get(record._id);
                record._rev = existingRecord._rev;
            } else {
                console.error("Error guardando el record en PouchDB:", error);
                throw error;
            }
        }
    }
    throw new Error('No se pudo guardar el registro después de varios intentos.');
};

// Guardar respuesta en PouchDB
const saveResponseInPouchDB = async (record) => {
    try {
        return await saveOrUpdateResponse(record);
    } catch (error) {
        console.error("Error final al guardar el record en PouchDB:", {
            error,
            record,
            pouchDbInfo: await pouchResponsesDB.info(),
        });
        throw error;
    }
};

// Simulación de la función de subida que ahora solo guarda localmente
const uploadRecord = (survey, record) =>
    setLastSavedRecord(survey, record).then(() => saveResponseInPouchDB(record));

// Obtener partes del formulario (ajustado para offline)
async function getFormParts(props) {
    const transformed = await transformPreviewXForm(props.xformUrl); // Supongamos que xformUrl es la URL del formulario localmente
    const model = parser.parseFromString(transformed.model, 'text/xml');

    const encryptedSubmission = model.querySelector(
        'submission[base64RsaPublicKey]'
    );

    let survey = {
        ...transformed,
        enketoId: props.enketoId,
        theme:
            transformed.theme ||
            utils.getThemeFromFormStr(transformed.form) ||
            settings.defaultTheme,
    };

    if (encryptedSubmission != null) {
        survey = encryptor.setEncryptionEnabled(survey);
    }

    const externalData = await getExternalData(survey, model, {
        isPreview: props.isPreview,
    });

    Object.assign(survey, { externalData });

    const lastSavedRecord = props.isPreview
        ? null
        : await getLastSavedRecord(survey.enketoId);

    return populateLastSavedInstances(survey, lastSavedRecord);
}

// Simulación de obtención de datos sin conexión
const getExternalData = async (survey, model, options = {}) => {
    replaceMediaSources(model, survey.media);
    return []; // Simulamos que no hay datos externos a obtener
};

// Eliminar cualquier función que intente hacer una solicitud de red

export default {
    uploadRecord,
    getFormParts,
};
