import React, { Component } from 'react';
import DOMPurify from 'dompurify'
import { translate } from '../core/i18n';
import { CONFIG } from '../core/config';
import { displayPrice } from '../core/format';
import { getCategoriesAsync } from '../core/categories.js';
import displayTaskTiming from '../helpers/display-task-timing';

export default class NewListingReview extends Component {
    constructor(props) {
        super();

        this.state = {
            listing: props.listing,
            currency: props.currency
        };
    }

    componentDidMount() {
        getCategoriesAsync(categories => {
            const categoryLabels = {};

            categories.forEach(category => {
                categoryLabels[category.code] = category.label;
            });

            this.setState({
                categoryLabels,
                ready: true
            });
        });
    }
    
    render() {
     return <div className="row">
                {this.state.ready &&
                <div className="col-xs-12">
                    <div className="row">
                        <div className="col-xs-12">
                            <h1 style={{color: CONFIG.COLOR_PRIMARY}}>
                                {this.props.listingType === 1 ? translate("NEW_LISTING_FINAL_REVIEW_HEADER") : translate("NEW_SUPPLY_LISTING_FINAL_REVIEW_HEADER")}
                            </h1>
                            <p>
                                {this.props.listingType === 1 ? translate("NEW_LISTING_FINAL_REVIEW_DESC") : translate("NEW_SUPPLY_LISTING_FINAL_REVIEW_DESC")}
                            </p>
                        </div>
                    </div>

                <div className="col-xs-12">
                    { CONFIG.USER_ENABLE_SUPPLY_DEMAND_ACCOUNTS !== "1" &&
                        <div className="row">
                            <div className="col-xs-12">
                                <h4 style={{color: CONFIG.COLOR_PRIMARY}}>{translate("LISTING_TYPE")}</h4>
                                { this.state.listing.taskType === 1 ? translate("SUPPLY_LISTING") : translate("DEMAND_LISTING")}
                            </div>
                        </div>
                    }

                    <div className="row">
                        <div className="col-xs-12">
                            <h4 style={{color: CONFIG.COLOR_PRIMARY}}>{translate("CATEGORY")}</h4>
                            {
                                this.state.listing.categories
                                .map(category =>
                                    <span key={category}>{this.state.categoryLabels[category]}</span>
                                )
                            }
                        </div>
                    </div>

                    { CONFIG.LISTING_DESC_MODE === "1" &&
                        <div className="row">
                            <div className="col-xs-12">
                                <h4 style={{color: CONFIG.COLOR_PRIMARY}}>{translate("LISTING_TITLE")}</h4>
                                {this.state.listing.title}
                            </div>
                        </div>
                    }

                    { CONFIG.LISTING_DESC_MODE === "1" &&
                        <div className="row">
                            <div className="col-xs-12">
                                <h4 style={{color: CONFIG.COLOR_PRIMARY}}>{translate("LISTING_DESCRIPTION")}</h4>
                                <div className="content" dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(this.state.listing.description)}}></div>
                            </div>
                        </div>
                    }

                    <div className="row">
                        <div className="col-xs-12">
                            <h4 style={{color: CONFIG.COLOR_PRIMARY}}>{translate("LISTING_LOCATION")}</h4>
                            <div>{this.state.listing.location.street} {this.state.listing.location.streetNumber}, {this.state.listing.location.postalCode} {this.state.listing.location.city}</div>
                        </div>
                    </div>

                    { CONFIG.LISTING_TIMING_MODE === "1" &&
                        <div className="row">
                            <div className="col-xs-12">
                                <h4 style={{color: CONFIG.COLOR_PRIMARY}}>{translate("LISTING_DATE")}</h4>
                                <div>
                                    {displayTaskTiming(this.state.listing.timing, `${CONFIG.DATE_FORMAT}`)}
                                </div>
                            </div>
                        </div>
                    }

                    { CONFIG.LISTING_DURATION_MODE === "1" &&
                        <div className="row">
                            <div className="col-xs-12">
                                <h4 style={{color: CONFIG.COLOR_PRIMARY}}>{translate("LISTING_DURATION")}</h4>
                                <div>
                                    {this.state.listing.duration}h
                                </div>
                            </div>
                        </div>
                    }

                    { CONFIG.LISTING_PRICING_MODE === "1" &&
                        <div className="row">
                            <div className="col-xs-12">
                                <h4 style={{color: CONFIG.COLOR_PRIMARY}}>{translate("PRICING")}</h4>
                                { this.state.listing.priceType === 1 ? translate("PRICING_MODEL_HOURLY") : this.state.listing.priceType === 0 ? translate("PRICING_MODEL_TOTAL") : translate("PRICING_MODEL_REQUEST_QUOTE") }
                            </div>
                        </div>
                    }

                    { CONFIG.LISTING_PRICING_MODE === "1" && this.state.listing.priceType !== 2 && 
                        <div className="row">
                            <div className="col-xs-12">
                                <h4 style={{color: CONFIG.COLOR_PRIMARY}}>{translate("PRICE")}</h4>
                                {displayPrice(this.state.listing.price, this.state.currency, this.state.listing.priceType)}
                            </div>
                        </div>
                    }

                    { CONFIG.LISTING_QUANTITY_MODE === "1" &&
                        <div className="row">
                            <div className="col-xs-12">
                                <h4 style={{color: CONFIG.COLOR_PRIMARY}}>{translate("LISTING_QUANTITY")}</h4>
                                { this.state.listing.quantity } { this.state.listing.unitOfMeasure }
                            </div>
                        </div>
                    }
                </div>
            </div>
            }
        </div>
    }
}
