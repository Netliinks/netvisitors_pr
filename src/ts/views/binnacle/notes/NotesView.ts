//
//  NotesView.ts
//
//  Generated by Poll Castillo on 09/03/2023.
//
import { Config } from "../../../Configs.js"
import { getEntityData, getEntitiesData, getUserInfo, getFile } from "../../../endpoints.js";
import { CloseDialog, drawTagsIntoTables, renderRightSidebar, filterDataByHeaderType, inputObserver, generateCsv  } from "../../../tools.js";
import { InterfaceElement, InterfaceElementCollection } from "../../../types.js"
import { UIContentLayout, UIExportSidebar, UIRightSidebar } from "./Layout.js"
import { UITableSkeletonTemplate } from "./Template.js"

// Local configs
const tableRows = Config.tableRows
let currentPage = Config.currentPage
const pageName = 'Notas'
const customerId = localStorage.getItem('customer_id');
const GetNotes = async (): Promise<void> => {
    const notesRaw = await getEntitiesData('Note')
    const notes = notesRaw.filter((data: any) => `${data.customer?.id}` === `${customerId}`)
    return notes
}

export class Notes {
    private dialogContainer: InterfaceElement = document.getElementById('app-dialogs')
    private siebarDialogContainer: InterfaceElement = document.getElementById('entity-editor-container')
    private appContainer: InterfaceElement = document.getElementById('datatable-container')

    public render = async (): Promise<void> => {
        let notesArray: any = await GetNotes()
        this.appContainer.innerHTML = ''
        this.appContainer.innerHTML = UIContentLayout

        // Getting interface elements
        const viewTitle: InterfaceElement = document.getElementById('view-title')
        const tableBody: InterfaceElement = document.getElementById('datatable-body')

        // Changing interface element content
        viewTitle.innerText = pageName
        tableBody.innerHTML = UITableSkeletonTemplate.repeat(tableRows)

        // Exec functions
        this.load(tableBody, currentPage, notesArray)
        this.searchNotes(tableBody, notesArray)
        new filterDataByHeaderType().filter()
        this.pagination(notesArray, tableRows, currentPage)
        this.export()
    }

    public load = (tableBody: InterfaceElement, currentPage: number, notes: any): void => {
        tableBody.innerHTML = '' // clean table

        // configuring max table row size
        currentPage--
        let start: number = tableRows * currentPage
        let end: number = start + tableRows
        let paginatedItems: any = notes.slice(start, end)

        // Show message if page is empty
        if (notes.length === 0) {
            let row: InterfaceElement = document.createElement('TR')
            row.innerHTML = `
            <td>No existen datos<td>
            <td></td>
            <td></td>
            `

            tableBody.appendChild(row)
        }
        else {
            for (let i = 0; i < paginatedItems.length; i++) {
                let note = paginatedItems[i] // getting note items
                let row: InterfaceElement = document.createElement('TR')
                const noteCreationDateAndTime = note.creationDate.split('T')
                const noteCreationDate = noteCreationDateAndTime[0]
                row.innerHTML += `
                    <td>${note.title}</td>
                    <td>${note.content}</td>
                    <td id="table-date">${noteCreationDate}</td>
                    <td>
                        <button class="button" id="entity-details" data-entityId="${note.id}" onclick="${this.previewNote(note.id)}">
                            <i class="fa-solid fa-magnifying-glass"></i>
                        </button>
                    </td>
                `
                tableBody.appendChild(row)
                
                // TODO: Corret this fixer
                // fixDate()
            }
        }

        //renderTimeStamp()
    }

    private searchNotes = async (tableBody: InterfaceElement, notes: any) => {
        const search: InterfaceElement = document.getElementById('search')
        await search.addEventListener('keyup', () => {
            const arrayNotes: any = notes.filter((note: any) =>
                `${note.title}
                ${note.content}
                ${note.creationDate}`
                    .toLowerCase()
                    .includes(search.value.toLowerCase())
            )

            let filteredNotes = arrayNotes.length
            let result = arrayNotes

            if (filteredNotes >= Config.tableRows) filteredNotes = Config.tableRows

            this.load(tableBody, currentPage, result)
            this.pagination(result, tableRows, currentPage)

            // Rendering icons
        })
    }

    private previewNote = async (noteID: string): Promise<void> => {
        const openPreview: InterfaceElement = document.querySelectorAll('#entity-details')
        openPreview.forEach((preview: InterfaceElement) => {
            let currentNoteId = preview.dataset.entityid
            preview.addEventListener('click', (): void => {
                previewBox(currentNoteId)
            })
        })

        const previewBox = async (noteId: string): Promise<void> => {
            const note = await getEntityData('Note', noteId)
            const image = await getFile(note?.attachment ?? '')
            await renderRightSidebar(UIRightSidebar)
            const sidebarContainer: InterfaceElement = document.getElementById('entity-editor-container')
            const closeSidebar: InterfaceElement = document.getElementById('close')
            closeSidebar.addEventListener('click', (): void => {
                new CloseDialog().x(sidebarContainer)
            })
            // Note details
            const _details: InterfaceElementCollection = {
                picture: document.getElementById('note-picture-placeholder'),
                title: document.getElementById('note-title'),
                content: document.getElementById('note-content'),
                author: document.getElementById('note-author'),
                authorId: document.getElementById('note-author-id'),
                date: document.getElementById('creation-date'),
                time: document.getElementById('creation-time')
            }

            

            const noteCreationDateAndTime = note.creationDate.split('T')
            const noteCreationTime = noteCreationDateAndTime[1]
            const noteCreationDate = noteCreationDateAndTime[0]

            _details.title.innerText = note.title
            _details.content.innerText = note.content
            _details.author.value = `${note.user.firstName} ${note.user.lastName}`
            _details.authorId.value = note.createdBy
            _details.date.value = noteCreationDate
            _details.time.value = noteCreationTime

            if (note.attachment !== undefined) {
                
                _details.picture.innerHTML = `
                    <img id="note-picture" height="100" width="100" class="note_picture margin_b_8" src="${image}">
                `
            }
            this.closeRightSidebar()
        }
    }

