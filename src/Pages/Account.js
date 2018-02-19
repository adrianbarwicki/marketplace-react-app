import React, { Component } from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import Address from '../Components/Address';
import EditableEntity from '../Components/EditableEntity';
import apiUser from '../api/user';
import * as apiTaskLocation from '../api/task-location';
import apiBillingAddress from '../api/billing-address';
import * as apiUserProperty from '../api/user-property';
import { goTo, goStartPage, convertToAppPath } from '../core/navigation';
import { getUserAsync } from '../core/auth';
import { translate, getLang } from '../core/i18n';
import { fetchAndAddLang } from '../helpers/i18n-helpers';
import { openConfirmDialog } from '../helpers/confirm-before-action.js';
import {LANG_CODES} from '../constants/LANGUAGES.js';
import EmailSettings from './Account/EmailSettings.js';
import StripePaymentConnector from '../Components/PaymentConnectors/Stripe.js';
import { CONFIG } from '../core/config';

export default class Account extends Component {
    constructor(props) {
        super(props);
   
        const sector = props.params.sector || this.props.location.query.sector || 'profile';

        this.state = {
            lang: getLang(),
            langDirty: false,
            billingAddressId: null,
            ready: false,
            isLoading: true,
            user: null,
            billingAddress: null,
            sector,
            data: {
                emailNotifDisabled: false,
                phoneNo: ''
            },
            toBeUpdated: {
                phoneNo: false
            }
        };
    }
    componentDidMount() {
        getUserAsync(user => {
            if (!user) {
                return goTo(`/login?redirectTo=${convertToAppPath(location.pathname)}`);
            }

            this.setState({
                user
            });

            apiUser
            .getItem(user.id)
            .then(profile => {
                const data = this.state.data;
                const phoneNoProp = profile.userProperties.find(_ => _.propKey === 'phoneNo');
                debugger;
                if (phoneNoProp) {
                    data.phoneNo = phoneNoProp.propValue;
                }

                this.setState({
                    data,
                    profile
                });
            });

            apiTaskLocation
            .getItems({
                userId: user.id
            })
            .then(defaultListingLocation => {
                if (defaultListingLocation[0]) {
                    this.setState({
                        defaultListingLocationId: defaultListingLocation[0].id,
                        defaultListingLocation: defaultListingLocation[0]
                    });
                }
            });

            apiBillingAddress
            .getItems({
                default: true
            }).then(billingAddresses => {
                const billingAddress = billingAddresses
                    .find(_ => _.default === true) ||
                    billingAddresses[billingAddresses.length - 1];
                
                if (billingAddress) {
                    this.setState({
                        billingAddressId: billingAddress.id,
                        billingAddressReady: true,
                        billingAddress
                    });
                } else {
                    this.setState({
                        billingAddressReady: true
                    });
                }
            });
        }, true);
    }

    changeSectorFn(sector) {
        return () => {
            if (sector === 'profile') {
                goTo(`/account/${sector}`)

                return apiUser
                    .getItem(this.state.user.id)
                    .then(profile => this.setState({
                        profile,
                        sector
                    }));
            }

            goTo(`/account/${sector}`);

            this.setState({
                sector
            });
        }
    }

