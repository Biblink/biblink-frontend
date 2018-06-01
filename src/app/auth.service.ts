import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs';
import { EmailUserInterface } from './interfaces/email-user.interface';
import { User } from './interfaces/user';
import { AngularFirestore } from 'angularfire2/firestore';

@Injectable()
export class AuthService {
    userData: User;
    actionCodeSettings = {
        url: 'http://0.0.0.0:4200/sign-in'
    };

    constructor(private _afAuth: AngularFireAuth) { }

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

    logout(): Promise<any> {
        return this._afAuth.auth.signOut();
    }

    sendPasswordReset(email: string): Promise<any> {
        return this._afAuth.auth.sendPasswordResetEmail(email, this.actionCodeSettings)
            .then(() => {
                return 'success';
            })
            .catch((error) => {
                return { errorCode: error.code, errorMessage: error.message };
            });
    }


    get authState(): Observable<firebase.User> {
        return this._afAuth.authState;
    }

    get emailVerified(): Promise<boolean> {
        return this._afAuth.auth.currentUser.reload().then((res) => {
            return this._afAuth.auth.currentUser.emailVerified;
        });
    }


    get profileImage(): Promise<string> {
        return this._afAuth.auth.currentUser.reload().then((res) => {
            return this._afAuth.auth.currentUser.photoURL;
        });
    }
    get email() {
        if (this.userData === undefined || this.userData.email === undefined) {
            return this._afAuth.auth.currentUser.email;
        }
        return this.userData.email;
    }

    sendVerificationEmail() {
        return this._afAuth.auth.currentUser.sendEmailVerification(this.actionCodeSettings).then(function () {
            return `Email verification was sent.`;
        }).catch((err) => {
            console.log(err);
        });
    }

    updateEmail(email: string) {
        return this._afAuth.auth.currentUser.updateEmail(email).then(() => 'success').catch((err) => {
            console.log(err);
        });
    }

    updatePassword(password: string) {
        return this._afAuth.auth.currentUser.updatePassword(password).then(() => 'success').catch((err) => {
            console.log(err);
        });
    }
}
