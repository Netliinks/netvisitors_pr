// @filename: Contractors.ts

import { deleteEntity, getEntitiesData, getEntityData, registerEntity, setPassword, setUserRole, updateEntity, getUserInfo, getFilterEntityData } from "../../../endpoints.js"
import { drawTagsIntoTables, inputObserver, inputSelect, CloseDialog, getVerifyEmail, generateCsv } from "../../../tools.js"
import { InterfaceElement, InterfaceElementCollection } from "../../../types.js"
import { Config } from "../../../Configs.js"
import { tableLayout } from "./Layout.js"
import { tableLayoutTemplate } from "./Templates.js"

const tableRows = Config.tableRows
const currentPage = Config.currentPage
const customerId = localStorage.getItem('customer_id')
let currentUserInfo : any
const getUsers = async (): Promise<void> => {
    const currentUser = await getUserInfo()
    currentUserInfo = await getEntityData('User', `${currentUser.attributes.id}`)

    const users: any = await getEntitiesData('User')
    const FSuper: any = users.filter((data: any) => data.isSuper === false)
    const FCustomer: any = FSuper.filter((data: any) => `${data.customer?.id}` === `${customerId}`)
    const data: any = FCustomer.filter((data: any) => `${data.userType}`.includes('CONTRACTOR'))
    return data
}

export class Contractors {
    private dialogContainer: InterfaceElement =
        document.getElementById('app-dialogs')

    private entityDialogContainer: InterfaceElement =
        document.getElementById('entity-editor-container')

    private content: InterfaceElement =
        document.getElementById('datatable-container')

    public async render(): Promise<void> {
        let data: any = await getUsers()
        this.content.innerHTML = ''
        this.content.innerHTML = tableLayout
        const tableBody: InterfaceElement = document.getElementById('datatable-body')

        tableBody.innerHTML = tableLayoutTemplate.repeat(tableRows)
        this.load(tableBody, currentPage, data)

        this.searchEntity(tableBody, data)
        this.pagination(data, tableRows, currentPage)
    }

    public load(table: InterfaceElement, currentPage: number, data: any) {
        setUserPassword()
        setRole()
        table.innerHTML = ''
        currentPage--
        let start: number = tableRows * currentPage
        let end: number = start + tableRows
        let paginatedItems: any = data.slice(start, end)
        if (data.length === 0) {
            let row: InterfaceElement = document.createElement('tr')
            row.innerHTML = `
        <td>los datos no coinciden con su búsqueda</td>
        <td></td>
        <td></td>
      `
            table.appendChild(row)
        }
        else {
            for (let i = 0; i < paginatedItems.length; i++) {
                let contractor = paginatedItems[i]
                let row: InterfaceElement =
                    document.createElement('tr')
                row.innerHTML += `
          <td>${contractor.firstName} ${contractor.lastName}</dt>
          <td>${contractor.dni}</dt>
          <td>${contractor.username}</dt>
          <td class="key"><button class="button" id="change-user-password" data-userid="${contractor.id}"><i class="fa-regular fa-key"></i></button></td>
          <td class="tag"><span>${contractor.state.name}</span></td>
          <td class="entity_options">
            <button class="button" id="edit-entity" data-entityId="${contractor.id}">
              <i class="fa-solid fa-pen"></i>
            </button>

            <button class="button" id="remove-entity" data-entityId="${contractor.id}">
              <i class="fa-solid fa-trash"></i>
            </button>
          </dt>
        `
                table.appendChild(row)
                drawTagsIntoTables()
            }
        }

        this.register()
        this.import()
        this.export()
        this.edit(this.entityDialogContainer, data)
        this.remove()
        this.changeUserPassword()
    }

    public searchEntity = async (tableBody: InterfaceElement, data: any) => {
        const search: InterfaceElement = document.getElementById('search')

        await search.addEventListener('keyup', () => {
            const arrayData: any = data.filter((user: any) =>
                `${user.firstName}
                 ${user.lastName}
                 ${user.username}
                 ${user.dni}`
                    .toLowerCase()
                    .includes(search.value.toLowerCase())
            )

            let filteredResult = arrayData.length
            let result = arrayData
            if (filteredResult >= tableRows) filteredResult = tableRows

            this.load(tableBody, currentPage, result)

        })

    }

