export default class TadDbConnection{

    constructor() {
        this.key = "TadDbConnection_" + Math.floor(Math.random()*100000);
        this.title = this.key;
        this.children = [];

        this.connection_id = null;
        this.connection_name = null;
        this.db_host = null;
        this.db_password = null;
        this.db_port = null;
        this.db_sid = null;
        this.db_type = null;
        this.db_username = null;
    }
}