    render() {
            return (
                <div className="container">
                    <div className="col-xs-12 col-sm-3">
                        <div className="row" style={{ marginTop: 20 }}>
                            <div className="col-xs-12">
                                <ul className="list-unstyled vq-account-sector-list">
                                    <li className={this.state.sector === 'profile' && 'vq-account-sector-active'}>
                                        <a href="#" onTouchTap={this.changeSectorFn('profile')}>{translate('ACCOUNT_MENU_PROFILE')}</a>
                                    </li>

                                    <li className={this.state.sector === 'language' && 'vq-account-sector-active'}>
                                        <a href="#" onTouchTap={this.changeSectorFn('language')}>{translate('ACCOUNT_MENU_LANGUAGE')}</a>
                                    </li>

                                    {
                                        this.state.user &&
                                        (
                                            (
                                                CONFIG &&
                                                CONFIG.PAYMENTS_ENABLED === '1' &&
                                                (
                                                    (
                                                        this.state.user.userType === 2 &&
                                                        (
                                                            CONFIG.USER_TYPE_SUPPLY_LISTING_ENABLED === "1" &&
                                                            CONFIG.USER_TYPE_DEMAND_LISTING_ENABLED !== "1"
                                                            
                                                        ) ||
                                                        (
                                                            CONFIG.USER_TYPE_SUPPLY_LISTING_ENABLED !== "1" &&
                                                            CONFIG.USER_TYPE_DEMAND_LISTING_ENABLED === "1"
                                                        ) ||
                                                        (
                                                            CONFIG.USER_TYPE_SUPPLY_LISTING_ENABLED === "1" &&
                                                            CONFIG.USER_TYPE_DEMAND_LISTING_ENABLED === "1"
                                                        )
                                                    ) ||
                                                    (
                                                        this.state.user.userType === 1 &&
                                                        (
                                                            CONFIG.USER_TYPE_SUPPLY_LISTING_ENABLED === "1" &&
                                                            CONFIG.USER_TYPE_DEMAND_LISTING_ENABLED !== "1"
                                                            
                                                        ) ||
                                                        (
                                                            CONFIG.USER_TYPE_SUPPLY_LISTING_ENABLED !== "1" &&
                                                            CONFIG.USER_TYPE_DEMAND_LISTING_ENABLED === "1"
                                                        ) ||
                                                        (
                                                            CONFIG.USER_TYPE_SUPPLY_LISTING_ENABLED === "1" &&
                                                            CONFIG.USER_TYPE_DEMAND_LISTING_ENABLED === "1"
                                                        )
                                                    )
                                                )
                                            ) ||
                                            (
                                                CONFIG &&
                                                CONFIG.PAYMENTS_ENABLED !== '1' &&
                                                (
                                                    (
                                                        this.state.user.userType === 2 &&
                                                        (
                                                            CONFIG.USER_TYPE_SUPPLY_LISTING_ENABLED === "1" &&
                                                            CONFIG.USER_TYPE_DEMAND_LISTING_ENABLED === "1"
                                                        ) 
                                                    ) ||
                                                    (
                                                        this.state.user.userType === 1
                                                    )
                                                )
                                            )
                                        ) &&
                                        <li className={this.state.sector === 'billing-address' && 'vq-account-sector-active'}>
                                            <a href="#" onTouchTap={this.changeSectorFn('billing-address')}>{translate('ACCOUNT_MENU_BILLING_ADDRESS')}</a>
                                        </li>
                                    }

                                    {
                                        this.state.user &&
                                        (
                                            (
                                                CONFIG &&
                                                CONFIG.PAYMENTS_ENABLED === '1' &&
                                                (
                                                    (
                                                        this.state.user.userType === 2 &&
                                                        (
                                                            CONFIG.USER_TYPE_SUPPLY_LISTING_ENABLED === "1" &&
                                                            CONFIG.USER_TYPE_DEMAND_LISTING_ENABLED !== "1"
                                                            
                                                        ) ||
                                                        (
                                                            CONFIG.USER_TYPE_SUPPLY_LISTING_ENABLED === "1" &&
                                                            CONFIG.USER_TYPE_DEMAND_LISTING_ENABLED === "1"
                                                        )
                                                    ) ||
                                                    (
                                                        this.state.user.userType === 1 &&
                                                        (
                                                            CONFIG.USER_TYPE_SUPPLY_LISTING_ENABLED !== "1" &&
                                                            CONFIG.USER_TYPE_DEMAND_LISTING_ENABLED === "1"
                                                        ) ||
                                                        (
                                                            CONFIG.USER_TYPE_SUPPLY_LISTING_ENABLED === "1" &&
                                                            CONFIG.USER_TYPE_DEMAND_LISTING_ENABLED === "1"
                                                        )
                                                    )
                                                )
                                            ) ||
                                            (
                                                CONFIG &&
                                                CONFIG.PAYMENTS_ENABLED !== '1' &&
                                                (
                                                    (
                                                        this.state.user.userType === 2 &&
                                                        (
                                                            CONFIG.USER_TYPE_SUPPLY_LISTING_ENABLED === "1" &&
                                                            CONFIG.USER_TYPE_DEMAND_LISTING_ENABLED !== "1"
                                                        ) ||
                                                        (
                                                            CONFIG.USER_TYPE_SUPPLY_LISTING_ENABLED === "1" &&
                                                            CONFIG.USER_TYPE_DEMAND_LISTING_ENABLED === "1"
                                                        )
                                                    ) ||
                                                    (
                                                        this.state.user.userType === 1 &&
                                                        (
                                                            CONFIG.USER_TYPE_SUPPLY_LISTING_ENABLED !== "1" &&
                                                            CONFIG.USER_TYPE_DEMAND_LISTING_ENABLED === "1"
                                                        ) ||
                                                        (
                                                            CONFIG.USER_TYPE_SUPPLY_LISTING_ENABLED === "1" &&
                                                            CONFIG.USER_TYPE_DEMAND_LISTING_ENABLED === "1"
                                                        )
                                                    )
                                                )
                                            )
                                        ) &&
                                        <li className={this.state.sector === 'listing-address' && 'vq-account-sector-active'}>
                                            <a href="#" onTouchTap={this.changeSectorFn('listing-address')}>{translate('ACCOUNT_MENU_LISTING_ADDRESS')}</a>
                                        </li>
                                    }
                                    { CONFIG && this.state.user &&
                                    (
                                      (CONFIG.USER_DOCUMENTS_ENABLED_FOR_SUPPLY === "1" && this.state.user.userType === 2) ||
                                      (CONFIG.USER_DOCUMENTS_ENABLED_FOR_DEMAND === "1" && this.state.user.userType === 1) ||
                                      (
                                        (CONFIG.USER_DOCUMENTS_ENABLED_FOR_SUPPLY === "1" || CONFIG.USER_DOCUMENTS_ENABLED_FOR_DEMAND === "1") &&
                                        this.state.user.userType === 0
                                      )
                                    ) &&
                                        <li>
                                            <a href="#" onTouchTap={() => goTo(`/user-documents?redirectTo=${convertToAppPath(location.pathname)}`)}>{translate('HEADER_USER_DOCUMENTS')}</a>
                                        </li>
                                    }

                                    { CONFIG && this.state.user &&
                                    (
                                      (CONFIG.USER_PREFERENCES_ENABLED_FOR_SUPPLY === "1" && this.state.user.userType === 2) ||
                                      (CONFIG.USER_PREFERENCES_ENABLED_FOR_DEMAND === "1" && this.state.user.userType === 1) ||
                                      (
                                        (CONFIG.USER_PREFERENCES_ENABLED_FOR_SUPPLY === "1" || CONFIG.USER_PREFERENCES_ENABLED_FOR_DEMAND === "1") &&
                                        this.state.user.userType === 0
                                      )
                                    ) &&
                                        <li>
                                            <a href="#" onTouchTap={() => goTo(`/user-preferences?redirectTo=${convertToAppPath(location.pathname)}`)}>{translate('USER_PREFERENCES')}</a>
                                        </li>
                                    }
                                { CONFIG && this.state.user &&
                                    (
                                      (CONFIG.USER_VERIFICATIONS_ENABLED_FOR_SUPPLY === "1" && this.state.user.userType === 2) ||
                                      (CONFIG.USER_VERIFICATIONS_ENABLED_FOR_DEMAND === "1" && this.state.user.userType === 1) ||
                                      (
                                        (CONFIG.USER_VERIFICATIONS_ENABLED_FOR_SUPPLY === "1" || CONFIG.USER_VERIFICATIONS_ENABLED_FOR_DEMAND === "1") &&
                                        this.state.user.userType === 0
                                      )
                                    ) &&
                                        <li>
                                            <a href="#" onTouchTap={() => goTo(`/user-verifications?redirectTo=${convertToAppPath(location.pathname)}`)}>{translate('USER_VERIFICATIONS')}</a>
                                        </li>
                                    }

                                    <li className={this.state.sector === 'notifications' && 'vq-account-sector-active'}>
                                        <a href="#" onTouchTap={this.changeSectorFn('notifications')}>{translate('ACCOUNT_MENU_NOTIFICATIONS')}</a>
                                    </li>

                                    { CONFIG && CONFIG.PAYMENTS_ENABLED === '1' &&
                                        <li className={this.state.sector === 'payments' && 'vq-account-sector-active'}>
                                            <a href="#" onTouchTap={this.changeSectorFn('payments')}>{translate('ACCOUNT_MENU_PAYMENTS')}</a>
                                        </li>
                                    }

                                    <li className={this.state.sector === 'change-password' && 'vq-account-sector-active'}>
                                        <a href="#" onTouchTap={() => goTo('/change-password')}>{translate('CHANGE_PASSWORD')}</a>
                                    </li>

                                    <li className={this.state.sector === 'delete-account' && 'vq-account-sector-active'}>
                                        <a href="#" onTouchTap={this.changeSectorFn('delete-account')}>{translate('ACCOUNT_MENU_DELETE_ACCOUNT')}</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="col-xs-12 col-sm-9">
                            { false && <div className="row">
                                <div className="col-xs-12">
                                    <h1>{translate('ACCOUNT_SETTINGS')}</h1>
                                </div>
                            </div>
                            }
                            
                            { this.state.sector === 'language' &&
                                <div className="row">
                                    <div className="col-xs-12">
                                        <h2>{translate('ACCOUNT_LANGUAGE_DETAILS_HEADER')}</h2>
                                        <p className="text-muted">{translate('ACCOUNT_LANGUAGE_DETAILS_DESC')}</p>
                                    </div>
                                    <div className="col-xs-12">
                                        <DropDownMenu
                                            value={this.state.lang}
                                            onChange={(event, index, value) => {
                                                this.setState({
                                                    langDirty: true,
                                                    lang: value,
                                                });
                                            }}
                                        >
                                            <MenuItem value={'hu'} primaryText={LANG_CODES['hu']} />
                                            <MenuItem value={'en'} primaryText={LANG_CODES['en']} />
                                        </DropDownMenu>
                                    </div>
                                    <div className="col-xs-12">
                                        <RaisedButton
                                            disabled={!this.state.langDirty}
                                            primary={true}
                                            onTouchTap={
                                                () => {
                                                    fetchAndAddLang(this.state.lang, true, () => {
                                                        location.reload();
                                                    });
                                                }
                                            }
                                            label={translate('UPDATE')}
                                        />
                                    </div>
                                </div>
                            }


                            { this.state.profile && this.state.sector === 'profile' &&
                                <div className="row">
                                    <div className="col-xs-12">
                                        <h2>{translate('EDIT_PROFILE')}</h2>
                                    </div>

                                    <div className="row">
                                        <EditableEntity
                                            saveLeft={true}
                                            cancelLabel={translate('CANCEL')}
                                            saveLabel={translate('UPDATE')}
                                            showCancelBtn={false}
                                            value={this.state.profile} 
                                            fields={[
                                                {
                                                    type: 'string',
                                                    key: 'firstName',
                                                    label: translate('FIRST_NAME')
                                                },
                                                {
                                                    type: 'string',
                                                    key: 'lastName',
                                                    label: translate('LAST_NAME') 
                                                },
                                                
                                                {
                                                    type: 'html',
                                                    key: 'bio',
                                                    label: translate('PROFILE_BIO'),
                                                    hint: translate('PROFILE_BIO_DESC'),
                                                },
                                                /** 
                                                {
                                                    type: 'string',
                                                    key: 'website',
                                                    label: translate('WEBSITE')
                                                }
                                                */
                                            ]}
                                            onConfirm={
                                                updatedEntity => {
                                                    apiUser
                                                    .updateItem(this.state.user.id, updatedEntity)
                                                    .then(_ => _, _ => _)
                                                }
                                            }
                                        />
                                    </div>
                                    
                                    <div className="col-xs-12">
                                        <h2>{translate('ACCOUNT_USER_DETAILS_HEADER')}</h2>
                                        <p className="text-muted">{translate('ACCOUNT_USER_DETAILS_DESC')}</p>
                                    </div>

                                    <div className="col-xs-12">
                                        <TextField
                                            maxLength={11}
                                            required={true}
                                            onChange={(_, newValue) => {
                                                const data = this.state.data;

                                                data.phoneNo = newValue;

                                                newValue = String(newValue);

                                                newValue = newValue.split('.').join('');
                                                newValue = newValue.split('+').join('');
                                                newValue = newValue.split(' ').join('');

                                                if (!isNaN(Number(newValue)) && newValue.length < 14) {
                                                    data.phoneNo = newValue;

                                                    this.setState({
                                                        data,
                                                        toBeUpdated: {
                                                            phoneNo: true
                                                        }
                                                    });
                                                }
                                            }}
                                            value={this.state.data.phoneNo}
                                            floatingLabelText={`${translate('PHONE_NO')}*`}
                                            type="text"
                                        />
                                    </div>
                                    <div className="col-xs-12">
                                        <RaisedButton
                                            disabled={!this.state.toBeUpdated.phoneNo || String(this.state.data.phoneNo).length < 9}
                                            primary={true}
                                            onTouchTap={
                                                () => {
                                                    const phoneNo = this.state.data.phoneNo;

                                                    getUserAsync(user => {
                                                        try {
                                                            user.userProperties
                                                            .find(_ => _.propKey === 'phoneNo')
                                                            .propValue = phoneNo;
                                                        } catch (err) {
                                                            return alert('Error: Could not update internal model.')
                                                        }
                                                    });

                                                    apiUserProperty
                                                        .createItem(this.state.user.id, 'phoneNo', phoneNo)
                                                        .then(_ => {
                                                            this.setState({
                                                                toBeUpdated: {
                                                                    phoneNo: false
                                                                }
                                                            })
                                                        }, _ => _);
                                                }
                                            }
                                            label={translate('UPDATE')}
                                        />
                                    </div>
                                </div>
                            }

                            { this.state.sector === 'billing-address' &&
                            <div className="row">
                                <div className="col-xs-12">
                                    <h2>{translate('ACCOUNT_BILLING_ADDRESS_HEADER')}</h2>
                                    <p className="text-muted">{translate('ACCOUNT_BILLING_ADDRESS_DESC')}</p>
                                </div>
                                <div className="col-xs-12 col-sm-10 col-md-8">
                                    <Address
                                        deriveOnly={true}
                                        withTaxNumber={true}
                                        location={this.state.billingAddress || {}}
                                        onLocationChange={billingAddress => {
                                            const toBeUpdated = this.state.toBeUpdated;
                                            
                                            toBeUpdated.billingAddress = true;

                                            this.setState({
                                                billingAddress,
                                                toBeUpdated
                                            });
                                        }}
                                    />
                                </div>
                                <div className="col-xs-12" style={{ marginTop: 20 }}>
                                    <RaisedButton
                                        disabled={!this.state.toBeUpdated.billingAddress || String(this.state.billingAddress.postalCode) < 4}
                                        primary={true}
                                        onTouchTap={
                                            () => {
                                                const billingAddress = this.state.billingAddress;
                                                const billingAddressId = this.state.billingAddressId;

                                                if (!billingAddressId) {
                                                    return apiBillingAddress
                                                        .createItem(billingAddress)
                                                        .then(BillingAddress => {
                                                            const toBeUpdated = this.state.toBeUpdated;

                                                            toBeUpdated.billingAddress = false;

                                                            this.setState({
                                                                toBeUpdated,
                                                                billingAddress
                                                            })
                                                        }, err => {
                                                            console.error(err);
                                                        });
                                                }
                                                
                                                return apiBillingAddress
                                                    .updateItem(billingAddressId, billingAddress)
                                                    .then(data => {
                                                        const toBeUpdated = this.state.toBeUpdated;

                                                        toBeUpdated.billingAddress = false;

                                                        this.setState({
                                                            toBeUpdated
                                                        });
                                                    }, err => {
                                                        console.error(err);
                                                    });
                                            }
                                        }
                                        label={translate('UPDATE')}
                                    />
                                </div>
                            </div>
                            }

                            { this.state.sector === 'listing-address' &&
                            <div className="row">
                                <div className="col-xs-12">
                                    <h2>{translate('ACCOUNT_DEFAULT_LISTING_LOCATION_HEADER')}</h2>
                                    <p className="text-muted">{translate('ACCOUNT_DEFAULT_LISTING_LOCATION_DESC')}</p>
                                </div>
                                <div className="col-xs-12 col-sm-10 col-md-8">
                                    <Address
                                        deriveOnly={true}
                                        location={this.state.defaultListingLocation || {}}
                                        onLocationChange={defaultListingLocation => {
                                            const toBeUpdated = this.state.toBeUpdated;
                                            
                                            toBeUpdated.defaultListingLocation = true;

                                            this.setState({
                                                defaultListingLocationId: defaultListingLocation.id,
                                                defaultListingLocation,
                                                toBeUpdated
                                            });
                                        }}
                                    />
                                </div>
                                <div className="col-xs-12" style={{ marginTop: 20 }}>
                                    <RaisedButton
                                        disabled={!this.state.toBeUpdated.defaultListingLocation || String(this.state.defaultListingLocation.postalCode) < 4}
                                        primary={true}
                                        onTouchTap={
                                            () => {
                                                const defaultListingLocationId = this.state.defaultListingLocationId;
                                                const defaultListingLocation = this.state.defaultListingLocation;

                                                if (!defaultListingLocationId) {
                                                    return apiTaskLocation
                                                        .updateDefaultItem(defaultListingLocation)
                                                        .then(_ => {
                                                            const toBeUpdated = this.state.toBeUpdated;

                                                            toBeUpdated.defaultListingLocation = false;

                                                            this.setState({
                                                                toBeUpdated
                                                            })
                                                        }, err => {
                                                            console.error(err);
                                                        });
                                                }
                                            }
                                        }
                                        label={translate('UPDATE')}
                                    />
                                </div>
                            </div>
                            }

                            { this.state.sector === 'notifications' && <EmailSettings /> }

                            { CONFIG && CONFIG.PAYMENTS_ENABLED === '1' && this.state.sector === 'payments' &&
                                 <div className="row">
                                    <div className="col-xs-12">
                                        <h2>{translate('PAYMENT_SETTINGS_HEADER')}</h2>
                                        <p className="text-muted">{translate('PAYMENT_SETTINGS_DESC')}</p>
                                    </div>
                                    <div className="col-xs-12">
                                        <StripePaymentConnector isMarketplaceOwner={false} />
                                    </div>
                                </div>
                            }

                            { this.state.sector === 'delete-account' &&
                                <div className="row">
                                    <div className="col-xs-12">
                                        <h2>{translate('DELETE_YOUR_ACCOUNT_HEADER')}</h2>
                                        <p className="text-muted">{translate('DELETE_YOUR_ACCOUNT_DESC')}</p>
                                    </div>

                                    <div className="col-xs-12">
                                        <RaisedButton
                                            secondary={true}
                                            label={translate('DELETE_YOUR_ACCOUNT_ACTION')}
                                            onTouchTap={() => {
                                                openConfirmDialog({
                                                    headerLabel: translate('DELETE_YOUR_ACCOUNT_HEADER'),
                                                    confirmationLabel: translate('DELETE_YOUR_ACCOUNT_DESC')
                                                }, () => {
                                                    apiUser
                                                    .deleteItem(this.state.user.id)
                                                    .then(_ => {
                                                        goStartPage();
                                                    }, err => {
                                                        alert('Error');
                                                    });
                                                });
                                            }}
                                        />
                                    </div>
                                </div>
                            }
                    </div>
                </div>
            );
    }
};