    private changeUserPassword(): void {
        const changeUserPasswordKeys: InterfaceElement = document.querySelectorAll('#change-user-password')
        changeUserPasswordKeys.forEach((buttonKey: InterfaceElement): void => {
            buttonKey.addEventListener('click', async (): Promise<void> => {
                let userId: string = buttonKey.dataset.userid
                this.dialogContainer.style.display = 'block'
                this.dialogContainer.innerHTML = `
                    <div class="dialog_content" id="dialog-content">
                        <div class="dialog">
                            <div class="dialog_container padding_8">
                                <div class="dialog_header">
                                    <h2>Actualizar contraseña</h2>
                                </div>

                                <div class="dialog_message padding_8">
                                    <div class="material_input">
                                        <input type="password" id="password" autocomplete="none">
                                        <label for="entity-lastname"><i class="fa-solid fa-lock"></i> Nueva contraseña</label>
                                    </div>

                                    <div class="material_input">
                                        <input type="password" id="re-password" autocomplete="none">
                                        <label for="entity-lastname"><i class="fa-solid fa-lock"></i> Repetir contraseña</label>
                                    </div>
                                </div>

                                <div class="dialog_footer">
                                    <button class="btn btn_primary" id="cancel">Cancelar</button>
                                    <button class="btn btn_danger" id="update-password">Actualizar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `
                inputObserver()
                const _password: InterfaceElement = document.getElementById('password')
                const _repassword: InterfaceElement = document.getElementById('re-password')
                const _updatePasswordButton: InterfaceElement = document.getElementById('update-password')
                const _closeButton: InterfaceElement = document.getElementById('cancel')
                const _dialog: InterfaceElement = document.getElementById('dialog-content')

                _updatePasswordButton.addEventListener('click', () => {
                    if (_password.value === '') {
                        alert('El campo "Contraseña" no puede estar vacío.')
                    }
                    else if (_repassword.value === ' ') {
                        alert('Debe repetir la contraseña para continuar')
                    }
                    else if (_password.value === _repassword.value) {
                        let raw: string = JSON.stringify({
                            "id": `${userId}`,
                            "newPassword": `${_password.value}`
                        })

                        setPassword(raw)
                            .then((): void => {
                                setTimeout((): void => {
                                    alert('Se ha cambiado la contraseña')
                                    new CloseDialog().x(_dialog)
                                }, 1000)
                            })
                    }
                    else {
                        console.log('Las contraseñas no coinciden')
                        alert('Las contraseñas no coinciden')
                    }
                })

                _closeButton.onclick = () => {
                    new CloseDialog().x(_dialog)
                }
            })
        })

    }

