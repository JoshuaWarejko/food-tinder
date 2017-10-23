function Mongo() {
	var mongoCredentials = {
		uri: 'localhost',
		port: '27017',
		db: 'foodlocator',
		credentials: {
			user: "joshuawarejko",
			pass: "thebled13",
			auth: {
				authdb: 'admin'
			}
		}
	}
	this.connection = mongoCredentials;
}

module.exports = new Mongo();