import React from "react";

export const contextApp = React.createContext({
    menuItems: [],
    changeData: (x: string, y: string, items: []) => {
    }
  }
);
