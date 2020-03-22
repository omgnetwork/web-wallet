/*
Copyright 2019-present OmiseGO Pte Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. */

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { createAction } from 'actions/createAction';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

function fakeAsyncRequestSuccess () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('toto-success');
    }, 1);
  });
}

function fakeAsyncRequestFailure () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(Error('toto-failed'));
    }, 1);
  });
}

describe('createAction', () => {
  it('should return false to caller on async failure', async () => {
    const store = mockStore({});
    const res = await store.dispatch(
      createAction('TEST/GET', () => fakeAsyncRequestFailure())
    );
    expect(res).toBe(false);
  });

  it('should return true to caller on async success', async () => {
    const store = mockStore({});
    const res = await store.dispatch(
      createAction('TEST/GET', () => fakeAsyncRequestSuccess())
    );
    expect(res).toBe(true);
  });

  it('should dispatch request/success on successful async call', async () => {
    const expectedActions = [
      { type: 'TEST/GET/REQUEST' },
      { type: 'TEST/GET/SUCCESS', payload: 'toto-success' }
    ];
    const store = mockStore({});
    await store.dispatch(
      createAction('TEST/GET', () => fakeAsyncRequestSuccess())
    );
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('should dispatch request/error/uiError on failure of async call', async () => {
    const expectedActions = [
      { type: 'TEST/GET/REQUEST' },
      { type: 'TEST/GET/ERROR' },
      { type: 'UI/ERROR/UPDATE', payload: 'toto-failed' },
    ];
    const store = mockStore({});
    await store.dispatch(
      createAction('TEST/GET', () => fakeAsyncRequestFailure())
    );
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('should use custom error message when passed', async () => {
    const expectedActions = [
      { type: 'TEST/GET/REQUEST' },
      { type: 'TEST/GET/ERROR' },
      { type: 'UI/ERROR/UPDATE', payload: 'custom-error-message' },
    ];
    const store = mockStore({});
    await store.dispatch(
      createAction(
        'TEST/GET',
        () => fakeAsyncRequestFailure(),
        'custom-error-message'
      )
    );
    expect(store.getActions()).toEqual(expectedActions);
  });
});