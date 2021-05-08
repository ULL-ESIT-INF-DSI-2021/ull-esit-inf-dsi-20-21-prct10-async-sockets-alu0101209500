import * as filesys from "fs";
import * as chalk from "chalk";

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