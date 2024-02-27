// @filename: Sporadic.ts
import { deleteEntity, registerEntity, getFilterEntityData, getFilterEntityCount, getUserInfo, postNotificationPush, getEntityData, updateEntity } from "../../../../endpoints.js";
import { inputObserver, CloseDialog, filterDataByHeaderType, pageNumbers, fillBtnPagination, searchUniversalSingle, currentDateTime } from "../../../../tools.js";
import { Config } from "../../../../Configs.js";
import { tableLayout } from "./Layout.js";
import { tableLayoutTemplate } from "./Template.js";
import { exportSporadicCsv, exportSporadicPdf, exportSporadicXls } from "../../../../exportFiles/taskSporadic.js";
const tableRows = Config.tableRows;
const currentPage = Config.currentPage;
const customerId = localStorage.getItem('customer_id');
let infoPage = {
    count: 0,
    offset: Config.offset,
    currentPage: currentPage,
    search: ""
};
const currentBusiness = async () => {
    const currentUser = await getUserInfo();
    const userid = await getEntityData('User', `${currentUser.attributes.id}`);
    return userid;
};
let dataPage;
let currentUser;
const getTaskSporadic = async () => {
    //const currentUser = await getUserInfo()
    // currentUserInfo = await getEntityData('User', `${currentUser.attributes.id}`)
    currentUser = await currentBusiness();
    let raw = JSON.stringify({
        "filter": {
            "conditions": [
                {
                    "property": "customer.id",
                    "operator": "=",
                    "value": `${customerId}`
                },
                {
                    "property": "user.userType",
                    "operator": "=",
                    "value": `CUSTOMER`
                },
                {
                    "property": "taskType",
                    "operator": "=",
                    "value": "ESPORADICAS"
                },
            ],
        },
        sort: "+execDate",
        limit: Config.tableRows,
        offset: infoPage.offset,
    });
    if (infoPage.search != "") {
        raw = JSON.stringify({
            "filter": {
                "conditions": [
                    {
                        "group": "OR",
                        "conditions": [
                            {
                                "property": "name",
                                "operator": "contains",
                                "value": `${infoPage.search.toLowerCase()}`
                            }
                        ]
                    },
                    {
                        "property": "customer.id",
                        "operator": "=",
                        "value": `${customerId}`
                    },
                    {
                        "property": "user.userType",
                        "operator": "=",
                        "value": `CUSTOMER`
                    },
                    {
                        "property": "taskType",
                        "operator": "=",
                        "value": "ESPORADICAS"
                    },
                ]
            },
            sort: "+execDate",
            limit: Config.tableRows,
            offset: infoPage.offset
        });
    }
    infoPage.count = await getFilterEntityCount("Task_", raw);
    dataPage = await getFilterEntityData("Task_", raw);
    return dataPage;
};
export class Sporadic {
    constructor() {
        this.dialogContainer = document.getElementById('app-dialogs');
        this.entityDialogContainer = document.getElementById('entity-editor-container');
        this.content = document.getElementById('datatable-container');
        this.searchEntity = async (tableBody /*, data: any*/) => {
            const search = document.getElementById('search');
            const btnSearch = document.getElementById('btnSearch');
            search.value = infoPage.search;
            await search.addEventListener('keyup', () => {
                /*const arrayData: any = data.filter((user: any) =>
                    `${user.firstName}
                     ${user.lastName}
                     ${user.username}`
                        .toLowerCase()
                        .includes(search.value.toLowerCase())
                )
    
                let filteredResult = arrayData.length
                let result = arrayData
                if (filteredResult >= tableRows) filteredResult = tableRows
    
                this.load(tableBody, currentPage, result)
                */
            });
            btnSearch.addEventListener('click', async () => {
                new Sporadic().render(Config.offset, Config.currentPage, search.value.toLowerCase().trim());
            });
        };
        this.export = () => {
            const exportNotes = document.getElementById('export-entities');
            exportNotes.addEventListener('click', async () => {
                this.dialogContainer.style.display = 'block';
                this.dialogContainer.innerHTML = `
              <div class="dialog_content" id="dialog-content">
                  <div class="dialog">
                      <div class="dialog_container padding_8">
                          <div class="dialog_header">
                              <h2>Seleccionar la fecha</h2>
                          </div>

                          <div class="dialog_message padding_8">
                              <div class="form_group">
                                  <div class="form_input">
                                      <label class="form_label" for="start-date">Desde:</label>
                                      <input type="date" class="input_date input_date-start" id="start-date" name="start-date">
                                  </div>
                  
                                  <div class="form_input">
                                      <label class="form_label" for="end-date">Hasta:</label>
                                      <input type="date" class="input_date input_date-end" id="end-date" name="end-date">
                                  </div>

                                  <label for="exportCsv">
                                      <input type="radio" id="exportCsv" name="exportOption" value="csv" /> CSV
                                  </label>

                                  <label for="exportXls">
                                      <input type="radio" id="exportXls" name="exportOption" value="xls" checked /> XLS
                                  </label>

                                  <label for="exportPdf">
                                      <input type="radio" id="exportPdf" name="exportOption" value="pdf" /> PDF
                                  </label>
                              </div>
                          </div>

                          <div class="dialog_footer">
                              <button class="btn btn_primary" id="cancel">Cancelar</button>
                              <button class="btn btn_danger" id="export-data">Exportar</button>
                          </div>
                      </div>
                  </div>
              </div>
          `;
                let fecha = new Date(); //Fecha actual
                let mes = fecha.getMonth() + 1; //obteniendo mes
                let dia = fecha.getDate(); //obteniendo dia
                let anio = fecha.getFullYear(); //obteniendo año
                if (dia < 10)
                    dia = '0' + dia; //agrega cero si el menor de 10
                if (mes < 10)
                    mes = '0' + mes; //agrega cero si el menor de 10
                // @ts-ignore
                document.getElementById("start-date").value = anio + "-" + mes + "-" + dia;
                // @ts-ignore
                document.getElementById("end-date").value = anio + "-" + mes + "-" + dia;
                inputObserver();
                const _closeButton = document.getElementById('cancel');
                const exportButton = document.getElementById('export-data');
                const _dialog = document.getElementById('dialog-content');
                exportButton.addEventListener('click', async () => {
                    const _values = {
                        start: document.getElementById('start-date'),
                        end: document.getElementById('end-date'),
                        exportOption: document.getElementsByName('exportOption')
                    };
                    let rawExport = JSON.stringify({
                        "filter": {
                            "conditions": [
                                {
                                    "property": "taskType",
                                    "operator": "=",
                                    "value": `ESPORADICAS`
                                },
                                {
                                    "property": "user.userType",
                                    "operator": "=",
                                    "value": `CUSTOMER`
                                },
                                {
                                    "property": "customer.id",
                                    "operator": "=",
                                    "value": `${customerId}`
                                },
                                {
                                    "property": "execDate",
                                    "operator": ">=",
                                    "value": `${_values.start.value}`
                                },
                                {
                                    "property": "execDate",
                                    "operator": "<=",
                                    "value": `${_values.end.value}`
                                }
                            ],
                        },
                        sort: "+execDate",
                        fetchPlan: 'full',
                    });
                    const sporadic = await getFilterEntityData("Task_", rawExport);
                    for (let i = 0; i < _values.exportOption.length; i++) {
                        let ele = _values.exportOption[i];
                        if (ele.type = "radio") {
                            if (ele.checked) {
                                if (ele.value == "xls") {
                                    // @ts-ignore
                                    exportSporadicXls(sporadic, _values.start.value, _values.end.value);
                                }
                                else if (ele.value == "csv") {
                                    // @ts-ignore
                                    exportSporadicCsv(sporadic, _values.start.value, _values.end.value);
                                }
                                else if (ele.value == "pdf") {
                                    // @ts-ignore
                                    exportSporadicPdf(sporadic, _values.start.value, _values.end.value);
                                }
                            }
                        }
                    }
                });
                _closeButton.onclick = () => {
                    new CloseDialog().x(_dialog);
                };
            });
        };
    }
    async render(offset, actualPage, search) {
        infoPage.offset = offset;
        infoPage.currentPage = actualPage;
        infoPage.search = search;
        this.content.innerHTML = '';
        this.content.innerHTML = tableLayout;
        const tableBody = document.getElementById('datatable-body');
        tableBody.innerHTML = '.Cargando...';
        let data = await getTaskSporadic();
        tableBody.innerHTML = tableLayoutTemplate.repeat(tableRows);
        this.load(tableBody, currentPage, data);
        this.searchEntity(tableBody /*, data*/);
        new filterDataByHeaderType().filter();
        this.pagination(data, tableRows, infoPage.currentPage);
    }
    openTasksModal(container, data) {
        const view = document.querySelectorAll('#view-entity');
        view.forEach((view) => {
            const entityId = view.dataset.entityid;
            view.addEventListener('click', () => {
                RInterface('Task_', entityId);
            });
        });
        const RInterface = async (entities, entityID) => {
            const data = await getEntityData(entities, entityID);
            const dialogContainer = document.getElementById('app-dialogs');
            dialogContainer.innerHTML = `
                <div class="dialog_content" id="dialog-content">
                    <div class="dialog">
                        <div class="dialog_container padding_8" style="width:70%;position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);" id="modal">
                            <div class="dialog_header" style="display: flex;justify-content: center;">
                                <h2 style="margin: 0;">${data.name}</h2>
                            </div>

                            <div class="dialog_message padding_8" style="text-align: center;">
                                <p style="text-align: justify;">${data.description ?? ""}</p>
                            </div>
                            <div class="dialog_message padding_8" style="display: flex; justify-content: center;">
                                <div  style="padding:20px;background:#dfdfdf"><span><i class="fa-solid fa-calendar-days" style="font-size:15px"></i> ${data.execDate}</span></div>
                                <div style="width: 50px"></div>
                                <div style="padding:20px;background:#dfdfdf""><span><i class="fa-solid fa-clock"  style="font-size:15px"></i> ${data.execTime}</span></div>
                                
                            </div>
                            
                            <div class="dialog_footer" style="text-align: center;">
                                <button class="btn btn_primary" id="cancel-modal">Cerrar</button>
                                
                            </div>
                        </div>
                </div>
            </div>
              `;
            const cancelBtnModal = document.getElementById('cancel-modal');
            cancelBtnModal.addEventListener('click', () => {
                const dialog = document.getElementById('dialog-content');
                new CloseDialog().x(dialog);
            });
        };
    }
    load(table, currentPage, data) {
        table.innerHTML = '';
        currentPage--;
        let start = tableRows * currentPage;
        let end = start + tableRows;
        let paginatedItems = data.slice(start, end);
        if (data.length === 0) {
            let row = document.createElement('tr');
            row.innerHTML = `
        <td>los datos no coinciden con su búsqueda</td>
        <td></td>
        <td></td>
      `;
            table.appendChild(row);
        }
        else {
            for (let i = 0; i < paginatedItems.length; i++) {
                let taskSporadic = paginatedItems[i];
                let row = document.createElement('tr');
                row.innerHTML += `
                <td>${taskSporadic.name}</dt>
          
                <td>${taskSporadic.execDate}</dt>
      
                <td>${taskSporadic.execTime}</dt>`;
                row.innerHTML += `<td>${taskSporadic.isReadDate ?? ''} </dt>`;
                row.innerHTML += `<td>${taskSporadic.isReadTime ?? ''}</dt>`;
                row.innerHTML += `
                <td class="entity_options">
                <button class="button" id="view-entity" data-entityId="${taskSporadic.id}">
                <i class="fa-solid fa-magnifying-glass"></i>
                </button>
                <button class="button" id="edit-entity" data-entityId="${taskSporadic.id}">
                <i class="fa-solid fa-pen"></i>
              </button>
                  <button class="button" id="remove-entity" data-entityId="${taskSporadic.id}">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </dt>
              `;
                table.appendChild(row);
            }
        }
        this.register();
        this.edit(this.entityDialogContainer, data);
        this.remove();
        this.export();
        this.openTasksModal(this.content, data);
    }
    register() {
        // register entity
        const openEditor = document.getElementById('new-entity');
        openEditor.addEventListener('click', async () => {
            renderInterface();
        });
        const renderInterface = async () => {
            const notification = await searchUniversalSingle("name", "=", "Consigna", "NotificationType");
            this.entityDialogContainer.innerHTML = '';
            this.entityDialogContainer.style.display = 'flex';
            this.entityDialogContainer.innerHTML = `
            <div class="entity_editor" id="entity-editor">
            <div class="entity_editor_header">
              <div class="user_info">
                <div class="avatar"><i class="fa-solid fa-building"></i></div>
                <h1 class="entity_editor_title">Registrar <br><small>Específicas</small></h1>
              </div>
    
              <button class="btn btn_close_editor" id="close"><i class="fa-regular fa-x"></i></button>
            </div>
    
            <!-- EDITOR BODY -->
            <div class="entity_editor_body">
              <div class="material_input">
                  <input type="text" id="entity-name" autocomplete="none" required>
                  <label for="entity-name">Título</label>
              </div>
              
              <div class="form_input">
                  <label for="entity-description" class="form_label"></i> Descripción:</label>
                  <textarea id="entity-description" name="entity-description" row="30" class="input_textarea"></textarea>
              </div>
              <div class="form_group">
                  <div class="form_input">
                      <label class="form_label" for="execution-date">Fecha de Ejecución:</label>
                      <input type="date" class="input_time input_execution-date" id="execution-date" name="execution-date">
                  </div>
                  <div class="form_input">
                      <label class="form_label" for="execution-time">Hora de Ejecución:</label>
                      <input type="time" class="input_time input_time-execution" id="execution-time" name="execution-time">
                  </div>
    
                 
              </div> 
             
              
              
          </div>
    
        
            <!-- END EDITOR BODY -->
    
            <div class="entity_editor_footer">
              <button class="btn btn_primary btn_widder" id="register-entity">Guardar</button>
            </div>
          </div>
      `;
            // @ts-ignore
            inputObserver();
            //inputSelect('Customer', 'entity-customer')
            this.close();
            const agregarCeros = (numero) => {
                return numero < 10 ? `0${numero}` : numero;
            };
            const registerButton = document.getElementById('register-entity');
            const fecha = new Date();
            let day = fecha.getDate();
            day = agregarCeros(day);
            let month = fecha.getMonth() + 1;
            month = agregarCeros(month);
            const year = fecha.getFullYear();
            const dateFormat = year + '-' + month + '-' + day;
            const hour = fecha.getHours();
            const minutes = fecha.getMinutes();
            const seconds = fecha.getSeconds();
            const hourFormat = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            registerButton.addEventListener('click', async () => {
                const inputsCollection = {
                    name: document.getElementById('entity-name'),
                    description: document.getElementById('entity-description'),
                    customer: document.getElementById('entity-customer'),
                    executionDate: document.getElementById('execution-date'),
                    executionTime: document.getElementById('execution-time')
                };
                let dateToday = new Date(dateFormat);
                let dateExec = new Date(`${inputsCollection.executionDate.value}`);
                let horusInstant = new Date(`${dateFormat}T${hourFormat}`);
                let horusExec = new Date(`${dateFormat}T${inputsCollection.executionTime.value}`);
                let _userInfo = await getUserInfo();
                const customerId = localStorage.getItem('customer_id');
                //console.log(inputsCollection.executionDate.value)
                const raw = JSON.stringify({
                    "taskType": `ESPORADICAS`,
                    "name": `${inputsCollection.name.value}`,
                    "description": `${inputsCollection.description.value}`,
                    "execDate": `${inputsCollection.executionDate.value}`,
                    "user": {
                        "id": `${_userInfo.attributes.id}`
                    },
                    "customer": {
                        "id": `${customerId}`
                    },
                    "execTime": `${inputsCollection.executionTime.value}`,
                    "startTime": `${hourFormat}`,
                    "startDate": `${dateFormat}`,
                });
                if (`${inputsCollection.name.value.trim()}` === '' || `${inputsCollection.name.value.trim()}` === null) {
                    alert('Nombre del consigna general vacío');
                }
                else if (`${inputsCollection.executionDate.value.trim()}` === '' || `${inputsCollection.executionDate.value.trim()}` === null) {
                    alert('Debe especificar la fecha de la consigna');
                }
                else if (dateToday > dateExec) {
                    alert('La fecha no puede ser menor a la del día de hoy');
                }
                else if (`${inputsCollection.executionTime.value.trim()}` === '' || `${inputsCollection.executionTime.value.trim()}` === null) {
                    alert('Debe especificar la hora de ejecución de la consigna');
                }
                //COMPARANDO LAS HORAS DEL MISMO DIA
                else if (dateToday.getTime() == dateExec.getTime() && (horusInstant > horusExec)) {
                    alert('La hora no puede ser menor a la actual');
                }
                else {
                    reg(raw);
                    let rawUser = JSON.stringify({
                        "filter": {
                            "conditions": [
                                {
                                    "property": "customer.id",
                                    "operator": "=",
                                    "value": `${customerId}`
                                },
                                {
                                    "property": "userType",
                                    "operator": "=",
                                    "value": `GUARD`
                                },
                                {
                                    "property": "state.name",
                                    "operator": "=",
                                    "value": `Enabled`
                                },
                                {
                                    "property": "token",
                                    "operator": "<>",
                                    "value": ``
                                }
                            ],
                        },
                    });
                    const dataUser = await getFilterEntityData("User", rawUser);
                    for (let i = 0; i < dataUser.length; i++) {
                        const data = { "token": dataUser[i]['token'], "title": "Específica", "body": `${inputsCollection.name.value}` };
                        const envioPush = await postNotificationPush(data);
                    }
                }
            });
            const reg = async (raw) => {
                registerEntity(raw, 'Task_')
                    .then((res) => {
                    let parse = JSON.parse(raw);
                    const notify = JSON.stringify({
                        "user": {
                            "id": `${currentUser.id}`
                        },
                        "customer": {
                            "id": `${customerId}`
                        },
                        "business": {
                            "id": `${currentUser.business.id}`
                        },
                        "title": `${parse.name} | [CONSIGNA]`,
                        "description": `${parse.description} | ${parse.execDate} ${parse.execTime}`,
                        "creationDate": `${dateFormat}`,
                        "creationTime": `${hourFormat}`,
                        "firebaseId": `${currentDateTime().date}T${currentDateTime().timeHHMMSS}`,
                        "notificationType": {
                            "id": `${notification[0].id}`
                        },
                    });
                    registerEntity(notify, 'Notification');
                    setTimeout(async () => {
                        //let data = await getUsers();
                        const tableBody = document.getElementById('datatable-body');
                        const container = document.getElementById('entity-editor-container');
                        new CloseDialog().x(container);
                        new Sporadic().render(Config.offset, Config.currentPage, infoPage.search);
                    }, 1000);
                });
            };
        };
    }
    edit(container, data) {
        // Edit entity
        const fecha = new Date();
        const day = fecha.getDate();
        const month = fecha.getMonth() + 1;
        const year = fecha.getFullYear();
        const dateFormat = year + '-' + month + '-' + day;
        let dateToday = new Date(dateFormat);
        const edit = document.querySelectorAll('#edit-entity');
        edit.forEach((edit) => {
            const entityId = edit.dataset.entityid;
            edit.addEventListener('click', () => {
                RInterface('Task_', entityId);
            });
        });
        const RInterface = async (entities, entityID) => {
            const data = await getEntityData(entities, entityID);
            const executionDate = data.execDate;
            let dateExec = new Date(executionDate);
            this.entityDialogContainer.innerHTML = '';
            this.entityDialogContainer.style.display = 'flex';
            this.entityDialogContainer.innerHTML = `
          <div class="entity_editor" id="entity-editor">
          <div class="entity_editor_header">
              <div class="user_info">
              <div class="avatar"><i class="fa-regular fa-user"></i></div>
              <h1 class="entity_editor_title">Editar <br><small>${data.name} </small></h1>
              </div>

              <button class="btn btn_close_editor" id="close"><i class="fa-solid fa-x"></i></button>
          </div>

          <!-- EDITOR BODY -->
          <div class="entity_editor_body">
             
          <div class="material_input">
          <input type="text" id="entity-name" class="input_filled" value="${data.name}">
              <label for="entity-name">Título</label>
          </div>
            <div class="form_input">
            <label for="entity-description" class="form_label"></i> Descripción:</label>
              <textarea id="entity-description" name="entity-description" row="30" class="input_textarea">${data.description ?? ""}</textarea>
            </div>
              <div class="form_group">
                <div class="form_input">
                    <label class="form_label" for="execution-date">Fecha de Ejecución:</label>
                    <input type="date" class="input_time input_execution-date" id="execution-date" name="execution-date" value="${data.execDate}">
                </div>
                <div class="form_input">
                    <label class="form_label" for="execution-time">Hora de Ejecución:</label>
                    <input type="time" class="input_time input_time-execution" id="execution-time" name="execution-time" value="${data.execTime}">
                </div>

         
              </div> 
          </div>
          <!-- END EDITOR BODY -->

          <div class="entity_editor_footer">
              <button class="btn btn_primary btn_widder" id="update-changes">Guardar</button>
          </div>
          </div>
          `;
            if (dateToday >= dateExec) {
                let updateButton;
                updateButton = document.getElementById('update-changes');
                const nombre = document.getElementById("entity-name");
                nombre.disabled = true;
                const description = document.getElementById("entity-description");
                description.disabled = true;
                const fecha = document.getElementById("execution-date");
                fecha.disabled = true;
                const tiempo = document.getElementById("execution-time");
                tiempo.disabled = true;
                updateButton = document.getElementById("update-changes");
                updateButton.disabled = true;
            }
            inputObserver();
            this.close();
            UUpdate(entityID);
        };
        const UUpdate = async (entityId) => {
            const notification = await searchUniversalSingle("name", "=", "Consigna", "NotificationType");
            let updateButton;
            updateButton = document.getElementById('update-changes');
            console.log(updateButton);
            const $value = {
                // @ts-ignore
                name: document.getElementById('entity-name'),
                description: document.getElementById('entity-description'),
                // @ts-ignore
                execDate: document.getElementById('execution-date'),
                execTime: document.getElementById('execution-time'),
                // @ts-ignore
            };
            updateButton.addEventListener('click', async () => {
                //e.preventDefault()
                let name;
                name = document.getElementById('entity-name');
                let executionDate;
                executionDate = document.getElementById('execution-date');
                let executionTime;
                executionTime = document.getElementById('execution-time');
                const agregarCeros = (numero) => {
                    return numero < 10 ? `0${numero}` : numero;
                };
                const fecha = new Date();
                let day = fecha.getDate();
                day = (day);
                let month = fecha.getMonth() + 1;
                month = agregarCeros(month);
                const year = fecha.getFullYear();
                const dateFormat = year + '-' + month + '-' + day;
                const hour = fecha.getHours();
                const minutes = fecha.getMinutes();
                const seconds = fecha.getSeconds();
                const hourFormat = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                let dateToday = new Date(dateFormat);
                let dateExec = new Date(`${executionDate.value}`);
                let horusInstant = new Date(`${dateFormat}T${hourFormat}`);
                let horusExec = new Date(`${dateFormat}T${executionTime.value}`);
                //console.log(hourFormat)
                //console.log(executionTime.value)
                if (`${name.value.trim()}` === '' || `${name.value.trim()}` === null) {
                    alert('Nombre del consigna general vacío');
                }
                else if (`${executionDate.value.trim()}` === '' || `${executionDate.value.trim()}` === null) {
                    alert('Debe especificar la fecha de la consigna');
                }
                else if (dateToday > dateExec) {
                    alert('La fecha no puede ser menor a la del día de hoy');
                }
                else if (`${executionTime.value.trim()}` === '' || `${executionTime.value.trim()}` === null) {
                    alert('Debe especificar la hora de ejecución de la consigna');
                }
                //COMPARANDO LAS HORAS DEL MISMO DIA
                else if (dateToday.getTime() == dateExec.getTime() && (horusInstant > horusExec)) {
                    alert('La hora no puede ser menor a la actual');
                }
                else {
                    let raw = JSON.stringify({
                        // @ts-ignore
                        "name": `${$value.name.value}`,
                        // @ts-ignore
                        "description": `${$value.description.value}`,
                        // @ts-ignore
                        "execDate": `${$value.execDate.value}`,
                        // @ts-ignore
                        "execTime": `${$value.execTime.value}`,
                        "isRead": false
                    });
                    update(raw);
                }
            });
            /**
         * Update entity and execute functions to finish defying user
         * @param raw
         */
            const update = async (raw) => {
                updateEntity('Task_', entityId, raw)
                    .then((res) => {
                    setTimeout(async () => {
                        let parse = JSON.parse(raw);
                        const notify = JSON.stringify({
                            "user": {
                                "id": `${currentUser.id}`
                            },
                            "customer": {
                                "id": `${customerId}`
                            },
                            "business": {
                                "id": `${currentUser.business.id}`
                            },
                            "title": `${parse.name} | [CONSIGNA]`,
                            "description": `${parse.description} | ${parse.execDate} ${parse.execTime}`,
                            "creationDate": `${currentDateTime().date}`,
                            "creationTime": `${currentDateTime().timeHHMM}`,
                            "firebaseId": `${currentDateTime().date}T${currentDateTime().timeHHMMSS}`,
                            "notificationType": {
                                "id": `${notification[0].id}`
                            },
                        });
                        registerEntity(notify, 'Notification');
                        let tableBody;
                        let container;
                        let data;
                        tableBody = document.getElementById('datatable-body');
                        container = document.getElementById('entity-editor-container');
                        //data = await getUsers();
                        new CloseDialog().x(container);
                        new Sporadic().render(infoPage.offset, infoPage.currentPage, infoPage.search);
                    }, 100);
                });
                let rawUser = JSON.stringify({
                    "filter": {
                        "conditions": [
                            {
                                "property": "customer.id",
                                "operator": "=",
                                "value": `${customerId}`
                            },
                            {
                                "property": "userType",
                                "operator": "=",
                                "value": `GUARD`
                            },
                            {
                                "property": "state.name",
                                "operator": "=",
                                "value": `Enabled`
                            },
                            {
                                "property": "token",
                                "operator": "<>",
                                "value": ``
                            }
                        ],
                    },
                });
                const dataUser = await getFilterEntityData("User", rawUser);
                for (let i = 0; i < dataUser.length; i++) {
                    const data = { "token": dataUser[i]['token'], "title": "Específica", "body": `${$value.name.value}` };
                    const envioPush = await postNotificationPush(data);
                }
            };
        };
    }
    remove() {
        const remove = document.querySelectorAll('#remove-entity');
        remove.forEach((remove) => {
            const entityId = remove.dataset.entityid;
            remove.addEventListener('click', () => {
                this.dialogContainer.style.display = 'flex';
                this.dialogContainer.innerHTML = `
          <div class="dialog_content" id="dialog-content">
            <div class="dialog dialog_danger">
              <div class="dialog_container">
                <div class="dialog_header">
                  <h2>¿Deseas eliminar esta Consigna Específica??</h2>
                </div>

                <div class="dialog_message">
                  <p>Esta acción no se puede revertir</p>
                </div>

                <div class="dialog_footer">
                  <button class="btn btn_primary" id="cancel">Cancelar</button>
                  <button class="btn btn_danger" id="delete">Eliminar</button>
                </div>
              </div>
            </div>
          </div>
        `;
                // delete button
                // cancel button
                // dialog content
                const deleteButton = document.getElementById('delete');
                const cancelButton = document.getElementById('cancel');
                const dialogContent = document.getElementById('dialog-content');
                deleteButton.onclick = async () => {
                    deleteEntity('Task_', entityId)
                        .then((res) => {
                        setTimeout(async () => {
                            //let data = await getUsers();
                            const tableBody = document.getElementById('datatable-body');
                            new CloseDialog().x(dialogContent);
                            new Sporadic().render(infoPage.offset, infoPage.currentPage, infoPage.search);
                        }, 1000);
                    });
                };
                cancelButton.onclick = () => {
                    new CloseDialog().x(dialogContent);
                    //this.render();
                };
            });
        });
    }
    close() {
        const closeButton = document.getElementById('close');
        const editor = document.getElementById('entity-editor-container');
        closeButton.addEventListener('click', () => {
            //console.log('close')
            new CloseDialog().x(editor);
        });
    }
    pagination(items, limitRows, currentPage) {
        const tableBody = document.getElementById('datatable-body');
        const paginationWrapper = document.getElementById('pagination-container');
        paginationWrapper.innerHTML = '';
        let pageCount;
        pageCount = Math.ceil(infoPage.count / limitRows);
        let button;
        if (pageCount <= Config.maxLimitPage) {
            for (let i = 1; i < pageCount + 1; i++) {
                button = setupButtons(i /*, items, currentPage, tableBody, limitRows*/);
                paginationWrapper.appendChild(button);
            }
            fillBtnPagination(currentPage, Config.colorPagination);
        }
        else {
            pagesOptions(items, currentPage);
        }
        function setupButtons(page /*, items: any, currentPage: number, tableBody: InterfaceElement, limitRows: number*/) {
            const button = document.createElement('button');
            button.classList.add('pagination_button');
            button.setAttribute("name", "pagination-button");
            button.setAttribute("id", "btnPag" + page);
            button.innerText = page;
            button.addEventListener('click', () => {
                infoPage.offset = Config.tableRows * (page - 1);
                currentPage = page;
                new Sporadic().render(infoPage.offset, currentPage, infoPage.search);
            });
            return button;
        }
        function pagesOptions(items, currentPage) {
            paginationWrapper.innerHTML = '';
            let pages = pageNumbers(items, Config.maxLimitPage, currentPage);
            const prevButton = document.createElement('button');
            prevButton.classList.add('pagination_button');
            prevButton.innerText = "<<";
            paginationWrapper.appendChild(prevButton);
            const nextButton = document.createElement('button');
            nextButton.classList.add('pagination_button');
            nextButton.innerText = ">>";
            for (let i = 0; i < pages.length; i++) {
                if (pages[i] > 0 && pages[i] <= pageCount) {
                    button = setupButtons(pages[i]);
                    paginationWrapper.appendChild(button);
                }
            }
            paginationWrapper.appendChild(nextButton);
            fillBtnPagination(currentPage, Config.colorPagination);
            setupButtonsEvents(prevButton, nextButton);
        }
        function setupButtonsEvents(prevButton, nextButton) {
            prevButton.addEventListener('click', () => {
                new Sporadic().render(Config.offset, Config.currentPage, infoPage.search);
            });
            nextButton.addEventListener('click', () => {
                infoPage.offset = Config.tableRows * (pageCount - 1);
                new Sporadic().render(infoPage.offset, pageCount, infoPage.search);
            });
        }
    }
}
