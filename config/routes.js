exports.routes = function (map) {
	
	map.get('/', 'application#index');
	map.post('/subscribe', 'application#subscribe');
	map.get('/confirm/:id', 'application#confirm');

	//
	map.get('/admin', 'application#admin');
	map.get('/admin/new', 'application#new_admin');
	map.post('/admin/save', 'application#save_admin');

	map.get('/admin/login', 'application#login');
	map.post('/admin/login', 'application#validate_login');

    // Generic routes. Add all your routes below this line
    // feel free to remove generic routes
    //map.all(':controller/:action');
    //map.all(':controller/:action/:id');
};