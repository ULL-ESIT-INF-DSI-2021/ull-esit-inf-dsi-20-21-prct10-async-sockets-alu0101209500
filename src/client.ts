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


// ---------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------


yargs.command({
    command: 'add',
    describe: 'Add a new note',
    builder: {
      p: {
        describe: 'Port',
        demandOption: true,
        type: 'number',
      },
      title: {
        describe: 'Note title',
        demandOption: true,
        type: 'string',
      },
      user: {
        describe: 'User name',
        demandOption: true,
        type: 'string',
      },
      body: {
        describe: 'Content of the note',
        demandOption: true,
        type: 'string',
      },
      color: {
        describe: 'Color used to print the note',
        demandOption: true,
        type: 'string',
      },
    },
    handler(argv) {
      if ((typeof argv.title === 'string')&&(typeof argv.user === 'string')&&(typeof argv.p === 'number')&&(typeof argv.body === 'string')&&(typeof argv.color === 'string')) {
        if (["red", "green", "blue", "yellow"].filter((v) => (v == argv.color)).length > 0){
            let myClient: ClientEE = new ClientEE(argv.p);
            myClient.sendtoserv({type: "add", user: argv.user, title: argv.title, body: argv.body, color: argv.color});
        } else {
            console.log(chalk.red("Color not valid"));
        }
      }
      else{
        console.log(chalk.red("Invalid type for the params"));
      }
    },
  });


/**
 * Remove an existing note command
 */
yargs.command({
    command: 'rm',
    describe: 'Remove a note',
    builder: {
      p: {
        describe: 'Port',
        demandOption: true,
        type: 'number',
      },
      title: {
        describe: 'Note title',
        demandOption: true,
        type: 'string',
      },
      user: {
        describe: 'User name',
        demandOption: true,
        type: 'string',
      },
    },
    handler(argv) {
      if ((typeof argv.title === 'string')&&(typeof argv.user === 'string')&&(typeof argv.p === 'number')) {
        const myClient = new ClientEE(argv.p).sendtoserv({type: "rm", user: argv.user, title: argv.title});
      }
      else{
        console.log(chalk.red("Invalid type for the params"));
      }
    },
  });

/**
 * Modifies a note command
 */
yargs.command({
    command: 'mod',
    describe: 'Modify an existing',
    builder: {
      p: {
        describe: 'Port',
        demandOption: true,
        type: 'number',
      },
      title: {
        describe: 'Note title',
        demandOption: true,
        type: 'string',
      },
      user: {
        describe: 'User name',
        demandOption: true,
        type: 'string',
      },
      ntitle: {
        describe: 'New title',
        demandOption: false,
        type: 'string',
      },
      body: {
        describe: 'Content of the note',
        demandOption: false,
        type: 'string',
      },
      color: {
        describe: 'Color used to print the note',
        demandOption: false,
        type: 'string',
      },
    },
    handler(argv) {
      if ((typeof argv.title === 'string')&&(typeof argv.user === 'string')&&(typeof argv.p === 'number')) {
        if (argv.color == undefined || ["red", "green", "blue", "yellow"].filter((v) => (v == argv.color)).length > 0){
            let dummy: RequestType = {
                type: "mod",
                user: "",
            };
            dummy.title = argv.title;
            dummy.user = argv.user;
            if(argv.ntitle !== undefined){
                dummy.ntitle = String(argv.ntitle);
            }
            if(argv.body !== undefined){
                dummy.body = String(argv.body);
            }
            if(argv.color !== undefined){
                dummy.color = String(argv.color);
            }
            const myClient = new ClientEE(argv.p).sendtoserv(dummy);
        } else {
            console.log(chalk.red("Color not valid"));
        }
      }
      else{
        console.log(chalk.red("Invalid type for the params"));
      }
    },
  });

/**
 * Print list of notes command
 */
yargs.command({
    command: 'ls',
    describe: 'List the notes of a user',
    builder: {
      p: {
        describe: 'Port',
        demandOption: true,
        type: 'number',
      },
      user: {
        describe: 'User name',
        demandOption: true,
        type: 'string',
      },
    },
    handler(argv) {
      if ((typeof argv.user === 'string') && (typeof argv.p === 'number')) {
        const myClient = new ClientEE(argv.p).sendtoserv({type: "ls", user: argv.user});
      }
      else{
        console.log(chalk.red("Invalid type for the params"));
      }
    },
  });

/**
 * Read a note command
 */
yargs.command({
    command: 'read',
    describe: 'Read a note',
    builder: {
      p: {
        describe: 'Port',
        demandOption: true,
        type: 'number',
      },
      title: {
        describe: 'Note title',
        demandOption: true,
        type: 'string',
      },
      user: {
        describe: 'User name',
        demandOption: true,
        type: 'string',
      },
    },
    handler(argv) {
      if ((typeof argv.title === 'string')&&(typeof argv.user === 'string')&&(typeof argv.p === 'number')) {
        const myClient = new ClientEE(argv.p).sendtoserv({type: "read", user: argv.user, title: argv.title});
      }
      else{
        console.log(chalk.red("Invalid type for the params"));
      }
    },
  });
  yargs.parse();
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
