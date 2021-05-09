[![Tests](https://github.com/ULL-ESIT-INF-DSI-2021/ull-esit-inf-dsi-20-21-prct10-async-sockets-alu0101209500/actions/workflows/tests.yml/badge.svg)](https://github.com/ULL-ESIT-INF-DSI-2021/ull-esit-inf-dsi-20-21-prct10-async-sockets-alu0101209500/actions/workflows/tests.yml) [![Coveralls](https://github.com/ULL-ESIT-INF-DSI-2021/ull-esit-inf-dsi-20-21-prct10-async-sockets-alu0101209500/actions/workflows/coveralls.yml/badge.svg)](https://github.com/ULL-ESIT-INF-DSI-2021/ull-esit-inf-dsi-20-21-prct10-async-sockets-alu0101209500/actions/workflows/coveralls.yml) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=ULL-ESIT-INF-DSI-2021_ull-esit-inf-dsi-20-21-prct10-async-sockets-alu0101209500&metric=alert_status)](https://sonarcloud.io/dashboard?id=ULL-ESIT-INF-DSI-2021_ull-esit-inf-dsi-20-21-prct10-async-sockets-alu0101209500)

# Informe Práctica 10: Implementación de un cliente y un servidor de la aplicación de procesamiento de notas mediante Sockets en Node.js.

## Introducción

Esta práctica tiene como propósito adquirir nociones básicas sobre el uso de sockets en NodeJS para establecer una conexión cliente - servidor entre dos programas. 

## Modificación de la clase NoteClass

La clase NoteClass es la misma que fue desarrollada en la práctica 8 pero con dos cambios importantes:
* Se han eliminado todas las líneas de console.log() que imprimían por pantalla información del estado de las notas para evitar que la terminal del servidor se llene de mensajes sobre la manipulación de las notas (Esta terminal únicamente debería imprimir información sobre las conexiones y peticiones de los clientes).

* Las funciones de la clase, que antes no devolvían ningún valor, se han modificado para que devuelvan la información sobre el proceso que se debe devolver al cliente. Por ejemplo, la función correspondiente a añadir una nota devolverá una cadena indicando si se ha podido crear la nota o si por el contrario la nota ya existía, la función de listar notas devolverá un array de tuplas nombre-color que permitirá al cliente imprimir el título de cada nota con su correspondiente color, y la función de lectura devuelve el contenido de la nota. 

Código de la clase:

~~~ typescript
/**
 * Clase para manipular notas
 */
export class NoteClass {
    /**
     * Constructor de la clase. Recibe el nombre del usuario cuyas notas serán manipuladas.
     * @param user Usuario cuyas notas serán manipuladas
     */
    constructor(private user:string){}

    /**
     * Dadas las propiedades de una nota, genera una cadena String con dicha información representada con la sintaxis de JSON.
     * @param title Título de la nota
     * @param body Contenido de la nota
     * @param color Color con el que imprimir la nota
     */
    getJSON(title:string, body:string, color:string){
        return `{\n\t\"title\":\"${title}\",\n\t\"body\":\"${body}\",\n\t\"color\":\"${color}\"\n}`;
    }
    /**
     * Crea una nueva nota que se almacena en un fichero JSON. Si la nota ya existe emite un mensaje de error.
     * @param title Título de la nota
     * @param body Contenido de la nota
     * @param color Color con el que imprimir la nota
     */
    addNote(title:string, body:string, color:string){
        if(!filesys.existsSync(`./files/${this.user}`)){
            filesys.mkdirSync(`./files/${this.user}`);
        }
        if (filesys.existsSync(`./files/${this.user}/${title}.json`)){
            return("The note already exists!");
        } else {
            filesys.writeFileSync(`./files/${this.user}/${title}.json`, this.getJSON(title, body, color));
            return("Succesfully created!");
        }
    }
    /**
     * Borra una nota. Si la nota no existe emite un mensaje de error.
     * @param title Título de la nota
     */
    rmNote(title:string){
        if (filesys.existsSync(`./files/${this.user}/${title}.json`)){
            filesys.rmSync(`./files/${this.user}/${title}.json`);
            return "Note removed";
        } else {
            return "That note does not exist.";
        }
    }
    /**
     * Lista todas las notas del usuario imprimiendo el nombre de cada nota con el color indicado en su contenido.
     */
    lsNote(){
        let result: [string, string][] = [];
        if(!filesys.existsSync(`./files/${this.user}`)){
            result.push([`User ${this.user} has no notes`, "red"]);
            return result;
        } else {
            if(filesys.readdirSync(`./files/${this.user}`).length == 0){
                result.push([`User ${this.user} has no notes`, "red"]);
                return result;
            } else {
                console.log(chalk.green(`Notes of ${this.user}: \n`));
                filesys.readdirSync(`./files/${this.user}`).forEach((elem) => {
                    let jsonobj = JSON.parse(String(filesys.readFileSync(`./files/${this.user}/${elem}`)));
                    switch (jsonobj.color) {
                        case "red":
                            result.push([jsonobj.title, "red"]);
                            break;
                        case "blue":
                            result.push([jsonobj.title, "blue"]);
                            break;
                        case "green":
                            result.push([jsonobj.title, "green"]);
                            break;
                        case "yellow":
                            result.push([jsonobj.title, "yellow"]);
                            break;
                        default:
                            result.push(["The color of this note is not valid: " + jsonobj.title, "red"]);
                            break;
                    }
                });
                return result;
            }
        }
    }
    /**
     * Lee una nota. Si la nota no existe emite un mensaje de error.
     * @param title Título de la nota.
     */
    readNote(title:string){
        if (filesys.existsSync(`./files/${this.user}/${title}.json`)){
            let jsonobj = JSON.parse(String(filesys.readFileSync(`./files/${this.user}/${title}.json`)));
            return [jsonobj.title + "\n" + jsonobj.body, jsonobj.color];
        } else {
            console.log(chalk.red("That note does not exist."));
            return ["That note does not exist", "red"];
        }
    }
    /**
     * Modifica una nota. Si la nota no existe emite un mensaje de error.
     * @param title Título de la nota
     * @param ntitle Opcional - Nuevo título.
     * @param body Opcional - Nuevo body.
     * @param color Opcional - Nuevo color
     */
    modifyNote(title:string, ntitle:string|unknown, body:string|unknown, color:string|unknown){
        if (filesys.existsSync(`./files/${this.user}/${title}.json`)){
            let jsonobj = JSON.parse(String(filesys.readFileSync(`./files/${this.user}/${title}.json`)));
            if (ntitle != undefined){
                jsonobj.title = String(ntitle);
            }
            if (body != undefined){
                jsonobj.body = String(body);
            }
            if (color != undefined){
                jsonobj.color = String(color);
            }
            filesys.rmSync(`./files/${this.user}/${title}.json`);
            filesys.writeFileSync(`./files/${this.user}/${jsonobj.title}.json`, this.getJSON(jsonobj.title, jsonobj.body, jsonobj.color));
            return "Succesfully modified!";
        } else {
            return "That note does not exist.";
        }
    }
}
~~~

Un recordatorio rápido de lo que hace cada función:

* **addNote:** Comprueba si una nota existe, de ser así devuelve un mensaje de error. En caso contrario crea la nota y devuelve un mensaje de confirmación.
* **rmNote:** Comprueba si una nota existe, de ser así la elimina y devuelve un mensaje de confirmación. En caso contrario devuelve un mensaje de error.
* **lsNote:** En caso de que el directorio del usuario exista, lee el contenido del directorio y devuelve un array de tuplas “Título de la nota” - “Color de la nota”. Si el directorio no existe o está vacío, el array a devolver tendrá una única tupla formada por un mensaje de error y el color de impresión, que será rojo.
* **readNote:** En caso de que el fichero exista, devuelve una tupla “Título + salto de línea + Body” - “Color de la nota”. En caso de que el fichero no exista, la tupla a devolver estará formada por un mensaje de error y un color de impresión rojo.
* **modNote:** Recibe valores para modificar una nota. Si la nota puede ser modificada correctamente, devuelve un mensaje de confirmación. En caso contrario, devuelve un mensaje de error.

## Clase ClientEE:

La clase ClientEE permite instanciar objetos cliente, cuyo propósito es establecer conexión con un servidor, realizar peticiones e imprimir el contenido relacionado con la clase notas devuelto por el servidor. Esta clase hereda de EventEmitter, por lo que es posible emitir eventos para comprobar posteriormente su funcionamiento mediante pruebas.

~~~ typescript
/**
 * Define el formato de una petición al servidor
 */
export type RequestType = {
    type: 'add' | 'rm' | 'ls' | 'read' | 'mod';
    user: string;
    title?: string;
    ntitle?: string;
    body?: string;
    color?: string;
}

/**
 * Clase Cliente - Permite crear objetos cliente que hagan peticiones a un servidor y procesen las respuestas.
 */
export class ClientEE extends EventEmitter{
    public client: any;
    /**
     * Constructor de la clase. Establece la conexión con el servidor y define qué código ejecutar ante posibles eventos.
     * @param pt Puerto de conexión
     */
    constructor(pt: number){
        super();
        let wholeData = '';
        this.client = connect({port: pt});
        this.client.on('data', (values:any) => {
            wholeData = wholeData + String(values);
        });

        this.client.on('end', (values:any) => {
            console.log("Conexión finalizada");
            this.client.emit('fullmess', JSON.parse(wholeData));
            this.emit('fullmess', JSON.parse(wholeData));
        });

        this.client.on('fullmess', (objJSON: any) => {
            if(objJSON.type === "stateResponse"){
                console.log(objJSON.state);
            } else if(objJSON.type === "noteResponse") {
                switch (objJSON.state[1]) {
                    case "red":
                        console.log(chalk.red(objJSON.state[0]));
                        break;
                    case "blue":
                        console.log(chalk.blue(objJSON.state[0]));
                        break;
                    case "green":
                        console.log(chalk.green(objJSON.state[0]));
                        break;
                    case "yellow":
                        console.log(chalk.yellow(objJSON.state[0]));
                        break;
                    default:
                        console.log(chalk.red("The color of this note is not valid"));
                        break;
                }
            } else if (objJSON.type === "listResponse"){
                objJSON.state.forEach((elem:any) => {
                    switch (elem[1]) {
                        case "red":
                            console.log(chalk.red(elem[0]));
                            break;
                        case "blue":
                            console.log(chalk.blue(elem[0]));
                            break;
                        case "green":
                            console.log(chalk.green(elem[0]));
                            break;
                        case "yellow":
                            console.log(chalk.yellow(elem[0]));
                            break;
                        default:
                            console.log(chalk.red("The color of this note is not valid"));
                            break;
                    }
                });
            }
        });
    }

    /**
     * Envía una petición al servidor.
     * @param objJSON Objeto con la información de la petición
     */
    sendtoserv(objJSON: RequestType){
        console.log('Se está enviando:');
        console.log(objJSON);
        this.client.write(JSON.stringify(objJSON) + '\n');
    }
}
~~~

El constructor de la clase recibe como parámetro un número de puerto, al que se conectará mediante la función **connect** del módulo net de Node. El socket que ha abierto la conexión al ejecutar **connect** será almacenado como atributo de la clase. A continuación, se definen los siguientes manejadores de eventos:

* **data:** Cuando el cliente recibe información a través del socket, este contenido se concatena a una cadena cuyo valor inicial es el de cadena vacía. Esto permite recomponer un mensaje si se emite fraccionado.
* **end:** Cuando se recibe un evento end el cliente parsea el contenido de la respuesta como un objeto JSON, contenido en la cadena wholeData, pues se entiende que ya no quedan más paquetes por enviar. A continuación, se emite un evento “fullmess”, junto con el objeto JSON parseado.
* **fullmess:** Recibe un objeto JSON con la respuesta a la petición en formato JSON. Esta respuesta puede ser del tipo “stateResponse”, que contiene una cadena con información de la petición, “listResponse”, que contiene una lista de tuplas “Valor” - “Color”, o “noteResponse”, que contiene una tupla “Contenido de la nota” - “Color”. Se empleará el valor de type para imprimir por pantalla adecuadamente el contenido de la respuesta.

El único método de la clase a parte del constructor es **sendtoserv**, que envía un mensaje de petición al servidor. Esto es posible porque el socket empleado para establecer conexión con el servidor está almacenado como atributo público de la clase, luego es accesible por esta función.

## Clase ServerEE

La clase ServerEE permite instanciar objetos servidor, que podrán ponerse a la escucha en un puerto para recibir, procesar, y emitir respuesta ante peticiones enviadas por un cliente. Para procesar las operaciones relacionadas con la manipulación de notas, esta clase se apoya en la clase NoteClass. Además, esta clase hereda de EventEmitter, por lo que es posible emitir eventos para comprobar posteriormente su funcionamiento mediante pruebas.

~~~ typescript
export class ServerEE extends EventEmitter{
    public server: any;

    /**
     * Constructor de la clase. Crea un objeto server y define qué código ejecutar ante posibles eventos.
     */
    constructor(){
        super();

        this.server = net.createServer((connection) => {
            console.log("Conexión establecida");
            let wholeData = '';

            connection.on('data', (values) => {
                wholeData = wholeData + String(values);
                if(wholeData.indexOf('\n') !== -1){
                    wholeData = wholeData.slice(0, wholeData.indexOf('\n'));
                    connection.emit('fullmess', JSON.parse(wholeData));
                    this.emit('fullmess', JSON.parse(wholeData));
                    wholeData = '';
                }
            });

            connection.on('fullmess', (objJSON) => {
                switch (objJSON.type) {
                    case "add":
                        connection.emit('addEvent', objJSON);
                        this.emit('addEvent', objJSON);
                        break;
                    case "rm":
                        connection.emit('rmEvent', objJSON);
                        this.emit('rmEvent', objJSON);
                        break;
                    case "ls":
                        connection.emit('lsEvent', objJSON);
                        this.emit('lsEvent', objJSON);
                        break;
                    case "mod":
                        connection.emit('modEvent', objJSON);
                        this.emit('modEvent', objJSON);
                        break;
                    case "read":
                        connection.emit('readEvent', objJSON);
                        this.emit('readEvent', objJSON);
                        break;
                    default:
                        connection.emit('errEvent', objJSON);
                        this.emit('errEvent', objJSON);
                        break;
                }
            });

            connection.on('addEvent', (objJSON) => {
                let nota = new NoteClass(objJSON.user);
                let result = "";
                result = nota.addNote(String(objJSON.title), String(objJSON.body), String(objJSON.color));
                console.log("Petición add");
                connection.write(JSON.stringify({type: "stateResponse", state: result}));
                connection.end();
            });
            connection.on('rmEvent', (objJSON) => {
                let nota = new NoteClass(objJSON.user);
                let result = "";
                result = nota.rmNote(String(objJSON.title));
                console.log("Petición rm");
                connection.write(JSON.stringify({type: "stateResponse", state: result}));
                connection.end();
            });
            connection.on('lsEvent', (objJSON) => {
                let nota = new NoteClass(objJSON.user);
                let result = [];
                result = nota.lsNote();
                console.log("Petición ls");
                connection.write(JSON.stringify({type: "listResponse", state: result}));
                connection.end();
            });
            connection.on('modEvent', (objJSON) => {
                let nota = new NoteClass(objJSON.user);
                let result = "";

                result = nota.modifyNote(String(objJSON.title), String(objJSON.ntitle), String(objJSON.body), String(objJSON.color));
                console.log("Petición mod");
                connection.write(JSON.stringify({type: "stateResponse", state: result}));
                connection.end();
            });
            connection.on('readEvent', (objJSON) => {
                let nota = new NoteClass(objJSON.user);
                let result:any = {};
                result = nota.readNote(String(objJSON.title));
                console.log("Petición Read");
                connection.write(JSON.stringify({type: "noteResponse", state: result}));

                connection.end();
            });
            connection.on('errEvent', (objJSON) => {
                console.log("Error en la petición");
                connection.write(JSON.stringify({type: "stateResponse", state: "Error"}));
                connection.end();
            });
            connection.on('close', () => {
                console.log("A client has disconected");
            });
        });
    }
    /**
     * Pone en escucha el servidor en un puerto indicado por el usuario
     * @param port Número del puerto
     */
    listen(port: number){
        this.server.listen(port, () => {
            console.log("Server a la escucha...");
        });
    }
}
~~~

Esta clase cuenta con dos métodos:
* El constructor: En este método se almacena como atributo de la clase el objeto socket que empleará el servidor para atender peticiones. Para ello emplea la función createServer, del módulo net de Node. Adicionalmente, se definen los manejadores a ejecutar ante determinados eventos.
* El método **listen:** Recibe como parámetro un número de puerto. El método pone el servidor a la escucha en el puerto indicado por el parámetro. Esto es posible dado que el socket encargado de atender las peticiones de los clientes es almacenado como atributo de la clase en el constructor.

Los eventos que gestiona la clase son los siguientes:

* **data:** Cuando el server recibe una petición, almacena el contenido en un buffer “wholeData”. Dado que un mensaje puede llegar fraccionado, el server procesa un mensaje únicamente cuando la cadena recibida contiene un carácter ‘\n’, que se interpreta como “fin del mensaje”. De esta forma, cuando se recibe una cadena con ‘\n’ se emite un evento “fullmess” junto con el objeto JSON parseado.
* **fullmess:** Recibe la petición como parámetro. Depende de la propiedad **type** de la petición (add, rm, mod, ls, read) se emite un nuevo evento distinto (addNote, rmNote, modNote, lsNote, readNote, errEvent).
* **addEvent:** Ante este evento, se invoca a la función de crear nota de la clase NoteClass con los parámetros indicados en la petición del cliente
* **rmEvent:** Ante este evento, se invoca a la función de eliminar una nota de la clase NoteClass con los parámetros indicados en la petición del cliente
* **modEvent:** Ante este evento, se invoca a la función de modificar una nota de la clase NoteClass con los parámetros indicados en la petición del cliente
* **readEvent:** Ante este evento, se invoca a la función de leer una nota de la clase NoteClass con los parámetros indicados en la petición del cliente
* **lsEvent:** Ante este evento, se invoca a la función de listar notas de la clase NoteClass con los parámetros indicados en la petición del cliente

Además, en los 5 eventos anteriores (addEvent - readEvent), se envía al cliente la respuesta a la petición y, a continuación,  se cierra la conexión con el cliente para finalizar. 

* **errEvent:** El manejador de este evento se ejecuta cuando el tipo de mensaje enviado en la petición no es válido. Envía una respuesta al cliente notificando este hecho y finaliza la conexión.

## Github Actions:

## Integración continua: GitHub Actions.

Las GitHub actions nos permiten ejecutar una serie de acciones cuando se detecta un cambio en el repositorio (push o pull request), que emplearemos para comprobar cómo han afectado los cambios al código. Para usar las GitHub Actions debemos haber creado, ya sea manualmente o desde la página, una carpeta .github/workflows. Además, deberemos instalar como dependencias de desarrollo todos los paquetes que tengamos instalados de forma global en la máquina y que estemos empleando en el proyecto, ya que las actions se ejecutarán en máquinas virtuales que instalarán las dependencias especificadas en el package.json antes de ejecutar los pasos especificados.

En nuestro caso, emplearemos las GitHub Actions para comprobar los tests y lanzar coveralls y SonarCloud:

### Tests:

Para ejecutar los tests debemos añadir el siguiente fichero yml a la carpeta workflows:

~~~
# This workflow will do a clean install of node dependencies, build the source code and run tests across different versions of node
# For more information see: https://help.github.com/actions/language-and-framework-guides/using-nodejs-with-github-actions

name: Tests

on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]

jobs:
  build:

    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [14.x, 15.x]
        # See supported Node.js release schedule at https://nodejs.org/en/about/releases/

    steps:
    - uses: actions/checkout@v2
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v2
      with:
        node-version: ${{ matrix.node-version }}
    - run: npm install
    - run: npm test

~~~

### Coveralls:

Para realizar las pruebas de cubrimiento del código de Coveralls deberemos incluir el siguiente código en un fichero yml en la carpeta workflows:

~~~
name: Coveralls

on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]

