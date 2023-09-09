# KidsFun
KidsFun is a web application where parents can find and share kids friendly activities and adventures.

<img width="500" alt="image" src="https://github.com/vivalkm/KidsFun/assets/83200994/f63e71bb-2ca8-47b8-a613-a75efab95715">

## Deployment
https://kidsfun.cyclic.app/
## Specifications
   - Authentication
     - User can register and login, enabled by passport
   - Authorization
     - User needs to be logged in to make any edit (add, update or delete an activity or review)
     - A user can only edit their own posts or reviews
   - Functionalities
     - Activities are marked on a cluster map using Mapbox API
     - Every activity has its detail page showing images, descriptions, price, location, map, and reviews from other users
     - Client side and server side validations
     - All details for each activity can be edited and deleted after creation
     - Search based on keyword in title and location
## Built with
   - ### Front End
     - HTML, CSS, Bootsrap v5.0
     - EJS, EJS Mate
  - ### Back End
     - NodeJS
     - ExpressJS
     - MongoDB
     - cloudinary
     - MapBox
     - passport (local-strategy)
     - JOI
     - connect-flash
     - morgan
     - sessions
     - helmet
     - mongoSanitize
     - sanitizeHtml
### Deployed on cyclic.app, database on MongoDB Atlas
