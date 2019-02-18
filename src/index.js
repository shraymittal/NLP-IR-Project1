import React from 'react';
import { render } from 'react-dom';
import ons from 'onsenui';
import {
    Page,
    Row,
    Col,
    Input,
    Button,
    List,
    ListItem,
    Icon,
} from 'react-onsenui';
import _ from 'lodash';

class Skeleton extends React.Component {
    constructor(props) {
        super(props);

        this.url = 'http://localhost:5000/api/';
        this.state = {
            query: '',
            movies: [],
        };
    }

    renderMovie = movie => {
        let rating = _.get(movie, 'vote_average', '--');
        if (rating !== '--')
            rating = parseFloat(Math.round(rating * 100) / 100).toFixed(1);

        let tagline = _.get(movie, 'tagline[0]');
        if (tagline) tagline = `: ${tagline}`;

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
                <div className="expandable-content">{movie.overview}</div>
            </ListItem>
        );
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

                this.setState({ movies: json });
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
