import React, { Component } from 'react';
import apiTask from '../api/task';
import Paper from 'material-ui/Paper';
import coreAuth from '../core/auth';
import Toggle from 'material-ui/Toggle';
import {Tabs, Tab} from 'material-ui/Tabs';
import RaisedButton from 'material-ui/RaisedButton';
import * as coreNavigation from '../core/navigation';
import LinearProgress from 'material-ui/LinearProgress';


const style = {
    margin: 20,
    textAlign: 'center',
    display: 'block',
    color: '#546e7a',
    overlfow: 'scroll'
};
const styles = {
  block: {
    maxWidth: 250
  },
  thumbOff: {
    backgroundColor: '#ffcccc',
  },
  trackOff: {
    backgroundColor: '#ff9d9d',
  },
  thumbSwitched: {
    backgroundColor: 'red',
  },
  trackSwitched: {
    backgroundColor: '#ff9d9d',
  },
  labelStyle: {
    color: 'red',
  },
};

class MyListings extends Component {
    constructor(props) {
        super(props);
   
        this.state = {
                    isLoading: false,
                    description: "",
                    title: "",
                    offers: [
                        
                    ]
            };
            this.getOfferProgress = this.getOfferProgress.bind(this);
            this.handleActive = this.handleActive.bind(this);
         
    }
      componentDidMount() {
        this.loadTasks();
    }
    
     loadTasks(query) {
         this.setState({
            isLoading: true
        });
      
        apiTask.getItems({
            taskType: 1,
            status: window.localStorage.getItem('listStatus'),
           // owner_user_id: coreAuth.getUserId()
        })
        .then(offers => {
            this.setState({
                isLoading: false,
                offers: offers
                
            });
        });
    }

     handleActive(tab) {
         
       var tabType= tab.props["data-route"];
         if ( tabType == "activate") {
             window.localStorage.setItem('listStatus', 0)
             window.localStorage.setItem('key', 'k')
         }
         else if  ( tabType == "inEdit") {
             window.localStorage.setItem('listStatus', 10)
         }
         else if ( tabType == "deActivate") {
             window.localStorage.setItem('listStatus', 103)
         }
          this.loadTasks();
}

    getOfferProgress(offer) {
        var offerProgress = 0;
        
        if ( offer.title ) {
             offerProgress++
        }
        if ( offer.price ) {
             offerProgress++
        }
        if ( offer.description ) {
             offerProgress++
        }
        if ( offer.images) {
             offerProgress++
        }
        return offerProgress * 25 ;
        
    }


