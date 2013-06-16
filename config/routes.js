exports.routes = function (map) {
	
	map.get('/', 'application#index');
	map.post('/subscribe', 'application#subscribe');
	map.get('/confirm/:id', 'application#confirm');

	//
	map.get('/admin', 'application#admin');

    // Generic routes. Add all your routes below this line
    // feel free to remove generic routes
    //map.all(':controller/:action');
    //map.all(':controller/:action/:id');
};