jobs:
  coveralls:

    runs-on: ubuntu-latest

   
    steps:
    - name: Cloning repo
      uses: actions/checkout@v2
    - name: Use Node.js 15.x
      uses: actions/setup-node@v2
      with:
        node-version: 15.x
    - name: Installing dependencies
      run: npm install
    - name: Generating coverage information
      run: npm run coverage
    - name: Coveralls GitHub Action
      uses: coverallsapp/github-action@master
      with:
        github-token: ${{ secrets.GITHUB_TOKEN }}

~~~

En este caso los pasos se ejecutarán sólo en la versión 15.x de Node. Tras instalar las dependencias ejecuta el comando coverage de nuestro package.json, que emplea istambul para generar un fichero con la información de cubrimiento que empleará coveralls. A continuación se hace uso de la GitHub Action de Coveralls.

### SonarCloud:

SonarCloud es una herramienta que nos permite visualizar estadísticas del código que estamos desarrollando. Para incluir un flujo de trabajo de SonarCloud en nuestro repositorio debemos acceder a la página de Sonar Cloud y desactivar la opción de análisis automático, accediendo a continuación a la opción de “seguir el tutorial” que nos muestra la página inmediatamente después. Este tutorial consiste en añadir a nuestro repo un secreto de SonarCloud y los siguientes ficheros:

