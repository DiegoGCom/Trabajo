
import { ModalManager } from "./ModalManager.mjs";
import { SignalManager } from "./SingalManager.mjs";

/*Esta clase es responsable de renderizar los datos obtenidos del almacenamiento local
de forma dinámica, también tiene una funcionalidad de búsqueda filtrada */

export class TableManager {
    /**
     * @param {SignalManager} signalManager  
     */
    constructor(signalManager) {
        this.signalManager = signalManager;

        this.tableBody = document.querySelector('tbody');

        this.searchInput = document.getElementById('searchInput');

        this.suggestions = document.getElementById("suggestions");
        this.storagedData = [];

        this.dataKeys = new Set();
        this.dniList = [];

        //Cuando se emite la señal de datos añadidos se recarga la tabla
        signalManager.on('dataAdded', this.loadData.bind(this));
        signalManager.on('loadingData', this.loadStoragedData.bind(this));

        this.loadData();
        this.addDownloadJsonButton();
    }
    //Carga datos desde almacenamiento interno, se pasa como callback a signalManager
    loadStoragedData(data) {
        this.storagedData = data;
    }

    ///* Creamos la fila de registro con los campos y añadimos los datos recibidos
    // no queremos representar todos los datos, ya que estos se verán en la modal */
    setClientData(row) {

        const data = row.data;

        let tableRow = document.createElement('tr');
        let dni = document.createElement('td');
        let firstName = document.createElement('td');
        let surname = document.createElement('td');
        let appointmentDate = document.createElement('td');
        let appointmentHour = document.createElement('td');

        dni.textContent = data.dni;
        firstName.textContent = data.firstName;
        surname.textContent = data.surname;
        appointmentDate.textContent = data.appointmentDate;
        appointmentHour.textContent = data.appointmentHour;

        tableRow.appendChild(dni);
        tableRow.appendChild(firstName);
        tableRow.appendChild(surname);
        tableRow.appendChild(appointmentDate);
        tableRow.appendChild(appointmentHour);

        this.createRowButtons(row, tableRow);

        this.tableBody.appendChild(tableRow);
        this.dataKeys.add(row.storageKey);
        this.dniList.push(data.dni);

        this.setupSearchInput();

    }

    /*Creamos dos botones, uno para ver la modal con todos los datos y otro para
    eliminar el registro */
    createRowButtons(row, tableRow) {

        const data = row.data;

        /*Creamos una division en la tabla con un botón para ver los datos */
        const ver = document.createElement('td');
        const verButton = document.createElement('button');
        verButton.textContent = 'Ver';
        verButton.addEventListener('click', () => {
            ModalManager.openModal(data);
        });
        ver.classList.add("tableButtons");
        ver.appendChild(verButton);

        const borrar = document.createElement('td');
        const borrarButton = document.createElement('button');
        borrarButton.textContent = 'Eliminar';
        borrarButton.addEventListener('click', () => {
            //Emite la señal de datos eliminados
            this.signalManager.emit('dataDeleted', row);
            this.dataKeys.delete(row.storageKey);
            tableRow.remove();
        });
        borrar.classList.add("tableButtons");
        borrar.appendChild(borrarButton);


        tableRow.appendChild(ver);
        tableRow.appendChild(borrar);

    }


    /*Cargamos los datos desde el almacenamiento, guardamos cada clave en un 
    Set para evitar duplicados y después representamos los datos en la tabla  */
    loadData() {
        /**
         * @type {Array}
         */
        this.signalManager.emit('orderData')
        if (!this.storagedData) return;
        this.storagedData.forEach(row => {
            if (row.storageKey && !this.dataKeys.has(row.storageKey)) {
                this.setClientData(row);
            }
        });
    }

    /*Usamos el input de búsqueda por DNI para ir filtrando los registros conforme se va introduciendo el dni
    y que se vayan mostrando en la tabla de forma dinamica   */
    setupSearchInput() {
        this.searchInput.addEventListener("input", () => {
            const query = this.searchInput.value.trim().toUpperCase();; // Normalizar el input
            this.filterTable(query);
        });

    }
    /**Conforme se escribe en el input de búsqueda de DNI se irá filtrando el objeto con los datos para 
     * mostrar solo aquellos registros que coinciden con la búsqueda, si el input esta vacío se muestran
     * todo los datos
     */
    filterTable(query) {

        if (!query) {
            this.tableBody.querySelectorAll('tr').forEach(row => {
                row.style.display = "";
            });
        }
        this.tableBody.querySelectorAll('tr').forEach(row => {
            const dniField = row.querySelector('td:first-child'); //Primer campo, el dni
            //Usamos el método startsWith() para comprobar si el dni comienza con el texto introducido
            if (dniField && dniField.textContent.toUpperCase().startsWith(query)) {
                row.style.display = ""
            } else {
                row.style.display = 'none';
            }
        });

    }

    /*DEPRECATED.- Este método era utilizado para crear sugerencias con un <ul> a medida que 
    se escribía en el input, el típico cuadro de búsqueda con sugerencia */
    renderSuggestions(list) {

        this.suggestions.classList.add('searching')
        this.suggestions.innerHTML = ""; // Limpiar sugerencias anteriores
        list.forEach(dni => {
            const li = document.createElement("li");
            li.textContent = dni;
            li.addEventListener("click", () => {
                searchInput.value = dni; // Seleccionar sugerencia
                this.suggestions.innerHTML = ""; // Limpiar sugerencias
                this.suggestions.classList.remove('searching')
            });
            this.suggestions.appendChild(li);
        });
    }

/**
 * Crea un botón de descarga que genera un archivo JSON con los datos
 * actuales en `storagedData`, crea un Blob con la información binaria de ese archivo,
 * genera una URL dinámica para el Blob, crea un enlace de descarga y simula un clic en
 * el enlace para iniciar la descarga del archivo JSON. Después de la descarga, limpia
 * el DOM eliminando el enlace y revoca la URL del Blob para liberar recursos. Es un poco 
 * locura pero funciona
 */
    addDownloadJsonButton() {
        const downloadButton = document.getElementById("downloadJsonButton");
        downloadButton.addEventListener("click", () => {
            const jsonData = JSON.stringify(this.storagedData, null, 2); 
            const blob = new Blob([jsonData], { type: "application/json" }); 
            const url = URL.createObjectURL(blob); 
            const a = document.createElement("a"); 
            a.href = url;
            a.download = "data.json"; 
            document.body.appendChild(a); 
            a.click(); 
            document.body.removeChild(a); 
            URL.revokeObjectURL(url); 
        });
    }

}