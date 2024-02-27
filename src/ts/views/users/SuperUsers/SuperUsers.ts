// @filename: SuperUsers.ts

import { deleteEntity, getEntityData, registerEntity, setPassword, setUserRole, updateEntity, getUserInfo, sendMail, getFilterEntityData, getFilterEntityCount } from "../../../endpoints.js"
import { NUsers } from "../../../namespaces.js"
import { drawTagsIntoTables, inputObserver, inputSelect, CloseDialog, getVerifyEmail, filterDataByHeaderType, getVerifyUsername, pageNumbers, fillBtnPagination } from "../../../tools.js"
import { InterfaceElement } from "../../../types.js"
import { Config } from "../../../Configs.js"
import { tableLayout, UIConvertToSU } from "./Layout.js"
import { tableLayoutTemplate } from "./Templates.js"
//import { verifyUserType } from "../../../tools.js"
import { exportSuperCsv, exportSuperPdf, exportSuperXls } from "../../../exportFiles/superUsers.js"

const tableRows = Config.tableRows
const currentPage = Config.currentPage
const SUser = true
let currentUserInfo: any; 
const customerId = localStorage.getItem('customer_id');
let infoPage = {
    count: 0,
    offset: Config.offset,
    currentPage: currentPage,
    search: ""
}
let dataPage: any
const getUsers = async (superUser: boolean): Promise<void> => {
    const currentUser = await getUserInfo();
    const user = await getEntityData('User', `${currentUser.attributes.id}`);
    currentUserInfo = user;

    //const users: any = await getEntitiesData('User')
    //const FSuper: any = users.filter((data: any) => data.isSuper === superUser)
    //const FCustomer = FSuper.filter((data: any) => `${data.customer?.id}` === `${customerId}`)
    //const SuperUsers: any = FCustomer.filter((data: any) => `${data.userType}`.includes('CUSTOMER'))
    let raw = JSON.stringify({
        "filter": {
            "conditions": [
              {
                "property": "customer.id",
                "operator": "=",
                "value": `${customerId}`
              },
              {
                "property": "isSuper",
                "operator": "=",
                "value": `${superUser}`
              },
              {
                "property": "userType",
                "operator": "=",
                "value": `CUSTOMER`
              }
            ],
            
        }, 
        sort: "-createdDate",
        limit: Config.tableRows,
        offset: infoPage.offset,
        fetchPlan: 'full',
        
    })
    if(infoPage.search != ""){
        raw = JSON.stringify({
            "filter": {
                "conditions": [
                  {
                    "group": "OR",
                    "conditions": [
                      {
                        "property": "dni",
                        "operator": "contains",
                        "value": `${infoPage.search.toLowerCase()}`
                      },
                      {
                        "property": "firstName",
                        "operator": "contains",
                        "value": `${infoPage.search.toLowerCase()}`
                      },
                      {
                        "property": "lastName",
                        "operator": "contains",
                        "value": `${infoPage.search.toLowerCase()}`
                      },
                      {
                        "property": "secondLastName",
                        "operator": "contains",
                        "value": `${infoPage.search.toLowerCase()}`
                      },
                      {
                        "property": "username",
                        "operator": "contains",
                        "value": `${infoPage.search.toLowerCase()}`
                      },
                      {
                        "property": "email",
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
                    "property": "isSuper",
                    "operator": "=",
                    "value": `${superUser}`
                  },
                  {
                    "property": "userType",
                    "operator": "=",
                    "value": `CUSTOMER`
                  }
                ]
              },
            sort: "-createdDate",
            limit: Config.tableRows,
            offset: infoPage.offset,
            fetchPlan: 'full',
            
        })
    }
    infoPage.count = await getFilterEntityCount("User", raw)
    dataPage = await getFilterEntityData("User", raw)
    return dataPage
}

export class SuperUsers {
    private dialogContainer: InterfaceElement =
        document.getElementById('app-dialogs')

    private entityDialogContainer: InterfaceElement =
        document.getElementById('entity-editor-container')

    private content: InterfaceElement =
        document.getElementById('datatable-container')

    public async render(offset: any, actualPage: any, search: any): Promise<void> {
        infoPage.offset = offset
        infoPage.currentPage = actualPage
        infoPage.search = search
        this.content.innerHTML = ''
        this.content.innerHTML = tableLayout
        const tableBody: InterfaceElement = document.getElementById('datatable-body')
        tableBody.innerHTML = '.Cargando...'
        new filterDataByHeaderType().filter()
        let data: any = await getUsers(SUser)
        tableBody.innerHTML = tableLayoutTemplate.repeat(tableRows)
        this.load(tableBody, currentPage, data)

        this.searchEntity(tableBody/*, data*/)
        this.pagination(data, tableRows, infoPage.currentPage)
    }

    public load(table: InterfaceElement, currentPage: number, data: any) {
        setUserPassword(SUser);
        //setRole(SUser);
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
                let client = paginatedItems[i]
                let row: InterfaceElement =
                    document.createElement('tr')
                row.innerHTML += `
          <td>${client.firstName} ${client.lastName}</dt>
          <td>${client.username}</dt>
          <td class="key"><button class="button" id="change-user-password" data-userid="${client.id}"><i class="fa-regular fa-key"></i></button></td>
          <td class="tag"><span>${client.state.name}</span></td>
          <td>${client.verifiedSuper ? 'Si' : 'No'}</td>

          <td class="entity_options">
            <button class="button" id="convert-entity" data-entityId="${client.id}">
                <i class="fa-solid fa-envelope"></i>
            </button>

            <button class="button" id="edit-entity" data-entityId="${client.id}">
              <i class="fa-solid fa-pen"></i>
            </button>

            <button class="button" id="remove-entity" data-entityId="${client.id}">
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
        this.export(SUser)
        this.edit(this.entityDialogContainer, data)
        this.remove()
        this.convertToSuper()
        this.changeUserPassword()
    }

    public searchEntity = async (tableBody: InterfaceElement/*, data: any*/) => {
        const search: InterfaceElement = document.getElementById('search')
        const btnSearch: InterfaceElement = document.getElementById('btnSearch')
        search.value = infoPage.search
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

            this.load(tableBody, currentPage, result)*/

        })
        btnSearch.addEventListener('click', async () => {
            new SuperUsers().render(Config.offset , Config.currentPage, search.value.toLowerCase().trim())
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

    private register() {
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
                    <h1 class="entity_editor_title">Registrar <br><small>Superusuario</small></h1>
                    </div>

                    <button class="btn btn_close_editor" id="close"><i class="fa-regular fa-x"></i></button>
                </div>

                <!-- EDITOR BODY -->
                <div class="entity_editor_body">
                    <div class="material_input">
                    <input type="text" id="entity-firstname" autocomplete="none">
                    <label for="entity-firstname"><i class="fa-solid fa-user"></i> Nombre</label>
                    </div>

                    <div class="material_input">
                    <input type="text" id="entity-lastname" autocomplete="none">
                    <label for="entity-lastname"><i class="fa-solid fa-user"></i> Apellido</label>
                    </div>

                    <div class="material_input">
                    <input type="text" id="entity-secondlastname" autocomplete="none">
                    <label for="entity-secondlastname"><i class="fa-solid fa-user"></i> 2do Apellido</label>
                    </div>

                    <div class="material_input">
                    <input type="text"
                        id="entity-dni"
                        maxlength="12" autocomplete="none">
                    <label for="entity-dni"><i class="fa-solid fa-id-card"></i> DNI</label>
                    </div>

                    <div class="material_input">
                    <input type="text"
                        id="entity-phone"
                        maxlength="10" autocomplete="none">
                    <label for="entity-phone"><i class="fa-solid fa-phone"></i> Teléfono</label>
                    </div>

                    <div class="material_input">
                    <input type="email"
                        id="entity-email"
                        autocomplete="none">
                    <label for="entity-email">Email</label>
                    </div>

                    <div class="material_input">
                    <input type="text" id="entity-username" class="input_filled" placeholder="john.doe@ejemplo.com" readonly>
                    <label for="entity-username"><i class="input_locked fa-solid fa-lock"></i> Nombre de usuario</label>
                    </div>

                    <div class="material_input_select">
                    <label for="entity-state">Estado</label>
                    <input type="text" id="entity-state" class="input_select" readonly placeholder="cargando..." autocomplete="none">
                    <div id="input-options" class="input_options">
                    </div>
                    </div>
                    <!--
                    <div class="material_input_select" style="display: none">
                        <label for="entity-business"><i class="fa-solid fa-building"></i> Empresa</label>
                        <input type="text" id="entity-business" class="input_select" readonly placeholder="cargando..." autocomplete="none">
                        <div id="input-options" class="input_options">
                        </div>
                    </div>

                    <div class="material_input_select">
                    <label for="entity-citadel"><i class="fa-solid fa-buildings"></i> Ciudadela</label>
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

            inputObserver()
            //inputSelect('Citadel', 'entity-citadel')
            //inputSelect('Customer', 'entity-customer')
            inputSelect('State', 'entity-state')
            //inputSelect('Department', 'entity-department')
            //inputSelect('Business', 'entity-business')
            this.close()
            this.generateUserName()

            const registerButton: InterfaceElement = document.getElementById('register-entity')
            registerButton.addEventListener('click', async() => {
                const inputsCollection: any = {
                    firstName: document.getElementById('entity-firstname'),
                    lastName: document.getElementById('entity-lastname'),
                    secondLastName: document.getElementById('entity-secondlastname'),
                    phoneNumer: document.getElementById('entity-phone'),
                    state: document.getElementById('entity-state'),
                    //customer: document.getElementById('entity-customer'),
                    username: document.getElementById('entity-username'),
                    //citadel: document.getElementById('entity-citadel'),
                    temporalPass: document.getElementById('tempPass'),
                    dni: document.getElementById('entity-dni'),
                    email: document.getElementById('entity-email'),
                }
                const randomKey = { key: Math.floor(Math.random() * 999999) };
                const raw = JSON.stringify({
                    "lastName": `${inputsCollection.lastName.value}`,
                    "secondLastName": `${inputsCollection.secondLastName.value}`,
                    "isSuper": true,
                    "newUser": true,
                    "hashSuper": randomKey.key,
                    "verifiedSuper": false,
                    "dni": `${inputsCollection.dni.value}`,
                    "email": `${inputsCollection.email.value}`,
                    "temp": `${inputsCollection.temporalPass.value}`,
                    "isWebUser": false,
                    "active": true,
                    "firstName": `${inputsCollection.firstName.value}`,
                    "state": {
                        "id": `${inputsCollection.state.dataset.optionid}`
                    },
                    "contractor": {
                        "id": `${currentUserInfo.contractor.id}`,
                    },
                    "customer": {
                        "id": `${customerId}`,
                    },
                    "citadel": {
                        "id": `${currentUserInfo.citadel.id}`,
                    },
                    "business":{
                        "id": `${currentUserInfo.business.id}`
                    },
                    "department":{
                      "id": `${currentUserInfo.department.id}`
                    },
                    "phone": `${inputsCollection.phoneNumer.value}`,
                    "userType": "CUSTOMER",
                    "username": `${inputsCollection.username.value.replace(/\s+/g, '')}@${currentUserInfo.customer.name.toLowerCase().replace(/\s+/g, '')}.com`
                })
                let mailRaw = JSON.stringify({
                    "address": inputsCollection.email.value,
                    "subject": "Netliinks - Clave de validación.",
                    "body": `Estimado ${inputsCollection.firstName.value}, el código de confirmación para ingresar a la plataforma de Netvisitors es: \n
                                                               ${randomKey.key}\nNo responder a este correo.\nSaludos.\n\n\nNetliinks S.A.`
                })
                const existEmail = await getVerifyEmail(inputsCollection.email.value)
                const existUsername = await getVerifyUsername(`${inputsCollection.username.value}@${currentUserInfo.customer.name.toLowerCase().replace(/\s+/g, '')}.com`)
                if(existUsername != "none"){
                    alert("¡Usuario ya existe, es tipo "+existUsername+"!")
                }else if(existEmail == true){
                    alert("¡Correo electrónico ya existe!")
                }else if(inputsCollection.firstName.value === '' || inputsCollection.firstName.value === undefined){
                    alert("¡Nombre vacío!")
                }else if(inputsCollection.lastName.value === '' || inputsCollection.lastName.value === undefined){
                    alert("¡Primer apellido vacío!")
                }else if(inputsCollection.secondLastName.value === '' || inputsCollection.secondLastName.value === undefined){
                    alert("¡Segundo apellido vacío!")
                }else if(inputsCollection.email.value === '' || inputsCollection.email.value === undefined){
                    alert("¡Correo vacío!")
                }else if(inputsCollection.dni.value === '' || inputsCollection.dni.value === undefined){
                    alert("DNI vacío!")
                }else if(inputsCollection.temporalPass.value === '' || inputsCollection.temporalPass.value === undefined){
                    alert("Clave vacío!")
                }else{
                    reg(raw, mailRaw)
                }   
            })

        }

        const reg = async (raw: any, mailRaw: any) => {
            registerEntity(raw, 'User')
                .then((res) => {
                    sendMail(mailRaw)
                    setTimeout(async () => {
                        //let data = await getUsers(SUser)
                        const tableBody: InterfaceElement = document.getElementById('datatable-body')
                        const container: InterfaceElement = document.getElementById('entity-editor-container')
                        new CloseDialog().x(container)
                        new SuperUsers().render(Config.offset, Config.currentPage, infoPage.search)
                        //new SuperUsers().load(tableBody, currentPage, data)
                    }, 1000)
                })
        }
    }

    private generateUserName = async (): Promise<void> => {
        const firstName: InterfaceElement = document.getElementById('entity-firstname')
        const secondName: InterfaceElement = document.getElementById('')
        const lastName: InterfaceElement = document.getElementById('entity-lastname')
        const secondLastName: InterfaceElement = document.getElementById('entity-secondlastname')
        const clientName: InterfaceElement = document.getElementById('entity-customer')

        const userName: InterfaceElement = document.getElementById('entity-username')

        let UserNameFFragment: string = ''
        let UserNameLNFragment: string = ''
        let UserNameSLNFragment: string = ''


        firstName.addEventListener('keyup', (e: any): void => {
            UserNameFFragment = firstName.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            userName.setAttribute('value', `${UserNameFFragment.trim()}.${UserNameLNFragment}${UserNameSLNFragment[0] ?? ''}`)
        })

        lastName.addEventListener('keyup', (e: any): void => {
            UserNameLNFragment = lastName.value.toLowerCase()
            userName.setAttribute('value', `${UserNameFFragment.trim()}.${UserNameLNFragment}${UserNameSLNFragment[0] ?? ''}`)
        })

        secondLastName.addEventListener('keyup', (e: any): void => {
            UserNameSLNFragment = secondLastName.value.toLowerCase()
            if (secondLastName.value.length > 0) {
                //UserNameFFragment[0]
                userName.setAttribute('value', `${UserNameFFragment}.${UserNameLNFragment}${UserNameSLNFragment[0]}`)
            }
            else {
                userName.setAttribute('value', `${UserNameFFragment}.${UserNameLNFragment}`)
            }
        })

    }

    public import() {
        const importButton: InterfaceElement =
            document.getElementById('import-entities')

        importButton.addEventListener('click', (): void => {
            console.log('Importing...')
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
              <input type="text" id="entity-lastname" class="input_filled" value="${data.lastName}" readonly>
              <label for="entity-lastname">Apellido</label>
            </div>

            <div class="material_input">
              <input type="text" id="entity-secondlastname" class="input_filled" value="${data.secondLastName}" readonly>
              <label for="entity-secondlastname">2do Apellido</label>
            </div>

            <div class="material_input">
              <input type="text"
                id="entity-phone"
                class="input_filled"
                maxlength="10"
                value="${data.phone}">
              <label for="entity-phone">Teléfono</label>
            </div>

            <div class="material_input">
              <input type="text" id="entity-username" class="input_filled" value="${data.username}" readonly>
              <label for="entity-username">Nombre de usuario</label>
            </div>

            <div class="material_input">
              <input type="text" maxlength="10" id="entity-dni" class="input_filled" value="${data.dni}">
              <label for="entity-dni">Cédula</label>
            </div>

            <div class="material_input">
              <input type="email" id="entity-email" class="input_filled" value="${data.email}" disabled>
              <label for="entity-email">Email</label>
            </div>

            <div class="material_input_select">
              <label for="entity-state">Estado</label>
              <input type="text" id="entity-state" class="input_select" readonly placeholder="cargando...">
              <div id="input-options" class="input_options">
              </div>
            </div>
            <!--
            <div class="material_input_select">
              <label for="entity-business">Empresa</label>
              <input type="text" id="entity-business" class="input_select" readonly placeholder="cargando...">
              <div id="input-options" class="input_options">
              </div>
            </div>

            <div class="material_input_select">
              <label for="entity-citadel">Ciudadela</label>
              <input type="text" id="entity-citadel" class="input_select" readonly placeholder="cargando...">
              <div id="input-options" class="input_options">
              </div>
            </div>

            <div class="material_input_select">
              <label for="entity-customer">Cliente</label>
              <input type="text" id="entity-customer" class="input_select" readonly placeholder="cargando...">
              <div id="input-options" class="input_options">
              </div>
            </div>

            <div class="material_input_select">
              <label for="entity-department">Departamento</label>
              <input type="text" id="entity-department" class="input_select" readonly placeholder="cargando...">
              <div id="input-options" class="input_options">
              </div>
            </div>

            <br><br><br>
            <div class="material_input">
              <input type="password" id="tempPass" >
              <label for="tempPass">Clave temporal</label>
            </div>
            -->
            <div style="display:flex;justify-content:center">
                <img alt="Código QR ${data?.dni ?? ''}" id="qrcode">
                <br>
                <button id="btnDescargar">Descargar</button>
            </div>
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
            //inputSelect('Department', 'entity-department')
            //inputSelect('Business', 'entity-business')
            const qr: InterfaceElement = document.getElementById("qrcode")
            // @ts-ignore
            new QRious({
                element: qr,
                value: data.id, // La URL o el texto
                size: 250,
                backgroundAlpha: 1, // 0 para fondo transparente
                foreground: "#1D4C82FF", // Color del QR
                level: "H", // Puede ser L,M,Q y H (L es el de menor nivel, H el mayor)
            });
            download(qr, data)
            this.close()
            UUpdate(entityID)
        }

        const download = (qr: InterfaceElement, data: any) => {
            const btnDescargar: InterfaceElement =
                document.getElementById('btnDescargar')
            btnDescargar.addEventListener('click', () => {
                const enlace = document.createElement("a");
                enlace.href = qr.src;
                enlace.download = `Código QR ${data?.dni ?? ''}.png`;
                enlace.click();
            })
        }


        const UUpdate = async (entityId: any) => {
            const updateButton: InterfaceElement = document.getElementById('update-changes');
            updateButton.addEventListener('click', async() => {
                const $value = {
                    // @ts-ignore
                    //firstName: document.getElementById('entity-firstname'),
                    // @ts-ignore
                    //lastName: document.getElementById('entity-lastname'),
                    // @ts-ignore
                    //secondLastName: document.getElementById('entity-secondlastname'),
                    // @ts-ignore
                    phone: document.getElementById('entity-phone'),
                    // @ts-ignore
                    //email: document.getElementById('entity-email'),
                    // @ts-ignore
                    status: document.getElementById('entity-state'),
                    // @ts-ignore
                    dni: document.getElementById('entity-dni'),
                    // @ts-ignore
                    //business: document.getElementById('entity-business'),
                    // @ts-ignore
                    //citadel: document.getElementById('entity-citadel'),
                    // @ts-ignore
                    //department: document.getElementById('entity-department'),
                    // @ts-ignore
                    //customer: document.getElementById('entity-customer'),
                    //// @ts-ignore
                    //userType: document.getElementById('entity-type')
                };
              let raw = JSON.stringify({
                  // @ts-ignore
                  //"lastName": `${$value.lastName?.value}`,
                  // @ts-ignore
                  //"secondLastName": `${$value.secondLastName?.value}`,
                  "active": true,
                  // @ts-ignore
                  //"firstName": `${$value.firstName?.value}`,
                  "state": {
                      "id": `${$value.status?.dataset.optionid}`
                  },
                  //"customer": {
                  //    "id": `${$value.customer?.dataset.optionid}`
                  //},
                  // @ts-ignore
                  "phone": `${$value.phone?.value}`,
                  // @ts-ignore
                  "dni": `${$value.dni.value}`,
                  // @ts-ignore
                  //"email": `${$value.email?.value}`,
                  // @ts-ignore
                  //"userType": `${$value.userType?.dataset.optionid}`,
              });
              /*const existEmail = await getVerifyEmail($value.email?.value);
              if(existEmail == true){
                  alert("¡Correo electrónico ya existe!");
              }else{
                  update(raw);
              } */
              // @ts-ignore
              if ($value.dni.value === '' || $value.dni.value === undefined) {
                alert("DNI vacío!");
              }else{
                update(raw);
              }
            });
            const update = (raw: any) => {
              updateEntity('User', entityId, raw)
                  .then((res) => {
                  setTimeout(async () => {
                      const tableBody = document.getElementById('datatable-body');
                      const container = document.getElementById('entity-editor-container');
                      //let data = await getUsers(SUser);
                      new CloseDialog().x(container);
                      new SuperUsers().render(infoPage.offset, infoPage.currentPage, infoPage.search)
                      //new SuperUsers().load(tableBody, currentPage, data);
                  }, 100);
              });
          };
        };
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
                  <h2>¿Deseas eliminar este superusuario?</h2>
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
                            //let data = await getUsers(SUser);
                            const tableBody = document.getElementById('datatable-body');
                            new CloseDialog().x(dialogContent);
                            new SuperUsers().render(infoPage.offset, infoPage.currentPage, infoPage.search)
                            //new SuperUsers().load(tableBody, currentPage, data);
                        }, 1000)
                    })
                }

                cancelButton.onclick = () => {
                    new CloseDialog().x(dialogContent)
                    //this.render()
                }
            })
        })

    }

    private export = (SUser: any): void => {
        const exportUsers: InterfaceElement = document.getElementById('export-entities');
        exportUsers.addEventListener('click', async() => {
            this.dialogContainer.style.display = 'block';
            this.dialogContainer.innerHTML = `
                <div class="dialog_content" id="dialog-content">
                    <div class="dialog">
                        <div class="dialog_container padding_8">
                            <div class="dialog_header">
                                <h2>Seleccione un tipo</h2>
                            </div>

                            <div class="dialog_message padding_8">
                                <div class="form_group">
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
            inputObserver();
            const _closeButton: InterfaceElement = document.getElementById('cancel');
            const exportButton: InterfaceElement = document.getElementById('export-data');
            const _dialog: InterfaceElement = document.getElementById('dialog-content');
            exportButton.addEventListener('click', async() => {
                const _values: any = {
                    exportOption: document.getElementsByName('exportOption')
                }
                let rawExport = JSON.stringify({
                    "filter": {
                        "conditions": [
                          {
                            "property": "customer.id",
                            "operator": "=",
                            "value": `${customerId}`
                          },
                          {
                            "property": "isSuper",
                            "operator": "=",
                            "value": `${SUser}`
                          },
                          {
                            "property": "userType",
                            "operator": "=",
                            "value": `CUSTOMER`
                          }
                        ],
                        
                    }, 
                    sort: "-createdDate",
                    fetchPlan: 'full',
                    
                })
                const users: any = await getFilterEntityData("User", rawExport) //await getUsers(SUser)
                for (let i = 0; i < _values.exportOption.length; i++) {
                    let ele: any = _values.exportOption[i]
                    if (ele.type = "radio") {
    
                        if (ele.checked){
                            if(ele.value == "xls"){
                                // @ts-ignore
                                exportSuperXls(users)
                            }else if(ele.value == "csv"){
                                // @ts-ignore
                                exportSuperCsv(users)
                            }else if(ele.value == "pdf"){
                                // @ts-ignore
                                exportSuperPdf(users)
                            }
                        }
                    }
                }
            })
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
        pageCount = Math.ceil(infoPage.count / limitRows)

        let button: InterfaceElement

        if(pageCount <= Config.maxLimitPage){
            for (let i = 1; i < pageCount + 1; i++) {
                button = setupButtons(
                    i /*, items, currentPage, tableBody, limitRows*/
                )

                paginationWrapper.appendChild(button)
            }
            fillBtnPagination(currentPage, Config.colorPagination)
        }else{
            pagesOptions(items, currentPage)  
        }

        function setupButtons(page: any /*, items: any, currentPage: number, tableBody: InterfaceElement, limitRows: number*/) {
            const button: InterfaceElement = document.createElement('button')
            button.classList.add('pagination_button')
            button.setAttribute("name", "pagination-button")
            button.setAttribute("id", "btnPag"+page)
            button.innerText = page

            button.addEventListener('click', (): void => {
                infoPage.offset = Config.tableRows * (page - 1)
                currentPage = page
                new SuperUsers().render(infoPage.offset, currentPage, infoPage.search)
            })

            return button
        }

        function pagesOptions(items: any, currentPage: any) {
            paginationWrapper.innerHTML = ''
            let pages = pageNumbers(pageCount, Config.maxLimitPage, currentPage)
            
            const prevButton: InterfaceElement = document.createElement('button')
            prevButton.classList.add('pagination_button')
            prevButton.innerText = "<<"     
            paginationWrapper.appendChild(prevButton)

            const nextButton: InterfaceElement = document.createElement('button')
            nextButton.classList.add('pagination_button')
            nextButton.innerText = ">>"
    
            for (let i = 0; i < pages.length; i++) {
                if(pages[i] > 0 && pages[i] <= pageCount){
                    button = setupButtons(
                        pages[i]
                    )
                    paginationWrapper.appendChild(button)
                }
            }
            paginationWrapper.appendChild(nextButton)
            fillBtnPagination(currentPage, Config.colorPagination)
            setupButtonsEvents(prevButton, nextButton)
        }

        function setupButtonsEvents(prevButton: InterfaceElement, nextButton: InterfaceElement) {
            prevButton.addEventListener('click', (): void => {
                new SuperUsers().render(Config.offset, Config.currentPage, infoPage.search)
            })

            nextButton.addEventListener('click', (): void => {
                infoPage.offset = Config.tableRows * (pageCount - 1)
                new SuperUsers().render(infoPage.offset, pageCount, infoPage.search)
            })
        }
    }

    private convertToSuper() {
        const convert: InterfaceElement = document.querySelectorAll('#convert-entity')
        convert.forEach((convert: InterfaceElement) => {
            const entityId = convert.dataset.entityid
            convert.addEventListener('click', async (): Promise<void> => {
                const user = await getEntityData('User', entityId)
                if(!user.verifiedSuper){
                    this.dialogContainer.style.display = 'block'
                    this.dialogContainer.innerHTML = UIConvertToSU

                    const modalUsername: InterfaceElement = document.getElementById('username')
                    modalUsername.innerHTML = user.firstName
                    inputObserver()

                    // modal functionality
                    const nextButton: InterfaceElement = document.getElementById('button-next-userconverter')
                    const cancelButton: InterfaceElement = document.getElementById('button-cancel')
                    const buttonBack: InterfaceElement = document.getElementById('button-back')
                    const buttonSubmit: InterfaceElement = document.getElementById('button-submit')

                    const modalViews: InterfaceElement = document.querySelectorAll('.modal_view')
                    const buttonGroups: InterfaceElement = document.querySelectorAll('.modal_button_group')
                    const stepCount: InterfaceElement = document.getElementById('stepCount')
                    const resultMail: InterfaceElement = document.getElementById('result-mail')
                    const inputMail: InterfaceElement = document.getElementById('input-email')
                    const confirmationCode: InterfaceElement = document.getElementById('confirmation-code')
                    const modalContainer: InterfaceElement = document.getElementById('modal_container')
                    let mailRaw: any = []
                    let updateRaw: any = []
                    //let roleRaw: any = [];
                    inputMail.value = user.email;
                    nextButton.addEventListener('click', async() => {
                        const randomKey = { key: Math.floor(Math.random() * 999999) }
                        const existEmail = await getVerifyEmail(inputMail.value);

                        if (inputMail.value === '' || inputMail.value == null) {
                            alert('Debe ingresar un correo para continuar.')
                        }
                        else if(inputMail.value != user.email && existEmail == true){
                            alert("¡Correo electrónico ya existe!")
                        } 
                        else {
                            modalViews.forEach((modalView: InterfaceElement) => {
                                modalView.classList.toggle('modal_view-isHidden')
                                stepCount.innerText = '2'
                            });

                            buttonGroups.forEach((buttonGroup: InterfaceElement) => {
                                buttonGroup.classList.toggle('modal_button_group-isHidden')
                            })

                            resultMail.innerText = inputMail.value
                            confirmationCode.innerText = randomKey.key

                            mailRaw = JSON.stringify({
                                "address": inputMail.value,
                                "subject": "Netliinks - Clave de validación.",
                                "body": `Estimado ${user.firstName}, el código de confirmación para ingresar a la plataforma de Netvisitors es: \n
                                                                            ${randomKey.key}\nNo responder a este correo.\nSaludos.\n\n\nNetliinks S.A.`
                            })

                            updateRaw = JSON.stringify({
                                "email": inputMail.value,
                                "hashSuper": randomKey.key,
                            })

                            /*roleRaw = JSON.stringify({
                                "id": `${user.id}`,
                                "roleCode": `app_web_clientes`
                            })*/

                            sendMail(mailRaw);
                            updateEntity('User', entityId, updateRaw);
                            //setUserRole(roleRaw);
                            setTimeout(async () => {
                                //let data = await getUsers(SUser);
                                const tableBody = document.getElementById('datatable-body');
                                new CloseDialog().x(modalContainer);
                                //this.load(tableBody, currentPage, data);
                            },100);
                        }
                    })
                    cancelButton.onclick = () => {
                        new CloseDialog().x(modalContainer)
                    }
                }else{
                    alert(`Usuario ${user.username} ya está verificado.`)
                }
                

            })
        })
    }

    public close(): void {
        const closeButton: InterfaceElement = document.getElementById('close')
        const editor: InterfaceElement = document.getElementById('entity-editor-container')

        closeButton.addEventListener('click', () => {
            new CloseDialog().x(editor)
        }, false)
    }
}


/*export const setNewPassword: any = async (): Promise<void> => {
    const users: any = await getEntitiesData('User')
    const FNewUsers: any = users.filter((data: any) => data.isSuper === false)

    FNewUsers.forEach((newUser: any) => {

    })

}*/
export const setUserPassword = async (SUser: boolean) => {
    /*const users = await getEntitiesData('User');
    const filterBySuperUsers = users.filter((data: any) => data.isSuper === SUser);
    const FCustomer: any = filterBySuperUsers.filter((data: any) => `${data.customer?.id}` === `${customerId}`)
    const filterByUserType: any = FCustomer.filter((data: any) => `${data.userType}`.includes('CUSTOMER'))
    const data = filterByUserType;*/
    let raw = JSON.stringify({
        "filter": {
            "conditions": [
              {
                "property": "isSuper",
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
                "value": `CUSTOMER`
              },
              {
                "property": "newUser",
                "operator": "=",
                "value": `${true}`
              },
              {
                "property": "temp",
                "operator": "<>",
                "value": ``
              }
            ]
        }
    })
    let data = await getFilterEntityData("User", raw)
    data.forEach((newUser: any) => {
        let raw = JSON.stringify({
            "id": `${newUser.id}`,
            "newPassword": `${newUser.temp}`
        });
        if (newUser.newUser === true && (newUser.temp !== undefined || newUser.temp !== ''))
            setPassword(raw);
    });
    setRole(data)
  };
  export async function setRole(data: any) {
    /*const users = await getEntitiesData('User');
    const filterByNewUsers = users.filter((data: any) => data.newUser === SUser);
    const FCustomer: any = filterByNewUsers.filter((data: any) => `${data.customer?.id}` === `${customerId}`)
    const filterByUserType: any = FCustomer.filter((data: any) => `${data.userType}`.includes('CUSTOMER'))
    const data = filterByUserType;*/
    /*let raw = JSON.stringify({
        "filter": {
            "conditions": [
              {
                "property": "isSuper",
                "operator": "=",
                "value": `${SUser}`
              },
              {
                "property": "newUser",
                "operator": "=",
                "value": `${SUser}`
              },
              {
                "property": "customer.id",
                "operator": "=",
                "value": `${customerId}`
              },
              {
                "property": "userType",
                "operator": "=",
                "value": `CUSTOMER`
              },
              {
                "property": "temp",
                "operator": "<>",
                "value": ``
              }
            ]
        }
    })
    let data = await getFilterEntityData("User", raw)*/
    data.forEach((newUser: any) => {
        let roleCode;
        if(newUser.userType === 'CUSTOMER'){
          roleCode = 'app_web_clientes'
        }
        let raw = JSON.stringify({
            "id": `${newUser.id}`,
            "roleCode": `${roleCode}`
        });
        let updateNewUser = JSON.stringify({
            "newUser": false,
            "temp": ''
        });
        if (newUser.newUser === true) {
            setUserRole(raw).then((res) => {
                setTimeout(() => {
                    updateEntity('User', newUser.id, updateNewUser);
                }, 1000);
            })
        }
    });
  }
  