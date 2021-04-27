/*
Author: Eli Elad Elrom
Website: https://EliElrom.com
License: MIT License
Component: src/component/Header/Header.test.tsx
*/

import React from 'react'
import { shallow } from 'enzyme'
import Header from './Header'

describe('<Header />', () => {
  let component

  beforeEach(() => {
    component = shallow(<Header />)
  });

  test('It should mount', () => {
    expect(component.length).toBe(1)
  })
})