    public register() {
        // register entity
        const openEditor: InterfaceElement = document.getElementById('new-entity')
        openEditor.addEventListener('click', (): void => {
            renderInterface('User')
        })

        const renderInterface = async (entities: string): Promise<void> => {
            this.entityDialogContainer.innerHTML = ''
            this.entityDialogContainer.style.display = 'flex'
            this.entityDialogContainer.innerHTML = `
        <div class="entity_editor" id="entity-editor">
          <div class="entity_editor_header">
            <div class="user_info">
              <div class="avatar"><i class="fa-regular fa-user"></i></div>
              <h1 class="entity_editor_title">Registrar <br><small>Contratista</small></h1>
            </div>

            <button class="btn btn_close_editor" id="close"><i class="fa-solid fa-x"></i></button>
          </div>

          <!-- EDITOR BODY -->
          <div class="entity_editor_body">
            <div class="material_input">
              <input type="text" id="entity-firstname" autocomplete="none">
              <label for="entity-firstname">Nombre</label>
            </div>

            <div class="material_input">
              <input type="text" id="entity-lastname" autocomplete="none">
              <label for="entity-lastname">Apellido</label>
            </div>

            <div class="material_input">
              <input type="text" id="entity-secondlastname" autocomplete="none">
              <label for="entity-secondlastname">2do Apellido</label>
            </div>

            <div class="material_input">
              <input type="text"
                id="entity-dni"
                maxlength="10" autocomplete="none">
              <label for="entity-dni">Cédula</label>
            </div>

            <div class="material_input">
              <input type="text"
                id="entity-phone"
                maxlength="10" autocomplete="none">
              <label for="entity-phone">Teléfono</label>
            </div>

            <div class="material_input">
              <input type="text" id="entity-username" class="input_filled" placeholder="john.doe@ejemplo.com" readonly>
              <label for="entity-username"><i class="input_locked fa-solid fa-lock"></i> Nombre de usuario</label>
            </div>

            <div class="material_input">
                <input type="email"
                    id="entity-email"
                    autocomplete="none">
                <label for="entity-email">Email</label>
            </div>

            <div class="material_input_select">
              <label for="entity-state">Estado</label>
              <input type="text" id="entity-state" class="input_select" readonly placeholder="cargando..." autocomplete="none">
              <div id="input-options" class="input_options">
              </div>
            </div>

            <!--
            <div class="material_input_select" style="display: none">
              <label for="entity-business">Empresa</label>
              <input type="text" id="entity-business" class="input_select" readonly placeholder="cargando..." autocomplete="none">
              <div id="input-options" class="input_options">
              </div>
            </div>

            <div class="material_input_select" style="display: none">
              <label for="entity-citadel">Ciudadela</label>
              <input type="text" id="entity-citadel" class="input_select" readonly placeholder="cargando...">
              <div id="input-options" class="input_options">
              </div>
            </div>

            <div class="material_input_select" style="display: none">
              <label for="entity-customer">Cliente</label>
              <input type="text" id="entity-customer" class="input_select" readonly placeholder="cargando...">
              <div id="input-options" class="input_options">
              </div>
            </div>

            <div class="material_input_select" style="display: none">
              <label for="entity-department">Departamento</label>
              <input type="text" id="entity-department" class="input_select" readonly placeholder="cargando...">
              <div id="input-options" class="input_options">
              </div>
            </div>
            -->
            <div class="form_group">
                <div class="form_input">
                    <label class="form_label" for="start-time">Entrada:</label>
                    <input type="time" class="input_time input_time-start" id="start-time" name="start-time">
                </div>

                <div class="form_input">
                    <label class="form_label" for="end-time">Salida:</label>
                    <input type="time" class="input_time input_time-end" id="end-time" name="end-time">
                </div>
            </div>

            <br>
            <div class="material_input">
              <input type="password" id="tempPass" autocomplete="false">
              <label for="tempPass">Contraseña</label>
            </div>

          </div>
          <!-- END EDITOR BODY -->

          <div class="entity_editor_footer">
            <button class="btn btn_primary btn_widder" id="register-entity">Guardar</button>
          </div>
        </div>
      `

            // @ts-ignore
            inputObserver()
            //inputSelect('Citadel', 'entity-citadel')
            //inputSelect('Customer', 'entity-customer')
            inputSelect('State', 'entity-state')
            //inputSelect('Department', 'entity-department')
            //inputSelect('Business', 'entity-business')
            this.close()
            this.generateContractorName()


            const registerButton: InterfaceElement = document.getElementById('register-entity')
            registerButton.addEventListener('click', async() => {
                let _values: InterfaceElementCollection
                _values = {
                    firstName: document.getElementById('entity-firstname'),
                    lastName: document.getElementById('entity-lastname'),
                    secondLastName: document.getElementById('entity-secondlastname'),
                    dni: document.getElementById('entity-dni'),
                    phoneNumer: document.getElementById('entity-phone'),
                    state: document.getElementById('entity-state'),
                    //customer: document.getElementById('entity-customer'),
                    username: document.getElementById('entity-username'),
                    //citadel: document.getElementById('entity-citadel'),
                    temporalPass: document.getElementById('tempPass'),
                    ingressHour: document.getElementById('start-time'),
                    turnChange: document.getElementById('end-time'),
                    //departments: document.getElementById('entity-department'),
                    email: document.getElementById('entity-email'),
                }

                const contractorRaw = JSON.stringify({
                    "lastName": `${_values.lastName.value}`,
                    "secondLastName": `${_values.secondLastName.value}`,
                    "isSuper": false,
                    "newUser": true,
                    "email": `${_values.email.value}`,
                    "temp": `${_values.temporalPass.value}`,
                    "isWebUser": false,
                    "active": true,
                    "firstName": `${_values.firstName.value}`,
                    "ingressHour": `${_values.ingressHour.value}`,
                    "turnChange": `${_values.turnChange.value}`,
                    "state": {
                        "id": `${_values.state.dataset.optionid}`
                    },
                    "contractor": {
                        "id": `${currentUserInfo.contractor.id}`
                    },
                    "customer": {
                        "id": `${customerId}`
                    },
                    "citadel": {
                        "id": `${currentUserInfo.citadel.id}`
                    },
                    "department": {
                        "id": `${currentUserInfo.department.id}`
                    },
                    "business": {
                        "id": `${currentUserInfo.business.id}`
                    },
                    "phone": `${_values.phoneNumer.value}`,
                    "dni": `${_values.dni.value}`,
                    "userType": "CONTRACTOR",
                    "username": `${_values.username.value}@${currentUserInfo.customer.name.toLowerCase().replace(/\s+/g, '')}.com`,
                })

                /*const existEmail = await getVerifyEmail(_values.email.value);
                if(existEmail == true){
                    alert("¡Correo electrónico ya existe!");
                }else */
                if(_values.firstName.value === '' || _values.firstName.value === undefined){
                    alert("¡Nombre vacío!")
                }else if(_values.lastName.value === '' || _values.lastName.value === undefined){
                    alert("¡Primer apellido vacío!")
                }else if(_values.secondLastName.value === '' || _values.secondLastName.value === undefined){
                    alert("¡Segundo apellido vacío!")
                }else if(_values.email.value === '' || _values.email.value === undefined){
                    alert("¡Correo vacío!")
                }else if(_values.dni.value === '' || _values.dni.value === undefined){
                    alert("DNI vacío!")
                }else if(_values.temporalPass.value === '' || _values.temporalPass.value === undefined){
                    alert("Clave vacío!")
                }else{
                    reg(contractorRaw);
                }
            })

        }

        const reg = async (raw: string) => {
            registerEntity(raw, 'User')
                .then((res) => {
                    setTimeout(async () => {
                        let data = await getUsers()
                        const tableBody: InterfaceElement = document.getElementById('datatable-body')
                        const container: InterfaceElement = document.getElementById('entity-editor-container')

                        new CloseDialog().x(container)
                        this.load(tableBody, currentPage, data)
                    }, 1000)
                })
        }
    }

