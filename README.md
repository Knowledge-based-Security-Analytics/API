# API

The API is a node.js project implementing the [GraphQL](https://graphql.org/) query language.

A complete documentation of the interfaces is given by the GraphQL implementation itself. After the project has been started, it can be accessed via [localhost:4000](localhost:4000).

## Setup

To begin with setting up the complete backend environment, follow the steps in [Pattern Matcher](https://github.com/Knowledge-based-Security-Analytics/Pattern-Matcher) project. The project is a regular node.js project and can therefore be started like one:

1. Download and unzip or clone the project:
    ```bash
    git clone https://github.com/Knowledge-based-Security-Analytics/API.git
    ```
2. Install node modules:
    ```bash
    npm update
    ```
    ```bash
    npm install
    ```
3. Adjust the IPs within the environment variables which can be found in the .env file:
    <pre>MONGO_DB_PATH = "<b>@192.168.2.116:27017</b>"
   KAFKA_HOST = "<b>192.168.2.116</b>"
   ESPER_HOST = "<b>http://192.168.2.116:8082</b>"</pre>
4. Start the project:
    ```bash
    npm start
    ```

