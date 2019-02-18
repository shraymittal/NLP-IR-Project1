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
        return (
            <ListItem key={Math.random()} expandable tappable>
                <div className="left">
                    {movie.vote_average}
                    <Icon className="material-icons">star_half</Icon>
                </div>
                <div className="center">{movie.title[0]}</div>
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
