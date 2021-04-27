/*
Author: Eli Elad Elrom
Website: https://EliElrom.com
License: MIT License
Component: src/component/OperationProduct/OperationProduct.test.tsx
*/

import React from 'react'
import { shallow } from 'enzyme'
import OperationProduct from './OperationProduct'

describe('<OperationProduct />', () => {
  let component

  beforeEach(() => {
    component = shallow(<OperationProduct />)
  });

  test('It should mount', () => {
    expect(component.length).toBe(1)
  })
})
