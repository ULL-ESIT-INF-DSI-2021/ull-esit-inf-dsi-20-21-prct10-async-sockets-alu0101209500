import {EventEmitter} from 'events';
import * as yargs from 'yargs';
import {connect} from 'net';
import * as chalk from 'chalk';


export type RequestType = {
    type: 'add' | 'rm' | 'ls' | 'read' | 'mod';
    user: string;
    title?: string;
    ntitle?: string;
    body?: string;
    color?: string;
}

export class ClientEE extends EventEmitter{
    public client: any;
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

    sendtoserv(objJSON: RequestType){
        console.log('Se está enviando:');
        console.log(objJSON);
        this.client.write(JSON.stringify(objJSON) + '\n');
    }
}

/*
let client = connect({port: 60300});
let client2 = connect({port: 60300});


client.write("{\"type\": \"add\", \"color\":");

const timer = setTimeout(() => {
    client2.write("{\"type\":\"rm\"}\n");
    client.write("\"blue\"}\n");
    client2.on('data', (data) => {
        console.log("Por aquí llegó");
    });
}, 4000);

client.on('data', (data) => {
    console.log("Ha llegao");
});
*/
