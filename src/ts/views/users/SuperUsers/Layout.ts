// @filename: Layout.ts

export const tableLayout = `
  <div class="datatable" id="datatable">
    <div class="datatable_header">
      <div class="datatable_title" id="datatable-title"><h1>Superusuarios</h1></div>
      <div class="datatable_tools" id="datatable-tools">
        <input type="search"
        class="search_input"
        placeholder="Buscar"
        id="search">

        <button
          class="datatable_button add_user"
          id="new-entity">
          <i class="fa-solid fa-user-plus"></i>
        </button>

        <button
          class="datatable_button import_user"
          id="import-entities">
          Importar
        </button>
      </div>
    </div>

    <table class="datatable_content">
      <thead><tr>
        <th><span data-type="name">
          Nombre <i class="fa-regular fa-filter"></i>
        </span></th>

        <th colspan="2"><span data-type="id">
          ID <i class="fa-regular fa-filter"></i>
        </span></th>

        <!-- th class="header_filled header_key"></!-->

        <th class="thead_centered"><span data-type="status">
          Estado <i class="fa-regular fa-filter"></i>
        </span></th>

        <th><span data-type="citadel">
          Ciudadela <i class="fa-regular fa-filter"></i>
        </span></th>

        <th class="header_filled"></th>

      </tr></thead>
      <tbody id="datatable-body" class="datatable_body">

      </tbody>
    </table>

    <div class="datatable_footer">
      <div class="datatable_pagination" id="pagination-container"></div>
    </div>
  </div>`