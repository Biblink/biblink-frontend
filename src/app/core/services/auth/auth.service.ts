import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { Observable, merge } from 'rxjs';
import { EmailUserInterface } from '../../interfaces/email-user.interface';
import { User } from '../../interfaces/user';
import { AngularFirestore } from 'angularfire2/firestore';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
/**
 * Authentication service to handle all authentication
 */

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    /**
     * Variable to store user data
     */
    userData: User;
    /**
     * Current auth state
     */
    authUser = new BehaviorSubject<firebase.User>(undefined);
    /**
     * Action code settings for authentication
     */
    actionCodeSettings = {
        url: 'https://biblya-ed2ec.firebaseapp.com/sign-in' // TODO: change with new domain
    };
    /**
     * Initializes dependencies and does dependency injection
     * @param _afAuth AngularFireAuth instance to access authentication
     */
    constructor(private _afAuth: AngularFireAuth) {
        this._afAuth.authState.subscribe(this.authUser);
    }
    /**
     * Logs user in given a provider and necessary data
     * @param provider Provider to use to sign user in
     * @param data Email data if user is logging in with email
     * @returns {Promise} whether or not user has been succesfully logged in. If yes, returns User's data, if no, returns an error object
     */
    userLogin(provider: 'google' | 'facebook' | 'twitter' | 'email', data: EmailUserInterface = null): Promise<any> {
        switch (provider) {
            case 'google': {
                return this._afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then((res) => {
                    this.userData = new User('', '', res[ 'email' ],
                        { profileImage: res[ 'photoUrl' ], bio: '', shortDescription: '' });
                    return this.userData;
                })
                    .catch((err) => {
                        const errorCode = err.code;
                        const errorMessage = err.message;
                        return { errorCode: errorCode, errorMessage: errorMessage };
                    });
            }

            case 'facebook': {
                return this._afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider())
                    .catch((err) => {
                        const errorCode = err.code;
                        const errorMessage = err.message;
                        return { errorCode: errorCode, errorMessage: errorMessage };
                    });
            }

            case 'twitter': {
                return this._afAuth.auth.signInWithPopup(new firebase.auth.TwitterAuthProvider());
            }

            case 'email': {
                if (data === null || data === undefined) {
                    return new Promise((resolve, reject) => {
                        reject(`Please provide proper data for email login. Data Given: ${ data }`);
                    });
                } else {
                    return this._afAuth.auth.signInWithEmailAndPassword(data.email, data.password)
                        .then(() => {
                            return `User with email: ${ data.email } was logged in with email authentication.`;
                        })
                        .catch((err) => {
                            const errorCode = err.code;
                            const errorMessage = err.message;
                            if (errorCode === 'auth/wrong-password') {
                                return { errorCode: errorCode, errorMessage: 'wrong password' };
                            } else if (errorCode === 'auth/user-not-found') {
                                return 'user not found';
                            } else {
                                return errorMessage;
                            }
                        });
                }
            }
            default: {
                break;
            }
        }
    }

    /**
     * Signs user up with a given provider.
     * If email, utilizes data parameter
     * @param provider Provider to use to sign user up
     * @param data Email data if provider = 'email'
     * @returns {Promise} Attempts to sign user up, if success, provides the user data. Else, returns an error object
     */
    userSignup(provider: 'google' | 'facebook' | 'twitter' | 'email', data: EmailUserInterface = null): Promise<any> {
        switch (provider) {
            case 'google': {
                return this._afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
                    .then((res) => {
                        const userRes = res[ 'user' ];
                        this.userData = new User('', '', userRes[ 'email' ],
                            { profileImage: res[ 'photoUrl' ], bio: '', shortDescription: '' });
                        return this.userData;
                    }).catch((err) => {
                        const errorCode = err.code;
                        const errorMessage = err.message;
                        return { errorCode: errorCode, errorMessage: errorMessage };
                    });
            }

            case 'facebook': {
                return this._afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider()).then((res) => {
                    const userRes = res[ 'user' ];
                    this.userData = new User('', '', userRes[ 'email' ],
                        { profileImage: res[ 'photoUrl' ], bio: '', shortDescription: '' });
                    return this.userData;
                }).catch((err) => {
                    const errorCode = err.code;
                    const errorMessage = err.message;
                    return { errorCode: errorCode, errorMessage: errorMessage };
                });
            }

            case 'twitter': {
                return this._afAuth.auth.signInWithPopup(new firebase.auth.TwitterAuthProvider()).then((res) => {
                    const userRes = res[ 'user' ];
                    this.userData = new User('', '', userRes[ 'email' ],
                        { profileImage: res[ 'photoUrl' ], bio: '', shortDescription: '' });
                    return this.userData;
                });
            }

            case 'email': {
                if (data === null || data === undefined) {
                    return new Promise((resolve, reject) => {
                        reject(`Please provide proper data for email creation. Data Given: ${ data }`);
                    });
                } else {
                    return this._afAuth.auth.createUserWithEmailAndPassword(data.email, data.password)
                        .then(() => {
                            return this.sendVerificationEmail();
                        })
                        .catch((err) => {
                            const errorCode = err.code;
                            const errorMessage = err.message;
                            if (errorCode === 'auth/weak-password') {
                                return 'weak password';
                            } else {
                                return { errorCode: errorCode, errorMessage: errorMessage };
                            }
                        });
                }
            }
            default: {
                break;
            }
        }
    }
    /**
     * Logs current user out
     */
    logout(): Promise<any> {
        return this._afAuth.auth.signOut();
    }
    /**
     * Sends password reset email
     * @param {string} Email email to send password reset email to
     */
    sendPasswordReset(email: string): Promise<any> {
        return this._afAuth.auth.sendPasswordResetEmail(email, this.actionCodeSettings)
            .then(() => {
                return 'success';
            })
            .catch((error) => {
                return { errorCode: error.code, errorMessage: error.message };
            });
    }

    /**
     * Gets current auth state
     */
    get authState(): BehaviorSubject<firebase.User> {
        return this.authUser;
    }
    /**
     * Check if email has been verified
     * @param {boolean} updateAuthState Whether or not to update current authState (i.e. (authUser){@link AuthService#authUser})
     */
    emailVerified(updateAuthState = false): Promise<boolean> {
        return this._afAuth.auth.currentUser.reload().then(() => {
            if (updateAuthState && this._afAuth.auth.currentUser.emailVerified) {
                this.authUser.next(this._afAuth.auth.currentUser);
            }
            return this._afAuth.auth.currentUser.emailVerified;
        });
    }

    /**
     * Get current user's profile image
     */
    get profileImage(): Promise<string> {
        return this._afAuth.auth.currentUser.reload().then((res) => {
            return this._afAuth.auth.currentUser.photoURL;
        });
    }
    /**
     * Get email of current user
     */
    get email(): string {
        if (this.userData === undefined || this.userData.email === undefined) {
            return this._afAuth.auth.currentUser.email;
        }
        return this.userData.email;
    }
    /**
     * Sends a verification email to current user's email
     */
    sendVerificationEmail(): Promise<string> {
        return this._afAuth.auth.currentUser.sendEmailVerification(this.actionCodeSettings).then(function () {
            return `Email verification was sent.`;
        }).catch((err) => {
            console.log(err);
            return 'There was an error.';
        });
    }
    /**
     * Updates current user's email given a new email
     * @param email New email
     */
    updateEmail(email: string): Promise<string> {
        return this._afAuth.auth.currentUser.updateEmail(email).then(() => 'success').catch((err) => {
            console.log(err);
            return 'there was an error';
        });
    }
    /**
     * Updates current user's password given a new password
     * @param password New password
     */
    updatePassword(password: string): Promise<string> {
        return this._afAuth.auth.currentUser.updatePassword(password).then(() => 'success').catch((err) => {
            console.log(err);
            return 'there was an error';
        });
    }
}
