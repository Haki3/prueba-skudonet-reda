# Movie Formatter SkudoNet
## Script para listar las mejores 25 películas del ranking de IMDB

### Dependencias
Para ejecutar este script, necesitarás tener instalado Node.js y las siguientes dependencias:
- `csv-parser`: Para leer y parsear el archivo CSV.
- `axios`: Para descargar el archivo CSV desde la URL proporcionada.
- `fs`: Para manejar el sistema de archivos.

Puedes instalar estas dependencias usando npm:
```bash
npm install csv-parser axios fs
```

### Consideraciones
- Asegúrate de tener acceso a internet para descargar el archivo CSV.
- El script asume que el archivo CSV tiene las columnas `#Duracion` y `Nombre`.
- La URL de descarga ha sido modificada para permitir la descarga directa del archivo.

### Ejecución
Para ejecutar el script, simplemente corre el siguiente comando en tu terminal:
```bash
node index.js
```

### Salida Esperada
El script imprimirá un JSON con la estructura especificada en el prompt, similar al siguiente:
```json
{
    "peliculas": [
        {
            "pelicula": "The Shawshank Redemption",
            "duracion": 142,
            "puesto": 1
        },
        {
            "pelicula": "The Godfather",
            "duracion": 175,
            "puesto": 2
        }
        // ... 23 películas más
    ]
}
```