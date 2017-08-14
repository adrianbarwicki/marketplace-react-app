import React from 'react';
import { Card, CardMedia, CardTitle } from 'material-ui/Card';
import * as apiCategory from '../api/category';
import { translate } from '../core/i18n';
import { getConfigAsync } from '../core/config';

const _chunk = require('lodash.chunk');

export default class NewListingCategory extends React.Component {
    constructor(props) {
        super();

        this.state = {
            categories: []
        };
    }
    componentDidMount() {
        getConfigAsync(config => {
            apiCategory
                .getItems()
                .then(categories => {
                    this.setState({
                        ready: true,
                        config,
                        categories: _chunk(categories, 3) 
                    });
                });
        });
    }
    onCategoryChosen (tile) {
        this.props.onSelected && this.props.onSelected(tile.code);
    }
    render() {
        return <div className="container">
                    { this.state.ready &&
                        <div className="row">
                            <div className="col-xs-12">
                                <h1 style={{color: this.state.config.COLOR_PRIMARY}} className="text-left">
                                    {translate("NEW_LISTING_CATEGORY_HEADER")}
                                </h1>
                                <p>{translate("NEW_LISTING_CATEGORY_DESC")}</p>
                            </div>
                        </div>
                    }
                    <hr />
                    <div className="row">
                        <div className="col-xs-12">
                            { this.state.categories && this.state.categories
                                .map(row => (
                                    <div className="row">
                                        { row.map(tile =>
                                            <div className="col-xs-12 col-sm-4" style={{ marginBottom: 10 }}>
                                                <Card onClick={
                                                    () => this.onCategoryChosen(tile)
                                                }>
                                                    <CardMedia
                                                        overlay={
                                                            <CardTitle title={translate(tile.code)} />
                                                        }
                                                    >
                                                        <img alt="category" src={tile.imageUrl || '/images/category-default-img.jpeg'} />
                                                    </CardMedia>
                                                </Card>
                                            </div>
                                        )} 
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
    }
};