    private generateContractorName = async (): Promise<void> => {
        let firstName: InterfaceElement
        let lastName: InterfaceElement
        let secondLastName: InterfaceElement
        let contractorName: InterfaceElement
        let userName: InterfaceElement

        firstName = document.getElementById('entity-firstname')
        lastName = document.getElementById('entity-lastname')
        secondLastName = document.getElementById('entity-secondlastname')
        contractorName = document.getElementById('entity-customer')
        userName = document.getElementById('entity-username')

        let _fragmentOne: string
        let _fragmentTwo: string
        let _fragmentThree: string

        _fragmentOne = ''
        _fragmentTwo = ''
        _fragmentThree = ''

        firstName.addEventListener('keyup', (e: any): void => {
            _fragmentOne = firstName.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            userName.setAttribute('value', `${_fragmentOne.trim()}.${_fragmentTwo}${_fragmentThree}`)
        })

        lastName.addEventListener('keyup', (e: any): void => {
            _fragmentTwo = lastName.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            userName.setAttribute('value', `${_fragmentOne.trim()}.${_fragmentTwo}${_fragmentThree}`)
        })

        secondLastName.addEventListener('keyup', (e: any): void => {
            _fragmentThree = secondLastName.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            if (secondLastName.value.length > 0) {
                _fragmentOne[0]
                userName.setAttribute('value', `${_fragmentOne}.${_fragmentTwo}${_fragmentThree[0]}`)
            }
            else {
                userName.setAttribute('value', `${_fragmentOne}.${_fragmentTwo}${_fragmentThree}`)
            }
        })

    }

