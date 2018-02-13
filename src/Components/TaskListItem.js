import React, {Component} from 'react';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import IconButton from 'material-ui/IconButton';
import IconCall from 'material-ui/svg-icons/communication/call';
import IconChatBubble from 'material-ui/svg-icons/communication/chat-bubble';
import Avatar from 'material-ui/Avatar';
import {translate} from '../core/i18n';
import {goTo} from '../core/navigation';
import {luminateColor, getReadableTextColor, lightOrDark} from '../core/format';
import {openConfirmDialog} from '../helpers/confirm-before-action.js';
import apiTask from '../api/task';
import {CONFIG} from '../core/config';
import ListingHeader from '../Components/ListingHeader';
import {openRequestDialog} from '../helpers/open-requests-dialog';
import ORDER_STATUS from '../constants/ORDER_STATUS';
import REQUEST_STATUS from '../constants/REQUEST_STATUS';
import TASK_STATUS from '../constants/TASK_STATUS';
import getUserProperty from '../helpers/get-user-property';
import Moment from 'react-moment';
import * as apiRequest from '../api/request';
import {openDialog} from '../helpers/open-message-dialog.js';
import {getUserAsync} from '../core/auth';
import * as apiOrderActions from '../api/orderActions';
import {getUtcUnixTimeNow} from '../core/util';
import {factory as errorFactory} from '../core/error-handler';
import Chip from 'material-ui/Chip';
import CheckCircleIcon from 'material-ui/svg-icons/action/check-circle';

