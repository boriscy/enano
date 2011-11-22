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

To check how it works just got to (http://localhsot:3000/admin)[http://localhsot:3000/admin] and enter

    login: admin
    pass: demo123


In the left there are the list of pages you can add with **Crear**, Edit with **Editar** and delete with **Borrar**
if you create a new page it will appear on the right and you can add pictures and stuff, you can reorder the pages.
  
Enano uses tinyMCE as editor, you can add a picture from the browser just clicking the image from tinyMCE then clickthe button that appear at the right of **URL de la imagen**  and then select any image from the browser, you can upload images, just click the **plus** button and then select the images you want to add by clicking **Adicionar** (The green plus button). Then you can select any image right clicking it and then click on the **Seleccionar archivo** button, then close the browser and you will see the selected image for tinyMCE.