    public import() {
        const _importContractors: InterfaceElement =
            document.getElementById('import-entities')
        _importContractors.addEventListener('click', (): void => {
            this.entityDialogContainer.innerHTML = ''
            this.entityDialogContainer.style.display = 'flex'
            this.entityDialogContainer.innerHTML = `
                    <div class="entity_editor id="entity-editor">
                        <div class="entity_editor_header">
                            <div class="user_info">
                                <div class="avatar">
                                    <i class="fa-regular fa-up-from-line"></i>
                                </div>

                                <h1 class="entity_editor_title">Importar <br> <small>Contratistas</small></h1>
                            </div>

                            <button class="btn btn_close_editor" id="close"><i class="fa-solid fa-x"></i></button>
                        </div>

                        <!--EDITOR BODY -->
                        <div class="entity_editor_body padding_t_8_important">
                            <div class="sidebar_section">
                                <div class="file_template">
                                    <i class="fa-solid fa-file-csv"></i>
                                    <div class="description">
                                        <p class="filename">Plantilla de Contratistas</p>
                                        <a href="./public/src/templates/NetvisitorsEmpleados.csv" download="./public/src/templates/NetvisitorsContractors.csv" rel="noopener" target="_self" class="filelink">Descargar</a>
                                    </div>
                                </div>
                            </div>

                            <div class="sidebar_section">
                                <input type="file" id="file-handler">
                            </div>
                        </div>

                        <div class="entity_editor_footer">
                            <button class="btn btn_primary btn_widder" id="button-import">Importar<button>
                        </div>
                    </div>
                `

            this.close()

            const _fileHandler: InterfaceElement = document.getElementById('file-handler')
            _fileHandler.addEventListener('change', () => {
                readFile(_fileHandler.files[0])
            })

            async function readFile(file: any): Promise<void> {
                /*const customer = await getEntitiesData('Customer')
                const citadel = await getEntitiesData('Citadel')
                const department = await getEntitiesData('Department')
                const contractor = await getEntitiesData('Contractor')*/

                const fileReader = new FileReader()
                fileReader.readAsText(file)
                fileReader.addEventListener('load', (e: any): void => {
                    let result: any = e.srcElement.result
                    let resultSplit: any = result.split('\r')
                    let rawFile: string
                    let stageUsers: any = []

                    for (let i = 1; i < resultSplit.length; i++) {
                        let contractorData: any = resultSplit[i].split(';')
                        rawFile = JSON.stringify({
                            "lastName": `${contractorData[1]?.replace(/\n/g, '')}`,
                            "secondLastName": `${contractorData[2]?.replace(/\n/g, '')}`,
                            "isSuper": false,
                            "email": "",
                            "temp": `${contractorData[5]?.replace(/\n/g, '')}`,
                            "isWebUser": false,
                            "isActive": true,
                            "newUser": true,
                            "firstName": `${contractorData[0]?.replace(/\n/g, '')}`,
                            "ingressHour": `${contractorData[6]?.replace(/\n/g, '')}`,
                            "turnChange": `${contractorData[7]?.replace(/\n/g, '')}`,
                            "state": {
                                "id": "60885987-1b61-4247-94c7-dff348347f93"
                            },
                            "contractor": {
                                "id": `${currentUserInfo.contractor?.id}`,
                            },
                            "customer": {
                                "id": `${customerId}`
                            },
                            "citadel": {
                                "id": `${currentUserInfo.citadel?.id}`
                            },
                            "department": {
                                "id": `${currentUserInfo.department?.id}`
                            },
                            "business": {
                                "id": `${currentUserInfo.business.id}`
                            },
                            "phone": `${contractorData[3]?.replace(/\n/g, '')}`,
                            "dni": `${contractorData[4]?.replace(/\n/g, '')}`,
                            "userType": "CONTRACTOR",
                            "username": `${contractorData[0]?.toLowerCase().replace(/\n/g, '')}.${contractorData[1]?.toLowerCase().replace(/\n/g, '')}${contractorData[2]?.toLowerCase().replace(/\n/g, '')[0]}@${currentUserInfo.customer.name.toLowerCase().replace(/\s+/g, '')}.com`,
                            "createVisit": false,
                        })

                        stageUsers.push(rawFile)
                    }

                    const _import: InterfaceElement = document.getElementById('button-import')
                    _import.addEventListener('click', (): void => {
                        stageUsers.forEach((user: any) => {
                            registerEntity(user, 'User')
                                .then((res) => {
                                    setTimeout(async () => {
                                        let data = await getUsers()
                                        const tableBody: InterfaceElement = document.getElementById('datatable-body')
                                        const container: InterfaceElement = document.getElementById('entity-editor-container')

                                        new CloseDialog().x(container)
                                        new Contractors().load(tableBody, currentPage, data)
                                    }, 1000)
                                })
                        })
                    })
                })
            }
        })
    }

