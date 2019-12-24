import React from 'react'
import Cookies from 'js-cookie'

import './PostItHandler.css'

import PostItContainer from './PostItContainer'
import PostItControls from './PostItControls'

import * as DatesHelper from './dates'
import TRACE_DEBUG from './trace'
import * as Random from './random'
import * as Constants from './constants'

function getRandomTestData(numItems) {
  let data = [];
  for(var i = 0; i < numItems; i++) {
    data.push({
      pos: {
        top: `${Random.randomIntFromInterval(0, 200)}px`,
        left: `${Random.randomIntFromInterval(0, 200)}px`
      },
      text: DatesHelper.getWeekdayName(),
      key: `post-it-note-${i+Random.randomIntFromInterval(0, 1000)}`,
    });
  }
  return data;
}

class PostItHandler extends React.Component {

  constructor(props) {
    super(props);
    // TODO: Lift state up from both children components to better handle Drag n' Drop events
    this.state = {
      postIts: [],
    };

    this.addPostIt = this.addPostIt.bind(this);
    this.removePostIt = this.removePostIt.bind(this);
    this.handlePostItChange = this.handlePostItChange.bind(this);
    this.componentCleanup = this.componentCleanup.bind(this);
  }

  componentDidMount() {
    let cookiesData = Cookies.getJSON(Constants.COOKIES_NAME_POST_IT);
    if(cookiesData !== undefined) {
      TRACE_DEBUG('Initiating post it handler with previously saved data');
      this.setState({ postIts: cookiesData });
    }
    else {
      TRACE_DEBUG('Initiating post it handler with random test data');
      this.setState({ postIts: getRandomTestData(5) });
    }

    // Call componentCleanup before the page reloads on refresh
    window.addEventListener('beforeunload', this.componentCleanup);
  }

  componentWillUnmount() {
    this.componentCleanup();

    // Remove the event handler for normal unmounting
    window.removeEventListener('beforeunload', this.componentCleanup);
  }

  componentCleanup() {
    Cookies.set(Constants.COOKIES_NAME_POST_IT, this.state.postIts);
  }

  addPostIt() {
    TRACE_DEBUG('Add post it');
    this.setState({
      postIts: [...this.state.postIts, getRandomTestData(1)[0]],
    });
  }

  handlePostItChange(event, index, postIt) {
    let postItsCopy = Object.assign([], this.state.postIts);

    if(event.type === 'drop') {
      TRACE_DEBUG('handlePostItChange drop');
      postItsCopy[index].pos.left = postIt.pos.left;
      postItsCopy[index].pos.top = postIt.pos.top;
    }
    else if(event.type === 'change') {
      // Textarea value changed
      postItsCopy[index].text = event.target.value;
    }

    this.setState({
      postIts: postItsCopy
    });
  }

  removePostIt(event) {
    // Drop event over trashcan
    var index = event.dataTransfer.getData("postItIndex");

    if(index !== undefined) {
      let postItsCopy = Object.assign([], this.state.postIts);
      postItsCopy.splice(index, 1);

      this.setState({
        postIts: postItsCopy
      });
    }
  }

  render() {
    return(
      <React.Fragment>
        <PostItContainer postIts={this.state.postIts} handlePostItChange={this.handlePostItChange} />
        <PostItControls addPostIt={this.addPostIt} removePostIt={this.removePostIt} />
      </React.Fragment>
    );
  }
}

export default PostItHandler;