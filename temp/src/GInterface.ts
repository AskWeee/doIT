import {Ref} from "react";

export interface ISubMenus {
  id: string,
  label: string
}


export interface ISender {
  id: string,
  x: number,
  y: number,
  w: number,
  h: number
}

interface childProps {
  onRef?: any
}

export interface IAppProps {

}

export interface IAppState {
  child: Ref<any>,
  changeData: any,
  sender: ISender,
  isShownSubMenu: boolean,
  subMenus: Array<any>,
  event: {},
  changeSubMenus: any,
  changeContentChildren: any,
  contentChildren: Array<any>,
  jsxSubMenu: Array<any>
}

export interface IHeaderProps {
  // TODO
}

export interface IHeaderState {
  jsxMenus: any[]
}

export interface IHeaderSnapshot {
  // TODO
}
