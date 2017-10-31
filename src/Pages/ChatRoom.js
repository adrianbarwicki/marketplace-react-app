import React from 'react';
import Divider from 'material-ui/Divider';
import RaisedButton from 'material-ui/RaisedButton';
import Paper from 'material-ui/Paper';
import Moment from 'react-moment';
import HtmlTextField from '../Components/HtmlTextField';
import * as apiRequest from '../api/request';
import * as apiOrderActions from '../api/orderActions';
import { translate } from '../core/i18n';
import { goTo, tryGoBack } from '../core/navigation';
import displayTaskTiming from '../helpers/display-task-timing';
import DOMPurify from 'dompurify'
import Loader from "../Components/Loader";
import {
  Step,
  Stepper,
  StepLabel,
} from 'material-ui/Stepper';
import { getConfigAsync } from '../core/config';
import REQUEST_STATUS from '../constants/REQUEST_STATUS';
import ORDER_STATUS from '../constants/ORDER_STATUS';
import TASK_STATUS from '../constants/TASK_STATUS';
import { getUserAsync } from '../core/auth';
import { displayPrice, displayLocation } from '../core/format';
import { stripHtml, purifyHtmlMessage } from '../core/util';
import { openConfirmDialog } from '../helpers/confirm-before-action.js';
import { openDialog as openMessageDialog } from '../helpers/open-message-dialog.js';

import '../Chat.css';

const _ = require('underscore');

const defaultProfileImageUrl = '/images/avatar.png';

const REQUEST_ORDER = [
    REQUEST_STATUS.PENDING,
    REQUEST_STATUS.ACCEPTED,
    REQUEST_STATUS.MARKED_DONE,
    REQUEST_STATUS.SETTLED,
    REQUEST_STATUS.CLOSED,
    REQUEST_STATUS.DECLINED,
    REQUEST_STATUS.CANCELED
];

const STEPER_STATUSES = [
    [],
    [ REQUEST_STATUS.PENDING ],
    [ REQUEST_STATUS.ACCEPTED ],
    [ REQUEST_STATUS.MARKED_DONE ],
    [ REQUEST_STATUS.SETTLED, REQUEST_STATUS.CLOSED ]
];

const actionBtnStyle = {
    marginTop: 10,
    marginBottom: 10,
    width: '100%'
};

const getActiveStep = (requestStatus, isReviewed) => {
    let stepIndex = 1;

    STEPER_STATUSES.forEach((STEPPER_STATUS, index) => {
        stepIndex = STEPPER_STATUS.indexOf(requestStatus) > -1 ? index : stepIndex;
    });

    if (stepIndex === 4) {
        return isReviewed ? stepIndex + 1 : stepIndex;
    }

    return stepIndex;
};

const getReviewFromState = state => {
    try {
        return state.user.userType === 1 ?
            state.request.order.review : state.request.review
    } catch (err) {
        return undefined;
    }
};

export default class ChatRoom extends React.Component {
    constructor() {
        super();

        this.state = {
            isLoading: true,
            newMessage: '',
            task: {},
            users: {},
            messages: []
        };

        this.handleNewMessage = this.handleNewMessage.bind(this);
    }

    componentDidMount() {
        getConfigAsync(config => {
            getUserAsync(user => {
                let requestId = this.props.params.chatId;

                if (!user) {
                    return goTo(`/login?redirectTo=/chat/${requestId}`);
                }
                
                apiRequest
                .getItem(requestId)
                .then(chat => {
                    if (chat.task.status === TASK_STATUS.INACTIVE) {
                        return goTo('/');
                    }

                    if (chat.request.status === REQUEST_STATUS.CANCELED || chat.request.status === REQUEST_STATUS.DECLINED) {
                        return goTo('/');
                    }

                    const task = chat.task;

                    if (task.status === '99') {
                        goTo('/');

                        return alert('You cannot access this page. The listing has been marked as spam.');
                    }

                    this.setState({
                        newMessage: '',
                        config,
                        isUserOwner: user.id === chat.task.userId,
                        requestId,
                        user,
                        isLoading: false,
                        fromUserId: user.id,
                        toUserId: chat.messages[0].fromUserId === user.id ?
                            chat.messages[0].toUserId :
                            chat.messages[0].fromUserId,
                        messages: chat.messages,
                        users: chat.users,
                        task,
                        request: chat.request
                    });
                });
            }, true);
        });
    }

