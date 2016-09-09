# soundscape

### Getting Started (without a webserver)

Clone this repo. Then,
 - cd into soundscape/
 - Initialize a virtual environment `virtualenv .`
 - Activate the virtual environment `. bin/activate`
 - Install requirements to the virtual environment `pip install -r requirements.txt`
 - Run necessary migrations `python manage.py migrate`
 - Make a superuser `python manage.py createsuperuser` (remember your credentials)
 
 Now run the service: `python manage.py runserver 0.0.0.0:4000` and you can access the project at `localhost:4000`.
