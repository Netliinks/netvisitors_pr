//
//  lib.tools.ts
//
// Generated by Poll Castillo on 15/02/2023.
import { getEntitiesData } from "./endpoints.js"
import { InterfaceElement } from "./types.js"

//
export const inputObserver = (): void => {
  const inputs = <NodeListOf<Element>>document.querySelectorAll('input')
  inputs.forEach((input: any) => {
    input.addEventListener("keyup", (e: any): void => {
      if (input.value == "" || input.value == " ")
        input.classList.remove('input_filled'),
          input.value = ""
      else
        input.classList.add('input_filled')
    })
  })
}

export const inputSelect = async (entity: string, selectId: string, currentStatus?: string): Promise<void> => {
  const data = await getEntitiesData(entity)
  const state = await currentStatus
  const select: InterfaceElement = document.querySelector(`#${selectId}`)
  const inputParent = select.parentNode
  const optionsContent = inputParent.querySelector('#input-options')
  const optionsContainer: InterfaceElement = document.createElement('div')
  optionsContainer.classList.add('input_options_container')

  optionsContent.appendChild(optionsContainer)

  for (let i = 0; i < data.length; i++) {
    const inputOption: InterfaceElement = document.createElement('div')
    select.setAttribute('data-optionid', data[0].id)
    select.setAttribute('value', data[0].name)
    inputOption.classList.add('input_option')
    inputOption.setAttribute('id', data[i].id)
    inputOption.innerHTML = data[i].name

    optionsContainer.appendChild(inputOption)
  }
  const options: InterfaceElement = optionsContainer.querySelectorAll('.input_option')

  if (state === "Enabled") {
    select.value = "Activo"
  } else if (state === 'Disabled') {
    select.value = "Inactivo"
  } else {
    select.value = data[0].name
  }

  select.addEventListener('click', (): void => {
    inputParent.classList.toggle('select_active')
  })

  options.forEach((option: any) => {
    option.addEventListener('click', (): void => {
      select.value = option.innerText
      select.setAttribute('data-entityid', option.getAttribute('id'))
      inputParent.classList.remove('select_active')
    })
  })
}

export class FixStatusElement {
  public fix(element: any): void {
    const elementTextValue = element.innerText
    if (elementTextValue === "Enabled")
      elementTextValue.innerText = 'Activo',
        elementTextValue.toUpperCase()
    else
      elementTextValue.toUpperCase()
  }
}

export class FixStatusInputElement {
  public fix(inputId: string): void {
    const inputs = <NodeListOf<Element>>document.querySelectorAll(`#${inputId}`)
    inputs.forEach((input: any): void => {
      if (input.value === 'Enabled')
        input.value = 'Activo'.toUpperCase()
      else if (input.value == 'Disabled')
        input.value = 'Inactivo'.toUpperCase()
    })
  }
}

export const drawTagsIntoTables = (): void => {
  const tags: HTMLElement | any = document.querySelectorAll('.tag span')
  tags.forEach((tag: any): void => {
    let text = tag.innerText
    if (text === "Enabled" ||
      text === "enabled" ||
      text === "ENABLED" ||
      text === "Activo" ||
      text === "ACTIVO") {
      tag.innerText = "Activo"
      tag.classList.add("tag_green")
    }
    else if (text === "Disabled" ||
      text === "disabled" ||
      text === "DISABLED" ||
      text === "Inactivo" ||
      text === "INACTIVO") {
      tag.innerText = "Inactivo"
      tag.classList.add("tag_gray")
    }
  })

}