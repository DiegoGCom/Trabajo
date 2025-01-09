export class ModalManager {

    static inicializate() {
        this.modal = document.getElementById('infoModal');
        this.modalCloseButton = document.getElementById('close-modal');
        this.setupCloseListeners();
    }

    /*Por cada clave del objeto de extrae el campo de la modal que 
    representa los datos si existe se establece el valor, para ello 
    he nombrado los ids de los campos de la modal
    con la palabra modaL y el id de cada input */
    static openModal(data) {
        Object.entries(data).forEach(([key, value]) => {
            const element = document.getElementById(`modaL${key}`);
            if (element) {
                element.textContent = value;
            }
        });
        // Mostrar la modal
        this.modal.style.display = 'block';
    }
    
    //Establece el los eventos de cierre de modal tanto con la X de la modal como clicando en el exterior
    static setupCloseListeners() {
        this.modalCloseButton.addEventListener('click', () => { this.modal.style.display = 'none' });
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.modal.style.display = 'none';
            }
        })

    }



   /*  openModal(data){
        document.getElementById("modalDNI").textContent = data.dni;
        document.getElementById("modalNombre").textContent = data.firstName;
        document.getElementById("modalApellido").textContent = data.surname;
        document.getElementById("modalFechaCita").textContent = data.appointmentDate;
        document.getElementById("modalHoraCita").textContent = data.appointmentHour;
        document.getElementById("modalContacto").textContent = data.contact;
        document.getElementById("modalFechaNacimiento").textContent = data.birth;
        document.getElementById("modalObservaciones").textContent = data.observations;
      
        this.modal.style.display = "block";
    }
    */
}