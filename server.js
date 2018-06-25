var ex= require('express'), ap= ex();
ap.use(ex.static('./')).listen(3000);