    public edit(container: InterfaceElement, data: any) {
        // Edit entity
        const edit: InterfaceElement = document.querySelectorAll('#edit-entity')
        edit.forEach((edit: InterfaceElement) => {
            const entityId = edit.dataset.entityid
            edit.addEventListener('click', (): void => {
                RInterface('User', entityId)
            })
        })

        const RInterface = async (entities: string, entityID: string): Promise<void> => {
            const data: any = await getEntityData(entities, entityID)
            this.entityDialogContainer.innerHTML = ''
            this.entityDialogContainer.style.display = 'flex'
            this.entityDialogContainer.innerHTML = `
                <div class="entity_editor" id="entity-editor">
                <div class="entity_editor_header">
                    <div class="user_info">
                    <div class="avatar"><i class="fa-regular fa-user"></i></div>
                    <h1 class="entity_editor_title">Editar <br><small>${data.firstName} ${data.lastName}</small></h1>
                    </div>

                    <button class="btn btn_close_editor" id="close"><i class="fa-solid fa-x"></i></button>
                </div>

                <!-- EDITOR BODY -->
                <div class="entity_editor_body">
                    <div class="material_input">
                    <input type="text" id="entity-firstname" class="input_filled" value="${data.firstName}" readonly>
                    <label for="entity-firstname">Nombre</label>
                    </div>

                    <div class="material_input">
                    <input type="text" id="entity-lastname" class="input_filled" value="${data.lastName}" reandonly>
                    <label for="entity-lastname">Apellido</label>
                    </div>

                    <div class="material_input">
                    <input type="text" id="entity-secondlastname" class="input_filled" value="${data.secondLastName}" readonly>
                    <label for="entity-secondlastname">2do Apellido</label>
                    </div>

                    <div class="material_input">
                    <input type="text"
                        id="entity-dni"
                        class="input_filled"
                        maxlength="10"
                        value="${data?.dni ?? ''}" disabled>
                    <label for="entity-dni">Cédula</label>
                    </div>

                    <div class="material_input">
                    <input type="email" id="entity-email" class="input_filled" value="${data?.email ?? ''}" disabled>
                    <label for="entity-email">Email</label>
                    </div>

                    <div class="material_input">
                    <input type="text"
                        id="entity-phone"
                        class="input_filled"
                        maxlength="10"
                        value="${data?.phone ?? ''}">
                    <label for="entity-phone">Teléfono</label>
                    </div>

                    <div class="material_input">
                    <input type="text" id="entity-username" class="input_filled" value="${data.username}" readonly>
                    <label for="entity-username">Nombre de usuario</label>
                    </div>

                    <div class="material_input_select">
                    <label for="entity-state">Estado</label>
                    <input type="text" id="entity-state" class="input_select" readonly placeholder="cargando...">
                    <div id="input-options" class="input_options">
                    </div>
                    </div>
                    <!--
                    <div class="material_input_select" style="display: none">
                    <label for="entity-business">Empresa</label>
                    <input type="text" id="entity-business" class="input_select" readonly placeholder="cargando...">
                    <div id="input-options" class="input_options">
                    </div>
                    </div>

                    <div class="material_input_select" style="display: none">
                    <label for="entity-citadel">Ciudadela</label>
                    <input type="text" id="entity-citadel" class="input_select" readonly placeholder="cargando...">
                    <div id="input-options" class="input_options">
                    </div>
                    </div>

                    <div class="material_input_select" style="display: none">
                    <label for="entity-customer">Cliente</label>
                    <input type="text" id="entity-customer" class="input_select" readonly placeholder="cargando...">
                    <div id="input-options" class="input_options">
                    </div>
                    </div>

                    <div class="material_input_select">
                    <label for="entity-contractor">Contratista</label>
                    <input type="text" id="entity-contractor" class="input_select" readonly placeholder="cargando...">
                    <div id="input-options" class="input_options">
                    </div>
                    </div>
                    -->
                    <div class="form_group">
                        <div class="form_input">
                            <label class="form_label" for="start-time">Entrada:</label>
                            <input type="time" class="input_time input_time-start" id="start-time" name="start-time" value="${data.ingressHour}">
                        </div>

                        <div class="form_input">
                            <label class="form_label" for="end-time">Salida:</label>
                            <input type="time" class="input_time input_time-end" id="end-time" name="end-time" value="${data.turnChange}">
                        </div>
                    </div>
                    <!--
                    <br>
                    <div class="material_input">
                    <input type="password" id="tempPass" >
                    <label for="tempPass">Contraseña:</label>
                    </div> -->

                </div>
                <!-- END EDITOR BODY -->

                <div class="entity_editor_footer">
                    <button class="btn btn_primary btn_widder" id="update-changes">Guardar</button>
                </div>
                </div>
            `
            inputObserver()
            //inputSelect('Business', 'entity-citadel')
            //inputSelect('Customer', 'entity-customer')
            inputSelect('State', 'entity-state', data.state.name)
            //inputSelect('Business', 'entity-business')
            //inputSelect('Contractor', 'entity-contractor')
            this.close()
            updatecontractor(entityID)
        }

        const updatecontractor = async (contractorId: any): Promise<void> => {
            let updateButton: InterfaceElement
            updateButton = document.getElementById('update-changes')

            const _values: InterfaceElementCollection = {
                //firstName: document.getElementById('entity-firstname'),
                //lastName: document.getElementById('entity-lastname'),
                //secondLastName: document.getElementById('entity-secondlastname'),
                phone: document.getElementById('entity-phone'),
                //dni: document.getElementById('entity-dni'),
                status: document.getElementById('entity-state'),
                ingressHour: document.getElementById('start-time'),
                turnChange: document.getElementById('end-time'),
                //contractor: document.getElementById('entity-contractor'),
            }

            updateButton.addEventListener('click', () => {
                let contractorRaw = JSON.stringify({
                    //"lastName": `${_values.lastName.value}`,
                    //"secondLastName": `${_values.secondLastName.value}`,
                    "active": true,
                    //"firstName": `${_values.firstName.value}`,
                    "state": {
                        "id": `${_values.status.dataset.optionid}`
                    },
                    "ingressHour": `${_values.ingressHour.value}`,
                    "turnChange": `${_values.turnChange.value}`,
                    "phone": `${_values.phone.value}`,
                    //"dni": `${_values.dni.value}`,
                    /*"contractor": {
                        "id": `${_values.contractor.optionid}`
                    }*/
                })

                update(contractorRaw)
            })

            /**
             * Update entity and execute functions to finish defying user
             * @param raw
             */
            const update = (raw: string) => {
                updateEntity('User', contractorId, raw)
                    .then((res) => {
                        setTimeout(async () => {
                            let tableBody: InterfaceElement
                            let container: InterfaceElement
                            let data: any

                            tableBody = document.getElementById('datatable-body')
                            container = document.getElementById('entity-editor-container')
                            data = await getUsers()

                            new CloseDialog().x(container)
                            this.load(tableBody, currentPage, data)
                        }, 100)
                    })
            }
        }
    }

