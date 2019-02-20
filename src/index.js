import React from 'react';
import { render } from 'react-dom';
import ons from 'onsenui';
import {
    Page,
    Row,
    Col,
    Input,
    Button,
    Switch,
    List,
    ListItem,
    Icon,
} from 'react-onsenui';
import _ from 'lodash';

class Skeleton extends React.Component {
    constructor(props) {
        super(props);

        this.url = 'http://localhost:5000/api/';
        this.image_url = 'https://image.tmdb.org/t/p/w500/';
        this.state = {
            query: '',
            movies: [],
            sortByRevenue: null,
            sortByTime: null,
            sortByRating: null,
        };
        this.unsorted = [];
    }

    renderMovie = movie => {
        let rating = _.get(movie, 'vote_average', '--');
        if (rating !== '--')
            rating = parseFloat(Math.round(rating * 100) / 100).toFixed(1);

        let tagline = _.get(movie, 'tagline[0]');
        if (tagline) tagline = `: ${tagline}`;

        var revenue = String(movie.revenue).replace(
            /\B(?=(\d{3})+(?!\d))/g,
            ','
        );
        var poster_url = this.image_url + String(movie.poster_path);

        return (
            <ListItem key={Math.random()} expandable tappable>
                <div className="left">
                    {rating}
                    <Icon className="material-icons">star_half</Icon>
                </div>
                <div className="center">
                    <span>{_.get(movie, 'title[0]')}</span>
                    <span style={{ color: 'gray' }}>{tagline}</span>
                </div>
                <div className="expandable-content">
                    <a href={poster_url}>Link to movie poster</a>
                    <p>{movie.overview}</p>
                    <p>
                        {'Release Year: ' +
                            String(movie.release_date).substring(0, 4)}
                    </p>
                    <p>{'Genres: ' + movie['genres.name']}</p>
                    <p>{'Director(s): ' + movie['directors.name']}</p>
                    <p>{'Cast: ' + movie['cast.name']}</p>
                    <p>{'Revenue: $' + revenue}</p>
                    <p>
                        <a
                            onClick={() => {
                                this.setState({
                                    query: 'more like: ' + movie['title'],
                                });
                                this.setState(
                                    { mlt_query: 'id:' + movie['id'] },
                                    this.recommend
                                );
                            }}
                            style={{ color: 'blue' }}>
                            <u>
                                <i>See more like this</i>
                            </u>
                        </a>
                    </p>
                </div>
            </ListItem>
        );
    };

    resort = (type, e) => {
        // Update UI
        if (typeof type !== 'undefined') {
            const newState = {};
            newState[type] = e.target.checked ? 'desc' : null;
            this.setState(newState);
        }

        this.sort();
    };

    search = () => {
        fetch(this.url + 'search', {
            method: 'post',
            headers: new Headers({
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            }),
            body: JSON.stringify({ query: this.state.query }),
        })
            .then(response => response.json())
            .then(json => {
                console.log('Response');
                console.log(json);

                const newState = {};
                newState.sortByTime = _.get(json.sort, 'release_date', null);
                newState.sortByRating = _.get(json.sort, 'vote_average', null);
                // newState.sortByRevenue = _.get(json.sort, "revenue", null);
                this.setState(newState);

                this.unsorted = json.movies;
                this.sort();
            });
    };

    recommend = () => {
        fetch(this.url + 'morelikethis', {
            method: 'post',
            headers: new Headers({
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            }),
            body: JSON.stringify({ query: this.state.mlt_query }),
        })
            .then(response => response.json())
            .then(json => {
                console.log('Response');
                console.log(json);

                this.unsorted = json;
                this.resort();
            });
    };

    sort = () => {
        // Resort movies
        let sortOrder = [],
            sortParams = [];
        if (this.state.sortByRevenue) {
            sortParams.push('revenue');
            sortOrder.push(this.state.sortByRevenue);
        }
        if (this.state.sortByRating) {
            sortParams.push('vote_average');
            sortOrder.push(this.state.sortByRating);
        }
        if (this.state.sortByTime) {
            sortParams.push('release_date');
            sortOrder.push(this.state.sortByTime);
        }

        let newList = [];
        if (sortOrder.length)
            newList = _.orderBy(this.unsorted, sortParams, sortOrder);
        else newList = this.unsorted;

        console.log(newList);

        this.setState({ movies: newList });
    };

    render = () => {
        return (
            <Page>
                <Row style={{ padding: '10px' }}>
                    <Col style={{ margin: 'auto', textAlign: 'center' }}>
                        <Input
                            value={this.state.query}
                            onChange={e =>
                                this.setState({ query: e.target.value })
                            }
                            placeholder="Find a movie!"
                        />
                        <Button
                            onClick={this.search}
                            style={{ margin: '15px' }}>
                            Search
                        </Button>
                    </Col>
                    <Col>
                        <Row>
                            <Col verticalAlign="bottom">
                                Sort by <b>Blockbuster</b> &nbsp;&nbsp;&nbsp;
                            </Col>
                            <Col verticalAlign="bottom">
                                <Switch
                                    checked={this.state.sortByRevenue !== null}
                                    onChange={e =>
                                        this.resort('sortByRevenue', e)
                                    }
                                />
                            </Col>
                            <Col verticalAlign="bottom">
                                Sort by <b>Rating</b> &nbsp;&nbsp;&nbsp;
                            </Col>
                            <Col verticalAlign="bottom">
                                <Switch
                                    checked={this.state.sortByRating !== null}
                                    onChange={e =>
                                        this.resort('sortByRating', e)
                                    }
                                />
                            </Col>
                            <Col verticalAlign="bottom">
                                Sort by <b>Recent</b> &nbsp;&nbsp;&nbsp;
                            </Col>
                            <Col verticalAlign="bottom">
                                <Switch
                                    checked={this.state.sortByTime !== null}
                                    onChange={e => this.resort('sortByTime', e)}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>

                <List
                    dataSource={this.state.movies}
                    renderRow={this.renderMovie}
                />
            </Page>
        );
    };
}

ons.ready(() => {
    //Render app skeleton
    render(<Skeleton />, document.getElementById('app'));
});
