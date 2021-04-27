/*
Author: Eli Elad Elrom
Website: https://EliElrom.com
License: MIT License
Component: src/component/Content/Content.test.tsx
*/

import React from 'react'
import { shallow } from 'enzyme'
import Content from './Content'

describe('<Content />', () => {
  let component

  beforeEach(() => {
    component = shallow(<Content />)
  });

  test('It should mount', () => {
    expect(component.length).toBe(1)
  })
})
