import React from "react";
import ReactDOM from "react-dom";
import renderer from "react-test-renderer";
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import App, { Search, Button, List } from "./App";
import { sortBy } from 'lodash';

Enzyme.configure({ adapter: new Adapter() });

describe("App", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  test("has a valid snapshot", () => {
    const component = renderer.create(<App />);
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe("Search", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<Search>Search</Search>, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  test("has a valid snapshot", () => {
    const component = renderer.create(<Search>Search</Search>);
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe("Button", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<Button>Button</Button>, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  test("has a valid snapshhot", () => {
    const component = renderer.create(<Button>Button</Button>);
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe("List", () => {
  const props = {
    list: [
      { title: "1", author: "1", num_comments: 1, points: 2, objectID: "y" },
      { title: "2", author: "2", num_comments: 1, points: 2, objectID: "z" },
    ],
    sortKey: 'TITLE',
    isSortReverse: false,
  };

  const SORTS = {
    NONE: list => list,
    TITLE: list => sortBy(list, 'title'),
    AUTHOR: list => sortBy(list, 'author'),
    COMMENTS: list => sortBy(list, 'num_comments').reverse(),
    POINTS: list => sortBy(list, 'points').reverse(),
  }

  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<List {...props} />, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  it('shows two items in list', () => {
    const element = shallow(
      <List {...props} />
    );

    expect(element.find('.table-row').length).toBe(2);
  });

  test("has a valid snapshot", () => {
    const component = renderer.create(<List {...props} />);
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
