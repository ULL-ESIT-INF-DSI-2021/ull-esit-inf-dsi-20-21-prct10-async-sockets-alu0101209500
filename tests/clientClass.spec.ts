import "mocha";
import {expect} from "chai";
import {ClientEE} from "../src/clientClass";
import * as filesys from "fs";
import * as net from "net";

describe('Client Class:', () =>{
    it('Un cliente puede conectarse a un servidor, enviar y recibir información del estado de una petición', (done) =>{
        let serv = net.createServer((connection) => {
            connection.on('data', (data:string) => {
                expect(JSON.parse(data).type).to.be.eq("add");
                connection.write(JSON.stringify({type: "stateResponse", state: "OK"}));
                connection.end();
                done();
            });
        });
        serv.listen(60306, () => {});
        let client = new ClientEE(60306);
        client.sendtoserv({type: "add", user: "Tests"});
        client.on("fullmess", (data) => {
            serv.close();
        });
    });
    it('Un cliente puede conectarse a un servidor, enviar y recibir una nota', (done) =>{
        let serv = net.createServer((connection) => {
            connection.on('data', (data:string) => {
                let obj = JSON.stringify({title: "Ejemplo", body: "Body", color: "red"});
                connection.write(JSON.stringify({type: "noteResponse", state: obj}));
                connection.end();
            });
        });
        serv.listen(60307, () => {});
        let client = new ClientEE(60307);
        client.sendtoserv({type: "add", user: "Tests"});
        client.on("fullmess", (data) => {
            expect(JSON.parse(data.state).title).to.be.eq("Ejemplo");
            serv.close();
            done();
        });
    });
    it('Un cliente puede conectarse a un servidor, enviar y recibir una lista', (done) =>{
        let serv = net.createServer((connection) => {
            connection.on('data', (data:string) => {
                connection.write(JSON.stringify({type: "listResponse", state: [["Nota1", "red"], ["Nota2", "blue"], ["Nota3", "green"], ["Nota4", "yellow"], ["Nota5", "err"]]}));
                connection.end();
            });
        });
        serv.listen(60308, () => {});
        let client = new ClientEE(60308);
        client.sendtoserv({type: "add", user: "Tests"});
        client.on("fullmess", (data) => {
            expect(data.state.length).to.be.eq(5);
            serv.close();
            done();
        });
    });
  });
