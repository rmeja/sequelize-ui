import { createStore, applyMiddleware } from 'redux'
import logger from 'redux-logger'
import thunk from 'redux-thunk'
import { combineReducers } from 'redux'
import models from './models'
import currentModel from './currentModel'
import ui from './ui'
import forms from './forms'
import errors from './errors'

const rootReducer = combineReducers({
  models,
  currentModel,
  ui,
  forms,
  errors
})

const createStorage = keys => store => next => action => {
  const result = next(action)
  const state = store.getState()
  const persistedState = Object.keys(state).reduce(
    (acc, key) => (keys.includes(key) ? { ...acc, [key]: state[key] } : acc),
    {}
  )
  window.localStorage.setItem('sequelize-ui', JSON.stringify(persistedState))
  return result
}

const persistState = createStorage(['models'])

const middleware =
  process.env.NODE_ENV === 'production'
    ? applyMiddleware(persistState, thunk)
    : applyMiddleware(persistState, logger, thunk)

let persistedState
try {
  persistedState = JSON.parse(window.localStorage.getItem('sequelize-ui')) || {}
} catch (e) {
  persistedState = {}
}

const store = createStore(rootReducer, persistedState, middleware)

export default store
