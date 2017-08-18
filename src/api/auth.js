import * as communication from '../core/communication'
import * as auth from '../core/auth'

export const me = () => new Promise((resolve, reject) => {
    communication
    .doGet('/me')
    .then(data => {
        auth.setAsRequested();

        return resolve(data)
    }, err => {
        auth.setAsRequested();

        return reject(err)
    });
});

export const login = data => communication.doPost('/login', data);

export const signup = data => communication.doPost('/signup/email', data);

export const changePassword = data => communication.doPost('/auth/password', data);

export const requestEmailLogin = data => communication.doPost('/login/email', data);

export const resendVerificationEmail = data =>
    communication.doPost('/verify/resend-email', data);
