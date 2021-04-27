"use strict";
// src/AppRouter.tsx
exports.__esModule = true;
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var recoil_1 = require("recoil");
var App_1 = require("./App");
var About_1 = require("./About");
var AppRouter = function () {
    return (<react_router_dom_1.BrowserRouter>
      <recoil_1.RecoilRoot>
        <react_1.Suspense fallback={<span>Loading...</span>}>
          <react_router_dom_1.Switch>
            <react_router_dom_1.Route exact path="/" component={App_1["default"]}/>
            <react_router_dom_1.Route exact path="/about" component={About_1["default"]}/>
          </react_router_dom_1.Switch>
        </react_1.Suspense>
      </recoil_1.RecoilRoot>
    </react_router_dom_1.BrowserRouter>);
};
/*
// TODO EE: To replace Recoil with Redux Toolkit;

import { Provider } from 'react-redux'
import store from './redux/store'

<Router>
  <Provider store={store}>
    <Switch>
      <Route exact path="/" component={App} />
    </Switch>
  </Provider>
</Router>

 */
/*

// TODO: EE: Without Recoil or Redux Toolkit;

// src/AppRouter.tsx

import React, { FunctionComponent } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import App from './App'

const AppRouter: FunctionComponent = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={App} />
      </Switch>
    </Router>
  )
}

 */
exports["default"] = AppRouter;
