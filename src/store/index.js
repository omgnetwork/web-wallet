import reduxThunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createStore, applyMiddleware } from 'redux';
import reducers from 'reducers';

const initialState = {};

const store = createStore(
  reducers,
  initialState,
  composeWithDevTools (
    applyMiddleware(reduxThunk)
  )
);

export default store;
