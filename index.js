const fs = require('fs');
const axios = require('axios');
const csv = require('csv-parser');
const readline = require('readline');

// URL de la película, en un caso real se debería obtener de un archivo de configuración o variable de entorno
const MOVIE_URL = "https://drive.google.com/uc?export=download&id=1zue8yX7khIwjm0ooXLKLfyPNRaC3OFMY";
const INPUT_FILE_PATH = 'imdb_movies.csv';
const OUTPUT_FILE_PATH = 'peliculas.json';

/**
 * Descarga el archivo CSV de la URL proporcionada y lo guarda en el sistema de archivos.
 * @returns {Promise<void>}
 * @throws {Error} Si la URL es incorrecta o el archivo no está disponible.
 * @throws {Error} Si ocurre un error al escribir el archivo CSV.
 **/
async function downloadCSV() {
    console.log('Descargando archivo CSV...');
    try {
        const response = await axios({
            url: MOVIE_URL,
            method: 'GET',
            responseType: 'stream',
            validateStatus: (status) => status === 200
        });

        return new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(INPUT_FILE_PATH);
            response.data.pipe(writer);
            writer.on('finish', resolve);
            writer.on('error', (error) => reject(new Error(`Error al escribir CSV: ${error.message}`)));
        });
    } catch (error) {
        const message = error.response && error.response.status === 404
            ? 'Error: URL incorrecta o archivo no disponible (404 - Not Found).'
            : `Error al descargar CSV: ${error.message}`;
        throw new Error(message);
    }
}

/**
 * Valida que la fila del archivo CSV contenga los campos 'Nombre' y '#Duracion'.
 * @param {Object} row - Fila del archivo CSV.
 * @throws {Error} Si la fila no contiene los campos requeridosdevolvera un error.
 * */
function validateRow(row) {
    if (!row['Nombre'] || !row['#Duracion']) {
        throw new Error("Error: El archivo CSV debe incluir 'Nombre' y '#Duracion'.");
    }
}

/**
 * Parsea la duración de la película en minutos.
 * @param {string} duration - Duración de la película en formato 'HHMM'.
 * @returns {number|null} Duración de la película en minutos o null si la duracion es invalida.
 * */
function parseDuration(duration) {
    if (typeof duration !== 'string') {
        console.warn(`Duracion invalida: ${duration}`);
        return null;
    }
    const match = duration.match(/(\d+)H(\d+)M/);
    return match ? parseInt(match[1]) * 60 + parseInt(match[2]) : null;
}

/**
 * Parsea las 25 películas más populares del archivo CSV.
 * @returns {Promise<Object[]>} Lista de las 25 películas más populares.
 * @throws {Error} Si ocurre un error al leer el archivo CSV.
 * */
async function parseTopMoviesFromCSV() {
    const movies = [];
    let position = 1;
    return new Promise((resolve, reject) => {
        fs.createReadStream(INPUT_FILE_PATH)
            .pipe(csv())
            .on('data', (row) => {
                validateRow(row);
                const duracion = parseDuration(row['#Duracion']);
                if (duracion !== null) {
                    movies.push({ pelicula: row['Nombre'], duracion, puesto: position++ });
                }
            })
            .on('end', () => resolve(movies.slice(0, 25)))
            .on('error', reject);
    });
}

/**
 * Guarda los resultados en un archivo JSON.
 * @param {Object} result - Resultados a guardar.
 * */
function saveResultsToFile(result) {
    fs.writeFileSync(OUTPUT_FILE_PATH, JSON.stringify(result, null, 2));
    console.log(`Archivo JSON generado: ${OUTPUT_FILE_PATH}`);
}

/**
 * Pregunta al usuario si desea ver el contenido del archivo JSON.
 * @param {Object} result - Resultados a mostrar.
 * */
function promptUserToViewFile(result) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(`¿Desea ver el contenido? (y/n): `, (answer) => {
        if (answer.toLowerCase() === 'y') console.log(JSON.stringify(result, null, 2));
        rl.close();
    });
}

async function main() {
    try {
        await downloadCSV();
        const top25Movies = await parseTopMoviesFromCSV();
        const result = { peliculas: top25Movies };
        saveResultsToFile(result);
        promptUserToViewFile(result);
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

main();
