module.exports = (server, router) => {
	router.post('/signin', (req, res) => {
		server.src.controllers.authentication.signin(server, req, res);
	});
	
	router.post('/beginsignup', async (req, res) => {
		await server.src.controllers.authentication.beginSignup(server, req, res);
	});

	router.post('/completesignup', async (req, res) => {
		await server.src.controllers.authentication.completeSignup(server, req, res);
	});

	router.post('/updateprofilepassword', async (req, res) => {
		await server.src.controllers.authentication.updateProfilePassword(server, req, res);
	});
}