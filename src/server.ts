import {EventEmitter} from 'events';
import {NoteClass} from './noteClass';
import * as net from 'net';

export class ServerEE extends EventEmitter{
    public server: any;
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
                console.log(objJSON.type);
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
                console.log("Ha entrado en add:");
                console.log(objJSON);
                connection.write(JSON.stringify({type: "stateResponse", state: result}));
                connection.end();
                console.log("Conexión finalizada");
            });
            connection.on('rmEvent', (objJSON) => {
                let nota = new NoteClass(objJSON.user);
                let result = "";
                result = nota.rmNote(String(objJSON.title));
                console.log("Ha entrado en rm");
                console.log(objJSON);
                connection.write(JSON.stringify({type: "stateResponse", state: result}));
                connection.end();
                console.log("Conexión finalizada");
            });
            connection.on('lsEvent', (objJSON) => {
                let nota = new NoteClass(objJSON.user);
                let result = [];
                result = nota.lsNote();
                console.log("Ha entrado en ls");
                console.log(objJSON);
                connection.write(JSON.stringify({type: "listResponse", state: result}));
                connection.end();
                console.log("Conexión finalizada");
            });
            connection.on('modEvent', (objJSON) => {
                let nota = new NoteClass(objJSON.user);
                let result = "";

                result = nota.modifyNote(String(objJSON.title), String(objJSON.ntitle), String(objJSON.body), String(objJSON.color));
                console.log("Ha entrado en mod");
                console.log(objJSON);
                connection.write(JSON.stringify({type: "stateResponse", state: result}));
                connection.end();
                console.log("Conexión finalizada");
            });
            connection.on('readEvent', (objJSON) => {
                let nota = new NoteClass(objJSON.user);
                let result:any = {};
                result = nota.readNote(String(objJSON.title));
                console.log("Ha entrado en read");
                console.log(objJSON);
                connection.write(JSON.stringify({type: "noteResponse", state: result}));

                connection.end();
                console.log("Conexión finalizada");
            });
            connection.on('errEvent', (objJSON) => {
                console.log("Ha entrado en error");
                console.log(objJSON);
                connection.write(JSON.stringify({type: "stateResponse", state: "Error"}));
                connection.end();
                console.log("Conexión finalizada");
            });
        });
    }

    listen(port: number){
        this.server.listen(60300, () => {
            console.log("Server a la escucha...");
        });
    }
}

/*
server.listen(60300, () => {
    console.log("Server a la escucha...");
});
*/

const myServ = new ServerEE();
myServ.listen(60300);
myServ.on("fullmess", (objJSON) => {
    console.log("HE PILLAO EL EVENTO");
});
myServ.on("addEvent", (objJSON) => {
    console.log("EVENTO ADD");
});