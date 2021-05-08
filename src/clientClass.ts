import {EventEmitter} from 'events';
import * as yargs from 'yargs';
import {connect} from 'net';
import * as chalk from 'chalk';

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