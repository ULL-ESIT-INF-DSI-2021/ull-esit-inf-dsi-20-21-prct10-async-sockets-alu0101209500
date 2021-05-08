import * as chalk from "chalk";
import * as yargs from "yargs";
import {ClientEE, RequestType} from "./clientClass";

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