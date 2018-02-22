import React from 'react';
import * as apiAdmin from '../api/admin';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import Moment from 'react-moment';
import MenuItem from 'material-ui/MenuItem';
import Loader from "../Components/Loader";
import { translate } from '../core/i18n';
import { displayTaskStatus } from '../core/format';
import displayObject from '../helpers/display-object';
import getProperty from '../helpers/get-user-property';
import { openConfirmDialog } from '../helpers/confirm-before-action.js';
import DropDownMenu from 'material-ui/DropDownMenu';
import TASK_STATUS from '../constants/TASK_STATUS';
import RaisedButton from 'material-ui/RaisedButton';

import __ from 'underscore';

export default class SectionListings extends React.Component {
    constructor() {
        super();
        this.state = {
            isLoading: true,
            showProperty: false,
            showDetails: false,
            selectedUserId: null,
            isBlockingUser: false,
            tasks: []
        };
    }
    componentDidMount() {
        apiAdmin.task
            .getItems()
            .then(tasks => {
                this.setState({
                    isLoading: false,
                    tasks
                });
            });
    }

    taskHasOrders(task) {
        for (let request of task.requests) {
            if (request.order) {
                return true;
            }
            return false;
        }
    }

    render() {
            return (
                <div className="row">
                    <div className="col-xs-12">
                            <h1>Listings</h1>
                    </div>
                    <div className="col-xs-12">
                        <div className="col-xs-4 col-sm-4">
                            <TextField
                                min={1}
                                type="number"
                                onChange={(ev, value) => {
                                    this.setState({
                                        listingIdSearchValue: value
                                    });
                                }}
                                value={this.state.listingIdSearchValue}
                                floatingLabelText="ListingID"
                            />
                        </div>
                        <div className="col-xs-3 col-sm-3">
                            <DropDownMenu
                                style={{
                                    marginTop: 16,
                                    width: '100%'
                                }}
                                value={this.state.statusFilter} onChange={(_, _2, statusFilter) => {
                                this.setState({
                                    statusFilter
                                })
                            }}>
                                <MenuItem value={undefined} primaryText="No filter" />
                                {
                                    Object.keys(TASK_STATUS)
                                    .map((status, index) =>
                                        <MenuItem
                                            key={index}
                                            value={TASK_STATUS[status]}
                                            primaryText={status}
                                        />
                                    )
                                }
                            </DropDownMenu>
                        </div>
                        <div className="col-xs-3 col-sm-2">
                            <RaisedButton style={{
                                marginTop: 12
                            }} onClick={() => {
                                alert("Contact support for exporting data.");
                            }} label="Export" />
                        </div>
                    </div>

                    <div className="col-xs-12">
                        <table className="table">
                            <thead className="thead-dark">
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Title</th>
                                    <th scope="col">Status</th>
                                    <th scope="col">Created at</th>
                                    <th scope="col">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                            {
                            this.state.tasks
                            .filter(task => {
                                if (!this.state.statusFilter) {
                                    return true;
                                }

                                return this.state.statusFilter === task.status;
                            })
                            .filter(listing => {
                                return this.state.listingIdSearchValue ?
                                    String(listing.id) === String(this.state.listingIdSearchValue) :
                                    true;
                            })
                            .map((task, index) =>
                                <tr key={index}>
                                   <td>
                                        {task.id}
                                   </td>
                                    <td>
                                        {task.title}
                                    </td>
                                    <td>
                                        {displayTaskStatus(task.status)}
                                    </td>
                                    <td>
                                        <Moment format={`DD.MM.YYYY, HH:mm`}>{task.createdAt}</Moment>
                                    </td>

                                    <td>
                                        <a
                                        className="vq-row-option"
                                        href="#"
                                        onTouchTap={() => {
                                            apiAdmin.users
                                            .getUserEmail(task.userId)
                                            .then(userEmails => {
                                                this.setState({
                                                    showDetails: true,
                                                    selectedUser: userEmails
                                                });
                                            });
                                        }}>Owner email</a>

                                        <a className="vq-row-option" href="#" onTouchTap={() => {
                                            this.setState({
                                                showDetails: true,
                                                selectedUser: task
                                            })
                                        }}>Details</a>

                                        {
                                            !this.taskHasOrders(task) &&
                                            <a className="vq-row-option" href="#" onTouchTap={() => {
                                                openConfirmDialog({
                                                    headerLabel: 'Mark the listing as spam',
                                                    confirmationLabel: `Listing "${task.title}" (id: ${task.id}) will be marked as spam, the owner will be notified and the listing will disapear from the "Browse" page. It is only possible to mark listings that are not in progress as spam. Beware that once a listing is marked as spam, this process cannot be reversed. Are you sure?`
                                                }, () => {
                                                    apiAdmin.task
                                                    .markAsSpam(task.id)
                                                    .then(_ => {
                                                        const tasks = this.state.tasks;
    
                                                        const taskRef = tasks
                                                            .find(_ => _.id === task.id);
    
                                                        taskRef.status = '99';
    
                                                        this.setState({
                                                            tasks
                                                        });
    
                                                        alert('OK! Task has been marked as spam.');
                                                    }, err => {
                                                        if (err.code === "TASK_IS_NOT_ACTIVE") {
                                                            return alert('TASK_IS_NOT_ACTIVE: You can only mark active tasks as spam.');
                                                        }
                                                        
                                                        return alert(`Unknown error occured ${err}`);
                                                    })
                                                })
                                            }}>Spam</a>
                                        }
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>

                        { this.state.isLoading &&
                            <Loader isLoading={true} />
                        }

                        { !this.state.isLoading && !this.state.tasks.length &&
                            <p className="text-center">
                                No Listings
                            </p>
                        }
                    </div>

                    <div>
                        <Dialog
                            actions={[
                                <FlatButton
                                    label={translate('CANCEL')}
                                    primary={true}
                                    onTouchTap={() => this.setState({
                                        isBlockingUser: false,
                                        isUnblockingUser: false,
                                        selectedUserId: null
                                    })
                                    }
                                />,
                                <FlatButton
                                    label={translate('CONFIRM')}
                                    primary={true}
                                    onTouchTap={() => {
                                        const users = this.state.users;
                                        const userId = this.state.selectedUserId;
                                        const isBlocking = this.state.isBlockingUser;
                                        const USER_STATUS_BLOCKED = isBlocking ? '20' : '10';

                                        users
                                            .find(_ => _.id === userId)
                                            .status = USER_STATUS_BLOCKED;

                                        apiAdmin
                                            .users[
                                                isBlocking ? 'blockUser' : 'unblockUser'
                                            ](userId);

                                        this.setState({
                                            users,
                                            isBlockingUser: false,
                                            isUnblockingUser: false,
                                            selectedUserId: null
                                        });
                                    }}
                                />,
                            ]}
                            modal={false}
                            open={this.state.isBlockingUser || this.state.isUnblockingUser}
                            >
                                Block user #{this.state.selectedUserId}
                            </Dialog>

                            <div>
                                <Dialog
                                    autoScrollBodyContent={true}
                                    actions={[
                                        <FlatButton
                                            label={'OK'}
                                            primary={true}
                                            onTouchTap={() => this.setState({
                                                showDetails: false,
                                                selectedUser: null
                                            })}
                                        />
                                    ]}
                                    modal={false}
                                    open={this.state.showDetails}
                                    >
                                        <div className="container">
                                            { displayObject(this.state.selectedUser || {}, {
                                                doNotTrim: true,
                                                fields: {
                                                    description: {
                                                        type: 'html'
                                                    }
                                                }
                                            })}
                                        </div>
                                </Dialog>
                            </div>


                            <div>
                                <Dialog
                                    autoScrollBodyContent={true}
                                    actions={[
                                        <FlatButton
                                            label={'OK'}
                                            primary={true}
                                            onTouchTap={() => this.setState({
                                                showProperty: false,
                                                propertyName: null,
                                                selectedUser: null,
                                            })}
                                        />
                                    ]}
                                    modal={false}
                                    open={this.state.showProperty}
                                    >
                                        <div className="container">
                                            <div className="col-xs-12">
                                                    { this.state.showProperty &&
                                                        <img
                                                            alt="presentation"
                                                            width={400}
                                                            height={400}
                                                            src={getProperty(this.state.selectedUser, 'studentIdUrl')}
                                                        />
                                                    }
                                            </div>
                                            <div className="col-xs-12">
                                                { this.state.showProperty &&
                                                    <a href={getProperty(this.state.selectedUser, 'studentIdUrl')} target="_blank">Open in a separate page</a>
                                                }
                                            </div>
                                        </div>
                                </Dialog>
                            </div>
                        </div>
                     </div>
            );
    }
};
