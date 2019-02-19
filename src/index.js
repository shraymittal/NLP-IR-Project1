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
            sortByTime: false,
            sortByRating: false,
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
                            onClick={() => window.alert('not implemented yet')}
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
            newState[type] = e.target.checked;
            this.setState(newState);
        }

        // Resort movies
        let sortOrder = [];
        if (this.state.sortByRevenue) sortOrder.push('revenue');
        if (this.state.sortByRating) sortOrder.push('vote_average');
        if (this.state.sortByTime) sortOrder.push('release_date');

        let newList = [];
        if (sortOrder.length)
            newList = _.orderBy(this.unsorted, sortOrder, [
                'desc',
                'desc',
                'desc',
            ]);
        else newList = this.unsorted;

        console.log(newList);

        this.setState({ movies: newList });
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

                this.unsorted = json;
                this.resort();
            });
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
                                    checked={this.state.sortByRevenue}
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
                                    checked={this.state.sortByRating}
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
                                    checked={this.state.sortByTime}
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
