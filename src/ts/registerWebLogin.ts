//
//  registerWebLogin.ts
//
//  Generated by Poll Castillo on 01/03/2023.

import { currentDate, customerName } from "./UserLoggedInfo.js"
import { _userAgent, getEntityData, getUserInfo } from "./endpoints.js"

//
export const registerWebLogin = async (): Promise<void> => {
  const $userAgent: any = _userAgent
  const customer: string = await customerName()
  const creationDate: string = currentDate()
  const system: string = 'cliente'




  // User Agent *
  // Customer *
  // Creation date (day/month/year)
  // Creation time
  // System (platform type: 'cliente' or 'guardia')
  // User (the username)
  console.group('Data to reginster in Web access')
  console.info(customer)
  console.info(creationDate)
  console.log($userAgent)
  console.groupEnd()
}