// @filename: WebAccess.ts
import { Config } from "../../../Configs.js";
import { getEntityData, getEntitiesData } from "../../../endpoints.js";
import { CloseDialog, drawTagsIntoTables, renderRightSidebar } from "../../../tools.js";
import { UIContentLayout, UIRightSidebar } from "./Layout.js";
import { UITableSkeletonTemplate } from "./Template.js";
// Local configs
const tableRows = Config.tableRows;
let currentPage = Config.currentPage;
const pageName = 'Accesos';
const GetVisits = async () => {
    const visits = await getEntitiesData('Visit');
    return visits;
};
export class WebAccess {
    constructor() {
        this.dialogContainer = document.getElementById('app-dialogs');
        this.siebarDialogContainer = document.getElementById('entity-editor-container');
        this.appContainer = document.getElementById('datatable-container');
        this.render = async () => {
            let visitsArray = await GetVisits();
            this.appContainer.innerHTML = '';
            this.appContainer.innerHTML = UIContentLayout;
            // Getting interface elements
            const viewTitle = document.getElementById('view-title');
            const tableBody = document.getElementById('datatable-body');
            // Changing interface element content
            viewTitle.innerText = pageName;
            tableBody.innerHTML = UITableSkeletonTemplate.repeat(tableRows);
            // Exec functions
            this.load(tableBody, currentPage, visitsArray);
            this.searchVisit(tableBody, visitsArray);
            // Rendering icons
        };
        this.load = (tableBody, currentPage, visits) => {
            tableBody.innerHTML = ''; // clean table
            // configuring max table row size
            currentPage--;
            let start = tableRows * currentPage;
            let end = start + tableRows;
            let paginatedItems = visits.slice(start, end);
            // Show message if page is empty
            if (visits.length === 0) {
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
                    let visit = paginatedItems[i]; // getting visit items
                    let row = document.createElement('TR');
                    row.innerHTML += `
                    <td style="white-space: nowrap">${visit.firstName} ${visit.firstLastName} ${visit.secondLastName}</td>
                    <td>${visit.dni}</td>
                    <td id="table-date">${visit.createdDate}</td>
                    <td id="table-time" style="white-space: nowrap">${visit.creationTime}</td>
                    <td>${visit.user.userType}</td>
                    <td class="tag"><span>${visit.visitState.name}</span></td>
                    <td id="table-time">${visit.citadel.description}</td>

                    <td>
                        <button class="button" id="entity-details" data-entityId="${visit.id}">
                            <i class="table_icon fa-regular fa-magnifying-glass"></i>
                        </button>
                    </td>
                `;
                    tableBody.appendChild(row);
                    drawTagsIntoTables();
                }
                this.previewVisit();
                this.fixCreatedDate();
            }
        };
        this.searchVisit = async (tableBody, visits) => {
            const search = document.getElementById('search');
            await search.addEventListener('keyup', () => {
                const arrayVisits = visits.filter((visit) => `${visit.dni}${visit.firstName}${visit.firstLastName}${visit.secondLastName}${visit.createdDate}${visit.visitState.name}${visit.user.userType}${visit.creationTime}`
                    .toLowerCase()
                    .includes(search.value.toLowerCase()));
                let filteredVisit = arrayVisits.length;
                let result = arrayVisits;
                if (filteredVisit >= Config.tableRows)
                    filteredVisit = Config.tableRows;
                this.load(tableBody, currentPage, result);
            });
        };
        this.previewVisit = async () => {
            const openButtons = document.querySelectorAll('#entity-details');
            openButtons.forEach((openButton) => {
                const entityId = openButton.dataset.entityid;
                openButton.addEventListener('click', () => {
                    renderInterface(entityId);
                });
            });
            const renderInterface = async (entity) => {
                let entityData = await getEntityData('Visit', entity);
                console.log(entityData);
                renderRightSidebar(UIRightSidebar);
                const visitName = document.getElementById('visit-name');
                visitName.value = `${entityData.firstName} ${entityData.firstLastName}`;
                const visitReason = document.getElementById('visit-reason');
                visitReason.value = entityData.reason;
                const visitAutorizedBy = document.getElementById('visit-authorizedby');
                visitAutorizedBy.value = entityData.authorizer;
                const visitStatus = document.getElementById('visit-status');
                visitStatus.innerText = entityData.visitState.name;
                const visitCitadel = document.getElementById('visit-citadel');
                visitCitadel.value = entityData.citadel.description;
                const visitCitadelID = document.getElementById('visit-citadelid');
                visitCitadelID.value = entityData.citadel.name;
                const visitDepartment = document.getElementById('visit-department');
                visitDepartment.value = entityData.department.name;
                console.log(entityData.citadel.name);
                this.closeRightSidebar();
                drawTagsIntoTables();
            };
        };
        this.closeRightSidebar = () => {
            const closeButton = document.getElementById('close');
            const editor = document.getElementById('entity-editor');
            closeButton.addEventListener('click', () => {
                new CloseDialog().x(editor, this.siebarDialogContainer);
            });
        };
        this.fixCreatedDate = () => {
            const tableDate = document.querySelectorAll('#table-date');
            tableDate.forEach((date) => {
                const separateDateAndTime = date.innerText.split('T');
                date.innerText = separateDateAndTime[0];
            });
        };
    }
}
