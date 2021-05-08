import "mocha";
import {expect} from "chai";
import {NoteClass} from "../src/noteClass";
import * as filesys from "fs";

let note = new NoteClass('Pruebas');
filesys.readdirSync('./files/Pruebas').forEach((elem) => {
  filesys.rmSync(`./files/Pruebas/${elem}`);
});
describe('Note Class:', () =>{
  it('Se debe poder crear una nota', () =>{
    expect(filesys.existsSync(`./files/Pruebas/Nota.json`)).to.be.eq(false);
    expect(note.addNote('Nota', 'Body', 'red')).to.be.eq("Succesfully created!");
    expect(filesys.existsSync(`./files/Pruebas/Nota.json`)).to.be.eq(true);
    expect(note.addNote('Nota', 'Body', 'red')).to.be.eq("The note already exists!");
  });
  it('Se debe poder eliminar una nota', () =>{
    expect(filesys.existsSync(`./files/Pruebas/Nota.json`)).to.be.eq(true);
    expect(note.rmNote('Nota')).to.be.eq("Note removed");
    expect(filesys.existsSync(`./files/Pruebas/Nota.json`)).to.be.eq(false);
    expect(note.rmNote('Nota')).to.be.eq("That note does not exist.");
    expect(filesys.existsSync(`./files/Pruebas/Nota.json`)).to.be.eq(false);
  });
  it('Se debe poder modificar una nota', () =>{
    expect(note.addNote('Nota', 'Body', 'red')).to.be.eq("Succesfully created!");
    expect(note.modifyNote('EstaNoExiste', 'NuevoTítulo', 'New Body', 'green')).to.be.eq("That note does not exist.");
    expect(note.modifyNote('Nota', 'NuevoTítulo', 'New Body', 'red')).to.be.eq("Succesfully modified!");
    expect(note.modifyNote('NuevoTítulo', undefined, undefined, 'green')).to.be.eq("Succesfully modified!");
    expect(filesys.existsSync(`./files/Pruebas/NuevoTítulo.json`)).to.be.eq(true);
    let jsonobj = JSON.parse(String(filesys.readFileSync(`./files/Pruebas/NuevoTítulo.json`)));
    expect((jsonobj.body)).to.be.eq('New Body');
    expect((jsonobj.color)).to.be.eq('green');
  });
  it('Se debe poder listar los ficheros', () =>{
    expect(note.lsNote()[0][1]).to.be.eq("green");
    filesys.rmSync(`./files/Pruebas/NuevoTítulo.json`);
    expect(note.lsNote()[0][0]).to.be.eq("User Pruebas has no notes");
    expect(note.addNote('NuevoTítulo', 'New Body', 'green')).to.be.eq("Succesfully created!");
    expect(note.addNote('Nota1', 'New Body', 'red')).to.be.eq("Succesfully created!");
    expect(note.addNote('Nota2', 'New Body', 'blue')).to.be.eq("Succesfully created!");
    expect(note.addNote('Nota3', 'New Body', 'yellow')).to.be.eq("Succesfully created!");
    expect(note.addNote('Nota4', 'New Body', 'unvalid')).to.be.eq("Succesfully created!");
    expect(note.lsNote()[0][1]).to.be.eq("red");
  });
  it('Se debe poder leer un fichero', () =>{
    expect(note.readNote('NuevoTítulo')[0]).to.be.eq("NuevoTítulo\nNew Body");
    filesys.rmSync(`./files/Pruebas/NuevoTítulo.json`);
    expect(note.readNote('NuevoTítulo')[0]).to.be.eq("That note does not exist");
    expect(note.readNote('Nota1')[0]).to.be.eq("Nota1\nNew Body");
    expect(note.readNote('Nota2')[0]).to.be.eq("Nota2\nNew Body");
    expect(note.readNote('Nota3')[0]).to.be.eq("Nota3\nNew Body");
    expect(note.readNote('Nota4')[0]).to.be.eq("Nota4\nNew Body");
  });
  it('Se debe poder obtener un string en formato JSON', () =>{
    expect(note.getJSON('Title', 'Body', 'red')).to.be.eq(`{\n\t\"title\":\"Title\",\n\t\"body\":\"Body\",\n\t\"color\":\"red\"\n}`);
  });
});