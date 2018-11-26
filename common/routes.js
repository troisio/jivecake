export class Routes {
  constructor(prefix = '') {
    this.prefix = prefix;
  }

  events() {
    return `${this.prefix}/events`;
  }

  myTransactions(userId) {
    return `${this.prefix}/user/${userId}/transaction`;
  }

  transactions() {
    return `${this.prefix}/transaction`;
  }

  login() {
    return `${this.prefix}/login`;
  }

  signup() {
    return `${this.prefix}/signup`;
  }

  forgotPassword() {
    return `${this.prefix}/forgot-password`;
  }
}
