export class UIManager{

    constructor(){

        //---Controles HTML para la interfaz------------

        /**@param {HTMLDivElement} sectionContainer*/
        this.sectionContainer= document.getElementById('sectionContainer')
        /**@param {HTMLDivElement} buttonContainer */
        this.buttonSection= document.getElementById('buttonSection');
        /**@param {HTMLDivElement} formContainer */
        this.formSection= document.getElementById('formSection');
        /**@param {HTMLDivElement} tableContainer */
        this.tableSection= document.getElementById('tableSection');

        this.citaPreviaButton= document.getElementById('citaPreviaButton');
        this.tableCitasButton= document.getElementById('tableCitasButton');

        //--Botones laterales para cambiar la vista entre Home, cita previa y las tablas
        this.floatingButtons= Array.from(document.getElementsByClassName('floating-button'));

        //--Botones del nav
        this.navButtons= Array.from(document.getElementsByClassName('navButtons'));
        
        this.setupListeners();

    }
    /** @param {HTMLDivElement} element  */
    getCoordenates(element){
        console.log(`X: ${element.offsetLeft}`)
    }

    //--------Listeners----------------------------------

    setupListeners(){

        this.citaPreviaButton.addEventListener('click', ()=>{
            this.sectionContainer.style.transform= 'translateX(0vw)';
        });

        this.tableCitasButton.addEventListener('click', ()=>{
            this.sectionContainer.style.transform= 'translateX(-200vw)';
        });

        this.floatingButtons.forEach(button =>{
            button.addEventListener('click', ()=>{
                 this.sectionContainer.style.transform= 'translateX(-100vw)'; 
            });
        });

        this.navButtons.forEach(button=>{
            button.addEventListener('click', ()=>{
                switch (button.innerHTML){
                    case 'Home':
                        this.sectionContainer.style.transform= 'translateX(-100vw)'; 
                        break;
                    case 'Cita Previa':
                        this.sectionContainer.style.transform= 'translateX(0vw)';
                        break;
                    case 'Tabla de citas':
                        this.sectionContainer.style.transform= 'translateX(-200vw)';
                        break;  
                }   
            });
        });

        
    }
}