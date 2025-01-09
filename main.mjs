import { DataStorageManager } from "./src/DataStorageManager.mjs";
import { FormManager } from "./src/FormManager.mjs";
import { ModalManager } from "./src/ModalManager.mjs";
import { SignalManager } from "./src/SingalManager.mjs";
import { TableManager } from "./src/TableManager.mjs";
import { UIManager } from "./src/UIManager.mjs";

document.addEventListener("DOMContentLoaded", () => {
    const uiManager = new UIManager();

    const signalManager = new SignalManager();

    ModalManager.inicializate();

    const dataStorageManager = new DataStorageManager(signalManager);
    /* Capturamos la promesa, solo cuando los datos se hayan cargado
    se instancia la clase TableManager para garantizar que todos los datos
    del .json están disponibles cuando la tabla cargue los datos en su 
    constructor*/
    dataStorageManager.dataLoaded.then(() => {
        const tableManager = new TableManager(signalManager);
    });
    const formManager = new FormManager(signalManager);
});