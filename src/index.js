import React from 'react';
import { render } from 'react-dom';
import ons from 'onsenui';
import { Page } from 'react-onsenui';

/**
    @class Backbone of app: side menu + navigation routing
*/
class Skeleton extends React.Component {
    /**
        Main frame for entire app.
        Creates a menu with a navigator inside.
        Menu is controlled by one fn.
        Navigator controls page content.
    */
    render = () => {
        return <Page>Hello!</Page>;
    };
}

ons.platform.select('android');
ons.ready(() => {
    //Render app skeleton
    render(<Skeleton />, document.getElementById('app'));
});
