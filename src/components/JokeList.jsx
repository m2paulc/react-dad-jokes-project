import PropTypes from 'prop-types';
import { Component } from 'react';
import Joke from './Joke';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import './JokeList.css';

export default class JokeList extends Component {
  static defaultProps = { numJokestoGet: 10 };

  constructor(props) {
    super(props);
    this.state = {
      jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"),
      loading: false
    };
    this.seenJokes = new Set(this.state.jokes.map(j => j.text));
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    if (this.state.jokes.length === 0) this.getJokes();
  }

  async getJokes() {
    try {
      let jokes = [];
      // load jokes
      while (jokes.length < this.props.numJokestoGet) {
        let response = await axios.get("https://icanhazdadjoke.com/",
          { headers: { Accept: 'application/json' } });
        let newJoke = response.data.joke;
        if (!this.seenJokes.has(newJoke)) {
          jokes.push({
            id: uuidv4(),
            text: newJoke,
            votes: 0
          });
        } else {
          console.log("Found Duplicate!");
          console.log(newJoke);
        }
      }
      // put jokes to state
      this.setState(st => ({
        loading: false,
        jokes: [...st.jokes, ...jokes]
      }),
        () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
      );
      // console.log(jokes);
    } catch (e) {
      alert(e);
      this.setState({ loading: false });
    }
  }

  handleClick() {
    this.setState({ loading: true }, this.getJokes);
  }

  handleVote(id, delta) {
    this.setState(st => ({
      jokes: st.jokes.map(j => j.id === id ? { ...j, votes: j.votes + delta } : j)
    }), () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes)));
  }

  render() {
    if (this.state.loading) {
      return (
        <div className='JokeList-spinner'>
          <i className='far fa-8x fa-laugh fa-spin' />
          <h2 className='JokeList-title'>Loading...</h2>
        </div>
      );
    }
    //sort jokes
    let sortedJokes = this.state.jokes.sort((a, b) => b.votes - a.votes);

    return (
      <div className='JokeList'>
        <div className='JokeList-sidebar'>
          <h1 className='JokeList-title'><span>Dad</span> Jokes</h1>
          <img src='https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg' />
          <button className='JokeList-getmore' onClick={ this.handleClick }>Fetch Jokes</button>
        </div>
        <div className='JokeList-jokes'>
          { sortedJokes.map(j => (
            <Joke
              key={ j.id }
              votes={ j.votes }
              text={ j.text }
              upvote={ () => this.handleVote(j.id, 1) }
              downvote={ () => this.handleVote(j.id, -1) }
            />
          )) }
        </div>
      </div>
    );
  }
}

JokeList.propTypes = {
  numJokestoGet: PropTypes.number
};