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

  organization(id = null) {
    let url = `${this.prefix}/organization`;

    if (id !== null) {
      url += '/' + id;
    }

    return url;
  }

  organizationPersist(id = null) {
    let result = `${this.prefix}/organization/persist`;

    if (id !== null) {
      result += '/' + id;
    }

    return result;
  }

  transactions() {
    return `${this.prefix}/transaction`;
  }

  login(email = null, to = null) {
    let url = `${this.prefix}/login`;
    const parts = [];

    if (to !== null) {
      parts.push(`to=${to}`);
    }

    if (email !== null) {
      parts.push(`email=${email}`);
    }

    if (parts.length > 0) {
      url += `?${parts.join('&')}`;
    }

    return url;
  }

  signup() {
    return `${this.prefix}/signup`;
  }

  forgotPassword() {
    return `${this.prefix}/forgot-password`;
  }
}
