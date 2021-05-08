import "mocha";
import {expect} from "chai";
import {ServerEE} from "../src/serverClass";
import * as filesys from "fs";
import * as net from "net";

describe('Server Class:', () =>{
  it('Se debe poder crear una nota a través del servidor', (done) =>{
    const serv = new ServerEE();
    serv.listen(60300);
    serv.on('addEvent', (data) => {
        expect(data.type).to.be.eq('add');
        // serv.server.close();
        done();
    });
    let socket = net.connect({port: 60300});
    socket.write(JSON.stringify({type: "add", user: "Tests", title: "Nota1", body: "Nuevo Body", color: "red"}) + '\n');

    socket.on('data', (data) => {
        serv.server.close();
    });
  });
  it('Se debe poder eliminar una nota a través del servidor', (done) =>{
    const serv = new ServerEE();
    serv.listen(60301);
    serv.on('rmEvent', (data) => {
        expect(data.type).to.be.eq('rm');
        done();
    });
    let socket = net.connect({port: 60301});
    socket.write(JSON.stringify({type: "rm", user: "Tests", title: "Nota1"}) + '\n');

    socket.on('data', (data) => {
        serv.server.close();
    });
  });
  it('Se debe poder modificar una nota a través del servidor', (done) =>{
    const serv = new ServerEE();
    serv.listen(60302);
    serv.on('modEvent', (data) => {
        expect(data.type).to.be.eq('mod');
        done();
    });
    let socket = net.connect({port: 60302});
    socket.write(JSON.stringify({type: "mod", user: "Tests", title: "Nota1"}) + '\n');

    socket.on('data', (data) => {
        serv.server.close();
    });
  });
  it('Se debe listar un directorio de Usuario a través del servidor', (done) =>{
    const serv = new ServerEE();
    serv.listen(60303);
    serv.on('lsEvent', (data) => {
        expect(data.type).to.be.eq('ls');
        done();
    });
    let socket = net.connect({port: 60303});
    socket.write(JSON.stringify({type: "ls", user: "Tests"}) + '\n');

    socket.on('data', (data) => {
        serv.server.close();
    });
  });
  it('Se debe poder leer una nota a través del servidor', (done) =>{
    const serv = new ServerEE();
    serv.listen(60304);
    serv.on('readEvent', (data) => {
        expect(data.type).to.be.eq('read');
        done();
    });
    let socket = net.connect({port: 60304});
    socket.write(JSON.stringify({type: "read", user: "Tests", title: "Nota1"}) + '\n');

    socket.on('data', (data) => {
        serv.server.close();
    });
  });
  it('Se debe notificar los errores', (done) =>{
    const serv = new ServerEE();
    serv.listen(60305);
    serv.on('errEvent', (data) => {
        expect(data.type).to.be.eq('noExisteEsteTipoDePeticion');
        done();
    });
    let socket = net.connect({port: 60305});
    socket.write(JSON.stringify({type: "noExisteEsteTipoDePeticion", user: "Tests", title: "Nota1"}) + '\n');

    socket.on('data', (data) => {
        serv.server.close();
    });
  });
});