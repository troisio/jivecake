export class Event {
	_id = null;
	organizationId = null;
	published = false;
	registrationOpenDate = null;
	registrationClosedDate = null;
	facebookUrl = null;
	instagramUrl = null;
	twitterUrl = null;
	url = null;
	name = null;
	shortName = null;
	created = null;
	lastUserActivity = null;
	lastSystemActivity = null;
}

export class Item {
	_id = null;
	amount = null;
	currency = null;
	organizationId = null;
	published = false;
	name = null;
	created = null;
	maxiumumAvailable = null;
	lastUserActivity = null;
	lastSystemActivity = null;
}

export class Organization {
	_id = null;
	name = null;
	email = null;
	emailVerified = null;
	createdBy = null;
	read = [];
	write = [];
	created = null;
	lastUserActivity = null;
	lastSystemActivity = null;
}

export class PaymentProfileId {
	_id = null;
	organizationId = null;
	type = PaymentProfileType.Stripe;
	created = null;
}

export class Transaction {
	_id = null;
	userId = null;
	eventId = null;
	itemId = null;
	currency = null;
	amount = null;
	purchasedBy = null;
	createdBy = null;
	externalTransation = null;
	externalTransationType = null;
	lastUserActivity = null;
	lastSystemActivity = null;
	status = null;
}

export class User {
	_id = null;
	email = null;
	emailVerified = false;
	selectedLanguage = null;
	lastLanguage = null;
	hashedPassword = null;
	lastUserActivity = null;
	lastSystemActivity = null;
}

export class EntityType {
	static Event = 'event';
	static Item = 'item';
	static Organization = 'organization';
	static Transaction = 'transaction';
	static Event = 'event';
	static User = 'user';
}

export class JiveCakeTransactionStatus {
	SETTLED = 'settled';
	REVOKED = 'revoked';
	REFUNDED = 'refunded';
	PENDING = 'pending';
}

export class PaymentProfileType {
	static Stripe = 'stripe';
	static Paypal = 'paypal';
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
