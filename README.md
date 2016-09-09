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



### Contributing

 - Make a new branch when contributing to this repository.
 - Make pull requests
 - When committing to master, merge your branch in to master with a command like,

 **`git merge --ff-only --squash my-branch`
 **`git commit` (remove all the excess stuff in the commit message and replace it with something useful,
 e.g. add Redis client
 ** git push origin master
 ** close your PR with a link to the SHA of your commit
