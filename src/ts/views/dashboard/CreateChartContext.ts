//
//  CreateChartContext.ts
//
//  Generated by Poll Castillo on 23/02/2023.
//
import { InterfaceElement } from "../../types.js"

export const createChartContext = (type: string): void => {
  const chartContainer: InterfaceElement =
    document.querySelector('.chart_container')
  chartContainer.innerHTML = ""
  const CANVAS: InterfaceElement =
    document.createElement('canvas')
  CANVAS.setAttribute('id', `${type}-chart`)
  chartContainer.appendChild(CANVAS)
}