    private export = (): void => {
        const exportNotes: InterfaceElement = document.getElementById('export-button');
        exportNotes.addEventListener('click', async() => {
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
            let mes: any = fecha.getMonth()+1; //obteniendo mes
            let dia: any = fecha.getDate(); //obteniendo dia
            let anio: any = fecha.getFullYear(); //obteniendo año
            if(dia<10)
                dia='0'+dia; //agrega cero si el menor de 10
            if(mes<10)
                mes='0'+mes //agrega cero si el menor de 10

            // @ts-ignore
            document.getElementById("start-date").value = anio+"-"+mes+"-"+dia;
            // @ts-ignore
            document.getElementById("end-date").value = anio+"-"+mes+"-"+dia;
            inputObserver();
            const _closeButton: InterfaceElement = document.getElementById('cancel');
            const exportButton: InterfaceElement = document.getElementById('export-data');
            const _dialog: InterfaceElement = document.getElementById('dialog-content');
            exportButton.addEventListener('click', async() => {
                let rows = [];
                const _values = {
                    start: document.getElementById('start-date'),
                    end: document.getElementById('end-date'),
                }
                const notes: any = await GetNotes();
                        for(let i=0; i < notes.length; i++){
                            let note = notes[i]
                            let noteCreationDateAndTime = note.creationDate.split('T');
                            let noteCreationDate = noteCreationDateAndTime[0];
                            let noteCreationTime = noteCreationDateAndTime[1];
                            // @ts-ignore
                            if(noteCreationDate >= _values.start.value && noteCreationDate <= _values.end.value){
                                let obj = {
                                    "Título": `${note.title.split("\n").join("(salto)")}`,
                                    "Fecha": `${noteCreationDate}`,
                                    "Hora": `${noteCreationTime}`,
                                    "Usuario": `${note.user.firstName} ${note.user.lastName}`,
                                    "Contenido": `${note.content.split("\n").join("(salto)")}`
                                  }
                                  rows.push(obj);
                            }
                            
                        }
                        generateCsv(rows, "Notas");
                
                
            });
            _closeButton.onclick = () => {
                new CloseDialog().x(_dialog);
            };
        });
    };

    private pagination(items: [], limitRows: number, currentPage: number) {
        const tableBody: InterfaceElement = document.getElementById('datatable-body')
        const paginationWrapper: InterfaceElement = document.getElementById('pagination-container')
        paginationWrapper.innerHTML = ''

        let pageCount: number
        pageCount = Math.ceil(items.length / limitRows)

        let button: InterfaceElement

        for (let i = 1; i < pageCount + 1; i++) {
            button = setupButtons(
                i, items, currentPage, tableBody, limitRows
            )

            paginationWrapper.appendChild(button)
        }

        function setupButtons(page: any, items: any, currentPage: number, tableBody: InterfaceElement, limitRows: number) {
            const button: InterfaceElement = document.createElement('button')
            button.classList.add('pagination_button')
            button.innerText = page

            button.addEventListener('click', (): void => {
                currentPage = page
                new Notes().load(tableBody, page, items)
            })

            return button
        }
    }

    private closeRightSidebar = (): void => {
        const closeButton: InterfaceElement = document.getElementById('close')

        const editor: InterfaceElement = document.getElementById('entity-editor-container')

        closeButton.addEventListener('click', (): void => {
            new CloseDialog().x(editor)
        })
    }
}


/*async function renderTimeStamp() {
    const exportButton: InterfaceElement = document.getElementById('export-button')

    exportButton.addEventListener('click', (): void => {
        exportData()
    })

}


async function exportData() {
    console.log('%cTIMESTAMP 🕒', 'color: white;font-weight: bolder; font-size: 18px; background-color: slateblue; padding: 3px 5px')
    console.log('%cℹ️ Importante: se necesita cambiar el string de la fecha para filtrar los elementos', 'color: slateblue;font-weight: bolder; font-size: 10px;')
    renderRightSidebar(UIExportSidebar)


    const _export: InterfaceElement = document.getElementById('export-data')

    const pickedTime: any = {
        from: document.getElementById('timestamp-from'),
        to: document.getElementById('timestamp-to'),
    }

    const notes: any = await GetNotes()

    // 2023-03-21T16:28:47

    _export.addEventListener('click', (): void => {
        if (pickedTime.from.value === '') {
            alert('Debe seleccionar una fecha de inicio')
        } else {

            const preDate = pickedTime.from.value
            const postDate = pickedTime.to.value
            const fnotes: any = notes.filter((note: any) =>
                toMs(note.creationDate) > preDate && toMs(note.creationDate) < postDate
            )

            console.log(fnotes)
            console.log('Time from: ' + pickedTime.from.value)
            console.log('Time to: ' + pickedTime.to.value)
        }
    })

    console.log(_export)
}


function toMs(dateStr: any) {
    let separateDate: any = dateStr.split('T')
    const [year, month, day] = separateDate[0].split('-')
    let date = new Date(year, month - 1, day).getTime()
    console.log(date)
    return date
}*/