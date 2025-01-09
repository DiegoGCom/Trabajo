
import { ModalManager } from "./ModalManager.mjs";
import { SignalManager } from "./SingalManager.mjs";



export class FormManager {

    /**
     * @param {SignalManager} signalManager 
     */
    constructor(signalManager) {

        this.signalManager = signalManager;
    
        //Formulario
        this.appointmentForm = document.getElementById('appointmentForm');
        this.dataInputs = this.appointmentForm.querySelectorAll('input');
        this.sendButton = document.getElementById('sendButton');
        this.cleanButton = document.getElementById('cleanButton');
        this.errorLabel = document.getElementById("errorLabel");
        this.hourSelect = document.querySelector('select');
        this.hourSelect.disabled = true;
        this.ovbservationsTextArea = document.getElementById('observations');
        this.dateInput = document.getElementById('appointmentDate');

        this.isDataComplete = false;
        
        //Citas: {fecha , [horas]} 
        this.appointments = new Map();

        //Objeto con los datos
        this.clientData = {};

        this.storagedData=[];

       /*  Se comunica que esta clase escucha la señal dataDeleted y 
       enlaza el metodo para liberar las horas del selector, se usa bind(this) para
       que el el contexto del método no se pierda y siga siendo esta instancia concreta*/
        signalManager.on('dataDeleted', this.freeAvailableHours.bind(this));
        signalManager.on('loadingData', this.loadStoragedData.bind(this));


        this.createAvailableHours();
        this.loadAppointments()
        this.setupListeners();
        this.cleanForm();
    }
    //Carga datos desde almacenamiento interno, se pasa como callback a signalManager
    loadStoragedData(data){
        this.storagedData=data;
    }

    
    setupListeners() {
        //------Boton de envío de datos, validación
        this.sendButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.validateData();
        });

        //------Botón limpiar--------------------------
        this.cleanButton.addEventListener('click', () => {
            this.cleanForm();
        });

        this.dateInput.addEventListener('blur', () => this.updateAvailableHours());
        this.dateInput.addEventListener('focus', ()=> this.hourSelect.disabled=true);
    }

    /*Crea las opciones de horas en el select y les da formato*/
    createAvailableHours() {
        const selectionLabel= document.createElement('option');
        selectionLabel.textContent='Selecione una hora';
        selectionLabel.value='';
        selectionLabel.selected=true;
        selectionLabel.disabled=true;
        this.hourSelect.appendChild(selectionLabel);

        for (let hour = 8; hour <= 20; hour++) {
            const formatedHour = `${hour.toString().padStart(2, "0")}:00`;
            const option = document.createElement('option');
            option.value = formatedHour;
            option.textContent = formatedHour;
            this.hourSelect.appendChild(option);
        }
        
    }

    /*Cambiamos el formato para los campos de tipo fecha de yyyy-mm-dd que es el valor por defecto en HTML a dd-mm-yyyy */
    setClientData(input) {
        if (input.type === 'date' && input.value) {
            const [year, month, day] = input.value.split('-');
            this.clientData[input.name] = `${day}-${month}-${year}`;
        } else {
            this.clientData[input.name] = input.value;
        }
    }
    /*Se valida cada que cada input se haya 
    rellenado correctamente */
    validateInputs() {
        this.dataInputs.forEach(input => {
            if (!input.checkValidity()) {
                input.classList.add('error');
                this.isDataComplete = false;
            } else {
                input.classList.remove('error');
                this.setClientData(input);
            }
        });
    }
    // Validar selección de hora
    validateHourSelect() {
        console.log(this.hourSelect.value);
        
        if (!this.hourSelect.checkValidity() || this.hourSelect.value=='') {
            this.hourSelect.classList.add('error');
            this.isDataComplete = false;
        } else {
            this.hourSelect.classList.remove('error');
        }

    }
    /*Crea una clave única para identificar el registro uniendo dni, dia y hora de cita */
    setStorageKey(data) {
        const storageKey = `${data.dni}-${data.appointmentDate}-${data.appointmentHour}`;
        return { storageKey, data } || {};
    }

    /*Valida los datos y los envia si son correctos, de lo contrario muestra error */
    validateData() {
        this.isDataComplete = true;

        this.validateInputs();

        this.validateHourSelect();

        if (!this.isDataComplete) {
            this.errorLabel.classList.add('error-visible');
        } else {
            this.errorLabel.classList.remove('error-visible');
            this.clientData[this.hourSelect.name] = this.hourSelect.value;
            this.clientData[this.ovbservationsTextArea.name] = this.ovbservationsTextArea.value;
            this.signalManager.emit('dataAdded', this.setStorageKey(this.clientData));
            ModalManager.openModal(this.clientData);
            this.loadAppointments();
            this.clientData = {};
            this.cleanForm();
        }
    }
    /*Actualiza las horas disponibles en el selector de horas */
    updateAvailableHours() {
        if (!this.dateInput.checkValidity()) {

            this.hourSelect.disabled = true;

        } else {
            this.hourSelect.disabled = false;
            
            this.hourSelect.focus();
            const [year, month, day] = this.dateInput.value.split('-');
            const selectedDate = `${day}-${month}-${year}`;
            if (!selectedDate) {
                this.hourSelect.disabled = true;
                return;
            }
            const bookedHours = this.appointments.get(selectedDate) || [];
            this.renderTimeOptions(bookedHours);
        }
    }
    //Recibe las horas que ya han sido elegidas, pinta de rosa el fondo y desactiva la opción 
    /**
     * 
     * @param {Array} bookedHours 
     */
    renderTimeOptions(bookedHours) {

        const options = this.hourSelect.options;

        for (let i = 1; i < options.length; i++) {
            const option = options[i];
            const hour = option.value;

            if (bookedHours.includes(hour)) {
                option.style.backgroundColor = 'pink';
                option.disabled = true;
            } else {
                option.style.backgroundColor = '';
                option.disabled = false;
            }
        }
        options[0].selected=true;
        options[0].disabled=true;
    }

    //Limpia el formulario
    cleanForm() {
        this.dataInputs.forEach(input => {
            input.value = "";
        });
        this.ovbservationsTextArea.value = "";
        this.errorLabel.classList.remove('error-visible');
        this.hourSelect.value = null;
        this.hourSelect.disabled = true;
    }
    /*Cargamos los datos almacenados, si existen se obtiene la fecha y la hora y se añaden
    al array de las citas, de esta forma el select marcará la hora como ocupada cuando se actualicen
    las horas disponibles en el efecto blur del input fecha */
    loadAppointments() {
        /**
         * @type {Array}
         */
        this.signalManager.emit('orderData');
  
        if (!this.storagedData) return;
        this.storagedData.forEach(element => {
            if (element.storageKey) {
                const record = element.data;
                const hours = this.appointments.get(record.appointmentDate) || [];
                hours.push(record.appointmentHour);
                this.appointments.set(record.appointmentDate, hours);
            }
        });
    }

    /* Libera las horas disponibles para un dia concreto, se pasa como callback ante la
    señal de borrado de registro en el TableManager */ 
    freeAvailableHours(row) {

        /**
         * @type {Array}
         */
        const data = row.data;
        const date = this.appointments.get(data.appointmentDate);
        console.log(data.appointmentHour);
        const hourIndex = date.findIndex(item => item === data.appointmentHour);
        console.log(hourIndex);
        date.splice(hourIndex, 1);
        this.updateAvailableHours();
    }


}