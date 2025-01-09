import { SignalManager } from "./SingalManager.mjs";

export class DataStorageManager {

    /**
     * 
     * @param {SignalManager} signalManager 
     */
    constructor(signalManager) {

        this.signalManager=signalManager;
        this.clientData = {}
        this.storageKey = 'Citas';

        signalManager.on('dataAdded',this.saveData.bind(this));
        signalManager.on('orderData', this.sendData.bind(this));
        signalManager.on('dataDeleted', this.deleteRow.bind(this));
        /* Promesa: cuando los datos se hayan cargado,
        se instanciará en el main la clase TableManager */
        this.dataLoaded=this.loadInitialDataFromFile();
    }
    /*Guardamos el array con los datos que vienen en forma de un objeto
    clave-valor donde la clave es clave única y el valor es un objeto con los
    datos del cliente */
    saveData(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Los datos deben ser de tipo object');
        }
        const currentData = this.getData();
        currentData.push(data);
        localStorage.setItem(this.storageKey, JSON.stringify(currentData));
    }
      /*Obtenemos el array guardado en caso de que exista o uno vacío */
      getData() {
        const storedData = localStorage.getItem(this.storageKey);
        return storedData ? JSON.parse(storedData) : [];
    }

    sendData(){
        this.signalManager.emit('loadingData', this.getData())
    }
    clearData() {
        localStorage.removeItem(this.storageKey);
    }

    getRow(dataKey) {
        /**
         * @type {Array}
         */
        const data = this.getData(this.storageKey);
        return data.find(item => item.storageKey === dataKey);
    }
    deleteRow(row) {
        /**
      * @type {Array}
      */
        const dataKey = row.storageKey;
        const data = this.getData();
        const index= data.findIndex(item => item.storageKey === dataKey);
        data.splice(index, 1);
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }
    /**
     * Carga datos iniciales desde un archivo `data.json` y los almacena localmente, 
     * de esta forma habrá unos datos de prueba en la tabla al cargar el proyecto y además usamos 
     * un poco la asincronía
     */
    async loadInitialDataFromFile() {
        try {
            const response = await fetch("data.json");
            if (!response.ok) {
                console.warn("No se pudo cargar el archivo data.json.");
                return;
            }

            const initialData = await response.json();
            if (!Array.isArray(initialData)) {
                console.error("El archivo data.json no contiene un array válido.");
                return;
            }
            this.saveInitialData(initialData);
            console.log("Datos iniciales cargados desde data.json y almacenados en localStorage.");
        } catch (error) {
            console.error("Error al cargar data.json:", error);
        }
    }
    saveInitialData(data) {
        if (!Array.isArray(data)) {
            console.error("Se esperaba un array para los datos");
            return;
        }
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }
}