    public remove() {
        const remove: InterfaceElement = document.querySelectorAll('#remove-entity')
        remove.forEach((remove: InterfaceElement) => {

            const entityId = remove.dataset.entityid

            remove.addEventListener('click', (): void => {
                this.dialogContainer.style.display = 'block'
                this.dialogContainer.innerHTML = `
          <div class="dialog_content" id="dialog-content">
            <div class="dialog dialog_danger">
              <div class="dialog_container">
                <div class="dialog_header">
                  <h2>¿Deseas eliminar este contratista?</h2>
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
        `

                // delete button
                // cancel button
                // dialog content
                const deleteButton: InterfaceElement = document.getElementById('delete')
                const cancelButton: InterfaceElement = document.getElementById('cancel')
                const dialogContent: InterfaceElement = document.getElementById('dialog-content')

                deleteButton.onclick = () => {
                    deleteEntity('User', entityId)
                    .then((res) => {
                        setTimeout(async () => {
                            let data = await getUsers();
                            const tableBody = document.getElementById('datatable-body');
                            new CloseDialog().x(dialogContent);
                            new Contractors().load(tableBody, currentPage, data);
                        }, 1000)
                    })
                }

                cancelButton.onclick = () => {
                    new CloseDialog().x(dialogContent)
                    this.render()
                }
            })
        })

    }

