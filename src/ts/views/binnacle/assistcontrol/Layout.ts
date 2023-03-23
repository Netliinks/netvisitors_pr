//
//  Layout.ts
//
//  Generated by Poll Castillo on 09/03/2023.
//
export const UIContentLayout = `
    <div class="datatable" id="datatable">
        <div class="datatable_header">
            <div class="datatable_title"><h1 id="view-title"></h1></div>

            <div class="datatable_tools" id="datatable-tools">
                <input type="search" class="search_input" placeholder="Buscar" id="search">

                <button class="datatable_button import_user" id="import-entities">Exportar</button>
            </div>
        </div>

        <table class="datatable_content">
        <thead><tr>
            <th><span data-type="name">
            Nombre <i class="fa-regular fa-filter"></i>
            </span></th>

            <th><span data-type="CI">
            CI <i class="fa-regular fa-filter"></i>
            </span></th>

            <th class="thead_centered" width=100><span data-type="start">
            Inicio <i class="fa-regular fa-filter"></i>
            </span></th>

            <th class="thead_centered" width=120><span data-type="end">
            Fin <i class="fa-regular fa-filter"></i>
            </span></th>

            <th class="thead_centered" width=110><span data-type="state">
            Estado <i class="fa-regular fa-filter"></i>
            </span></th>

            <th class="thead_centered" width=120><span data-type="details">
            Detalles
            </span></th>

        </tr></thead>
        <tbody id="datatable-body" class="datatable_body">

        </tbody>
        </table>

        <div class="datatable_footer">
        <div class="datatable_pagination" id="pagination-container"></div>
        </div>
    </div>`

export const UIRightSidebar = `
<div class="entity_editor" id="entity-editor">
<div class="entity_editor_header">
  <div class="user_info">
    <div class="avatar"><i class="fa-regular fa-user"></i></div>
    <h1 class="entity_editor_title">Detalles de <br><small>Asistencia</small></h1>
  </div>

  <button class="btn btn_close_editor" id="close"><i class="fa-solid fa-x"></i></button>
</div>

<!-- EDITOR BODY -->
<div class="entity_editor_body">
    <div class="tag"><i class="label active_label"><i class="fa-solid fa-circle-dot"></i> Estado:</i> <span class="tag_gray" id="marcation-status"></span></div>
  <br><br>
  <div class="material_input">
    <input type="text" id="entity-firstname" class="input_filled" value="" readonly>
    <label for="entity-firstname">Nombre</label>
  </div>

  <div class="material_input">
    <input type="text" id="entity-dni" class="input_filled" value="" reandonly>
    <label for="entity-dni">Cédula</label>
  </div>

  <div class="material_input">
    <input type="text" id="entity-type" class="input_filled" value="" readonly>
    <label for="entity-type">Tipo</label>
  </div>

</div>
<!-- END EDITOR BODY -->

<div class="entity_editor_footer">
  <button class="btn btn_primary btn_widder" id="update-changes">Guardar</button>
</div>
</div>
`