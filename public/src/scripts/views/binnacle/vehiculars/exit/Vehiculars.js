//
//  AssistControl.ts
//
//  Generated by Poll Castillo on 15/03/2023.
//
import { Config } from "../../../../Configs.js";
import { getEntityData, getFilterEntityData, getFilterEntityCount, getFile } from "../../../../endpoints.js";
import { CloseDialog, renderRightSidebar, filterDataByHeaderType, inputObserver, pageNumbers, fillBtnPagination } from "../../../../tools.js";
import { UIContentLayout, UIRightSidebar } from "./Layout.js";
import { UITableSkeletonTemplate } from "./Template.js";
import { exportVehiSalCsv, exportVehiSalXls, exportVehiSalPdf, exportVehiSalIndPdf } from "../../../../exportFiles/vehicular-egress.js";
// Local configs
const tableRows = Config.tableRows;
let currentPage = Config.currentPage;
const pageName = 'Salida Vehicular';
const customerId = localStorage.getItem('customer_id');
let infoPage = {
    count: 0,
    offset: Config.offset,
    currentPage: currentPage,
    search: "",
    moreSearch: {
        department: "Todos"
    }
};
let dataPage;
const GetVehiculars = async () => {
    //const vehicularRaw = await getEntitiesData('Vehicular');
    //const vehicular = vehicularRaw.filter((data: any) => data.customer?.id === `${customerId}`);
    let raw;
    if (infoPage.moreSearch.department != null && infoPage.moreSearch.department != 'null') {
        raw = JSON.stringify({
            "filter": {
                "conditions": [
                    {
                        "property": "customer.id",
                        "operator": "=",
                        "value": `${customerId}`
                    },
                    {
                        "property": "vehiMarcType",
                        "operator": "=",
                        "value": `SALIDA`
                    },
                    {
                        "property": "department.id",
                        "operator": "=",
                        "value": `${infoPage.moreSearch.department}`
                    }
                ],
            },
            sort: "-createdDate",
            limit: Config.tableRows,
            offset: infoPage.offset,
            fetchPlan: 'full',
        });
    }
    else {
        raw = JSON.stringify({
            "filter": {
                "conditions": [
                    {
                        "property": "customer.id",
                        "operator": "=",
                        "value": `${customerId}`
                    },
                    {
                        "property": "vehiMarcType",
                        "operator": "=",
                        "value": `SALIDA`
                    }
                ],
            },
            sort: "-createdDate",
            limit: Config.tableRows,
            offset: infoPage.offset,
            fetchPlan: 'full',
        });
    }
    if (infoPage.search != "") {
        if (infoPage.moreSearch.department != null && infoPage.moreSearch.department != 'null') {
            raw = JSON.stringify({
                "filter": {
                    "conditions": [
                        {
                            "group": "OR",
                            "conditions": [
                                {
                                    "property": "licensePlate",
                                    "operator": "contains",
                                    "value": `${infoPage.search.toLowerCase()}`
                                },
                                {
                                    "property": "dni",
                                    "operator": "contains",
                                    "value": `${infoPage.search.toLowerCase()}`
                                },
                                {
                                    "property": "driver",
                                    "operator": "contains",
                                    "value": `${infoPage.search.toLowerCase()}`
                                },
                                {
                                    "property": "containerNro",
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
                            "property": "vehiMarcType",
                            "operator": "=",
                            "value": `SALIDA`
                        },
                        {
                            "property": "department.id",
                            "operator": "=",
                            "value": `${infoPage.moreSearch.department}`
                        }
                    ]
                },
                sort: "-createdDate",
                limit: Config.tableRows,
                offset: infoPage.offset,
                fetchPlan: 'full',
            });
        }
        else {
            raw = JSON.stringify({
                "filter": {
                    "conditions": [
                        {
                            "group": "OR",
                            "conditions": [
                                {
                                    "property": "licensePlate",
                                    "operator": "contains",
                                    "value": `${infoPage.search.toLowerCase()}`
                                },
                                {
                                    "property": "dni",
                                    "operator": "contains",
                                    "value": `${infoPage.search.toLowerCase()}`
                                },
                                {
                                    "property": "driver",
                                    "operator": "contains",
                                    "value": `${infoPage.search.toLowerCase()}`
                                },
                                {
                                    "property": "containerNro",
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
                            "property": "vehiMarcType",
                            "operator": "=",
                            "value": `SALIDA`
                        }
                    ]
                },
                sort: "-createdDate",
                limit: Config.tableRows,
                offset: infoPage.offset,
                fetchPlan: 'full',
            });
        }
    }
    infoPage.count = await getFilterEntityCount("Vehicular", raw);
    dataPage = await getFilterEntityData("Vehicular", raw);
    return dataPage;
};
export class VehicularsExit {
    constructor() {
        this.dialogContainer = document.getElementById('app-dialogs');
        this.siebarDialogContainer = document.getElementById('entity-editor-container');
        this.appContainer = document.getElementById('datatable-container');
        this.render = async (offset, actualPage, search, moreSearch) => {
            infoPage.offset = offset;
            infoPage.currentPage = actualPage;
            infoPage.search = search;
            infoPage.moreSearch.department = moreSearch;
            this.appContainer.innerHTML = '';
            this.appContainer.innerHTML = UIContentLayout;
            // Getting interface elements
            const viewTitle = document.getElementById('view-title');
            const tableBody = document.getElementById('datatable-body');
            // Changing interface element content
            viewTitle.innerText = pageName;
            tableBody.innerHTML = '.Cargando...';
            let eventsArray = await GetVehiculars();
            tableBody.innerHTML = UITableSkeletonTemplate.repeat(tableRows);
            // Exec functions
            this.load(tableBody, currentPage, eventsArray);
            this.searchNotes(tableBody /*, eventsArray*/);
            new filterDataByHeaderType().filter();
            this.pagination(eventsArray, tableRows, infoPage.currentPage);
            this.export();
            // Rendering icons
        };
        this.load = (tableBody, currentPage, events) => {
            tableBody.innerHTML = ''; // clean table
            // configuring max table row size
            currentPage--;
            let start = tableRows * currentPage;
            let end = start + tableRows;
            let paginatedItems = events.slice(start, end);
            // Show message if page is empty
            if (events.length === 0) {
                let row = document.createElement('TR');
                row.innerHTML = `
            <td>No existen datos<td>
            <td></td>
            <td></td>
            `;
                tableBody.appendChild(row);
            }
            else {
                for (let i = 0; i < paginatedItems.length; i++) {
                    let vehicular = paginatedItems[i]; // getting visit items
                    let row = document.createElement('TR');
                    row.innerHTML += `
                <td>${vehicular?.containerNro ?? ''}</td>
                <td style="white-space: nowrap">${vehicular?.licensePlate ?? ''}</td>
                <td>${vehicular?.dni ?? ''}</td>
                <td>${vehicular?.driver ?? ''}</td>
                <td>${vehicular?.department?.name ?? ''}</td>
                <td id="table-date">${vehicular?.egressDate ?? ''}</td>
                <td id="table-date">${vehicular?.egressTime ?? ''}</td>

                <td>
                    <button class="button" id="print-entity" data-entityId="${vehicular.id}">
                        <i class="fa-solid fa-file-pdf"></i>
                    </button>

                    <button class="button" id="entity-details" data-entityId="${vehicular.id}">
                        <i class="table_icon fa-regular fa-magnifying-glass"></i>
                    </button>
                </td>
                `;
                    tableBody.appendChild(row);
                    // TODO: Corret this fixer
                    // fixDate()
                }
                this.previewEvent();
                this.print();
            }
        };
        this.searchNotes = async (tableBody /*, visits: any*/) => {
            const search = document.getElementById('search');
            const btnSearch = document.getElementById('btnSearch');
            search.value = infoPage.search;
            await search.addEventListener('keyup', () => {
                /*const arrayVisits = visits.filter((vehicular: any) => `${vehicular.licensePlate}${vehicular.dni}${vehicular.driver}${vehicular.ingressDate}${vehicular.ingressTime}${vehicular.egressDate}${vehicular.egressTime}${vehicular.visitState.name}`
                        .toLowerCase()
                        .includes(search.value.toLowerCase()));
                
    
                let filteredEvents = arrayVisits.length
                let result = arrayVisits
    
                if (filteredEvents >= Config.tableRows) filteredEvents = Config.tableRows
    
                this.load(tableBody, currentPage, result)
                this.pagination(result, tableRows, currentPage)
    
                // Rendering icons*/
            });
            const cmbDepartments = document.getElementById('cmbDepartments');
            let raw = JSON.stringify({
                "filter": {
                    "conditions": [
                        {
                            "property": `customer.id`,
                            "operator": "=",
                            "value": `${customerId}`
                        }
                    ]
                },
                sort: "name"
            });
            let listDepartments = await getFilterEntityData(`Department`, raw);
            if (listDepartments.length != 0 || listDepartments != undefined) {
                for (let i = 0; i < listDepartments.length; i++) {
                    let department = listDepartments[i]; // getting visit items
                    let option = document.createElement('option');
                    option.setAttribute('value', department.id);
                    option.innerHTML = department?.name ?? '';
                    cmbDepartments.appendChild(option);
                }
                cmbDepartments.value = infoPage.moreSearch.department;
            }
            btnSearch.addEventListener('click', async () => {
                new VehicularsExit().render(Config.offset, Config.currentPage, search.value.toLowerCase().trim(), cmbDepartments.value);
            });
        };
        this.previewEvent = async () => {
            const openPreview = document.querySelectorAll('#entity-details');
            openPreview.forEach((preview) => {
                let currentEventId = preview.dataset.entityid;
                preview.addEventListener('click', () => {
                    previewBox(currentEventId);
                });
            });
            const previewBox = async (entity) => {
                let markingData = await getEntityData('Vehicular', entity);
                renderRightSidebar(UIRightSidebar);
                const sidebarContainer = document.getElementById('entity-editor-container');
                const closeSidebar = document.getElementById('close');
                closeSidebar.addEventListener('click', () => {
                    new CloseDialog().x(sidebarContainer);
                });
                // Event details
                const _values = {
                    controlImages: document.getElementById('galeria'),
                    //status: document.getElementById('marking-status'),
                    name: document.getElementById('marking-name'),
                    dni: document.getElementById('marking-dni'),
                    license: document.getElementById('marking-license'),
                    //department: document.getElementById('marking-department'),
                    //contractor: document.getElementById('marking-contractor'),
                    //product: document.getElementById('marking-product'),
                    type: document.getElementById('marking-type'),
                    unregisteredDriver: document.getElementById('marking-unregisteredDriver'),
                    containerNro: document.getElementById('marking-containerNro'),
                    phoneNumber: document.getElementById('marking-entity-phone'),
                    department: document.getElementById('marking-department'),
                    observation: document.getElementById('marking-observation'),
                    //dayManager: document.getElementById('marking-dayManager'),
                    //nightManager: document.getElementById('marking-nightManager'),
                    // Start marking
                    //startDate: document.getElementById('marking-start-date'),
                    //startTime: document.getElementById('marking-start-time'),
                    //startGuardID: document.getElementById('marking-start-guard-id'),
                    //startGuardName: document.getElementById('marking-start-guard-name'),
                    // End marking
                    endDate: document.getElementById('marking-end-date'),
                    endTime: document.getElementById('marking-end-time'),
                    endGuardID: document.getElementById('marking-end-guard-id'),
                    endGuardName: document.getElementById('marking-end-guard-name'),
                    endManagerName: document.getElementById('marking-end-manager-name'),
                };
                //_values.status.innerText = markingData.visitState.name;
                _values.name.value = markingData?.driver ?? '';
                _values.dni.value = markingData?.dni ?? '';
                _values.license.value = markingData?.licensePlate ?? '';
                //_values.department.value = markingData?.noGuide ?? '';
                //_values.contractor.value = markingData?.supplier ?? '';
                //_values.product.value = markingData?.product ?? '';
                _values.type.value = markingData?.vehiMarcType ?? '';
                _values.unregisteredDriver.value = markingData?.unregisteredDriver ?? '';
                _values.containerNro.value = markingData?.containerNro ?? '';
                _values.phoneNumber.value = markingData?.phoneNumber ?? '';
                _values.department.value = markingData?.department?.name ?? '';
                _values.observation.value = markingData?.observation ?? '';
                //_values.dayManager.value = markingData?.dayManager ?? '';
                //_values.nightManager.value = markingData?.nightManager ?? '';
                // Start marking
                //_values.startDate.value = markingData?.ingressDate ?? '';
                //_values.startTime.value = markingData?.ingressTime ?? '';
                //_values.startGuardID.value = markingData.ingressIssued?.username ?? '';
                //_values.startGuardName.value = markingData.ingressIssued?.firstName ?? '' + ' ' + markingData.ingressIssued?.lastName ?? '';
                // End marking
                _values.endDate.value = markingData?.egressDate ?? '';
                _values.endTime.value = markingData?.egressTime ?? '';
                _values.endGuardID.value = markingData.egressIssued?.username ?? '';
                _values.endGuardName.value = markingData.egressIssued?.firstName ?? '' + ' ' + markingData.egressIssued?.lastName ?? '';
                _values.endManagerName.value = markingData.manager?.name ?? '';
                if (markingData?.image1 !== undefined || markingData?.image2 !== undefined || markingData?.image3 !== undefined || markingData?.image4 !== undefined || markingData?.image5 !== undefined || markingData?.image6 !== undefined || markingData?.image7 !== undefined || markingData?.image8 !== undefined || markingData?.image9 !== undefined || markingData?.image10 !== undefined || markingData?.image11 !== undefined || markingData?.image12 !== undefined) {
                    let images = [];
                    if (markingData?.image1 !== undefined) {
                        let details = {
                            "image": `${await getFile(markingData.image1)}`,
                            "description": `Imagen 1 - ${markingData?.dni ?? ''}`,
                            "icon": "mobile",
                            "id": "image1"
                        };
                        images.push(details);
                    }
                    if (markingData?.image2 !== undefined) {
                        let details = {
                            "image": `${await getFile(markingData.image2)}`,
                            "description": `Imagen 2 - ${markingData?.dni ?? ''}`,
                            "icon": "mobile",
                            "id": "image2"
                        };
                        images.push(details);
                    }
                    if (markingData?.image3 !== undefined) {
                        let details = {
                            "image": `${await getFile(markingData.image3)}`,
                            "description": `Imagen 3 - ${markingData?.dni ?? ''}`,
                            "icon": "mobile",
                            "id": "image3"
                        };
                        images.push(details);
                    }
                    if (markingData?.image4 !== undefined) {
                        let details = {
                            "image": `${await getFile(markingData.image4)}`,
                            "description": `Imagen 4 - ${markingData?.dni ?? ''}`,
                            "icon": "mobile",
                            "id": "image4"
                        };
                        images.push(details);
                    }
                    if (markingData?.image5 !== undefined) {
                        let details = {
                            "image": `${await getFile(markingData.image5)}`,
                            "description": `Imagen 5 - ${markingData?.dni ?? ''}`,
                            "icon": "mobile",
                            "id": "image5"
                        };
                        images.push(details);
                    }
                    if (markingData?.image6 !== undefined) {
                        let details = {
                            "image": `${await getFile(markingData.image6)}`,
                            "description": `Imagen 6 - ${markingData?.dni ?? ''}`,
                            "icon": "mobile",
                            "id": "image6"
                        };
                        images.push(details);
                    }
                    if (markingData?.image7 !== undefined) {
                        let details = {
                            "image": `${await getFile(markingData.image7)}`,
                            "description": `Imagen 7 - ${markingData?.dni ?? ''}`,
                            "icon": "mobile",
                            "id": "image7"
                        };
                        images.push(details);
                    }
                    if (markingData?.image8 !== undefined) {
                        let details = {
                            "image": `${await getFile(markingData.image8)}`,
                            "description": `Imagen 8 - ${markingData?.dni ?? ''}`,
                            "icon": "mobile",
                            "id": "image8"
                        };
                        images.push(details);
                    }
                    if (markingData?.image9 !== undefined) {
                        let details = {
                            "image": `${await getFile(markingData.image9)}`,
                            "description": `Imagen 9 - ${markingData?.dni ?? ''}`,
                            "icon": "mobile",
                            "id": "image9"
                        };
                        images.push(details);
                    }
                    if (markingData?.image10 !== undefined) {
                        let details = {
                            "image": `${await getFile(markingData.image10)}`,
                            "description": `Imagen 10 - ${markingData?.dni ?? ''}`,
                            "icon": "mobile",
                            "id": "image10"
                        };
                        images.push(details);
                    }
                    if (markingData?.image11 !== undefined) {
                        let details = {
                            "image": `${await getFile(markingData.image11)}`,
                            "description": `Imagen 11 - ${markingData?.dni ?? ''}`,
                            "icon": "mobile",
                            "id": "image11"
                        };
                        images.push(details);
                    }
                    if (markingData?.image12 !== undefined) {
                        let details = {
                            "image": `${await getFile(markingData.image12)}`,
                            "description": `Imagen 12 - ${markingData?.dni ?? ''}`,
                            "icon": "mobile",
                            "id": "image12"
                        };
                        images.push(details);
                    }
                    for (let i = 0; i < images.length; i++) {
                        _values.controlImages.innerHTML += `
                        <label><i class="fa-solid fa-${images[i].icon}"></i> ${images[i].description}</label>
                        <img width="100%" class="note_picture margin_b_8" src="${images[i].image}" id="entity-details-zoom" data-entityId="${images[i].id}" name="${images[i].id}">
                    `;
                    }
                    this.previewZoom(images);
                }
                else {
                    _values.controlImages.innerHTML += `
                    <div class="input_detail">
                        <label><i class="fa-solid fa-info-circle"></i> No hay imágenes</label>
                    </div>
                `;
                }
                this.closeRightSidebar();
            };
        };
        this.print = () => {
            const print = document.querySelectorAll('#print-entity');
            print.forEach((print) => {
                const entityId = print.dataset.entityid;
                print.addEventListener('click', async () => {
                    const data = await getEntityData('Vehicular', entityId);
                    exportVehiSalIndPdf(data);
                });
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
                    let rawExport;
                    if (infoPage.moreSearch.department != null && infoPage.moreSearch.department != 'null') {
                        rawExport = JSON.stringify({
                            "filter": {
                                "conditions": [
                                    {
                                        "property": "customer.id",
                                        "operator": "=",
                                        "value": `${customerId}`
                                    },
                                    {
                                        "property": "vehiMarcType",
                                        "operator": "=",
                                        "value": `SALIDA`
                                    },
                                    {
                                        "property": "department.id",
                                        "operator": "=",
                                        "value": `${infoPage.moreSearch.department}`
                                    },
                                    {
                                        "property": "egressDate",
                                        "operator": ">=",
                                        "value": `${_values.start.value}`
                                    },
                                    {
                                        "property": "egressDate",
                                        "operator": "<=",
                                        "value": `${_values.end.value}`
                                    }
                                ],
                            },
                            sort: "-createdDate",
                            fetchPlan: 'full',
                        });
                    }
                    else {
                        rawExport = JSON.stringify({
                            "filter": {
                                "conditions": [
                                    {
                                        "property": "customer.id",
                                        "operator": "=",
                                        "value": `${customerId}`
                                    },
                                    {
                                        "property": "vehiMarcType",
                                        "operator": "=",
                                        "value": `SALIDA`
                                    },
                                    {
                                        "property": "egressDate",
                                        "operator": ">=",
                                        "value": `${_values.start.value}`
                                    },
                                    {
                                        "property": "egressDate",
                                        "operator": "<=",
                                        "value": `${_values.end.value}`
                                    }
                                ],
                            },
                            sort: "-createdDate",
                            fetchPlan: 'full',
                        });
                    }
                    const vehiculars = await getFilterEntityData("Vehicular", rawExport); //await GetVehiculars();
                    for (let i = 0; i < _values.exportOption.length; i++) {
                        let ele = _values.exportOption[i];
                        if (ele.type = "radio") {
                            if (ele.checked) {
                                if (ele.value == "xls") {
                                    // @ts-ignore
                                    exportVehiSalXls(vehiculars, _values.start.value, _values.end.value);
                                }
                                else if (ele.value == "csv") {
                                    // @ts-ignore
                                    exportVehiSalCsv(vehiculars, _values.start.value, _values.end.value);
                                }
                                else if (ele.value == "pdf") {
                                    // @ts-ignore
                                    exportVehiSalPdf(vehiculars, _values.start.value, _values.end.value);
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
        this.previewZoom = async (arrayImages) => {
            const openButtons = document.querySelectorAll('#entity-details-zoom');
            openButtons.forEach((openButton) => {
                const entityId = openButton.dataset.entityid;
                openButton.addEventListener('click', () => {
                    renderInterfaceZoom(entityId, arrayImages);
                });
            });
            const renderInterfaceZoom = async (entity, arrayImages) => {
                let description = '';
                for (let i = 0; i < arrayImages.length; i++) {
                    if (arrayImages[i].id == entity) {
                        description = arrayImages[i].description;
                    }
                }
                const picture = document.getElementsByName(`${entity}`);
                const close = document.getElementById("close-modalZoom");
                const modalZoom = document.getElementById('modalZoom');
                const editor = document.getElementById('entity-editor-container');
                editor.style.display = 'none';
                const img01 = document.getElementById('img01');
                const caption = document.getElementById('caption');
                modalZoom.style.display = 'block';
                img01.src = picture[0].currentSrc;
                caption.innerHTML = `${description}`;
                close.addEventListener('click', () => {
                    modalZoom.style.display = 'none';
                    const editor = document.getElementById('entity-editor-container');
                    editor.style.display = 'flex';
                });
            };
        };
        this.closeRightSidebar = () => {
            const closeButton = document.getElementById('close');
            const editor = document.getElementById('entity-editor-container');
            closeButton.addEventListener('click', () => {
                new CloseDialog().x(editor);
            });
        };
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
                const buttons = document.getElementsByName("pagination-button");
                buttons.forEach(button => {
                    button.style.background = "#ffffff";
                });
                infoPage.offset = Config.tableRows * (page - 1);
                currentPage = page;
                fillBtnPagination(page, Config.colorPagination);
                new VehicularsExit().render(infoPage.offset, currentPage, infoPage.search, infoPage.moreSearch.department);
            });
            return button;
        }
        function pagesOptions(items, currentPage) {
            paginationWrapper.innerHTML = '';
            let pages = pageNumbers(pageCount, Config.maxLimitPage, currentPage);
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
                new VehicularsExit().render(Config.offset, Config.currentPage, infoPage.search, infoPage.moreSearch.department);
            });
            nextButton.addEventListener('click', () => {
                infoPage.offset = Config.tableRows * (pageCount - 1);
                new VehicularsExit().render(infoPage.offset, pageCount, infoPage.search, infoPage.moreSearch.department);
            });
        }
    }
}
