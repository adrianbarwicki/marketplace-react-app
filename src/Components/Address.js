import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import Autocomplete from 'react-google-autocomplete';
import { translate } from '../core/i18n';
import { formatGeoResults } from '../core/util';
import { getConfigAsync } from '../core/config';

export default class Address extends Component {
    constructor(props) {
        super();

        let locationQueryString = '';
        const address = props.location || {};

        if (address.street)
            locationQueryString += address.street;

        if (address.streetNumber)
            locationQueryString += ` ${address.streetNumber}`;

        this.state = {
            countryRestriction: props.countryRestriction,
            locationQueryString,
            countryCode: address.countryCode,
            street: address.street,
            streetNumber: address.streetNumber,
            formattedAddress: address.formattedAddress,
            addressAddition: address.addressAddition,
            city: address.city,
            postalCode: address.postalCode,
            lat: address.lat,
            lng: address.lng
        };
    }

    componentDidMount() {
        getConfigAsync(config => this.setState({
            config,
            ready: true
        }));
    }
    
    getRequiredStar(mode) {
        return Number(mode) === 2 ? '*' : '';
    }

    isEnabled(mode) {
        return Number(mode) !== 0;
    }

    onAddressFieldChange(fieldKey) {
        return (ev, newValue) => {
            const location = this.state;
            
            location[fieldKey] = newValue;

            this.setState(location);

            this.props.onLocationChange &&
            this.props.onLocationChange(location);
        };
    }

    render() {
     return <div className="row">
                { this.state.ready &&
                <div className="col-xs-12">
                    <div className="row">
                        <div className="col-xs-12">
                            <div className="row">
                                <div className="col-xs-12">
                                        <h4 >{translate("LOCATION_COUNTRY") + '*'}</h4>
                                        <TextField
                                            disabled={true}
                                            name="countryCode"
                                            onChange={this.onAddressFieldChange('countryCode')}
                                            style={{width: '100%'}}
                                            inputStyle={{width: '100%'}}
                                            value={this.state.countryCode}
                                        />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-xs-12">
                                    <h4 >
                                        {translate("LOCATION_STREET") + '*'}
                                    </h4>
                                    <TextField id={'listing_location'} name="location" style={{width: '100%'}}>
                                        <Autocomplete
                                            value={this.state.street}
                                            onChange={(ev) => {
                                                const locationQueryString = ev.target.value;

                                                this.setState({
                                                    locationQueryString,
                                                    street: locationQueryString
                                                });
                                            }}
                                            style={{width: '100%'}}
                                            componentRestrictions={{country: this.state.countryRestriction}}
                                            onPlaceSelected={place => {
                                                const locationValue = formatGeoResults([ place ])[0];
                                                let locationQueryString = '';

                                                if (locationValue.route)
                                                    locationQueryString += locationValue.route;

                                                if (locationValue.streetNumber)
                                                    locationQueryString += ` ${locationValue.streetNumber}`;

                                                const location = {
                                                    locationQueryString,
                                                    postalCode: locationValue.postalCode,
                                                    countryCode: locationValue.countryCode,
                                                    city: locationValue.city,
                                                    addressAddition:
                                                        locationValue.streetNumber ||
                                                        this.state.addressAddition,
                                                    street: locationValue.route,
                                                    streetNumber: locationValue.streetNumber,
                                                    lat: locationValue.lat,
                                                    lng: locationValue.lng
                                                };

                                                this.setState(location);

                                                this.props.onLocationChange(location);
                                            }}
                                            types={[ 'address' ]}
                                        />
                                    </TextField>
                                </div>   
                            </div>
                            <div className="row">
                                <div className="col-xs-12">
                                        <h4 >{translate("LOCATION_ADDRESS_ADDITION")}</h4>
                                        <TextField
                                            name="addressAddition"
                                            onChange={this.onAddressFieldChange('addressAddition')}
                                            style={{width: '100%'}}
                                            inputStyle={{width: '100%'}}
                                            value={this.state.addressAddition}
                                        />
                                </div>  
                                <div className="col-xs-6">
                                    <h4 >{translate("LOCATION_CITY") + '*'}</h4>
                                    <TextField
                                        name="city"
                                        onChange={this.onAddressFieldChange('city')}
                                        style={{width: '100%'}}
                                        inputStyle={{width: '100%'}}
                                        value={this.state.city}
                                    />
                                </div>
                                <div className="col-xs-6">
                                    <h4 >{translate("LOCATION_POSTAL_CODE") + '*'}</h4>
                                    <TextField
                                        type="number"
                                        name="postalCode"
                                        onChange={this.onAddressFieldChange('postalCode')}
                                        style={{width: '100%'}}
                                        inputStyle={{width: '100%'}}
                                        value={this.state.postalCode}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-xs-12">
                                        <h4>{translate("BILLING_TAX_NUMBER")}</h4>
                                        <TextField
                                            name="taxNumber"
                                            onChange={this.onAddressFieldChange('taxNumber')}
                                            style={{width: '100%'}}
                                            inputStyle={{width: '100%'}}
                                            value={this.state.taxNumber}
                                        />
                                </div>  
                            </div>
                        </div>
                    </div>
                </div>
                }
            </div>
    }
}
