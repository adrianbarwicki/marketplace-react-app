import React, { Component } from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import Loader from "../Components/Loader";
import FlatButton from 'material-ui/FlatButton';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import TextField from 'material-ui/TextField';
import Slider from 'material-ui/Slider';
import ImageUploader from '../Components/ImageUploader';
import HtmlTextField from '../Components/HtmlTextField';
import REQUEST_STATUS from '../constants/REQUEST_STATUS';
import TASK_STATUS from '../constants/TASK_STATUS';
import apiTask from '../api/task';
import * as apiTaskImage from '../api/task-image';
import * as apiCategory from '../api/category';
import { goTo, goBack } from '../core/navigation';
import { factory as errorFactory } from '../core/error-handler';
import { translate } from '../core/i18n';
import { getConfigAsync } from '../core/config';
import { getUserAsync } from '../core/auth';
import { displayPrice, trimSpaces } from '../core/format';
import { displayMessage } from '../helpers/display-message.js';
import '../App.css';

export default class TaskEdit extends Component {
    constructor (props) {
        super(props);
   
        this.state = {
            isLoading: true,
            task: {},
            updatedTask: {}  
        };

        this.handleFieldChange=this.handleFieldChange.bind(this);
        this.handleUpdate=this.handleUpdate.bind(this);
    }
   
    componentDidMount() {
        getConfigAsync(config => {
            this.setState({
                config
            });

            getUserAsync(user => {
                if (!user) {
                    return goTo('/');
                }

                let taskId = this.props.params.taskId;
                
                apiTask
                .getItem(taskId)
                .then(rTask => {
                    if (!rTask) {
                        return goTo('/');
                    }

                    if (rTask.userId !== user.id) {
                        goTo('/');

                        return alert('NOT_YOUR_TASK');
                    }

                    const canEdit = Boolean(
                        this.state.task &&
                        this.state.task.status === TASK_STATUS.ACTIVE &&
                        this.state.task.requests &&
                        !this.state.task.requests
                        .filter(_ => _.status === REQUEST_STATUS.PENDING).length
                    );

                    if (canEdit) {
                        goTo('/');

                        return alert('EDITING_NOT_POSSIBLE');
                    }

                    apiCategory
                    .getItems()
                    .then(listingCategories => {
                        const category = listingCategories
                            .filter(
                                _ => _.code === rTask.categories[0].code
                            )[0];
                            
                        const minPrice = category ? category.minPriceHour || 0 : 0;
    
                        this.setState({
                            minPrice,
                            isLoading: false,
                            task: rTask,
                            updatedTask: {
                                images: rTask.images,
                                title: rTask.title,
                                description: {
                                  value: rTask.description,
                                  rawText: trimSpaces(rTask.description)
                                },
                                price: rTask.price,
                                priceType: rTask.priceType
                            }
                        });
                    });
                }, errorFactory());
            }, false);
        });
    }

  handleFieldChange (field, transform)  {
        return (event, value, rawText) => {
            const updatedTask = this.state.updatedTask;
            if (!rawText) {
              updatedTask[field] = transform ? transform(value) : value;
            } else {
              updatedTask[field].value = value;
              updatedTask[field].rawText = rawText;
            }

            this.setState({
                updatedTask
            });
        }
  }

  handleUpdate () {
    const taskId = this.state.task.id;
    const updatedTask = this.state.updatedTask;

    if (updatedTask.title < 5) {
        return displayMessage({
            label: translate('LISTING_TITLE_TOO_SHORT')
        });
    }

    if (updatedTask.description.rawText.length < 50) {
        return displayMessage({
            label: translate('LISTING_DESCRIPTION_TOO_SHORT')
        });
    }
    
    // updatedTask.price *= 100;

    apiTaskImage.createItem(taskId, updatedTask.images);

    updatedTask.description = updatedTask.description.value;

    apiTask
        .updateItem(taskId, updatedTask)
        .then(task => goTo(`/task/${taskId}`));
  }

  render() {
        return (
            <div >
              { this.state.isLoading && 
                <Loader isLoading={true} />
              }
              { !this.state.isLoading &&           
                        <div className="container">
                            <div className="col-xs-12 col-sm-8">
                                <div className="col-xs-12">
                                    <h4 style={{color: this.state.config.COLOR_PRIMARY}}>{translate("LISTING_TITLE")}</h4>
                                    <TextField
                                        ref="title"
                                        onChange={this.handleFieldChange('title')}
                                        value={this.state.updatedTask.title}
                                        style={{width: '100%'}}
                                        inputStyle={{width: '100%'}}
                                    />
                                </div>
                                <div className="col-xs-12">
                                    <h4 style={{color: this.state.config.COLOR_PRIMARY}}>{translate("LISTING_DESCRIPTION")}</h4>
                                        <HtmlTextField
                                             onChange={this.handleFieldChange('description')}
                                            value={this.state.updatedTask.description.value}
                                        />
                                    <hr />
                                </div>
                                { false &&
                                    <div className="col-xs-12">
                                        <h4 style={{color: this.state.config.COLOR_PRIMARY}}>{translate("NEW_LISTING_PRICING_HEADER")}</h4>
                                        <RadioButtonGroup 
                                            name="priceType" 
                                            onChange={ this.handleFieldChange('priceType', value => Number(value))} 
                                            ref="priceType"
                                            style={{width: '100%'}}
                                            inputStyle={{width: '100%'}}
                                            defaultSelected={this.state.task.priceType}>
                                                <RadioButton
                                                    value={1}
                                                    label={translate("PRICING_MODEL_HOURLY")}
                                                />
                                        </RadioButtonGroup>
                                    </div>
                                }
                                { this.state.task.priceType !== 2 &&
                                    <div className={"col-xs-12"}>
                                        <h2 
                                            style={{color: this.state.config.COLOR_PRIMARY}}
                                            className="text-center"
                                        >
                                            {displayPrice(this.state.updatedTask.price, this.state.config.PRICING_DEFAULT_CURRENCY, this.state.updatedTask.priceType)}
                                        </h2>
                                        <Slider
                                            min={this.state.minPrice}
                                            max={10000}
                                            step={500}
                                            value={this.state.updatedTask.price}
                                            onChange={this.handleFieldChange('price')}
                                        />
                                    </div>
                                }

                                { false &&
                                    <div className="col-xs-12">
                                        <h4 style={{color: this.state.config.COLOR_PRIMARY}}>Photos</h4>
                                        <ImageUploader images={this.state.updatedTask.images} onChange={images => {
                                            const updatedTask = this.state.updatedTask;

                                            updatedTask.images = images;

                                            this.setState({ updatedTask });
                                        }} />
                                    </div>
                                }

                                { this.state.config && 
                                <div className="col-xs-12 vq-margin-bottom-xs vq-margin-top-xs">
                                    <FlatButton
                                        style={{float: 'left'}}
                                        label={translate('CANCEL')}
                                        primary={ true }
                                        disabled={ false }
                                        onTouchTap={ () => goBack() }
                                    />
                                    <RaisedButton
                                        style={{ float: 'right' }}
                                        label={translate('CONFIRM')}
                                        labelStyle={{color: 'white '}}
                                        backgroundColor={this.state.config.COLOR_PRIMARY}
                                        disabled={ false }
                                        onTouchTap={ this.handleUpdate }
                                    />
                                </div>
                                }
                             </div>
                        </div>
                  }
            </div>
        );
  }
};