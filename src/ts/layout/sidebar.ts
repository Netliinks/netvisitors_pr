//
//  sidebar.ts
//
//  Generated by Poll Castillo on 27/02/2023.
//
import { Config } from ".././Configs.js"
import { InterfaceElement } from "../types.js"
// Views
import { Dashboard } from "../views/dashboard/dashboard.js"
import { Notes } from "../views/binnacle/notes/NotesView.js"
import { Clients } from "../views/users/clients/clients.js"
import { Visits } from "../views/binnacle/visits/VisitsView.js"
import { Employees } from "../views/users/employees/employees.js"
// @ts-ignore
import { Contractors } from "../views/users/contractors/Contractors.js"
import { AssistControl } from "../views/attendance/assistcontrol/AssistControl.js"
import { AssistGestion } from "../views/attendance/assistgestion/AssistGestion.js"
import { Departments } from "../views/departments/Departments.js"
import { SuperUsers } from "../views/users/SuperUsers/SuperUsers.js"
import { Events } from "../views/binnacle/Events/EventsView.js"
import { Binnacle } from "../views/binnacle/binnacle/BinnacleView.js";
import { Blacklist } from "../views/users/blacklist/blacklist.js"
import { VehicularsIng } from "../views/binnacle/vehiculars/ingress/Vehiculars.js"
import { VehicularsExit } from "../views/binnacle/vehiculars/exit/Vehiculars.js"

