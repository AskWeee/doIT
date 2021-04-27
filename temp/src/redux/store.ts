// src/redux/store.ts

import { configureStore, combineReducers } from '@reduxjs/toolkit'
import MenuReducer from "../js/reducers/MenuReducer";

const store = configureStore({
  reducer: combineReducers({
    // your reducers goes here
    MenuReducer
  }),
})

export default store
