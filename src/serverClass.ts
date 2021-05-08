import {EventEmitter} from 'events';
import {NoteClass} from './noteClass';
import * as net from 'net';

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