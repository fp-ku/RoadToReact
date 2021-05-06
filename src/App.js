import "./App.css";
import React, { Component } from "react";
import axios from 'axios';
import { sortBy } from 'lodash';
import { PropTypes } from 'prop-types';
import classNames from 'classnames';
import { render } from "@testing-library/react";

const DEFAULT_QUERY = 'redux';
const DEFAULT_HPP = 100;
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse(),
}

class App extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
      isLoading: false,
    };

    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.isCached = this.isCached.bind(this);
  }

  onDismiss = (objectID) => {
    this.setState(updateRemoveSearchResultState(objectID));
  }

  onSearchChange(event) {
    this.setState({ searchTerm: event.target.value });
  }

  isCached(searchTerm) {
    return !this.state.results[searchTerm];
  }

  setSearchTopStories(result) {
    const { hits, page } = result;
    this.setState(updateSearchResultState(hits, page));
};

  fetchSearchTopStories(searchTerm, page = 0) {
    this.setState({ isLoading: true });
    axios(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(result => this._isMounted && this.setSearchTopStories(result.data))
      .catch(error => this._isMounted && this.setState({ error }));
  }

  onSearchSubmit(event) {
    event.preventDefault();
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });

    if (this.isCached(searchTerm)) {
      this.fetchSearchTopStories(searchTerm);
    }
  }

  componentDidMount() {
    this._isMounted = true;

    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopStories(searchTerm);
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const { results, searchKey, searchTerm, error, isLoading} = this.state;
    const page = (results && results[searchKey] && results[searchKey].page) || 0;
    const list = (results && results[searchKey] && results[searchKey].hits) || [];

    return (
      <div className="page">
        <div className="interactions">
          <Search value={searchTerm} onChange={this.onSearchChange} onSubmit={this.onSearchSubmit}>Search</Search>
        </div>
        { error
          ? <div className="interactions">
            <p>Something is wrong.</p>
          </div>
          : <List list={list} onDismiss={this.onDismiss}/>
      }
        <div className="interactions">
          <ButtonWithLoading isLoading={isLoading} onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}>More</ButtonWithLoading>
        </div>
      </div>
    );
  }
}

const Button = ({ onClick, className = '', children }) =>  <button onClick={onClick} type="button" className={className}>{children}</button>;

Button.propTypes = {
  onClick: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.node,
};
Button.defaultProps = {
  className: '',
}

class Search extends Component {
  componentDidMount() {
    if (this.input) {
      this.input.focus();
    }
  }

  render() {
    const { value, onChange, onSubmit, children } = this.props;
  
    return (
      <form onSubmit={onSubmit}>
        <input type="text" value={value} onChange={onChange} ref={(node) => { this.input = node; }}/>
        <button type="submit">{children}</button>
      </form>)
  };
};

class List extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortKey: "NONE",
      isSortReverse: false,
    };

    this.onSort = this.onSort.bind(this);
  }

  onSort(newSortKey) {
    const { isSortReverse, sortKey } = this.state;
    const newIsSortReverse = sortKey === newSortKey && !isSortReverse;
    this.setState({ sortKey: newSortKey, isSortReverse: newIsSortReverse });
  }

  render() {
    const { list, onDismiss } = this.props;
    const { sortKey, isSortReverse } = this.state;
    const sortedList = SORTS[sortKey](list);
    const displayList = isSortReverse ? sortedList.reverse() : sortedList;

    return (
      <div className="table">
        <div className="table-header">
          <span style={{ width: "40%" }}>
            <Sort sortKey={"TITLE"} onSort={this.onSort} activeSortKey={sortKey}>
              Title
            </Sort>
          </span>
          <span style={{ width: "30%" }}>
            <Sort sortKey={"AUTHOR"} onSort={this.onSort} activeSortKey={sortKey}>
              Author
            </Sort>
          </span>
          <span style={{ width: "10%" }}>
            <Sort sortKey={"COMMENTS"} onSort={this.onSort} activeSortKey={sortKey}>
              Comments
            </Sort>
          </span>
          <span style={{ width: "10%" }}>
            <Sort sortKey={"POINTS"} onSort={this.onSort} activeSortKey={sortKey}>
              Points
            </Sort>
          </span>
          <span style={{ width: "10%" }}>Archive</span>
        </div>
        {displayList.map((item) => (
          <div key={item.objectID} className="table-row">
            <span style={{ width: "40%" }}>
              <a href={item.url}>{item.title}</a>
            </span>
            <span style={{ width: "30%" }}>{item.author}</span>
            <span style={{ width: "10%" }}>{item.num_comments}</span>
            <span style={{ width: "10%" }}>{item.points}</span>
            <span style={{ width: "10%" }}>
              <Button
                onClick={() => onDismiss(item.objectID)}
                className="button"
              >
                Remove
              </Button>
            </span>
          </div>
        ))}
        ;
      </div>
    );
  }
}
  
List.propTypes = {
  list: PropTypes.arrayOf(
    PropTypes.shape({
      objectID: PropTypes.string.isRequired,
      author: PropTypes.string,
      url: PropTypes.string,
      num_comments: PropTypes.number,
      points: PropTypes.number,
    })
  ).isRequired,
  onDismiss: PropTypes.func.isRequired,
}
  
const Loading = () => <div>Loading...</div>;
const withLoading = (Component) => ({ isLoading, ...rest }) => isLoading ? <Loading /> : <Component {...rest} />;
const ButtonWithLoading = withLoading(Button);

const Sort = ({ sortKey, onSort, activeSortKey, children }) => {
  const sortClass = classNames(
    'button-inline',
    { 'button-active': sortKey === activeSortKey }
  );
  
  return <Button className={sortClass} onClick={() => onSort(sortKey)}>{children}</Button>
}

const updateSearchResultState = (hits, page) =>
  (prevState) => {
  const { searchKey, results } = prevState;
  const oldHits = results && results[searchKey] ? results[searchKey].hits : [];
  const updatedHits = [...oldHits, ...hits];

  return { results: { ...results, [searchKey]: { hits: updatedHits, page } }, isLoading: false };
  };

const updateRemoveSearchResultState = (objectID) =>
prevState => {
    const { searchKey, results } = prevState;
    const { hits, page } = results[searchKey];
    const newList = hits.filter((item) => item.objectID !== objectID);

    return { results: { ...results, [searchKey]: { hits: newList, page } } }
  };

  export { Search, Button, List, updateSearchResultState, updateRemoveSearchResultState };
export default App;