    handleNewMessage (event) {
        event.preventDefault()
    
        let newMessage = this.state.newMessage;

        newMessage = purifyHtmlMessage(newMessage);

        if (newMessage < 2) {
            return alert(translate('ERROR_MESSAGE_TOO_SHORT'));
        }

        const data = {
            taskId: this.state.task.id,
            toUserId: this.state.toUserId,
            fromUserId: this.state.fromUserId,
            requestId: this.state.requestId,
            message: newMessage
        };

        this.state.messages.unshift(data);
        
        this.setState({
            isSubmitting: true,
            newMessage: '',
            messages: this.state.messages
        });

        apiRequest
        .createItemMessage(this.state.requestId, data)
        .then(rMessage => {
            const messages = this.state.messages;
            
            messages[0] = rMessage;
            
            this.setState({
                isSubmitting: false,
                messages
            });
        }, err => {
            this.setState({
                isSubmitting: false
            });
            alert('error');
        });
    }
    render() {
        return (
                <div className="container vq-no-padding st-chat-view">
                    { this.state.isLoading && 
                        <Loader isLoading={true} />
                    }

                    { !this.state.isLoading &&
                        <div className="row">
                            <div className="col-xs-12 col-sm-8">
                                    <div className="row">
                                        <div className="col-xs-12">
                                            <h1 style={{color: this.state.config.COLOR_PRIMARY}}>
                                                {translate("CHAT_PAGE_HEADER")}
                                            </h1>
                                            <p>{translate("CHAT_PAGE_DESC")}</p>
                                        </div>
                                    </div>
                                    <hr />
                                    { this.state.task &&
                                        <div className="row">
                                            <div className="col-xs-12">
                                                <h3>
                                                    <a style={{
                                                        textDecoration: 'none',
                                                        cursor: 'pointer'
                                                    }} onTouchTap={() => goTo(`/task/${this.state.task.id}`)}>
                                                        { this.state.task.title }
                                                    </a>
                                                </h3>
                                            </div>
                                            <div className="col-xs-12">
                                                <div className="row">
                                                    <div className="col-xs-12 col-sm-4">
                                                        <p className="text-muted">
                                                            {translate('LISTING_DATE')}:<br />{displayTaskTiming(this.state.task.taskTimings, `${this.state.config.DATE_FORMAT}`)}
                                                        </p>
                                                    </div>
                                                    <div className="col-xs-12 col-sm-4">
                                                        <p className="text-muted">
                                                            {translate('LISTING_LOCATION')}:<br />{displayLocation(this.state.task.taskLocations[0])}
                                                        </p>
                                                    </div>
                                                    <div className="col-xs-12 col-sm-4">
                                                        <p className="text-muted">
                                                            {translate('PRICE')}:<br />{displayPrice(this.state.task.price, this.state.task.currency)}/h
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-xs-12">
                                                    <Divider />
                                            </div>
                                        </div>
                                    }

                                    { this.state.users[this.state.fromUserId] &&
                                        <div className="row" style={{
                                            paddingLeft: 20,
                                            marginTop: 20,
                                            marginBottom: 20,
                                            paddingRight: 20
                                        }}>
                                            <div className="col-xs-12">
                                                <form onSubmit={this.handleNewMessage}>
                                                    <HtmlTextField                                                 
                                                        onChange={(event, newMessage) => this.setState({
                                                            newMessage
                                                        })}
                                                        value={this.state.newMessage}
                                                    />
                                                    
                                                    <RaisedButton
                                                        disabled={this.state.isSubmitting || !stripHtml(this.state.newMessage)}
                                                        type="submit"
                                                        style={{ marginTop: 10, width: '100%' }}
                                                        label={translate("CHAT_MESSAGE_SUBMIT")}
                                                    />
                                                </form>
                                            </div>
                                        </div>
                                    } 

                                    { this.state.messages
                                        .filter(message => {
                                            if (this.state.users[message.fromUserId]) {
                                                return true;
                                            }

                                            console.error("Sender not found. Inconsistent data!");

                                            return false;
                                        })
                                        .map(message => {
                                            const sender = this.state.users[message.fromUserId];

                                            const firstName = sender.firstName;
                                            const lastName = sender.lastName;
                                            const profileImageUrl = sender.imageUrl || defaultProfileImageUrl;

                                            return <div className="row" style={{ paddingLeft: '20px', marginTop: '20px'}}>
                                                        <div className="col-xs-12" style={{ marginBottom: '20px'}}>
                                                            <div className="row">
                                                                <div className="col-xs-3 col-sm-1">
                                                                    <a 
                                                                        style={{
                                                                            cursor: 'pointer'
                                                                        }} 
                                                                        onClick={
                                                                            () => goTo(`/profile/${message.fromUserId}`)
                                                                        }>
                                                                        <img
                                                                            alt="profile"
                                                                            style={{ 
                                                                                borderRadius: '50%', 
                                                                                width: '50px',
                                                                                height: '50px' 
                                                                            }} 
                                                                            src={profileImageUrl}
                                                                        />
                                                                    </a>
                                                                </div>
                                                                <div className="col-xs-9 col-sm-11" style={{ marginTop: 6 }}>
                                                                    <strong>
                                                                        <a
                                                                            style={{
                                                                                textDecoration: 'none',
                                                                                cursor: 'pointer'
                                                                            }}
                                                                            onClick={() => goTo(`/profile/${message.fromUserId}`)}>
                                                                        {firstName} {lastName}
                                                                        </a>
                                                                        </strong>
                                                                    <br />
                                                                    <p className="text-muted">
                                                                        <Moment format={`${this.state.config.DATE_FORMAT}, ${this.state.config.TIME_FORMAT}`}>{message.createdAt}</Moment>
                                                                    </p>
                                                                </div>
                                                            </div>   
                                                        </div>
                                                        <div className="col-xs-12">
                                                            <div dangerouslySetInnerHTML={{
                                                                __html: DOMPurify.sanitize(message.message)
                                                            }} />
                                                            <Divider style={{ marginRight: '10px' }}/>
                                                        </div>
                                                </div>;
                                        })
                                    }          
                            </div>

                            <div className="col-xs-12 col-sm-4">
                                    <Paper zDepth={1} style={{ padding: '10px' }}>
                                        <div className="row">
                                            <div className="col-xs-12" style={ { marginBottom: '20px'} }>
                                                <h4>{translate("IN_THIS_CHAT")}</h4>
                                            </div>    
                                        </div>   
                                        <div className="row">
                                            <div className="col-xs-12" style={{
                                                marginBottom: '10px'
                                            }}>
                                                { Object.keys(this.state.users)
                                                .map(userId => {
                                                    const user = this.state.users[userId];
                                                    const firstName = user.firstName;
                                                    const lastName = user.lastName;
                                                    const profileImageUrl = user.imageUrl || defaultProfileImageUrl;
                                                    const name = `${firstName} ${lastName}`;
                                                    const profileBio = stripHtml(user.bio, 50);

                                                    return <div className="row" style={{ marginBottom: '10px' }}>
                                                                <a href={`/app/profile/${userId}`}>
                                                                    <div className="col-xs-4 col-sm-3 col-md-2">
                                                                        <img alt={name}
                                                                            style={{ 
                                                                                borderRadius: '50%',
                                                                                width: '50px',
                                                                                height: '50px' 
                                                                            }} 
                                                                            src={profileImageUrl} 
                                                                        />
                                                                    </div>
                                                                    <div className="col-xs-8 col-sm-9 col-md-8">
                                                                            <strong>
                                                                                { name }
                                                                            </strong>
                                                                            <br />
                                                                            { profileBio }
                                                                    </div>
                                                                </a>
                                                            </div>;
                                                })} 
                                            </div>
                                        </div>
                                    </Paper>
                                    { this.state.isUserOwner &&
                                      String(this.state.request.status) === '0' &&
                                        <RaisedButton
                                            labelStyle={{color: 'white'}}
                                            backgroundColor={this.state.config.COLOR_PRIMARY}
                                            style={actionBtnStyle}
                                            label={translate("ORDER_CREATE")} 
                                            onClick={
                                                () => goTo(`/request/${this.state.requestId}/book`)
                                            }
                                        />
                                    }

                                    { this.state.request.order &&
                                      (
                                          String(this.state.request.order.status) === ORDER_STATUS.PENDING
                                      ) &&
                                      (
                                          this.state.request.fromUserId === this.state.fromUserId
                                      ) &&
                                        <RaisedButton
                                            label={translate('REQUEST_ACTION_MARK_DONE')}
                                            labelStyle={{color: 'white'}}
                                            backgroundColor={this.state.config.COLOR_PRIMARY}
                                            style={actionBtnStyle}
                                            onTouchTap={() => {
                                                const request = this.state.request;

                                                openConfirmDialog({
                                                    headerLabel: translate('REQUEST_ACTION_MARK_DONE'),
                                                    confirmationLabel: translate('REQUEST_ACTION_MARK_DONE_DESC')
                                                }, () => {
                                                    apiRequest
                                                    .updateItem(request.id, {
                                                        status: REQUEST_STATUS.MARKED_DONE
                                                    })
                                                    .then(_ => {
                                                        request.status = REQUEST_STATUS.MARKED_DONE;
                                                        request.order.status = ORDER_STATUS.MARKED_DONE;

                                                        this.setState({
                                                            request
                                                        });

                                                        openMessageDialog({
                                                            header: translate('REQUEST_ACTION_MARK_DONE_SUCCESS')
                                                        });
                                                    });
                                                });
                                            }}
                                        />
                                    }

                                    { this.state.isUserOwner && this.state.request.order &&
                                      (
                                          String(this.state.request.order.status) === ORDER_STATUS.PENDING ||
                                          String(this.state.request.order.status) === ORDER_STATUS.MARKED_DONE
                                      ) &&
                                        <RaisedButton
                                            label={translate('SETTLE_ORDER')}
                                            labelStyle={{color: 'white'}}
                                            backgroundColor={this.state.config.COLOR_PRIMARY}
                                            style={actionBtnStyle}
                                            onTouchTap={() => {
                                                const request = this.state.request;

                                                openConfirmDialog({
                                                    headerLabel: translate('SETTLE_ORDER'),
                                                    confirmationLabel: translate('SETTLE_ORDER_DESC')
                                                }, () => {
                                                    apiOrderActions
                                                        .settleOrder(request.order.id)
                                                        .then(_ => {
                                                            request.status = REQUEST_STATUS.SETTLED;
                                                            request.order.status = ORDER_STATUS.SETTLED;

                                                            this.setState({
                                                                request
                                                            });

                                                            openMessageDialog({
                                                                header: translate('ORDER_SETTLED_SUCCESS')
                                                            });
                                                        });
                                                });
                                            }}
                                        />
                                    }

                                    { this.state.isUserOwner && this.state.request.order &&
                                      (
                                          String(this.state.request.status) === REQUEST_STATUS.SETTLED
                                          ||
                                          String(this.state.request.status) === REQUEST_STATUS.CLOSED
                                      ) &&
                                      (
                                          !this.state.request.order.review
                                      ) &&
                                        <RaisedButton
                                            label={translate('LEAVE_REVIEW')}
                                            labelStyle={{color: 'white'}}
                                            backgroundColor={this.state.config.COLOR_PRIMARY}
                                            style={actionBtnStyle}
                                            onTouchTap={() => goTo(`/order/${this.state.request.order.id}/review`)}
                                        />
                                    }

                                    { !this.state.isUserOwner && this.state.request.order &&
                                      (
                                          String(this.state.request.status) === REQUEST_STATUS.SETTLED
                                          ||
                                          String(this.state.request.status) === REQUEST_STATUS.CLOSED
                                      ) &&
                                      (
                                          !this.state.request.review
                                      ) &&
                                        <RaisedButton
                                            label={translate('LEAVE_REVIEW')}
                                            labelStyle={{color: 'white'}}
                                            backgroundColor={this.state.config.COLOR_PRIMARY}
                                            style={actionBtnStyle}
                                            onTouchTap={() => goTo(`/request/${this.state.request.id}/review`)}
                                        />
                                    }

                                    { this.state.user &&
                                        <Stepper className="hidden-xs" activeStep={
                                            getActiveStep(this.state.request.status, getReviewFromState(this.state))
                                        } orientation="vertical">
                                            <Step>
                                                <StepLabel>{translate('REQUEST_RECEIVED')}</StepLabel>
                                            </Step>
                                            <Step>
                                                <StepLabel>{translate('REQUEST_BOOKED')}</StepLabel>
                                            </Step>
                                            <Step>
                                                <StepLabel>{translate('REQUEST_MARKED_AS_DONE')}</StepLabel>
                                            </Step>
                                            <Step>
                                                <StepLabel>{ this.state.request.status === REQUEST_STATUS.CLOSED ? translate('REQUEST_CLOSED') : translate('REQUEST_SETLLED')}</StepLabel>
                                            </Step>
                                            <Step>
                                                <StepLabel>{translate('REQUEST_REVIEWED')}</StepLabel>
                                            </Step>
                                        </Stepper>
                                    }
                            </div>
                        </div>   
                    }
            </div>    
        );
   }
};