export class Sidebar {
    private sidebarContainer: InterfaceElement = document.getElementById('app-sidebar')
    public render(): void {
        this.sidebarContainer.innerHTML = `
    <div class="app_sidebar_container">
      <div class="app_sidebar_container_menu">
        <div class="sidebar_top">
          <div class="sidebar_header"></div>

          <div class="sidebar_items"  style="overflow-y:scroll; height: 100%; max-height: 45rem;">
            <div class="sidebar_item">
              <span class="sidebar_item_label" id="render-dashboard">
                <i class="fa-regular fa-chart-simple"></i> <div class="label">Dashboard</div>
              </span>
            </div>

            <div class="sidebar_item">
              <span class="sidebar_item_label">
              <i class="fa-regular fa-user"></i> <div class="label">Usuarios</div>
              </span>

              <div class="sidebar_subitems">
                <div class="sidebar_subitem" id="render-clients">
                  <span class="sidebar_subitem_label">
                    <i class="fa-regular fa-user-group"></i> <div class="label">Clientes</div>
                  </span>
                </div>

                <div class="sidebar_subitem">
                  <span class="sidebar_subitem_label" id="render-employees">
                    <i class="fa-regular fa-users"></i> <div class="label">Empleados</div>
                  </span>
                </div>

                <div class="sidebar_subitem">
                  <span class="sidebar_subitem_label" id="render-contractors">
                    <i class="fa-regular fa-briefcase"></i> <div class="label">Contratistas</div>
                  </span>
                </div>

                <div class="sidebar_subitem">
                  <span class="sidebar_subitem_label" id="render-blacklist">
                    <i class="fa-regular fa-exclamation-triangle"></i> <div class="label">Lista Negra</div>
                  </span>
                </div>

              </div>
            </div>

            <div class="sidebar_item">
              <span class="sidebar_item_label">
              <i class="fa-regular fa-cabinet-filing"></i></i> <div class="label">Registros</div>
              </span>

              <div class="sidebar_subitems">
                <div class="sidebar_subitem" id="render-notes">
                  <span class="sidebar_subitem_label">
                    <i class="fa-regular fa-notes"></i> <div class="label">Reportes</div>
                  </span>
                </div>

                <div class="sidebar_subitem" id="render-visits">
                  <span class="sidebar_subitem_label">
                    <i class="fa-regular fa-user"></i> <div class="label">Visitas</div>
                  </span>
                </div>

                <div class="sidebar_subitem" id="render-events">
                  <span class="sidebar_subitem_label">
                    <i class="fa-regular fa-megaphone"></i> <div class="label">Eventos</div>
                  </span>
                </div>

                <div class="sidebar_subitem" id="render-binnacle">
                  <span class="sidebar_subitem_label">
                    <i class="fa-regular fa-book"></i> <div class="label">Bitácora</div>
                  </span>
                </div>

                <div class="sidebar_subitem" id="render-vehicularsing">
                  <span class="sidebar_subitem_label">
                    <i class="fa-regular fa-car"></i> <div class="label">Ingreso V.</div>
                  </span>
                </div>

                <div class="sidebar_subitem" id="render-vehicularsexit">
                  <span class="sidebar_subitem_label">
                    <i class="fa-regular fa-car"></i> <div class="label">Salida V.</div>
                  </span>
                </div>
              </div>
            </div>

            <div class="sidebar_item" id="render-deparments">
              <span class="sidebar_item_label">
                <i class="fa-regular fa-building"></i> <div class="label">Departamentos</div>
              </span>
            </div>

            <div class="sidebar_item" id="render-superusers">
              <span class="sidebar_item_label">
                <i class="fa-regular fa-shield"></i> <div class="label">Superusuarios</div>
              </span>
            </div>

            <div class="sidebar_item">
              <span class="sidebar_item_label">
              <i class="fa-regular fa-calendar"></i></i> <div class="label">Asistencia</div>
              </span>

              <div class="sidebar_subitems">

                <div class="sidebar_subitem" id="render-assistControl">
                  <span class="sidebar_subitem_label">
                    <i class="fa-regular fa-marker"></i> <div class="label">Control</div>
                  </span>
                </div>

                <div class="sidebar_subitem" id="render-assistGestion">
                  <span class="sidebar_subitem_label">
                    <i class="fa-regular fa-list-alt"></i> <div class="label">Gestión</div>
                  </span>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
        this.getSidebarItems()
        this.renders()
    }

    public getSidebarItems = (): void => {
        const sidebarItems: InterfaceElement =
            document.querySelectorAll('.sidebar_item')
        const sidebarSubitems: InterfaceElement =
            document.querySelectorAll('.sidebar_subitem')

        sidebarItems.forEach((sidebarItem: InterfaceElement) => {
            sidebarItem.addEventListener('click', () => {
                sidebarItems.forEach((sidebarItem: InterfaceElement) => sidebarItem.classList.remove('isActive'))
                sidebarItem.classList.add('isActive')
            })
        })

        sidebarSubitems.forEach((sidebarSubitem: InterfaceElement) => {
            sidebarSubitem.addEventListener('click', () => {
                sidebarSubitems.forEach((sidebarSubitem: InterfaceElement) => sidebarSubitem.classList.remove('isActive'))
                sidebarSubitem.classList.add('isActive')
            })
        })


    }

    public renders(): void {
        document.getElementById('render-dashboard')?.addEventListener('click', () => {
            new Dashboard().render()
        })

        document.getElementById('render-clients')?.addEventListener('click', (): void => {
            new Clients().render(Config.offset, Config.currentPage, "")
        })

        document.getElementById('render-employees')?.addEventListener('click', (): void => {
            new Employees().render(Config.offset, Config.currentPage, "")
        })

        document.getElementById('render-contractors')?.addEventListener('click', (): void => {
            new Contractors().render(Config.offset, Config.currentPage, "")
        })

        document.getElementById('render-blacklist')?.addEventListener('click', () => {
          new Blacklist().render(Config.offset, Config.currentPage, "");
      });

        // render notes
        document.getElementById('render-notes')?.addEventListener('click', (): void => {
            new Notes().render(Config.offset, Config.currentPage, "")
        })
        // render visits
        document.getElementById('render-visits')?.addEventListener('click', (): void => {
            new Visits().render(Config.offset, Config.currentPage, "")
        })
        document.getElementById('render-binnacle')?.addEventListener('click', () => {
          new Binnacle().render(Config.offset, Config.currentPage, "");
        });
        // render AssistControl
        document.getElementById('render-vehicularsing')?.addEventListener('click', () => {
          new VehicularsIng().render(Config.offset, Config.currentPage, "");
        });
        document.getElementById('render-vehicularsexit')?.addEventListener('click', () => {
          new VehicularsExit().render(Config.offset, Config.currentPage, "");
        });
        // render AssistControl
        document.getElementById('render-assistControl')?.addEventListener('click', (): void => {
            new AssistControl().render(Config.offset, Config.currentPage, "")
        })
        document.getElementById('render-assistGestion')?.addEventListener('click', () => {
          new AssistGestion().render();
        });
        // render AssistControl
        document.getElementById('render-events')?.addEventListener('click', (): void => {
            new Events().render(Config.offset, Config.currentPage, "")
        })
        // render Deparments
        document.getElementById('render-deparments')?.addEventListener('click', (): void => {
            new Departments().render(Config.offset, Config.currentPage, "")
        })
        // render Superusers
        document.getElementById('render-superusers')?.addEventListener('click', (): void => {
            new SuperUsers().render(Config.offset, Config.currentPage, "")
        })
    }
}


//new Clients().render()
// new AssistControl().render()
// new Notes().render()
// new SuperUsers().render()
// new Employees().render()
// new Contractors().render()
// new Dashboard().render()