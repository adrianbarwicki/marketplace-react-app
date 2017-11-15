import React from 'react';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import ChangePasswordPage from './Pages/ChangePasswordPage';  
import Task from './Pages/Task';
import Dashboard from './Pages/Dashboard';
import TaskEdit from './Pages/TaskEdit';
import LoginPage from './Pages/LoginPage';
import SignupPage from './Pages/SignupPage';
import Profile from './Pages/Profile';
import ProfileEdit from './Pages/ProfileEdit';
import MyListings from './Pages/MyListings';
import BrowseListings from './Pages/BrowseListings';
import Account from './Pages/Account';
import NewTask from './NewListing/NewListing';
import Chat from './Pages/Chat';
import EmailNotVerified from './Pages/EmailNotVerified';
import ChatRoom from './Pages/ChatRoom';
import BookRequest from './Pages/BookRequest';
import NotFound from './Pages/NotFound';
import PremiumPage from './Pages/PremiumPage';
import AdminPage from './Admin/Admin';
import AdminUserPage from './Admin/User';
import PostEdit from './Admin/PostEdit';
import Post from './Pages/Post';
import PostPrivacyPolicy from './Pages/PostPrivacyPolicy';
import PostTermsOfService from './Pages/PostTermsOfService';
import Review from './Pages/Review';
import StartPage from './Pages/StartPage';
import Imprint from './Pages/Imprint';
import UserDocuments from './Pages/UserDocuments';
import UserPreferences from './Pages/UserPreferences';
import UserVerifications from './Pages/UserVerifications';

import { pageView } from './core/tracking';

const AppRoutes = (
    <Router history={browserHistory} onUpdate={pageView}>
        <Route path="/">
            <IndexRoute component={StartPage}/>
        </Route>
        <Route path="/app">
            <IndexRoute component={BrowseListings}/>
            <Route path="account(/:sector)" component={Account}></Route>
            <Route path="dashboard(/:type)" component={Dashboard}></Route>
            <Route path="change-password" component={ChangePasswordPage}></Route>
            <Route path="my-listings" component={MyListings}></Route>
            <Route path="listings" component={BrowseListings}></Route>
            <Route path="user-preferences" component={UserPreferences}></Route>
            <Route path="user-verifications" component={UserVerifications}></Route>
            <Route path="user-documents" component={UserDocuments}></Route>
            <Route path="admin(/:section)" component={AdminPage}></Route>
            <Route path="admin/user/:userId" component={AdminUserPage}></Route>
            <Route path="new-listing" component={NewTask}></Route>
            <Route path="new-listing/:taskId" component={NewTask}></Route>
            <Route path="premium" component={PremiumPage}></Route>
            <Route path="chat" component={Chat}></Route>
            <Route path="chat/:chatId" component={ChatRoom}></Route>
            <Route path="request/:chatId" component={ChatRoom}></Route>
            <Route path="request/:requestId/book" component={BookRequest}></Route>
            <Route path="request/:requestId/review" component={Review}></Route>
            <Route path="order/:orderId/review" component={Review}></Route>
            <Route path="signup" component={SignupPage}></Route>
            <Route path="login" component={LoginPage}></Route>
            <Route path="post/:postId" component={Post}></Route>
            <Route path="terms" component={PostTermsOfService}></Route>
            <Route path="privacy" component={PostPrivacyPolicy}></Route>
            <Route path="imprint" component={Imprint}></Route>
            <Route path="email-not-verified" component={EmailNotVerified}></Route>
            <Route path="post/:postId/edit" component={PostEdit}></Route>
            <Route path="task/:taskId" component={Task}></Route>
            <Route path="task/:taskId/edit" component={TaskEdit}></Route>
            <Route path="profile/:profileId" component={Profile}></Route>
            <Route path="my-listings" component={MyListings}></Route>
            <Route path="profile/:profileId/edit" component={ProfileEdit}></Route>
            <Route path="*" component={NotFound}></Route>
        </Route>
    </Router>
);

export default AppRoutes;
