import React, { Component } from 'react';
import { HashRouter, Router, Route, IndexRoute, browserHistory } from 'react-router';

// Library components
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

// Custom components
import ChangePasswordPage from './Pages/ChangePasswordPage';  
import Header from './Partials/Header';
import Footer from './Partials/Footer';
import Task from './Pages/Task';
import Dashboard from './Pages/Dashboard';
import TaskEdit from './Pages/TaskEdit';
import LoginPage from './Pages/LoginPage';
import SignupPage from './Pages/SignupPage';
import Profile from './Pages/Profile';
import ProfileEdit from './Pages/ProfileEdit';
import MyListings from './Pages/MyListings';
import Offers from './Pages/Offers';
import NewTask from './NewListing/NewListing';
import Chat from './Pages/Chat';
import ChatRoom from './Pages/ChatRoom';
import BookRequest from './Pages/BookRequest';
import Order from './Pages/Order';
import PremiumPage from './Pages/PremiumPage';
import AdminPage from './Admin/Admin';
import PostEdit from './Admin/PostEdit';
import Post from './Pages/Post';
import PostPrivacyPolicy from './Pages/PostPrivacyPolicy';
import PostTermsOfService from './Pages/PostTermsOfService';
import * as coreAuth from './core/auth';
import * as coreTracking from './core/tracking';
import * as corei18n from './core/i18n.js';
import * as coreUtil from './core/util.js'
import * as coreConfig from './core/config.js'
import * as coreNavigation from './core/navigation';
import * as apiAuth from './api/auth';
import * as apiConfig from './api/config';

import './App.css';

coreNavigation.setBase('app');

corei18n.addLang('en', {});
corei18n.addLang('de', {});
corei18n.addLang('tr', {});
corei18n.addLang('pl', {});

class App extends Component {
  constructor (props) {
    super(props);

    this.state = {
      metaReady: false,
      labelsReady: false,
      user: null,
      meta: {}
    };

    const params = coreUtil.getParams(location.search);

    if (params.token) {
      coreAuth.setToken(params.token);
    } else {
      coreAuth.loadFromLocalStorage();
    }

    coreAuth.addListener('login', () => {
      apiAuth.me()
        .then(myUserData => {
          coreAuth.setUserId(myUserData.id);  
          coreAuth.setUser(myUserData);

          this.setState({
            user: myUserData
          });
        })
        .catch(err => {
          coreAuth.destroy();
          coreNavigation.goTo('/login');
        });
    }, true);

    coreAuth.addListener('logout', () => {
      this.setState({
        user: null
      });
    });
    
    apiConfig
      .appConfig
      .getItems({}, {
        cache: true
      })
      .then(config => {
        coreConfig.set(config);

        return this.setState({
          metaReady: true,
          meta: config
        })
      });

    const defaultLang = 'en';

    apiConfig.appLabel.getItems({
      lang: defaultLang
    }, {
      cache: true
    })
    .then(labels => {
      const labelTranslations = {};

      labels.forEach(item => {
          labelTranslations[item.labelKey] = item.labelValue;
      });

      corei18n.addLang(defaultLang, labelTranslations);

      this.setState({
        labelsReady: true
      })
    });
  }

  render() {
      return (
        this.state.metaReady && this.state.labelsReady && <MuiThemeProvider>
          <div>
            <Header
              appName={this.state.meta.NAME}
              logo={this.state.meta.LOGO_URL}
              user={this.state.user}>
            </Header>
              <HashRouter hashType="hashbang" history={browserHistory} onUpdate={coreTracking.pageView}>
                <Route path="/app">
                  <IndexRoute component={Offers}/>
                  <Route path="dashboard" component={Dashboard}></Route>
                  <Route path="change-password" component={ChangePasswordPage}></Route>
                  <Route path="my-listings" component={MyListings}></Route>
                  <Route path="admin/:section" component={AdminPage}></Route>
                  <Route path="new-listing" component={NewTask}></Route>
                  <Route path="new-listing/:taskId" component={NewTask}></Route>
                  <Route path="premium" component={PremiumPage}></Route>
                  <Route path="chat" component={Chat}></Route>
                  <Route path="chat/:chatId" component={ChatRoom}></Route>
                  <Route path="request/:requestId/book" component={BookRequest}></Route>
                  <Route path="order/:orderId" component={Order}></Route>
                  <Route path="signup" component={SignupPage}></Route>
                  <Route path="login" component={LoginPage}></Route>
                  <Route path="post/:postId" component={Post}></Route>
                  <Route path="terms" component={PostTermsOfService}></Route>
                  <Route path="privacy" component={PostPrivacyPolicy}></Route>
                  <Route path="post/:taskId/edit" component={PostEdit}></Route>
                  <Route path="task/:taskId" component={Task}></Route>
                  <Route path="task/:taskId/edit" component={TaskEdit}></Route>
                  <Route path="profile/:profileId" component={Profile}></Route>
                  <Route path="my-listings" component={MyListings}></Route>
                  <Route path="profile/:profileId/edit" component={ProfileEdit}></Route>
                </Route>
              </Router>
            <Footer
              logo={this.state.meta.LOGO_URL}
              appName={this.state.meta.NAME}
            >
            </Footer>
          </div>
        </MuiThemeProvider> 
      );
   }
}

export default App;
