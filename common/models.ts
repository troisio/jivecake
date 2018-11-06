export class Event {
	_id = null;
	organizationId = null;
	name = null;
	created = null;
	lastUserActivity = null;
	lastSystemActivity = null;
}

export class Item {
	_id = null;
	organizationId = null;
	name = null;
	created = null;
	maxiumumAvailable = null;
	lastUserActivity = null;
	lastSystemActivity = null;
}

export class Organization {
	_id = null;
	name = null;
	shortName = null;
	email = null;
	createdBy = null;
	read = [];
	write = [];
	lastUserActivity = null;
	lastSystemActivity = null;
}

export class Transaction {
	_id = null;
	organizationId = null;
	currency = null;
	amount = null;
	purchasedBy = null;
	createdBy = null;
	externalTransation = null;
	externalTransationType = null;
	lastUserActivity = null;
	lastSystemActivity = null;
}

export class User {
	_id = null;
	organizationId = null;
	username = null;
	email = null;
	lastUserActivity = null;
	lastSystemActivity = null;
}

export class EntityType = {
	Event = Event.name,
	Item = Item.name,
	Organization = Organization.name,
	Transaction = Transaction.name,
	User = User.name,
}

export class Currency {
	static USD = 'USD';
	static CAD = 'EUR';
	static GBP = 'EUR';
	static JPY = 'JPY';
	static KRW = 'KRW';
}

export class ExternalTransationType {
	static STRIPE = 'STRIPE';
}
