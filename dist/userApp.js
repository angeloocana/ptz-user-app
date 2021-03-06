'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bcryptjs = require('bcryptjs');

var _jwtSimple = require('jwt-simple');

var _ptzCoreApp = require('ptz-core-app');

var _ptzUserDomain = require('ptz-user-domain');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

var UserApp = function (_BaseApp) {
    _inherits(UserApp, _BaseApp);

    function UserApp(userAppArgs) {
        _classCallCheck(this, UserApp);

        var _this = _possibleConstructorReturn(this, (UserApp.__proto__ || Object.getPrototypeOf(UserApp)).call(this, userAppArgs));

        _this.tokenSecret = process.env.PASSWORD_SALT;
        _this.passwordSalt = process.env.PASSWORD_SALT;
        _this.userRepository = userAppArgs.userRepository;
        return _this;
    }

    _createClass(UserApp, [{
        key: 'execAction',
        value: function execAction(action) {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee() {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.t0 = action.type;
                                _context.next = _context.t0 === UserApp.actions.SAVE ? 3 : _context.t0 === UserApp.actions.GET_AUTH_TOKEN ? 6 : 9;
                                break;

                            case 3:
                                _context.next = 5;
                                return this.saveUser(action.args);

                            case 5:
                                return _context.abrupt('return', _context.sent);

                            case 6:
                                _context.next = 8;
                                return this.getAuthToken(action.args);

                            case 8:
                                return _context.abrupt('return', _context.sent);

                            case 9:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));
        }
    }, {
        key: 'hashPassword',
        value: function hashPassword(user) {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee2() {
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                if (user.password) {
                                    _context2.next = 2;
                                    break;
                                }

                                return _context2.abrupt('return', Promise.resolve(user));

                            case 2:
                                if (this.passwordSalt) {
                                    _context2.next = 4;
                                    break;
                                }

                                throw new Error('passwordSalt not added to process.env.');

                            case 4:
                                _context2.next = 6;
                                return (0, _bcryptjs.hash)(user.password, this.passwordSalt);

                            case 6:
                                user.passwordHash = _context2.sent;

                                user.password = undefined;
                                return _context2.abrupt('return', Promise.resolve(user));

                            case 9:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));
        }
    }, {
        key: 'saveUser',
        value: function saveUser(args) {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee3() {
                var user, otherUsers, userDb;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                args.userArgs.createdBy = args.authedUser;
                                user = new _ptzUserDomain.User(args.userArgs);
                                _context3.next = 4;
                                return this.hashPassword(user);

                            case 4:
                                user = _context3.sent;

                                if (user.isValid()) {
                                    _context3.next = 7;
                                    break;
                                }

                                return _context3.abrupt('return', Promise.resolve(user));

                            case 7:
                                _context3.next = 9;
                                return this.userRepository.getOtherUsersWithSameUserNameOrEmail(user);

                            case 9:
                                otherUsers = _context3.sent;

                                if (!user.otherUsersWithSameUserNameOrEmail(otherUsers)) {
                                    _context3.next = 12;
                                    break;
                                }

                                return _context3.abrupt('return', Promise.resolve(user));

                            case 12:
                                _context3.next = 14;
                                return this.userRepository.getById(user.id);

                            case 14:
                                userDb = _context3.sent;

                                if (userDb) user = userDb.update(user);
                                _context3.next = 18;
                                return this.userRepository.save(user);

                            case 18:
                                user = _context3.sent;
                                return _context3.abrupt('return', Promise.resolve(user));

                            case 20:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));
        }
    }, {
        key: 'findUsers',
        value: function findUsers(args) {
            return this.userRepository.find(args.query, { limit: args.options.limit });
        }
    }, {
        key: 'authUser',
        value: function authUser(args) {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee4() {
                var form, user, isPasswordCorrect;
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                form = args.form;
                                _context4.next = 3;
                                return this.userRepository.getByUserNameOrEmail(form.userNameOrEmail);

                            case 3:
                                user = _context4.sent;

                                if (user) {
                                    _context4.next = 6;
                                    break;
                                }

                                return _context4.abrupt('return', Promise.resolve(null));

                            case 6:
                                _context4.next = 8;
                                return (0, _bcryptjs.compare)(form.password, user.passwordHash);

                            case 8:
                                isPasswordCorrect = _context4.sent;
                                return _context4.abrupt('return', Promise.resolve(isPasswordCorrect ? user : null));

                            case 10:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));
        }
    }, {
        key: 'getAuthToken',
        value: function getAuthToken(args) {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee5() {
                var form, authToken, user, errors;
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                form = new _ptzUserDomain.AuthUserForm(args.form);
                                authToken = null;

                                if (form.isValid()) {
                                    _context5.next = 4;
                                    break;
                                }

                                return _context5.abrupt('return', Promise.resolve({
                                    authToken: authToken,
                                    user: null,
                                    errors: form.errors
                                }));

                            case 4:
                                _context5.next = 6;
                                return this.authUser(args);

                            case 6:
                                user = _context5.sent;
                                errors = [];

                                if (user == null) errors.push(_ptzUserDomain.allErrors.ERROR_USERAPP_GETAUTHTOKEN_INVALID_USERNAME_OR_PASSWORD);else authToken = (0, _jwtSimple.encode)(user, this.tokenSecret);
                                return _context5.abrupt('return', Promise.resolve({
                                    authToken: authToken,
                                    user: user,
                                    errors: errors
                                }));

                            case 10:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));
        }
    }, {
        key: 'verifyAuthToken',
        value: function verifyAuthToken(args) {
            var user = (0, _jwtSimple.decode)(args.token, this.passwordSalt);
            return Promise.resolve(user);
        }
    }, {
        key: 'seed',
        value: function seed() {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee7() {
                var _this2 = this;

                var authedUser;
                return regeneratorRuntime.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                this.log('seeding users', _ptzUserDomain.users.allUsers);
                                authedUser = {
                                    ip: '',
                                    dtCreated: new Date(),
                                    user: {
                                        displayName: 'Seed',
                                        id: 'ptz-user-app UserApp.seed()',
                                        email: '',
                                        userName: ''
                                    }
                                };

                                _ptzUserDomain.users.allUsers.forEach(function (user) {
                                    return __awaiter(_this2, void 0, void 0, regeneratorRuntime.mark(function _callee6() {
                                        return regeneratorRuntime.wrap(function _callee6$(_context6) {
                                            while (1) {
                                                switch (_context6.prev = _context6.next) {
                                                    case 0:
                                                        _context6.next = 2;
                                                        return this.saveUser({ userArgs: user, authedUser: authedUser });

                                                    case 2:
                                                        return _context6.abrupt('return', _context6.sent);

                                                    case 3:
                                                    case 'end':
                                                        return _context6.stop();
                                                }
                                            }
                                        }, _callee6, this);
                                    }));
                                });

                            case 3:
                            case 'end':
                                return _context7.stop();
                        }
                    }
                }, _callee7, this);
            }));
        }
    }, {
        key: 'updatePassword',
        value: function updatePassword(args) {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee8() {
                return regeneratorRuntime.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                                return _context8.abrupt('return', Promise.resolve(false));

                            case 1:
                            case 'end':
                                return _context8.stop();
                        }
                    }
                }, _callee8, this);
            }));
        }
    }, {
        key: 'updatePasswordToken',
        value: function updatePasswordToken(args) {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee9() {
                return regeneratorRuntime.wrap(function _callee9$(_context9) {
                    while (1) {
                        switch (_context9.prev = _context9.next) {
                            case 0:
                                return _context9.abrupt('return', Promise.resolve(false));

                            case 1:
                            case 'end':
                                return _context9.stop();
                        }
                    }
                }, _callee9, this);
            }));
        }
    }, {
        key: 'deleteUser',
        value: function deleteUser(args) {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee10() {
                return regeneratorRuntime.wrap(function _callee10$(_context10) {
                    while (1) {
                        switch (_context10.prev = _context10.next) {
                            case 0:
                                return _context10.abrupt('return', Promise.resolve(false));

                            case 1:
                            case 'end':
                                return _context10.stop();
                        }
                    }
                }, _callee10, this);
            }));
        }
    }]);

    return UserApp;
}(_ptzCoreApp.BaseApp);

exports.default = UserApp;

UserApp.actions = {
    SAVE: 'USER_APP_SAVE',
    GET_AUTH_TOKEN: 'GET_AUTH_TOKEN'
};
//# sourceMappingURL=userApp.js.map
//# sourceMappingURL=userApp.js.map