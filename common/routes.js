export class Routes {
  constructor(prefix = '') {
    this.prefix = prefix;
  }

  organizationEvents(organizationId) {
    return `${this.prefix}/organization/${organizationId}/event`;
  }

  event(eventId) {
    let url = `${this.prefix}/event`;

    if (typeof eventId !== 'undefined') {
      url += '/' + eventId;
    }

    return url;
  }

  eventDashboard(id) {
    return `${this.prefix}/event/${id}/dashboard`;
  }

  eventPublic(hash) {
    return `${this.prefix}/event/${hash}`;
  }

  home() {
    return `${this.prefix}/home`;
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

  eventPersist(id) {
    let result = `${this.prefix}/event/persist`;

    if (typeof id !== 'undefined') {
      result += '/' + id;
    }

    return result;
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

  landing() {
    return `${this.prefix}/`;
  }

  account() {
    return `${this.prefix}/account`;
  }

  signup() {
    return `${this.prefix}/signup`;
  }

  forgotPassword() {
    return `${this.prefix}/forgot-password`;
  }
}
