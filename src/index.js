import React from 'react';
import { render } from 'react-dom';
import ons from 'onsenui';
import { Page, Row, Col, Input, Button, List, ListItem } from 'react-onsenui';

class Skeleton extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            query: '',
            movies: [
                {
                    name: 'The Avengers',
                    img:
                        'https://nerdist.com/wp-content/uploads/2018/05/landscape-1500632962-avengers-assemble.jpg',
                    rating: 10,
                    desc: 'Badass superheroes',
                },
            ],
        };
    }

    renderMovie = movie => {
        return (
            <ListItem key={Math.random()} expandable tappable>
                <div className="left">
                    <img
                        src={movie.img}
                        alt={movie.name}
                        style={{
                            height: '100px',
                            width: '100px',
                        }}
                    />
                </div>
                <div className="center">{movie.name}</div>
                <div className="expandable-content">{movie.desc}</div>
            </ListItem>
        );
    };

    search = () => {
        //
    };

    render = () => {
        return (
            <Page>
                <Row style={{ margin: '10px' }}>
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
