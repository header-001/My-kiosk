var sqlMananger = {
	
	checkTable : function(){

		if(navigator.platform != "Win32") {
			 var db = window.openDatabase("Database", "1.0", "My Voda", 200000);
			 db.transaction(this.queryDB, this.errorCB);
		}
		 
	},
	
	queryDB : function(tx){
		tx.executeSql('SELECT * FROM CONTENT', [], this.querySuccess, this.errorCB);
	},
	
	querySuccess : function(tx, results) {
        console.log("Returned rows = " + results.rows.length);
        
        if (!results.rowsAffected) {
            console.log('No rows affected!');
            return false;
        }
        
        // for an insert statement, this property will return the ID of the last inserted row
        console.log("Last inserted row ID = " + results.insertId);
    },
	
    populateDB : function (tx) {
        tx.executeSql('DROP TABLE IF EXISTS DEMO');
        tx.executeSql('CREATE TABLE IF NOT EXISTS DEMO (id unique, data)');
        tx.executeSql('INSERT INTO DEMO (id, data) VALUES (1, "First row")');
        tx.executeSql('INSERT INTO DEMO (id, data) VALUES (2, "Second row")');
    },
 
    error : function CB(tx, err) {
        alert("Error processing SQL: "+err);
    },

    successCB : function () {
        alert("success!");
    }
	 
};