    private export = (): void => {
        const exportUsers: InterfaceElement = document.getElementById('export-entities');
        exportUsers.addEventListener('click', async() => {
            let rows = []
            const users: any = await getUsers()
            for(let i=0; i < users.length; i++){
                let user = users[i]
                // @ts-ignore
                    let obj = {
                        "Nombre": `${user.firstName.split("\n").join("(salto)")}`,
                        "Apellido 1": `${user.lastName.split("\n").join("(salto)")}`,
                        "Apellido 2": `${user.secondLastName.split("\n").join("(salto)")}`,
                        "Usuario": `${user.username}`,
                        "DNI": `${user?.dni}`,
                        "Email": `${user?.email ?? ''}`,
                        "Teléfono": `${user?.phone ?? ''}`,
                        "ingressHour": `${user?.ingressHour ?? ''}`,
                        "turnChange": `${user?.turnChange ?? ''}`
                        }
                        rows.push(obj)
            }
            generateCsv(rows, "Contratistas")
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
                new Contractors().load(tableBody, page, items)
            })

            return button
        }
    }

    public close(): void {
        const closeButton: InterfaceElement = document.getElementById('close')
        const editor: InterfaceElement = document.getElementById('entity-editor-container')

        closeButton.addEventListener('click', () => {
            new CloseDialog().x(editor)
        })
    }
}


export async function setUserPassword(): Promise<any> {
    /*const users: any = await getEntitiesData('User')
    const filterBySuperUsers: any = users.filter((data: any) => data.isSuper === false)
    const FCustomer: any = filterBySuperUsers.filter((data: any) => `${data.customer?.id}` === `${customerId}`)
    const filterByUserType: any = FCustomer.filter((data: any) => `${data.userType}`.includes('CONTRACTOR'))
    const data: any = filterByUserType*/
    let raw = JSON.stringify({
        "filter": {
            "conditions": [
              {
                "property": "isSuper",
                "operator": "=",
                "value": `${false}`
              },
              {
                "property": "customer.id",
                "operator": "=",
                "value": `${customerId}`
              },
              {
                "property": "userType",
                "operator": "=",
                "value": `CONTRACTOR`
              }
            ]
        }
    })
    let data = await getFilterEntityData("User", raw)

    data.forEach((newUser: any) => {
        let raw: string = JSON.stringify({
            "id": `${newUser.id}`,
            "newPassword": `${newUser.temp}`
        })

        if (newUser.newUser === true && (newUser.temp !== undefined || newUser.temp !== ''))
            setPassword(raw)
    })
}

export async function setRole(): Promise<void> {
    /*const users: any = await getEntitiesData('User')
    const filterByNewUsers: any = users.filter((data: any) => data.newUser == true)
    const FCustomer: any = filterByNewUsers.filter((data: any) => `${data.customer?.id}` === `${customerId}`)
    const filterByUserType: any = FCustomer.filter((data: any) => `${data.userType}`.includes('CONTRACTOR'))
    const data: any = filterByUserType*/
    let raw = JSON.stringify({
        "filter": {
            "conditions": [
              {
                "property": "isSuper",
                "operator": "=",
                "value": `${false}`
              },
              {
                "property": "newUser",
                "operator": "=",
                "value": `${true}`
              },
              {
                "property": "customer.id",
                "operator": "=",
                "value": `${customerId}`
              },
              {
                "property": "userType",
                "operator": "=",
                "value": `CONTRACTOR`
              }
            ]
        }
    })
    let data = await getFilterEntityData("User", raw)
    data.forEach((newUser: any) => {
        let raw: string = JSON.stringify({
            "id": `${newUser.id}`,
            "roleCode": 'app_clientes'
        })

        let updateNewUser: string = JSON.stringify({
            "newUser": false,
            "temp": ''
        })

        if (newUser.newUser == true) {
            setUserRole(raw).then((res) => {
                setTimeout(() => {
                    updateEntity('User', newUser.id, updateNewUser)
                }, 1000)
            })
        }
    })
}