export default class TaskListItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            task: props.task,
            properties: props.properties,
            request: props
                .task
                .requests
                .find(_ => {
                    if (props.task.status === TASK_STATUS.BOOKED) {
                        return _.status === REQUEST_STATUS.ACCEPTED ||
                            _.status === REQUEST_STATUS.BOOKED ||
                            _.status === REQUEST_STATUS.MARKED_DONE ||
                            _.status === REQUEST_STATUS.CLOSED ||
                            _.status === REQUEST_STATUS.SETTLED ||
                            _.status === REQUEST_STATUS.DECLINED
                    } else if (props.task.status === TASK_STATUS.COMPLETED) {
                        return _.status === REQUEST_STATUS.SETTLED || _.status === REQUEST_STATUS.CLOSED
                    }
                }),
            review: props
                .task
                .reviews
                .find(_ => _.fromUserId === props.task.userId),
            userType: props.userType
        };
    }

    componentDidMount() {
        this.setState({
            ready: true
        });
    }

    markAsDone() {
        if (this.state.task.taskType === 1) {
            return openConfirmDialog({
                headerLabel: translate('SETTLE_ORDER'),
                confirmationLabel: translate('SETTLE_ORDER_DESC')
            }, () => {
                apiOrderActions
                    .settleOrder(this.state.request.order.id)
                    .then(_ => {
                        const request = this.state.request;
                        request.status = REQUEST_STATUS.SETTLED;
                        request.order.status = ORDER_STATUS.SETTLED;

                        this.setState({
                            request,
                            properties: {
                                ...this.state.properties,
                                bookingDetails: false,
                                leaveReviewButton: true
                            }
                        });

                        return openDialog({header: translate('ORDER_SETTLED_SUCCESS')});
                    }, errorFactory());
            });
        }

        openConfirmDialog({
            headerLabel: translate('REQUEST_ACTION_MARK_DONE'),
            confirmationLabel: translate('REQUEST_ACTION_MARK_DONE_DESC')
        }, () => {

            apiRequest
                .updateItem(this.state.request.id, {status: REQUEST_STATUS.MARKED_DONE})
                .then(_ => {
                    const request = this.state.request;

                    request.status = REQUEST_STATUS.MARKED_DONE;

                    request.order.autoSettlementStartedAt = getUtcUnixTimeNow();

                    this.setState({
                        request
                    });

                    return openDialog({header: translate("REQUEST_ACTION_MARK_DONE_SUCCESS")});
                }, errorFactory());
        });
        
    }

    cancelTask() {
        openConfirmDialog({
            headerLabel: translate("CANCEL_LISTING_ACTION_HEADER"),
            confirmationLabel: translate("CANCEL_LISTING_DESC")
        }, () => {

            apiTask
                .updateItem(this.state.task.id, {status: TASK_STATUS.INACTIVE})
                .then(_ => {
                    const task = this.state.task;

                    task.status = TASK_STATUS.INACTIVE;


                    this.setState({
                        task,
                        properties: {
                            ...this.state.properties,
                            statusText: true
                        }
                    });

                    return openDialog({
                        header: translate('CANCEL_LISTING_SUCCESS_HEADER'),
                        desc: translate('CANCEL_LISTING_SUCCESS_DESC')
                    });

                }, errorFactory())
        });
    }

    leaveReview() {
        return this.state.task.taskType === 2 ?
            goTo(`/request/${this.state.request.id}/review`) :
            goTo(`/order/${this.state.request.order.id}/review`)
    }

    render() {

        const task = this.state.task;

        return (
            <div
                className="col-xs-12"
                style={{
                marginTop: 10
            }}>
                {
                    this.state.ready &&
                    <Paper style={{
                        padding: 10
                    }}>
                        <ListingHeader task={task}/>
                        <div className="row">
                            {
                                (
                                    this.state.properties &&
                                    (
                                        this.state.properties.statusText ||
                                        this.state.properties.editButton ||
                                        this.state.properties.cancelButton ||
                                        this.state.properties.requestsButton ||
                                        this.state.properties.bookingDetails ||
                                        this.state.properties.markAsDoneButton ||
                                        this.state.properties.leaveReviewButton
                                    )
                                ) &&
                                <div className="col-xs-12">
                                    <div className="row">
                                        <div className="col-xs-12 col-sm-6 text-left">
                                            {
                                                CONFIG.LISTING_EDIT_ENABLED === "1" &&
                                                this.state.properties.editButton &&
                                                this.state.task &&
                                                this.state.task.requests &&
                                                !this
                                                .state
                                                .task
                                                .requests 
                                                .filter(_ => _.status === REQUEST_STATUS.PENDING || _.status === REQUEST_STATUS.ACCEPTED)
                                                .length && <div
                                                    style={{
                                                    display: 'inline-block',
                                                    marginTop: 10,
                                                    marginRight: 5
                                                }}>
                                                    <strong>
                                                        <a
                                                            className="vq-link"
                                                            label={`${translate('EDIT_LISTING')}`}
                                                            style={{
                                                            color: CONFIG.COLOR_PRIMARY
                                                        }}
                                                            onTouchTap={() => goTo(`/task/${task.id}/edit`)}>
                                                            {translate('EDIT')}
                                                        </a>
                                                    </strong>
                                                </div>
                                            }
                                            {
                                                this.state.properties.cancelButton &&
                                                this.state.task &&
                                                this.state.task.status !== TASK_STATUS.INACTIVE &&
                                                <div
                                                    style={{
                                                    display: 'inline-block',
                                                    marginTop: 10,
                                                    marginRight: 5
                                                }}>
                                                    <strong>
                                                        <a
                                                            className="vq-link"
                                                            label={`${translate('CANCEL_LISTING_ACTION_HEADER')}`}
                                                            style={{
                                                            color: CONFIG.COLOR_PRIMARY
                                                        }}
                                                            onTouchTap={() => { this.cancelTask() }}>
                                                            {translate('CANCEL')}
                                                        </a>
                                                    </strong>
                                                </div>
                                            }
                                            {
                                                this.state.properties &&
                                                this.state.properties.statusText &&
                                                this.state.task &&
                                                <p
                                                    className="text-muted"
                                                    style={{
                                                    marginTop: 18
                                                }}>
                                                    <strong>
                                                        {String(this.state.request.status) === REQUEST_STATUS.PENDING && translate("TASK_STATUS_ACTIVE")}

                                                        {
                                                            String(this.state.request.status) === REQUEST_STATUS.BOOKED &&
                                                            this.state.request &&
                                                            !this.state.request.order.autoSettlementStartedAt &&
                                                            translate("TASK_STATUS_BOOKED")
                                                            }

                                                        {
                                                            String(this.state.request.status) === REQUEST_STATUS.MARKED_DONE &&
                                                            this.state.request &&
                                                            this.state.request.order.autoSettlementStartedAt &&
                                                            <span>
                                                                {translate("TASK_STATUS_MARKED_DONE")}&nbsp;
                                                                ({translate("ORDER_AUTOSETTLEMENT_ON")}&nbsp;
                                                                <Moment format={`${CONFIG.DATE_FORMAT}, ${CONFIG.TIME_FORMAT}`}>{(new Date(this.state.request.order.autoSettlementStartedAt * 1000).addHours(8))}</Moment>)
                                                            </span>
                                                        }

                                                        {String(this.state.request.status) === REQUEST_STATUS.ACCEPTED && translate("TASK_STATUS_ACCEPTED")}

                                                        {String(this.state.request.status) === REQUEST_STATUS.DECLINED && translate("TASK_STATUS_DECLINED")}

                                                        {String(this.state.request.status) === REQUEST_STATUS.SETTLED && translate("TASK_STATUS_COMPLETED")}

                                                        {String(this.state.task.status) === TASK_STATUS.INACTIVE && translate("TASK_STATUS_CANCELED")}

                                                    </strong>
                                                </p>
                                            }
                                        </div>
                                        <div className="col-xs-12 col-sm-6 text-right">
                                            {
                                                this.state.request && this.state.properties.bookingDetails && 
                                                <IconButton
                                                    onClick={() => goTo(`/profile/${this.state.request.fromUser.id}`)}
                                                    tooltipPosition="top-center"
                                                    tooltip={`${this.state.request.fromUser.firstName} ${this.state.request.fromUser.lastName}`}>
                                                    <Avatar
                                                        src={this.state.request.fromUser.imageUrl || '/images/avatar.png'}/>
                                                </IconButton>
                                            }
                                            {
                                                this.state.request &&
                                                this.state.properties.bookingDetails &&
                                                (
                                                    this.state.request.status === REQUEST_STATUS.ACCEPTED ||
                                                    this.state.request.status === REQUEST_STATUS.BOOKED ||
                                                    this.state.request.status === REQUEST_STATUS.MARKED_DONE
                                                ) &&
                                                    <IconButton
                                                    style={{
                                                    top: 10
                                                }}
                                                    tooltipPosition="top-center"
                                                    tooltip={getUserProperty(this.state.request.fromUser, 'phoneNo')}>
                                                    <IconCall/>
                                                </IconButton>
                                            }
                                            {
                                                this.state.request &&
                                                this.state.properties.bookingDetails &&
                                                (
                                                    this.state.request.status === REQUEST_STATUS.ACCEPTED ||
                                                    this.state.request.status === REQUEST_STATUS.BOOKED ||
                                                    this.state.request.status === REQUEST_STATUS.MARKED_DONE 
                                                ) &&                                                
                                                <IconButton
                                                    style={{
                                                    top: 10
                                                }}
                                                    tooltip={'Chat'}
                                                    tooltipPosition="top-center"
                                                    onClick={() => goTo(`/chat/${this.state.request.id}`)}>
                                                    <IconChatBubble/>
                                                </IconButton>
                                            }
                                            {
                                                this.state.request &&
                                                this.state.request.status === REQUEST_STATUS.ACCEPTED &&
                                                Number(this.state.task.taskType) ===  1 &&
                                                this.state.properties.bookButton &&
                                                <RaisedButton
                                                    primary={true}
                                                    label={translate('ORDER_CREATE')}
                                                    onTouchTap={() => goTo(`/request/${this.state.request.id}/book`)}
                                                />
                                            }
                                            {
                                                this.state.request &&
                                                (
                                                    (
                                                        this.state.userType === 1 &&
                                                        this.state.request.status === REQUEST_STATUS.MARKED_DONE ||
                                                        this.state.request.status === REQUEST_STATUS.BOOKED
                                                    ) ||
                                                    (
                                                        this.state.userType === 2 &&
                                                        this.state.request.status === REQUEST_STATUS.BOOKED
                                                    )
                                                ) &&
                                                this.state.properties.markAsDoneButton &&
                                                <RaisedButton
                                                    primary={true}
                                                    label={this.state.task.taskType === 2 ? translate('REQUEST_ACTION_MARK_DONE') : translate('SETTLE_ORDER')}
                                                    onTouchTap={() => this.markAsDone()}
                                                />
                                            }
                                            {
                                                this.state.request &&
                                                !this.state.review &&
                                                (
                                                    this.state.request.status === REQUEST_STATUS.MARKED_DONE ||
                                                    this.state.request.status === REQUEST_STATUS.SETTLED ||
                                                    this.state.request.status === REQUEST_STATUS.CLOSED
                                                ) &&
                                                (
                                                    (
                                                        Number(this.state.task.taskType) === 2 &&
                                                        CONFIG.LISTING_TASK_WORKFLOW_FOR_SUPPLY_LISTINGS === "1" &&
                                                        CONFIG.LISTING_TASK_WORKFLOW_FOR_SUPPLY_LISTINGS_REVIEW_STEP_ENABLED === "1"
                                                    ) ||
                                                    (
                                                        Number(this.state.task.taskType) === 1 &&
                                                        CONFIG.LISTING_TASK_WORKFLOW_FOR_DEMAND_LISTINGS === "1" &&
                                                        CONFIG.LISTING_TASK_WORKFLOW_FOR_DEMAND_LISTINGS_REVIEW_STEP_ENABLED === "1"
                                                    )
                                                ) &&
                                                this.state.properties.leaveReviewButton &&
                                                <div
                                                    style={{
                                                    display: 'inline-block',
                                                    padding: 10
                                                }}>
                                                    <RaisedButton
                                                        primary={true}
                                                        label={translate('LEAVE_REVIEW')}
                                                        onTouchTap={() => this.leaveReview()}/>
                                                </div>
                                            }
                                            {
                                                this.state.request &&
                                                this.state.review &&
                                                (
                                                    this.state.request.status === REQUEST_STATUS.SETTLED ||
                                                    this.state.request.status === REQUEST_STATUS.CLOSED
                                                ) &&
                                                (
                                                    (
                                                        Number(this.state.task.taskType) === 2 &&
                                                        CONFIG.LISTING_TASK_WORKFLOW_FOR_SUPPLY_LISTINGS === "1" &&
                                                        CONFIG.LISTING_TASK_WORKFLOW_FOR_SUPPLY_LISTINGS_REVIEW_STEP_ENABLED === "1"
                                                    ) ||
                                                    (
                                                        Number(this.state.task.taskType) === 1 &&
                                                        CONFIG.LISTING_TASK_WORKFLOW_FOR_DEMAND_LISTINGS === "1" &&
                                                        CONFIG.LISTING_TASK_WORKFLOW_FOR_DEMAND_LISTINGS_REVIEW_STEP_ENABLED === "1"
                                                    )
                                                ) &&
                                                this.state.properties &&
                                                this.state.properties.leaveReviewButton &&
                                                this.state.properties.statusText &&
                                                <Chip labelColor={getReadableTextColor(CONFIG.COLOR_PRIMARY)} backgroundColor={CONFIG.COLOR_PRIMARY} style={{float: 'right'}}>
                                                    <Avatar
                                                        backgroundColor={luminateColor(CONFIG.COLOR_PRIMARY, -0.2)}
                                                        color={getReadableTextColor(CONFIG.COLOR_PRIMARY)}
                                                        icon={<CheckCircleIcon />}/> {translate('TASK_ALREADY_REVIEWED')}
                                                </Chip>
                                            }
                                            {
                                                this.state.task.status === TASK_STATUS.ACTIVE &&
                                                this.state.properties.requestsButton &&
                                                <div
                                                    style={{
                                                    display: 'inline-block',
                                                    padding: 2
                                                }}>
                                                    <RaisedButton
                                                        label={`${this
                                                        .state
                                                        .task
                                                        .requests
                                                        .filter(_ => _.status === REQUEST_STATUS.PENDING || _.status === REQUEST_STATUS.ACCEPTED)
                                                        .length} ${translate('REQUESTS')}`}
                                                        labelStyle={{
                                                        color: 'white '
                                                    }}
                                                        backgroundColor={CONFIG.COLOR_PRIMARY}
                                                        onTouchTap={() => {
                                                        openRequestDialog(task.requests, task);
                                                    }}
                                                    />
                                                </div>
                                            }
                                        </div>
                                    </div>
                            </div>
                            }
                        </div>
                    </Paper>
                }
            </div>
        );
    }
}