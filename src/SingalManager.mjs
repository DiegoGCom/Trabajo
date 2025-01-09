/*Esta clase es una clase mediadora, otras clases se "suscriben" a sus señales, 
cediendo un comportamiento(método); cuando la señal se emite, se propaga a aquellas
clases que estén suscritas y llama a sus respectivos callbacks */

export class SignalManager {
    constructor() {
        /*Con Map se garantiza que solo pueda haber una señal con el mismo nombre*/
        this.listeners = new Map();
    }
    /*Recibimos la señal emitida con los argumentos necesarios para 
    ejecutar el callback */
    emit(signal, ...args) {
        /*Si la señal existe se llama a los callbacks de cada clase que se haya
        suscrito pasando los argumentos */
        if (this.listeners.has(signal)) {
            this.listeners.get(signal).forEach(listener => listener(...args));
        }
    }
    /*Este método recibe la señal y la guarda en el Map listeners,
    por cada señal puede recibir los comportamientos(métodos) de aquellas clases
    que quieran responder a la emisión de la señal */
    /*CUIDADO con el contexto del callback, se usa .bind(this) para que el callback
    quede ligado al contexto de la clase propietaria */
    on(signal, callback) {
        //Añadimos la señal al Map
        if (!this.listeners.has(signal)) this.listeners.set(signal, []);
        //Añadimos el callback a la señal
        this.listeners.get(signal).push(callback);
    }

    /*Elimina un callback de una señal*/
    off(signal, callback) {
        if (this.listeners.has(signal)) {
            const listeners = this.listeners.get(signal);
            const index = listeners.indexOf(callback);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }
}