En workflows, sonarcloud.yml:
~~~
name: Sonar-Cloud

on:
  push:
    branches:
      - master
  pull_request:
    branches:
      - master

jobs:
  sonarcloud:
    name: SonarCloud
    runs-on: ubuntu-latest
    steps:
      - name: Cloning Repo
        uses: actions/checkout@v2
        with:
          fetch-depth: 0  # Shallow clones should be disabled for a better relevancy of analysis
      - name: Uses Node.js
        uses: actions/setup-node@v1
        with:
          node-version: 15.x
      - name: Installing dependencies
        run: npm install
      - name: Generating coverage report
        run: npm run coverage
      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}  # Needed to get PR information, if any
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

~~~

En la carpeta raiz, sonar-project.properties:

~~~
sonar.projectKey=ULL-ESIT-INF-DSI-2021_ull-esit-inf-dsi-20-21-prct10-async-sockets-alu0101209500
sonar.organization=ull-esit-inf-dsi-2021

# This is the name and version displayed in the SonarCloud UI.
sonar.projectName=ull-esit-inf-dsi-20-21-prct10-async-sockets-alu0101209500
sonar.projectVersion=1.0

# Path is relative to the sonar-project.properties file. Replace "\" by "/" on Windows.
sonar.sources=src

# Encoding of the source code. Default is default system encoding
sonar.sourceEncoding=UTF-8

# Coverage info
sonar.javascript.lcov.reportPaths=coverage/lcov.info
~~~

Es importante tener en cuenta que para que todo esto funcione correctamente el repositorio debe tener visibilidad pública.

