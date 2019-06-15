export class Event {
  _id = null;
	avatar = null;
  organizationId = null;
  published = false;
  facebookUrl = null;
  instagramUrl = null;
  twitterUrl = null;
  hash = null;
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
  order = 0;
	maxiumumAvailable = null;
	lastUserActivity = null;
	lastSystemActivity = null;
}

export class Organization {
	_id = null;
	name = null;
	email = null;
	avatar = null;
	emailVerified = null;
	owner = null;
  stripe = null; // https://stripe.com/docs/connect/standard-accounts example shape
	read = [];
	write = [];
	created = null;
	lastUserActivity = null;
	lastSystemActivity = null;
}

export class Transaction {
	_id = null;
	userId = null;
	eventId = null;
	itemId = null;
	currency = null;
	amount = null;
	createdBy = null;
	externalTransationId = null;
	lastUserActivity = null;
	lastSystemActivity = null;
}

export class User {
	_id = null;
	email = null;
	avatar = null;
	emailVerified = false;
	lastLanguage = null;
	hashedPassword = null;
	created = null;
	lastUserActivity = null;
	lastSystemActivity = null;
}

export class PasswordRecovery {
	_id = null;
	userId = null;
	created = null;
}

export class OrganizationInvitation {
	_id = null;
	organization = null;
	userId = null;
	created = null;
}

export class EntityType {
	static Event = 'event';
	static Item = 'item';
	static Organization = 'organization';
	static Transaction = 'transaction';
	static Event = 'event';
	static User = 'user';
}

export class Language {
	static en = 'en';
	static fr = 'fr';
	static ko = 'ko';
	static es = 'es';
}

export const SUPPORTED_LANGUAGE_IDS = [Language.en, Language.fr, Language.ko];

export class Currency {
	static USD = 'USD';
	static CAD = 'CAD';
	static GBP = 'GBP';
  static EUR = 'EUR';
	static JPY = 'JPY';
	static KRW = 'KRW';
}

export class ExternalTransationType {
	static STRIPE = 'STRIPE';
}
