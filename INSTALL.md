# Installing enano
if you are using rvm first install ruby1.8.7

  rvm install ruby-1.8.7
  rvm ruby-1.8.7
  rvm gemset create rails2.3.8

Then you need to install rails2.3.8

  gem install rails -v 2.8.8
  gem install sqlite3-ruby
  gem update --system
  gem update --system -v 1.5.3

Then run
  
  rake db:migrate
  ./script/server