    render() {
       
        return (<div>
                    <div className="container" >
                            <div className="row">
                                    <div className="col-xs-12 col-sm-4" style={{'paddingLeft':'30px', 'marginTop':'70px', 'marginBottom':'10px' }} >
                                                <RaisedButton   label="Add new Insertion" primary={true}  onClick={ () => coreNavigation.goTo(`/new-listing`)} />
                                        </div>
                                        <div className="col-xs-12 col-sm-8">
                                             <div className="col-xs-12 col-sm-12">
                                                  <Tabs>
                                                         <Tab label="Activated" 
                                                              data-route="activate"
                                                              onActive={this.handleActive}
                                                              >
                                                                <div className="col-xs-12 col-sm-12">
                                                                        { this.state.offers.map( offer => {
                                                                            const offerProgress = this.getOfferProgress(offer);
                                                                                return(
                                                                                        <Paper style={style} zDepth={1} >
                                                                                            
                                                                                                <div className="row">  
                                                                                                    <div className="col-xs-12 col-sm-8"  >
                                                                                                            <img className="img-responsive"  src={ offer.images && offer.images[0] ? offer.images[0].imageUrl  : 'https://talentwand.de/images/categories/design.jpg' } role="presentation" />
                                                                                                    </div>
                                                                                                    <div className="col-xs-12 col-sm-4"  >
                                                                                                        
                                                                                                            <div className="col-xs-12 col-sm-12" style={{ 'marginTop':'5px', 'marginBottom':'5px'   }}>
                                                                                                                    <LinearProgress mode="determinate" value={offerProgress}  />
                                                                                                                    <span style={{'color':'#546e7a'}} >{offerProgress}%</span>  
                                                                                                            </div>
                                                                                                        
                                                                                                            <div className="col-xs-12 col-sm-12" style={{ 'marginTop':'15px' }}>
                                                                                                                    <h5>{offer.title}</h5> 
                                                                                                            </div>
                                                                                                        
                                                                                                            <div className="col-xs-12 col-sm-12" style={{ 'marginTop':'15px', 'marginBottom':'10px'  }} >
                                                                                                                <RaisedButton label="Deactivate" primary={true} fullWidth={true}  onClick={ () => coreNavigation.goTo(`/task/8/edit`)} /> 
                                                                                                            </div>
                                                                                                        

                                                                                                    </div>  
                                                                                                </div> 
                                                                                                
                                                                                        </Paper>
                                                                                        )    
                                                                                    }) 
                                                                                    }
                                                                            </div>
                                                                          </Tab>
                                                                                <Tab label="Draft" 
                                                                                     data-route="inEdit"
                                                                                     onActive={this.handleActive}
                                                                                     >
                                                                                      <div className="col-xs-12 col-sm-12">
                                                                                            { this.state.offers.map( offer => {
                                                                                            const offerProgress = this.getOfferProgress(offer);
                                                                                            return(
                                                                                                    <Paper style={style} zDepth={1} >
                                                                                                        
                                                                                                           <div className="row">  
                                                                                                                <div className="col-xs-12 col-sm-8"  >
                                                                                                                        <img className="img-responsive"  src={ offer.images && offer.images[0] ? offer.images[0].imageUrl  : 'https://talentwand.de/images/categories/design.jpg' } role="presentation" />
                                                                                                                </div>
                                                                                                                <div className="col-xs-12 col-sm-4"  >
                                                                                                                    
                                                                                                                        <div className="col-xs-12 col-sm-12" style={{ 'marginTop':'5px', 'marginBottom':'5px'   }}>
                                                                                                                              <LinearProgress mode="determinate" value={offerProgress}  />
                                                                                                                              <span style={{'color':'#546e7a'}} >{offerProgress}%</span>  
                                                                                                                        </div>
                                                                                                                    
                                                                                                                        <div className="col-xs-12 col-sm-12" style={{ 'marginTop':'5px' }}>
                                                                                                                                <h5>{  offer.categories[0].label  || offer.title || <h5>Title/Task In Progress</h5> }</h5>
                                                                                                                        </div>
                                                                                                                   
                                                                                                                   
                                                                                                                        <div className="col-xs-12 col-sm-12"  style={{ 'marginTop':'5px', 'marginBottom':'5px'  }}>
                                                                                                                              <RaisedButton label="Edit" primary={true} fullWidth={true}  onClick={ () => coreNavigation.goTo(`/task/8/edit`)} /> 
                                                                                                                              
                                                                                                                        </div>
                                                                                                                    
                                                                                                                    
                                                                                                                        <div className="col-xs-12 col-sm-12" style={{ 'marginTop':'5px', 'marginBottom':'5px'  }} >
                                                                                                                            <RaisedButton label="Deactivate" primary={true} fullWidth={true}  onClick={ () => coreNavigation.goTo(`/task/8/edit`)} /> 
                                                                                                                        </div>
                                                                                                                    

                                                                                                                </div>  
                                                                                                           </div> 
                                                                                                          
                                                                                                   </Paper>
                                                                                                  )    
                                                                                                }) 
                                                                                               }
                                                                                        </div>
                                                                                              </Tab>
                                                                                                    <Tab
                                                                                                      label="Deactived"
                                                                                                      data-route="deActivate"
                                                                                                      onActive={this.handleActive}
                                                                                                      >
                                                                                                       <div className="col-xs-12 col-sm-12">
                                                                                            { this.state.offers.map( offer => {
                                                                                            const offerProgress = this.getOfferProgress(offer);
                                                                                            return(
                                                                                                    <Paper style={style} zDepth={1} >
                                                                                                        
                                                                                                           <div className="row">  
                                                                                                                <div className="col-xs-12 col-sm-8"  >
                                                                                                                        <img className="img-responsive"  src={ offer.images && offer.images[0] ? offer.images[0].imageUrl  : 'https://talentwand.de/images/categories/design.jpg' } role="presentation" />
                                                                                                                </div>
                                                                                                                <div className="col-xs-12 col-sm-4"  >
                                                                                                                    
                                                                                                                        <div className="col-xs-12 col-sm-12" style={{ 'marginTop':'5px', 'marginBottom':'5px'   }}>
                                                                                                                              <LinearProgress mode="determinate" value={offerProgress}  />
                                                                                                                              <span style={{'color':'#546e7a'}} >{offerProgress}%</span>  
                                                                                                                        </div>
                                                                                                                    
                                                                                                                        <div className="col-xs-12 col-sm-12" >
                                                                                                                                <h5>{offer.title}</h5>  
                                                                                                                        </div>
                                                                                                                   
                                                                                                                   
                                                                                                                        <div className="col-xs-12 col-sm-12"  style={{ 'marginTop':'15px', 'marginBottom':'10px'  }}>
                                                                                                                              <RaisedButton label="Activate" primary={true} fullWidth={true}  onClick={ () => coreNavigation.goTo(`/task/8/edit`)} /> 
                                                                                                                        </div>
                                                                                                                    

                                                                                                                </div>  
                                                                                                           </div> 
                                                                                                          
                                                                                                   </Paper>
                                                                                                  )    
                                                                                                }) 
                                                                                               }
                                                                                        </div>
                                                                                            </Tab> 
                                                                                    </Tabs>
                                                                            </div>
                                                                     </div> {/* sm-8 close */}
                                                              </div> {/* 1st row closed  */}
                                                       </div> {/* container closed  */}
                                                </div>)
                                              }
                                           }

export default MyListings;